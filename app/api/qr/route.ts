import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data') || searchParams.get('text') || 'MTB-2026';

  try {
    const pngBuffer = await QRCode.toBuffer(data, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0d1117',
        light: '#ffffff',
      },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return new NextResponse('Erreur de génération du QR code', { status: 500 });
  }
}
