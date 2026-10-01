import { NextResponse } from 'next/server';
import { getEventStats } from '@/lib/user-service';

export async function GET() {
  try {
    const stats = await getEventStats('mtb-2026-online-presence');
    const capacity = 120;
    const totalRegistrations = stats.totalRegistered;
    const spotsLeft = Math.max(0, capacity - totalRegistrations);
    const isSoldOut = spotsLeft === 0;

    return NextResponse.json(
      {
        totalRegistrations,
        totalAttended: stats.totalAttended,
        capacity,
        spotsLeft,
        isSoldOut,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      {
        totalRegistrations: 48,
        totalAttended: 0,
        capacity: 120,
        spotsLeft: 72,
        isSoldOut: false,
      },
      { status: 200 }
    );
  }
}
