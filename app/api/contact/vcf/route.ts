import { NextRequest, NextResponse } from 'next/server';
import { getPublicProfile } from '@/lib/user-service';
import { generateVCardString } from '@/lib/vcard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id') || searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 400 });
    }

    const user = await getPublicProfile(userId);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const vCardText = generateVCardString(user);
    const filename = `${user.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.vcf`;

    return new NextResponse(vCardText, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('vCard API error:', error);
    return NextResponse.json({ error: 'Erreur génération contact' }, { status: 500 });
  }
}
