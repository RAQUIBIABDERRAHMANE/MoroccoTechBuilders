import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/user-service';
import { createPasswordResetToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`reset-req:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Trop de demandes de réinitialisation. Veuillez patienter ${rl.reset}s.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir une adresse email valide.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    let resetToken = '';
    let resetUrl = '';

    if (user) {
      resetToken = createPasswordResetToken(user.id, user.email);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

      // Send to n8n webhook if available
      const webhookUrl =
        process.env.RESET_PASSWORD_WEBHOOK_URL ||
        process.env.EVENT_WEBHOOK_URL ||
        process.env.N8N_WEBHOOK_URL;

      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            type: 'password_reset',
            email: user.email,
            fullName: user.fullName,
            resetToken,
            resetUrl,
          }),
        }).catch((err) => console.warn('Reset password webhook warning:', err));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Si cette adresse email est enregistrée, un lien de réinitialisation vous a été envoyé.',
      // Provide reset link in non-production for frictionless testing
      ...(process.env.NODE_ENV !== 'production' && resetUrl ? { debugResetUrl: resetUrl } : {}),
    });
  } catch (error: any) {
    console.error('Reset Request API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la demande de réinitialisation.' },
      { status: 500 }
    );
  }
}
