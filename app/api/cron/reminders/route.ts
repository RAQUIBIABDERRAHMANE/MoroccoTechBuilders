import { NextRequest, NextResponse } from 'next/server';
import { getActiveEvent, getAllAttendees, markEventCampaignSent } from '@/lib/user-service';
import { generateReminderEmailHtml } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret') || (authHeader ? authHeader.replace('Bearer ', '') : '');

    const expectedSecret = process.env.CRON_SECRET || 'mtb-cron-secret-2026';

    if (secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron request' }, { status: 401 });
    }

    const activeEvent = await getActiveEvent();
    if (!activeEvent) {
      return NextResponse.json({ success: true, message: 'No active event found' });
    }

    if (activeEvent.reminderSent) {
      return NextResponse.json({
        success: true,
        message: `Reminder already sent for active event: ${activeEvent.name}`,
      });
    }

    // Check if event is within 36 hours from now
    const eventTime = new Date(`${activeEvent.date}T${activeEvent.startTime || '09:00'}:00`).getTime();
    const now = Date.now();
    const diffHours = (eventTime - now) / (1000 * 60 * 60);

    if (diffHours > 36 || diffHours < 0) {
      return NextResponse.json({
        success: true,
        message: `Event ${activeEvent.name} is not in the T-24h window (diff: ${diffHours.toFixed(1)}h)`,
      });
    }

    const attendees = await getAllAttendees(activeEvent.id);
    if (attendees.length === 0) {
      return NextResponse.json({ success: true, message: 'No registered attendees to remind' });
    }

    const webhookUrl =
      process.env.EVENT_REMINDERS_WEBHOOK_URL ||
      process.env.EVENT_WEBHOOK_URL ||
      'https://n8n.raquibi.com/webhook/event-qrs';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const payload = {
      campaignType: 'reminder',
      eventId: activeEvent.id,
      eventName: activeEvent.name,
      totalRecipients: attendees.length,
      sentAt: new Date().toISOString(),
      recipients: attendees.map((att) => ({
        email: att.email,
        fullName: att.fullName,
        classe: att.classe,
        ticketId: att.ticketId,
        html: generateReminderEmailHtml({
          fullName: att.fullName,
          eventName: activeEvent.name,
          date: activeEvent.date,
          time: activeEvent.startTime || '14:00',
          location: activeEvent.location,
          ticketId: att.ticketId,
          passUrl: `${baseUrl}/confirmed?ticketId=${att.ticketId}`,
          calendarUrl: 'https://calendar.google.com',
        }),
      })),
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    await markEventCampaignSent(activeEvent.id, 'reminder');

    return NextResponse.json({
      success: true,
      message: `Automated reminder sent to ${attendees.length} attendees for ${activeEvent.name}`,
    });
  } catch (error: any) {
    console.error('Cron reminder error:', error);
    return NextResponse.json({ success: false, error: 'Internal cron error' }, { status: 500 });
  }
}
