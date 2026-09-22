import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, createEventRegistration, getUserRegistrations } from '@/lib/user-service';
import { setSessionCookie, verifyPassword } from '@/lib/auth';

const EVENT_ID = 'mtb-2026-online-presence';
const EVENT_NAME = 'Morocco Tech Builders — Construire sa Présence en Ligne';

export async function POST(request: Request) {
  try {
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

    // QR Code data matches the format used in n8n workflow & scanner: FullName-Classe
    const qrCodeData = `${cleanFullName}-${cleanClasse}`;
    const qrDataEncoded = encodeURIComponent(qrCodeData);
    const qrCodeUrl = `/api/qr?data=${qrDataEncoded}`;

    // Unique ticket identifier
    const ticketId = `OFPPT-DD-${Date.now().toString().slice(-6)}`;

    // 1. Check or Create User in Turso Database
    let existingUser = await findUserByEmail(cleanEmail);
    let userId = existingUser?.id;

    if (existingUser) {
      // If user provided a password and already has an account, verify or update
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

    // 2. Create or Retrieve Event Registration in Turso
    const registration = await createEventRegistration({
      userId,
      eventId: EVENT_ID,
      eventName: EVENT_NAME,
      ticketId,
      qrCodeData,
      qrCodeUrl,
    });

    // 3. Set Session Cookie (User is immediately authenticated)
    await setSessionCookie({
      userId,
      email: cleanEmail,
      fullName: cleanFullName,
      classe: cleanClasse,
    });

    // 4. Forward to external n8n Webhook for email delivery & remote sync
    const webhookUrl = process.env.EVENT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    let synced = false;

    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(15000),
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
      eventName: EVENT_NAME,
      speaker: 'Abderrahmane Raquibi',
      location: 'Salle de Conférence, OFPPT Marrakech',
      duration: '1h 45 - 2h 15',
      date: 'Session 2026',
      status: registration.status,
    };

    return NextResponse.json({
      success: true,
      message: existingUser
        ? 'Ravi de vous revoir ! Votre pass numérique a été mis à jour.'
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
