import { NextResponse } from 'next/server';
import { verifyPasswordResetToken } from '@/lib/auth';
import { updateUserPassword, findUserById } from '@/lib/user-service';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`reset-pwd:${ip}`, 5, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Trop de tentatives. Veuillez patienter.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Jeton et nouveau mot de passe requis.' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const payload = verifyPasswordResetToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Ce lien de réinitialisation est invalide ou a expiré (validité: 1 heure).' },
        { status: 400 }
      );
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable.' },
        { status: 404 }
      );
    }

    const updated = await updateUserPassword(payload.userId, String(password));
    if (!updated) {
      throw new Error('Échec de la mise à jour du mot de passe dans la base.');
    }

    return NextResponse.json({
      success: true,
      message: 'Votre mot de passe a été mis à jour avec succès ! Vous pouvez maintenant vous connecter.',
    });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de la réinitialisation du mot de passe.' },
      { status: 500 }
    );
  }
}
