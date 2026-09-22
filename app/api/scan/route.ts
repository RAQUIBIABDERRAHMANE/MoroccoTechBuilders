import { NextResponse } from 'next/server';
import { markRegistrationAttended } from '@/lib/user-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataInput = body.data || body.code || body.qr;

    if (!dataInput || typeof dataInput !== 'string' || !dataInput.trim()) {
      return NextResponse.json(
        { success: false, error: 'Données de scan QR manquantes.' },
        { status: 400 }
      );
    }

    const cleanData = dataInput.trim();
    const parts = cleanData.split('-');
    const fullName = parts.slice(0, -1).join('-').trim() || parts[0]?.trim() || '';
    const classe = parts.length > 1 ? parts[parts.length - 1].trim().toUpperCase() : '';

    const scanWebhookUrl =
      process.env.EVENT_SCAN_WEBHOOK_URL ||
      process.env.N8N_SCAN_WEBHOOK_URL ||
      'https://n8n.raquibi.com/webhook/event-qr-scans';

    let scanStatus: 'approve' | 'already_attended' | 'decline' = 'decline';
    let rawResponse = '';
    let message = '';

    // 1. Sync with Turso Database
    let tursoAttendee: any = null;
    try {
      const tursoRes = await markRegistrationAttended(cleanData);
      if (tursoRes.success) {
        tursoAttendee = tursoRes.user;
        if (tursoRes.alreadyAttended) {
          scanStatus = 'already_attended';
          message = 'Ce participant a déjà été scanné et est déjà dans la salle. Ré-entrée refusée.';
        } else {
          scanStatus = 'approve';
          message = 'Accès autorisé ! Statut mis à jour et présence enregistrée.';
        }
      }
    } catch (dbErr) {
      console.warn('Turso scan sync warning:', dbErr);
    }

    try {
      const res = await fetch(scanWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({ data: cleanData }),
      });

      // n8n returns status either in headers or body
      const headerStatus = res.headers.get('status')?.toLowerCase() || '';
      rawResponse = await res.text().catch(() => '');
      const lowerRaw = rawResponse.toLowerCase();

      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawResponse);
      } catch (e) {
        // Not JSON
      }

      const bodyStatus = parsedJson?.status?.toLowerCase() || '';
      const bodyMsg = parsedJson?.message || '';

      if (
        headerStatus === 'already_attended' ||
        bodyStatus === 'already_attended' ||
        lowerRaw.includes('already_attended')
      ) {
        scanStatus = 'already_attended';
        message = bodyMsg || 'Ce participant a déjà été scanné et est déjà dans la salle. Ré-entrée refusée.';
      } else if (
        headerStatus === 'approve' ||
        bodyStatus === 'approve'
      ) {
        scanStatus = 'approve';
        message = bodyMsg || 'Accès autorisé ! Statut mis à jour et email de présence envoyé.';
      } else {
        scanStatus = 'decline';
        message = bodyMsg || 'Ce QR code n\'est pas correct ou le participant est introuvable.';
      }
    } catch (err: any) {
      console.warn('Scan webhook fetch error:', err);
      scanStatus = 'decline';
      message = 'Le serveur de validation n8n n\'a pas répondu à temps ou est inaccessible.';
    }

    return NextResponse.json({
      success: true,
      status: scanStatus,
      message,
      participant: {
        fullName: fullName || cleanData,
        classe: classe || 'N/A',
        scannedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      raw: rawResponse,
    });
  } catch (error: any) {
    console.error('Scan API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement du scan.' },
      { status: 500 }
    );
  }
}
