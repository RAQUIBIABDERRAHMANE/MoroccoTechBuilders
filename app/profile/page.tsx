'use client';

import React, { useEffect, useState } from 'react';
import MTBLogo from '@/components/MTBLogo';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import styles from './profile.module.css';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  classe: string;
  year: string;
  phone?: string;
  githubUsername?: string;
  github?: string;
  linkedinUrl?: string;
  linkedin?: string;
  portfolioUrl?: string;
  portfolio?: string;
  bio?: string;
  skills?: string[] | string;
}

interface EventReg {
  id: string;
  userId?: string;
  eventId?: string;
  eventName?: string;
  ticketId?: string;
  ticket_id?: string;
  qrCodeData?: string;
  qr_code_value?: string;
  status: string;
  registeredAt?: string;
  created_at?: string;
  attendedAt?: string;
  attended_at?: string;
}

const PRESET_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript',
  'Node.js', 'Python', 'PHP / Laravel', 'TailwindCSS',
  'PostgreSQL', 'Turso / SQLite', 'Git & GitHub', 'Docker',
  'Figma', 'Rest APIs', 'FastAPI'
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<EventReg[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Profile Edit State
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace('/login');
          return;
        }

        setUser(data.user);
        setRegistrations(data.registrations || data.user?.registrations || []);

        // Prepopulate form safely
        setBio(data.user.bio || '');
        setGithub(data.user.githubUsername || data.user.github || '');
        setLinkedin(data.user.linkedinUrl || data.user.linkedin || '');
        setPortfolio(data.user.portfolioUrl || data.user.portfolio || '');

        if (data.user.skills) {
          if (Array.isArray(data.user.skills)) {
            setSelectedSkills(data.user.skills.map(String).filter(Boolean));
          } else if (typeof data.user.skills === 'string') {
            try {
              const parsed = JSON.parse(data.user.skills);
              if (Array.isArray(parsed)) {
                setSelectedSkills(parsed.map(String).filter(Boolean));
              } else {
                setSelectedSkills(data.user.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
              }
            } catch {
              setSelectedSkills(data.user.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Session verification error:', err);
        router.replace('/login');
      });
  }, [router]);

  const primaryReg = registrations[0] || null;
  const qrCodeData = primaryReg
    ? (primaryReg.qrCodeData || primaryReg.qr_code_value || (user ? `${user.fullName}-${user.classe}` : ''))
    : (user ? `${user.fullName}-${user.classe}` : '');
  const ticketId = primaryReg ? (primaryReg.ticketId || primaryReg.ticket_id || 'MTB-2026-REG') : 'MTB-2026-REG';
  const qrFallbackUrl = qrCodeData ? `/api/qr?data=${encodeURIComponent(qrCodeData)}` : '';
  const isAttended = primaryReg?.status === 'attended';

  // React Hook: QR code generation (must be called unconditionally before early return)
  useEffect(() => {
    if (qrCodeData) {
      QRCode.toDataURL(qrCodeData, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#0d1117', light: '#ffffff' },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {
          setQrDataUrl(qrFallbackUrl);
        });
    }
  }, [qrCodeData, qrFallbackUrl]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      const val = customSkillInput.trim();
      if (!selectedSkills.includes(val)) {
        setSelectedSkills([...selectedSkills, val]);
      }
      setCustomSkillInput('');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          github,
          linkedin,
          portfolio,
          skills: selectedSkills.join(', '),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Impossible de sauvegarder le profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(63, 185, 80, 0.2)',
            borderTopColor: 'var(--green)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Atelier: Construire sa Présence en Ligne')}&dates=20260125T093000Z/20260125T130000Z&details=${encodeURIComponent('Conférence technique MTB & OFPPT Marrakech animée par Abderrahmane Raquibi.')}&location=${encodeURIComponent('Salle Polyvalente NTIC Sidi Youssef Ben Ali, Marrakech')}`;

  return (
    <div className={styles.container}>
      {/* Top Bar Navigation */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.topBarBrand} aria-label="Retour à l'accueil">
            <MTBLogo size={32} variant="dark" />
          </Link>

          <div className={styles.topBarRight}>
            <Link href={`/u/${user.id}`} className={styles.publicProfileBtn} target="_blank">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Profil Public
            </Link>

            <button onClick={handleLogout} className={styles.logoutBtn} title="Se déconnecter">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Profile Hero Header */}
        <section className={styles.profileHero}>
          <div className={styles.heroLeft}>
            <div className={styles.avatarBig}>
              {getInitials(user.fullName)}
            </div>
            <div className={styles.heroInfo}>
              <h1>{user.fullName}</h1>
              <div className={styles.heroBadges}>
                <span className={styles.tagClasse}>Classe {user.classe}</span>
                <span className={styles.tagYear}>{user.year}</span>
                {isAttended ? (
                  <span className={styles.tagVerified}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Présence Confirmée
                  </span>
                ) : (
                  <span className={styles.tagYear}>Pass Émis</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" className={styles.backEventBtn}>
              ← Site de l'événement
            </Link>
          </div>
        </section>

        {/* Two Column Grid: Pass Card & Profile Editor */}
        <div className={styles.grid}>
          {/* Card 1: Official Pass & QR Code */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                </svg>
                Mon Pass d'Entrée Officiel
              </h2>
              {isAttended ? (
                <span className={styles.statusAttended}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Présence Validée
                </span>
              ) : (
                <span className={styles.statusPending}>
                  ● En attente du scan
                </span>
              )}
            </div>

            <div className={styles.passContainer}>
              <div className={styles.qrWrapper}>
                <img
                  src={qrDataUrl || qrFallbackUrl}
                  alt={`QR code d'accès de ${user.fullName}`}
                  className={styles.qrImage}
                />
              </div>

              <div className={styles.qrValue}>
                {qrCodeData}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
                {isAttended
                  ? 'Votre présence a été enregistrée avec succès à l\'accueil.'
                  : 'Présentez ce QR code à l\'équipe d\'accueil à l\'entrée pour valider votre présence.'}
              </p>

              <div className={styles.passMetaGrid}>
                <div className={styles.passMetaItem}>
                  <div className={styles.metaLabel}>Numéro de Billet</div>
                  <div className={styles.metaVal}>{ticketId}</div>
                </div>
                <div className={styles.passMetaItem}>
                  <div className={styles.metaLabel}>Date & Heure</div>
                  <div className={styles.metaVal}>25 Janvier 2026 · 09:30</div>
                </div>
                <div className={styles.passMetaItem}>
                  <div className={styles.metaLabel}>Lieu</div>
                  <div className={styles.metaVal}>Salle Polyvalente NTIC Marrakech</div>
                </div>
                <div className={styles.passMetaItem}>
                  <div className={styles.metaLabel}>Intervenant</div>
                  <div className={styles.metaVal}>Abderrahmane Raquibi</div>
                </div>
              </div>
            </div>

            <div className={styles.passActions}>
              <button
                onClick={() => window.print()}
                className={styles.btnPrintBadge}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
                Imprimer mon Badge
              </button>

              <a
                href={calendarUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.btnCalendar}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Ajouter au Calendrier
              </a>
            </div>
          </section>

          {/* Card 2: Developer Profile Editor */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Mon Profil Développeur
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                Visible publiquement
              </span>
            </div>

            {saveSuccess && (
              <div style={{
                background: 'rgba(63, 185, 80, 0.15)',
                border: '1px solid rgba(63, 185, 80, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: '#56d364',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Profil sauvegardé avec succès !
              </div>
            )}

            {saveError && (
              <div style={{
                background: 'rgba(209, 36, 47, 0.15)',
                border: '1px solid rgba(209, 36, 47, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: '#ff7b72',
                fontSize: '0.86rem',
              }}>
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className={styles.form}>
              <div className={styles.inputField}>
                <label htmlFor="bio">Bio / Courte présentation</label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Ex: Stagiaire passionné par le développement web fullstack, l'architecture logicielle et les technologies cloud..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className={styles.inputField}>
                <label htmlFor="github">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Nom d'utilisateur ou Lien GitHub
                </label>
                <input
                  id="github"
                  type="text"
                  placeholder="Ex: octocat ou https://github.com/..."
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>

              <div className={styles.inputField}>
                <label htmlFor="linkedin">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  Profil LinkedIn URL
                </label>
                <input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>

              <div className={styles.inputField}>
                <label htmlFor="portfolio">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Site Web Personnel / Portfolio
                </label>
                <input
                  id="portfolio"
                  type="url"
                  placeholder="https://mon-portfolio.dev"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
              </div>

              <div className={styles.inputField}>
                <label>Compétences & Technologies</label>
                <div className={styles.skillsWrap}>
                  {PRESET_SKILLS.map((sk) => {
                    const active = selectedSkills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => toggleSkill(sk)}
                        className={`${styles.skillChip} ${active ? styles.skillChipActive : ''}`}
                      >
                        {active && '✓ '}
                        {sk}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Ajouter une compétence puis Entrée (ex: Redis, GraphQL)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={addCustomSkill}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <button
                type="submit"
                className={`btn-green ${styles.saveBtn}`}
                disabled={saving}
              >
                {saving ? 'Enregistrement en cours...' : 'Enregistrer mon Profil'}
              </button>
            </form>
          </section>
        </div>

        {/* Section 3: Certificate of Attendance */}
        {isAttended ? (
          <section className={styles.certificateCard} id="printable-cert">
            <div className={styles.certHeader}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#ffd700', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Document Officiel
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
                  Attestation de Participation & Présence
                </h3>
              </div>
              <button
                onClick={() => window.print()}
                className="btn-green"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)',
                  color: '#0d1117',
                  border: 'none',
                  fontWeight: '700',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.35)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
                Télécharger mon Attestation
              </button>
            </div>

            <div className={styles.certPreview}>
              <div className={styles.certTitle}>
                Attestation de Participation
              </div>
              <div className={styles.certSub}>
                Morocco Tech Builders · Communauté des Développeurs & Stagiaires OFPPT
              </div>

              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '8px' }}>
                Ce certificat est fièrement décerné à :
              </p>
              <div className={styles.certRecipient}>
                {user.fullName}
              </div>

              <p className={styles.certBody}>
                Pour sa participation active à la conférence et à l'atelier technique
                <strong> « Construire sa Présence en Ligne: Portfolio, Réseaux & Visibilité Professionnelle »</strong>,
                organisé à Marrakech le <strong>25 Janvier 2026</strong>.
              </p>

              <div className={styles.certFooter}>
                <div style={{ textAlign: 'left' }}>
                  <div>Identifiant Certificat : <strong style={{ color: '#fff' }}>{ticketId}</strong></div>
                  <div>Vérifiable sur : <strong style={{ color: 'var(--green)' }}>moroccotechbuilders.org/u/{user.id}</strong></div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: '#fff' }}>Abderrahmane Raquibi</div>
                  <div style={{ fontSize: '0.75rem' }}>Fondateur MTB & Développeur Fullstack</div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className={styles.certLocked}>
            <div className={styles.lockedIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
              Attestation de Participation Verrouillée
            </h3>
            <p style={{ maxWidth: '540px', fontSize: '0.85rem', margin: 0 }}>
              Votre attestation officielle de participation sera automatiquement déverrouillée et disponible en téléchargement haute définition dès que votre pass QR aura été validé par les organisateurs à l'entrée de la salle.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
