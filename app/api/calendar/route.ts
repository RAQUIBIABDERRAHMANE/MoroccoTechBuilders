import { NextResponse } from 'next/server';
import { getRegistrationByTicketId } from '@/lib/user-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketIdParam = searchParams.get('ticketId') || searchParams.get('ticket_id');
    const nameParam = searchParams.get('fullName') || searchParams.get('name');
    const classeParam = searchParams.get('classe') || searchParams.get('class');

    let fullName = nameParam || 'Stagiaire MTB';
    let classe = classeParam || 'Développement Digital';
    let ticketId = ticketIdParam || 'OFPPT-DD-2026';

    if (ticketIdParam) {
      try {
        const found = await getRegistrationByTicketId(ticketIdParam);
        if (found) {
          if (found.user) {
            fullName = found.user.fullName;
            classe = found.user.classe;
          }
          ticketId = found.registration.ticketId;
        }
      } catch (err) {
        console.warn('Could not query Turso for ics:', err);
      }
    }

    const eventTitle = 'Atelier: Construire sa Présence en Ligne (Morocco Tech Builders)';
    const eventLocation = 'Salle Polyvalente NTIC Sidi Youssef Ben Ali, Marrakech';
    const eventDescription = `Billet Officiel MTB : ${ticketId}\\nStagiaire : ${fullName}\\nClasse : ${classe}\\nIntervenant : Abderrahmane Raquibi\\n\\nPrésentez votre QR code à l'accueil pour valider votre entrée et activer votre profil certifié.`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Morocco Tech Builders//Event Pass//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:mtb-event-${ticketId}@moroccotechbuilders.com`,
      `DTSTAMP:20260101T000000Z`,
      `DTSTART:20260125T093000Z`,
      `DTEND:20260125T130000Z`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription}`,
      `LOCATION:${eventLocation}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Rappel: Atelier Morocco Tech Builders dans 2 heures !',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="MTB-Event-${ticketId}.ics"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('iCalendar error:', error);
    return new NextResponse('Erreur de génération du calendrier', { status: 500 });
  }
}
