import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la déconnexion.' },
      { status: 500 }
    );
  }
}
