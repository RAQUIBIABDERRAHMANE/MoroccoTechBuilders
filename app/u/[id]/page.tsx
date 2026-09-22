import React from 'react';
import MTBLogo from '@/components/MTBLogo';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserProfileWithEvents } from '@/lib/user-service';
import styles from './public-profile.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const profile = await getUserProfileWithEvents(id);

  if (!profile) {
    return {
      title: 'Profil Stagiaire · Morocco Tech Builders',
    };
  }

  return {
    title: `${profile.fullName} · Profil Développeur Morocco Tech Builders`,
    description: `Découvrez le profil et les compétences de ${profile.fullName} (Classe ${profile.classe} - OFPPT Marrakech).`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getUserProfileWithEvents(id);

  if (!profile) {
    notFound();
  }

  const isAttended = profile.registrations?.some((r) => r.status === 'attended');
  const skillsList = Array.isArray(profile.skills) ? profile.skills : [];

  const getInitials = (name: string) => {
    if (!name) return 'MTB';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const cleanGithubUrl = (gh?: string) => {
    if (!gh) return null;
    if (gh.startsWith('http://') || gh.startsWith('https://')) return gh;
    return `https://github.com/${gh.replace('@', '').trim()}`;
  };

  const githubUrl = cleanGithubUrl(profile.githubUsername);
  const linkedinUrl = profile.linkedinUrl;
  const portfolioUrl = profile.portfolioUrl;

  return (
    <div className={styles.container}>
      <nav className={styles.topNav}>
        <Link href="/" className={styles.brandLink} aria-label="Retour à l'accueil">
          <MTBLogo size={28} variant="dark" />
        </Link>
        <Link href="/" className={styles.homeBtn}>
          ← Événement & Inscription
        </Link>
      </nav>

      <main className={styles.profileCard}>
        {/* Profile Header */}
        <header className={styles.profileHeader}>
          <div className={styles.avatar}>
            {getInitials(profile.fullName)}
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.name}>{profile.fullName}</h1>
            <div className={styles.subMeta}>
              <span className={styles.badgeClasse}>Classe {profile.classe}</span>
              <span className={styles.badgeYear}>OFPPT Marrakech · {profile.year}</span>
              {isAttended && (
                <span className={styles.badgeAttended}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Présence Confirmée
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Bio Section */}
        {profile.bio && (
          <div className={styles.bioSection}>
            {profile.bio}
          </div>
        )}

        {/* Skills Section */}
        {skillsList.length > 0 && (
          <section className={styles.skillsSection}>
            <h2 className={styles.sectionTitle}>Compétences & Technologies</h2>
            <div className={styles.skillsGrid}>
              {skillsList.map((skill, idx) => (
                <span key={idx} className={styles.skillItem}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Social & Portfolio Links */}
        {(githubUrl || linkedinUrl || portfolioUrl) && (
          <section className={styles.skillsSection}>
            <h2 className={styles.sectionTitle}>Liens Professionnels</h2>
            <div className={styles.socialLinks}>
              {githubUrl && (
                <Link
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialBtn}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </Link>
              )}

              {linkedinUrl && (
                <Link
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialBtn}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </Link>
              )}

              {portfolioUrl && (
                <Link
                  href={portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialBtn}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Site Personnel
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Events Participation */}
        <section className={styles.eventsSection}>
          <h2 className={styles.sectionTitle}>Événements & Ateliers Rejoints</h2>
          <div className={styles.eventCard}>
            <div>
              <div className={styles.eventCardTitle}>
                Construire sa Présence en Ligne: Portfolio, Réseaux & Visibilité Pro
              </div>
              <div className={styles.eventCardDate}>
                25 Janvier 2026 · Salle Polyvalente NTIC Marrakech · Intervenant: Abderrahmane Raquibi
              </div>
            </div>
            <div>
              {isAttended ? (
                <span className={styles.badgeAttended}>
                  ✓ Présence Validée
                </span>
              ) : (
                <span className={styles.badgeClasse}>
                  Inscrit
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className={styles.footerCta}>
          <Link href="/" className={`btn-green ${styles.joinBtn}`}>
            Découvrir l'événement & Rejoindre la Communauté
          </Link>
        </div>
      </main>
    </div>
  );
}
