import { NextRequest, NextResponse } from 'next/server';
import { updateEvent, getEventById } from '@/lib/user-service';

export const dynamic = 'force-dynamic';

function checkAdminAuth(request: NextRequest): boolean {
  const pin = request.headers.get('x-admin-pin');
  const validPin = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_SCAN_PIN || '2126';
  return pin === validPin;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await updateEvent(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Événement introuvable' }, { status: 404 });
    }

    const event = await getEventById(id);

    return NextResponse.json({
      success: true,
      message: 'Événement mis à jour avec succès !',
      event,
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
