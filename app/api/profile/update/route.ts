import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateUserProfile, getUserProfileWithEvents } from '@/lib/user-service';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Veuillez vous connecter pour modifier votre profil.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const githubInput = body.githubUsername || body.github || '';
    const linkedinInput = body.linkedinUrl || body.linkedin || '';
    const portfolioInput = body.portfolioUrl || body.portfolio || '';
    const bioInput = body.bio || '';
    const avatarInput = body.avatarUrl || body.avatar || '';

    // Clean links (e.g. if user entered "github.com/foo", normalize or save clean)
    let cleanGithub = (githubInput || '').trim().replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
    let cleanLinkedin = (linkedinInput || '').trim();
    if (cleanLinkedin && !cleanLinkedin.startsWith('http')) {
      cleanLinkedin = `https://${cleanLinkedin}`;
    }
    let cleanPortfolio = (portfolioInput || '').trim();
    if (cleanPortfolio && !cleanPortfolio.startsWith('http')) {
      cleanPortfolio = `https://${cleanPortfolio}`;
    }

    let cleanSkills: string[] = [];
    if (Array.isArray(body.skills)) {
      cleanSkills = body.skills.map((s: any) => String(s).trim()).filter(Boolean);
    } else if (typeof body.skills === 'string') {
      cleanSkills = body.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    await updateUserProfile(session.userId, {
      githubUsername: cleanGithub,
      linkedinUrl: cleanLinkedin,
      portfolioUrl: cleanPortfolio,
      bio: bioInput.trim(),
      skills: cleanSkills,
      avatarUrl: avatarInput.trim(),
    });

    const updatedProfile = await getUserProfileWithEvents(session.userId);

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès !',
      user: updatedProfile,
    });
  } catch (error: any) {
    console.error('Profile Update API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du profil.' },
      { status: 500 }
    );
  }
}
