import { NextResponse } from 'next/server';
import { markRegistrationAttended } from '@/lib/user-service';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check: 60 scans per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`scan:${ip}`, 60, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: `Trop de requêtes de scan. Veuillez patienter ${rl.reset}s.` },
        { status: 429, headers: { 'Retry-After': String(rl.reset) } }
      );
    }

    // 2. Authentication check: Secret Token or Scan PIN
    const authHeader = request.headers.get('x-scan-token');
    const validSecrets = [
      process.env.SCAN_API_SECRET,
      process.env.NEXT_PUBLIC_SCAN_API_SECRET,
      process.env.NEXT_PUBLIC_SCAN_PIN,
      '2126',
    ].filter(Boolean);

    if (!authHeader || !validSecrets.includes(authHeader)) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé. Jeton de scan invalide.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const dataInput = body.data || body.code || body.qr;

    if (!dataInput || typeof dataInput !== 'string' || !dataInput.trim()) {
      return NextResponse.json(
        { success: false, error: 'Données de scan QR manquantes.' },
        { status: 400 }
      );
    }

    const cleanData = dataInput.trim();

    // Fallback parsing for legacy "FullName-Classe" strings
    const parts = cleanData.split('-');
    const parsedFullName = parts.length > 1 ? parts.slice(0, -1).join('-').trim() : cleanData;
    const parsedClasse = parts.length > 1 ? parts[parts.length - 1].trim().toUpperCase() : '';

    const scanWebhookUrl =
      process.env.EVENT_SCAN_WEBHOOK_URL ||
      process.env.N8N_SCAN_WEBHOOK_URL ||
      'https://n8n.raquibi.com/webhook/event-qr-scans';

    let scanStatus: 'approve' | 'already_attended' | 'decline' = 'decline';
    let message = '';

    // 3. Primary Authoritative Verification: Turso Database
    let tursoAttendee: any = null;
    let registeredTicketId = cleanData;
    try {
      const tursoRes = await markRegistrationAttended(cleanData);
      if (tursoRes.success) {
        tursoAttendee = tursoRes.user;
        registeredTicketId = tursoRes.registration?.ticketId || cleanData;

        if (tursoRes.alreadyAttended) {
          scanStatus = 'already_attended';
          message = 'Ce participant a déjà été scanné et est déjà dans la salle. Ré-entrée refusée.';
        } else {
          scanStatus = 'approve';
          message = 'Accès autorisé ! Statut mis à jour et présence enregistrée.';
        }

        // Secondary fire-and-forget notification to n8n (does NOT downgrade Turso status)
        fetch(scanWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({
            data: cleanData,
            ticketId: registeredTicketId,
            fullName: tursoAttendee?.fullName,
            classe: tursoAttendee?.classe,
            status: scanStatus,
          }),
        }).catch((err) => {
          console.warn('n8n background scan sync error:', err);
        });

        return NextResponse.json({
          success: true,
          status: scanStatus,
          message,
          participant: {
            fullName: tursoAttendee?.fullName || parsedFullName || cleanData,
            classe: tursoAttendee?.classe || parsedClasse || 'N/A',
            ticketId: registeredTicketId,
            scannedAt: new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          },
        });
      }
    } catch (dbErr) {
      console.warn('Turso scan sync warning:', dbErr);
    }

    // 4. Secondary Fallback Verification (n8n) if not found in Turso
    try {
      const res = await fetch(scanWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ data: cleanData }),
      });

      const rawResponse = await res.text().catch(() => '');
      const lowerRaw = rawResponse.toLowerCase();

      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawResponse);
      } catch {
        // Not JSON
      }

      const headerStatus = res.headers.get('status')?.toLowerCase() || '';
      const bodyStatus = parsedJson?.status?.toLowerCase() || '';
      const bodyMsg = parsedJson?.message || '';

      if (
        headerStatus === 'already_attended' ||
        bodyStatus === 'already_attended' ||
        lowerRaw.includes('already_attended')
      ) {
        scanStatus = 'already_attended';
        message = bodyMsg || 'Ce participant a déjà été scanné et est déjà dans la salle. Ré-entrée refusée.';
      } else if (headerStatus === 'approve' || bodyStatus === 'approve') {
        scanStatus = 'approve';
        message = bodyMsg || 'Accès autorisé ! Présence confirmée.';
      } else {
        scanStatus = 'decline';
        message = bodyMsg || 'Billet ou QR Code introuvable dans le système.';
      }

      return NextResponse.json({
        success: true,
        status: scanStatus,
        message,
        participant: {
          fullName: parsedJson?.fullName || parsedFullName || cleanData,
          classe: parsedJson?.classe || parsedClasse || 'N/A',
          ticketId: cleanData,
          scannedAt: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      });
    } catch (err: any) {
      console.warn('Scan webhook fetch error:', err);
      return NextResponse.json({
        success: true,
        status: 'decline',
        message: 'Billet non reconnu et serveur de secours indisponible.',
        participant: {
          fullName: parsedFullName || cleanData,
          classe: parsedClasse || 'N/A',
          ticketId: cleanData,
          scannedAt: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      });
    }
  } catch (error: any) {
    console.error('Scan API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement du scan.' },
      { status: 500 }
    );
  }
}
