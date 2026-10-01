import { NextResponse } from 'next/server';
import { getEventStats, getAllAttendees, getAllEvents } from '@/lib/user-service';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('x-admin-pin');
    const validPin = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_SCAN_PIN || '2126';

    if (authHeader !== validPin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé à l’espace administration.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedEventId = searchParams.get('eventId');

    const allEvents = await getAllEvents();
    const activeEvent = allEvents.find((e) => e.isActive) || allEvents[0];
    const eventId = requestedEventId || activeEvent?.id || 'mtb-2026-online-presence';

    const [stats, attendees] = await Promise.all([
      getEventStats(eventId),
      getAllAttendees(eventId),
    ]);

    const attendanceRate =
      stats.totalRegistered > 0
        ? Math.round((stats.totalAttended / stats.totalRegistered) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      events: allEvents,
      currentEventId: eventId,
      stats: {
        totalRegistered: stats.totalRegistered,
        totalAttended: stats.totalAttended,
        attendanceRate,
        classesBreakdown: stats.classesBreakdown,
        recentScans: stats.recentScans,
      },
      attendees,
    });
  } catch (error: any) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des statistiques.' },
      { status: 500 }
    );
  }
}
