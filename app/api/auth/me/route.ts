import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserProfileWithEvents } from '@/lib/user-service';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    const profile = await getUserProfileWithEvents(session.userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Profil introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: profile,
      registrations: profile.registrations || [],
    });
  } catch (error) {
    console.error('Auth ME API Error:', error);
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Erreur lors de la récupération du profil.' },
      { status: 500 }
    );
  }
}
