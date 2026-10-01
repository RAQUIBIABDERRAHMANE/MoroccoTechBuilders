import { NextRequest, NextResponse } from 'next/server';
import { getAllAttendees, getEventById, markEventCampaignSent } from '@/lib/user-service';
import { generateReminderEmailHtml, generateThankYouEmailHtml } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

function checkAdminAuth(request: NextRequest): boolean {
  const pin = request.headers.get('x-admin-pin');
  const validPin = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_SCAN_PIN || '2126';
  return pin === validPin;
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const eventId = body.eventId || 'mtb-2026-online-presence';
    const campaignType: 'reminder' | 'thank_you' = body.campaignType || 'reminder';
    const isTest = Boolean(body.isTest);
    const testEmail = body.testEmail ? String(body.testEmail).trim() : null;

    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Événement introuvable' }, { status: 404 });
    }

    const allAttendees = await getAllAttendees(eventId);

    let targetAttendees = allAttendees;
    if (campaignType === 'thank_you') {
      targetAttendees = allAttendees.filter((a) => a.status === 'attended');
    }

    if (isTest) {
      if (!testEmail) {
        return NextResponse.json(
          { success: false, error: 'Email de test requis' },
          { status: 400 }
        );
      }

      const sampleAttendee = targetAttendees[0] || {
        fullName: 'Stagiaire Démo',
        email: testEmail,
        ticketId: 'OFPPT-DD-DEMO',
        classe: 'DEV201',
      };

      const testHtml =
        campaignType === 'reminder'
          ? generateReminderEmailHtml({
              fullName: sampleAttendee.fullName,
              eventName: event.name,
              date: event.date,
              time: event.startTime || '14:00',
              location: event.location,
              ticketId: sampleAttendee.ticketId,
              passUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/confirmed?ticketId=${sampleAttendee.ticketId}`,
              calendarUrl: 'https://calendar.google.com',
            })
          : generateThankYouEmailHtml({
              fullName: sampleAttendee.fullName,
              eventName: event.name,
              profileUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`,
              directoryUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/attendees`,
            });

      // Send test email via n8n webhook
      const webhookUrl =
        process.env.EVENT_REMINDERS_WEBHOOK_URL ||
        process.env.EVENT_WEBHOOK_URL ||
        'https://n8n.raquibi.com/webhook/event-qrs';

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: `test_${campaignType}`,
          recipient: testEmail,
          subject: `[TEST] ${campaignType === 'reminder' ? 'Rappel J-1' : 'Merci'} · ${event.name}`,
          html: testHtml,
          eventName: event.name,
        }),
      }).catch((e) => console.warn('Test broadcast webhook warning:', e));

      return NextResponse.json({
        success: true,
        message: `Email de test (${campaignType}) envoyé à ${testEmail}`,
      });
    }

    // LIVE BROADCAST
    if (targetAttendees.length === 0) {
      return NextResponse.json({
        success: false,
        error: campaignType === 'thank_you'
          ? 'Aucun participant présent (status: attended) pour le moment.'
          : 'Aucun inscrit pour cet événement.',
      });
    }

    const webhookUrl =
      process.env.EVENT_REMINDERS_WEBHOOK_URL ||
      process.env.EVENT_WEBHOOK_URL ||
      'https://n8n.raquibi.com/webhook/event-qrs';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Prepare recipients payload for n8n batch dispatch
    const payload = {
      campaignType,
      eventId: event.id,
      eventName: event.name,
      totalRecipients: targetAttendees.length,
      sentAt: new Date().toISOString(),
      recipients: targetAttendees.map((att) => ({
        email: att.email,
        fullName: att.fullName,
        classe: att.classe,
        ticketId: att.ticketId,
        status: att.status,
        html:
          campaignType === 'reminder'
            ? generateReminderEmailHtml({
                fullName: att.fullName,
                eventName: event.name,
                date: event.date,
                time: event.startTime || '14:00',
                location: event.location,
                ticketId: att.ticketId,
                passUrl: `${baseUrl}/confirmed?ticketId=${att.ticketId}`,
                calendarUrl: 'https://calendar.google.com',
              })
            : generateThankYouEmailHtml({
                fullName: att.fullName,
                eventName: event.name,
                profileUrl: `${baseUrl}/u/${att.userId}`,
                directoryUrl: `${baseUrl}/attendees`,
              }),
      })),
    };

    // Forward to n8n webhook
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn('Broadcast webhook warning:', err));

    // Mark as sent in DB
    await markEventCampaignSent(eventId, campaignType);

    return NextResponse.json({
      success: true,
      message: `Campagne "${campaignType === 'reminder' ? 'Rappel J-1' : 'Remerciements'}" transmise à ${targetAttendees.length} destinataires !`,
      count: targetAttendees.length,
    });
  } catch (error: any) {
    console.error('Broadcast API error:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la diffusion.' }, { status: 500 });
  }
}
