'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '#programme', label: 'Programme' },
  { href: '#objectifs', label: 'Objectifs' },
  { href: '#intervenant', label: 'Intervenant' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  React.useEffect(() => {
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

  return (
    <header className={styles.header} role="banner">
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="#" className={styles.logo} aria-label="Retour en haut">
          <Image
            src="/logo.jpg"
            alt="Logo Morocco Tech Builders"
            width={34}
            height={34}
            className={styles.logoImg}
            priority
          />
          <span className={styles.logoText}>Morocco <span className={styles.logoSub}>Tech Builders</span></span>
        </a>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Navigation principale">
          {NAV_LINKS.map(({ href, label }) => {
            const id = href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <a
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                {isActive && <span className={styles.activeDot} aria-hidden="true" />}
                {label}
              </a>
            );
          })}
        </nav>

        {/* CTA */}
        <a href="#inscription" className={`btn-green ${styles.navCta}`}>
          S'inscrire
        </a>

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
            <a key={href} href={href} className={styles.drawerLink} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a href="#inscription" className={`btn-green ${styles.drawerCta}`} onClick={() => setOpen(false)}>
            S'inscrire maintenant
          </a>
        </div>
      )}
    </header>
  );
}
