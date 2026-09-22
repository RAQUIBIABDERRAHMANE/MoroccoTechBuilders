import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, classe, year } = body;

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

    // QR Code data matches the format used in the n8n workflow: FullName-Classe
    const qrData = encodeURIComponent(`${cleanFullName}-${cleanClasse}`);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;

    // Unique ticket identifier
    const ticketId = `OFPPT-DD-${Date.now().toString().slice(-6)}`;

    // Forward to external webhook if configured
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
            ticketId,
          }),
        });

        if (!res.ok) {
          return NextResponse.json(
            {
              success: false,
              error: `Le serveur n8n a retourné une erreur (${res.status}). Veuillez vérifier le workflow n8n.`,
            },
            { status: 502 }
          );
        }

        synced = true;
        const data = await res.json().catch(() => null);
        if (data && (data.emailExists || data.stored === false)) {
          return NextResponse.json({
            success: true,
            alreadyRegistered: true,
            message: 'Vous êtes déjà inscrit ! Votre pass numérique a été rechargé.',
            synced: true,
            pass: {
              ticketId,
              fullName: cleanFullName,
              email: cleanEmail,
              phone: cleanPhone,
              classe: cleanClasse,
              year: cleanYear,
              qrCodeUrl,
              eventName: 'Morocco Tech Builders — Présence en Ligne',
              speaker: 'Abderrahmane Raquibi',
              location: 'Salle de Conférence, OFPPT',
              duration: '1h 45 - 2h 15',
              date: 'Session 2026',
            },
          });
        }
      } catch (err: any) {
        console.error('Webhook delivery error:', err);
        return NextResponse.json(
          {
            success: false,
            error: "Le serveur d'inscription n8n n'a pas répondu à temps (timeout). L'inscription n'a pas pu être enregistrée.",
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription confirmée avec succès ! Votre pass numérique a été généré.',
      synced,
      pass: {
        ticketId,
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        classe: cleanClasse,
        year: cleanYear,
        qrCodeUrl,
        eventName: 'Morocco Tech Builders — Présence en Ligne',
        speaker: 'Abderrahmane Raquibi',
        location: 'Salle de Conférence, OFPPT',
        duration: '1h 45 - 2h 15',
        date: 'Session 2026',
      },
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de l’inscription.' },
      { status: 500 }
    );
  }
}
