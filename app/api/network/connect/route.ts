import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveUserConnection, getUserConnections } from '@/lib/user-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Connectez-vous pour enregistrer des connexions dans votre réseau.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const targetUserId = (body.targetUserId || body.userId || '').trim();
    const note = body.note ? String(body.note).trim() : undefined;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du contact manquant' },
        { status: 400 }
      );
    }

    if (targetUserId === session.userId) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas vous ajouter vous-même en contact.' },
        { status: 400 }
      );
    }

    const res = await saveUserConnection(session.userId, targetUserId, note);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: 'Impossible d’enregistrer ce contact.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact enregistré avec succès dans votre réseau MTB !',
      connectionId: res.connectionId,
    });
  } catch (error: any) {
    console.error('Network connect API error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’enregistrement de la connexion.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const connections = await getUserConnections(session.userId);

    return NextResponse.json({
      success: true,
      connections,
    });
  } catch (error: any) {
    console.error('Get user connections error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de vos connexions' },
      { status: 500 }
    );
  }
}
