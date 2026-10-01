import { NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';
import {
  createUser,
  findUserByEmail,
  createEventRegistration,
  getActiveEvent,
  getEventById,
} from '@/lib/user-service';
import { setSessionCookie, verifyPassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check: 10 registrations per 10 minutes per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`register:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Trop de requêtes d'inscription. Veuillez réessayer dans ${rl.reset} secondes.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.reset) },
        }
      );
    }

    const body = await request.json();
    const { fullName, email, password, phone, classe, year } = body;

    if (!fullName || !email || !classe) {
      return NextResponse.json(
        { success: false, error: 'Veuillez remplir tous les champs obligatoires (Nom, Email, Classe).' },
        { status: 400 }
      );
    }

    // Clean inputs
    const cleanFullName = String(fullName).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const cleanClasse = String(classe).trim().toUpperCase();
    const cleanYear = String(year || (cleanClasse.includes('1') ? '1ère Année' : '2ème Année'));
    const userPassword = String(password || 'MTB2026!');

    // 2. Generate secure, non-colliding ticketId (UUID prefix)
    const ticketId = `OFPPT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Secure QR code payload: uses unique ticketId rather than guessable name-class
    const qrCodeData = ticketId;
    const qrDataEncoded = encodeURIComponent(qrCodeData);
    const qrCodeUrl = `/api/qr?data=${qrDataEncoded}`;

    // 3. Pre-generate base64 QR Code image so passes render offline/instantly
    let qrBase64 = '';
    try {
      qrBase64 = await QRCode.toDataURL(qrCodeData, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#082D5B',
          light: '#FFFFFF',
        },
      });
    } catch (qrErr) {
      console.warn('Base64 QR generation warning:', qrErr);
    }

    // 4. Check or Create User in Turso Database
    let existingUser = await findUserByEmail(cleanEmail);
    let userId = existingUser?.id;

    if (existingUser) {
      // If user provided a password and already has an account, verify
      if (password && existingUser.passwordHash) {
        const isPasswordValid = verifyPassword(userPassword, existingUser.passwordHash);
        if (!isPasswordValid) {
          return NextResponse.json(
            {
              success: false,
              error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter avec votre mot de passe.',
              requiresLogin: true,
            },
            { status: 401 }
          );
        }
      }
    } else {
      // Create new user in Turso
      const newUser = await createUser({
        fullName: cleanFullName,
        email: cleanEmail,
        password: userPassword,
        phone: cleanPhone,
        classe: cleanClasse,
        year: cleanYear,
      });
      userId = newUser.id;
    }

    if (!userId) {
      throw new Error('Erreur lors de la création du compte stagiaire dans Turso.');
    }

    // 5. Create or Retrieve Event Registration in Turso (Deduplicated)
    const requestedEventId = body.eventId;
    const targetEvent = requestedEventId ? await getEventById(requestedEventId) : await getActiveEvent();
    const eventId = targetEvent?.id || 'mtb-2026-online-presence';
    const eventName = targetEvent?.name || 'Morocco Tech Builders — Construire sa Présence en Ligne';

    const registration = await createEventRegistration({
      userId,
      eventId,
      eventName,
      ticketId,
      qrCodeData,
      qrCodeUrl,
    });

    // 6. Set Session Cookie (User is immediately authenticated)
    await setSessionCookie({
      userId,
      email: cleanEmail,
      fullName: cleanFullName,
      classe: cleanClasse,
    });

    // 7. Forward to external n8n Webhook for email delivery & remote sync (non-blocking)
    const webhookUrl = process.env.EVENT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    let synced = false;

    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify({
            fullName: cleanFullName,
            FullName: cleanFullName,
            email: cleanEmail,
            Email: cleanEmail,
            phone: cleanPhone,
            Phone: cleanPhone,
            classe: cleanClasse,
            Classe: cleanClasse,
            year: cleanYear,
            Year: cleanYear,
            ticketId: registration.ticketId,
            qrCodeData: registration.qrCodeData,
            eventId,
            eventName,
          }),
        });

        if (res.ok) {
          synced = true;
        } else {
          console.warn('n8n webhook returned non-200 status:', res.status);
        }
      } catch (err: any) {
        console.warn('n8n webhook fetch error (local account created successfully):', err);
      }
    }

    const passPayload = {
      ticketId: registration.ticketId,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      classe: cleanClasse,
      year: cleanYear,
      qrCodeUrl: registration.qrCodeUrl,
      qrBase64: qrBase64 || registration.qrCodeUrl,
      eventName,
      speaker: targetEvent?.speaker || 'Abderrahmane Raquibi',
      location: targetEvent?.location || 'Amphithéâtre OFPPT Marrakech',
      duration: '1h 45 - 2h 15',
      date: targetEvent?.date || 'Session 2026',
      status: registration.status,
    };

    return NextResponse.json({
      success: true,
      message: existingUser
        ? 'Ravi de vous revoir ! Votre pass numérique est prêt.'
        : 'Compte créé & inscription confirmée ! Votre pass numérique a été généré.',
      synced,
      userId,
      pass: passPayload,
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Une erreur est survenue lors de l’inscription.' },
      { status: 500 }
    );
  }
}
