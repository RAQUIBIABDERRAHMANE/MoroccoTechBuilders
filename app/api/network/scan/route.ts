import { NextRequest, NextResponse } from 'next/server';
import { resolvePublicContactFromQR } from '@/lib/user-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const qrData = (body.qrData || body.data || '').trim();

    if (!qrData) {
      return NextResponse.json(
        { success: false, error: 'Données QR manquantes' },
        { status: 400 }
      );
    }

    const contact = await resolvePublicContactFromQR(qrData);

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pass ou QR code non reconnu. Assurez-vous que votre interlocuteur utilise son pass officiel Morocco Tech Builders.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error: any) {
    console.error('Network QR Scan API error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la lecture du QR code.' },
      { status: 500 }
    );
  }
}
