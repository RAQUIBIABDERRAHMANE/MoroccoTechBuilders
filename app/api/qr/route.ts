import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data') || searchParams.get('text') || 'MTB-2026';

  const etag = `"${Buffer.from(data).toString('base64url').slice(0, 24)}"`;
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  try {
    const pngBuffer = await QRCode.toBuffer(data, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#082D5B',
        light: '#ffffff',
      },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'ETag': etag,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return new NextResponse('Erreur de génération du QR code', { status: 500 });
  }
}
