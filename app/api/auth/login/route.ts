import { NextResponse } from 'next/server';
import { findUserByEmail, getUserRegistrations } from '@/lib/user-service';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir votre email et votre mot de passe.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Aucun compte trouvé avec cette adresse email.' },
        { status: 404 }
      );
    }

    const isValid = verifyPassword(String(password), user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect. Veuillez réessayer.' },
        { status: 401 }
      );
    }

    // Set Session Cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      classe: user.classe,
    });

    const registrations = await getUserRegistrations(user.id);

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie !',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        classe: user.classe,
        year: user.year,
        githubUsername: user.githubUsername,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        bio: user.bio,
        skills: user.skills,
        avatarUrl: user.avatarUrl,
        registrations,
      },
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la connexion.' },
      { status: 500 }
    );
  }
}
