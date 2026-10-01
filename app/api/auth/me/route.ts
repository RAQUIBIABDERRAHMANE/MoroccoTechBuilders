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

    let profile = null;
    try {
      profile = await getUserProfileWithEvents(session.userId);
    } catch (dbErr) {
      console.warn('Transient Turso DB connection error in /api/auth/me, using session fallback:', dbErr);
    }

    if (!profile) {
      // Graceful fallback to session data so user remains authenticated during brief network hiccup
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: session.userId,
          fullName: session.fullName,
          email: session.email,
          classe: session.classe,
          year: session.classe.includes('1') ? '1ère Année' : '2ème Année',
          skills: [],
        },
        registrations: [],
      });
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
