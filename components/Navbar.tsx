'use client';

import React, { useState } from 'react';
import MTBLogo from './MTBLogo';
import styles from './Navbar.module.css';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '#programme', label: 'Programme' },
  { href: '#objectifs', label: 'Objectifs' },
  { href: '#intervenant', label: 'Intervenant' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(null);

  React.useEffect(() => {
    // Check auth status
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => { });

    const sectionIds = ['programme', 'objectifs', 'intervenant', 'faq'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'MTB';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className={styles.header} role="banner">
      <div className={`container ${styles.inner}`}>
        {/* Logo (Light Variant with Deep Navy & Moroccan Red/Green) */}
        <Link href="/" className={styles.logo} aria-label="Morocco Tech Builders — Retour à l'accueil">
          <MTBLogo size={36} variant="light" />
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Navigation principale">
          {NAV_LINKS.map(({ href, label }) => {
            const id = href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                {isActive && <span className={styles.activeDot} aria-hidden="true" />}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className={styles.navActions}>
          {user ? (
            <Link href="/profile" className={styles.profileBtn} title="Accéder à mon espace profil">
              <span className={styles.avatarMini}>{getInitials(user.fullName)}</span>
              <span>Mon Profil</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Connexion
              </Link>
              <Link href="#inscription" className={`btn-red ${styles.navCta}`}>
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Burger */}
        <button
          className={styles.burger}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <span className={`${styles.bLine} ${open ? styles.open1 : ''}`} />
          <span className={`${styles.bLine} ${open ? styles.openHide : ''}`} />
          <span className={`${styles.bLine} ${open ? styles.open3 : ''}`} />
        </button>
      </div>

      {open && (
        <div className={styles.drawer}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.drawerLink} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          {user ? (
            <Link href="/profile" className={styles.drawerProfileLink} onClick={() => setOpen(false)}>
              <span className={styles.avatarMini}>{getInitials(user.fullName)}</span>
              <span>Mon Profil Développeur</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.drawerLink} onClick={() => setOpen(false)}>
                Connexion
              </Link>
              <Link href="#inscription" className={`btn-red ${styles.drawerCta}`} onClick={() => setOpen(false)}>
                S'inscrire maintenant
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
