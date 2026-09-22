'use client';

import React from 'react';
import Image from 'next/image';
import Countdown from './Countdown';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Événement principal">
      {/* Top eyebrow bar */}
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowDot} aria-hidden="true" />
        Morocco Tech Builders · Développement Digital · OFPPT Marrakech
      </div>

      <div className={`container ${styles.grid}`}>
        {/* ── Left: Text ── */}
        <div className={styles.textCol}>
          <p className={styles.edition}>SAISON 2026</p>

          <h1 className={styles.title}>
            Construire sa{' '}
            <span className={styles.titleGreen}>Présence&nbsp;en&nbsp;Ligne</span>
            {' '}—{' '}
            Stagiaires<br />
            Développement Digital
          </h1>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              OCTOBRE 2026
            </div>
            <div className={styles.metaDot} aria-hidden="true" />
            <div className={styles.metaItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              SALLE DE CONFÉRENCE, OFPPT
            </div>
          </div>

          <div className={styles.ctas}>
            <a href="#inscription" className="btn-green">
              S'inscrire — Gratuit
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </a>
            <a href="#programme" className="btn-outline-white">
              Voir le programme
            </a>
          </div>

          <div className={styles.countdownWrap}>
            <Countdown />
          </div>
        </div>

        {/* ── Right: 3D Visual ── */}
        <div className={styles.visualCol} aria-hidden="true">
          <div className={styles.visualFrame}>
            <Image
              src="/hero-visual.jpg"
              alt=""
              fill
              className={styles.heroImg}
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            {/* Overlay gradient to blend edges */}
            <div className={styles.visualOverlayLeft} />
            <div className={styles.visualOverlayBottom} />
          </div>
        </div>
      </div>
    </section>
  );
}
