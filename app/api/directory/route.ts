import { NextRequest, NextResponse } from 'next/server';
import { getDirectoryAttendees } from '@/lib/user-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const classe = searchParams.get('classe') || undefined;
    const skill = searchParams.get('skill') || undefined;
    const eventId = searchParams.get('eventId') || undefined;

    const data = await getDirectoryAttendees({
      search,
      classe,
      skill,
      eventId,
    });

    return NextResponse.json(
      { success: true, ...data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching directory attendees:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des participants' },
      { status: 500 }
    );
  }
}
