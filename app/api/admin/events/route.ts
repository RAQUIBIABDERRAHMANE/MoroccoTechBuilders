import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent } from '@/lib/user-service';

export const dynamic = 'force-dynamic';

function checkAdminAuth(request: NextRequest): boolean {
  const pin = request.headers.get('x-admin-pin');
  const validPin = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_SCAN_PIN || '2126';
  return pin === validPin;
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const events = await getAllEvents();
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error('Error fetching admin events:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || !body.date || !body.speaker) {
      return NextResponse.json(
        { success: false, error: 'Nom, date et intervenant sont obligatoires' },
        { status: 400 }
      );
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const event = await createEvent({
      name: body.name,
      slug,
      description: body.description,
      speaker: body.speaker,
      speakerRole: body.speakerRole,
      location: body.location || 'OFPPT Marrakech',
      date: body.date,
      startTime: body.startTime || '14:00',
      endTime: body.endTime || '17:30',
      capacity: Number(body.capacity || 120),
      isActive: Boolean(body.isActive),
    });

    return NextResponse.json({
      success: true,
      message: 'Événement créé avec succès !',
      event,
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
