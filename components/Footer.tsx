import React from 'react';
import MTBLogo from './MTBLogo';
import styles from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topInner}>
            <div className={styles.brand}>
              {/* Official Brand Logo */}
              <div style={{ marginBottom: '16px' }}>
                <MTBLogo size={38} variant="dark" showTagline />
              </div>
              <p className={styles.brandDesc}>
                Morocco Tech Builders — A community for builders, learners, creators and innovators. Atelier pratique pour les stagiaires développeurs.
              </p>
            </div>

            <nav className={styles.links} aria-label="Liens du pied de page">
              <p className={styles.linksTitle}>Navigation</p>
              <Link href="#programme">Programme</Link>
              <Link href="#objectifs">Objectifs</Link>
              <Link href="#intervenant">Intervenant</Link>
              <Link href="#inscription">S'inscrire</Link>
              <Link href="#faq">FAQ</Link>
              
            </nav>

            <div className={styles.info}>
              <p className={styles.linksTitle}>Informations</p>
              <p className={styles.infoItem}>
                <span className={styles.infoLabel}>Lieu :</span> Salle de Conférence, OFPPT
              </p>
              <p className={styles.infoItem}>
                <span className={styles.infoLabel}>Date :</span> Octobre 2026
              </p>
              <p className={styles.infoItem}>
                <span className={styles.infoLabel}>Public :</span> Stagiaires Développement Digital
              </p>
              <p className={styles.infoItem}>
                <span className={styles.infoLabel}>Accès :</span> Gratuit sur inscription
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copy}>
              © 2026 Morocco Tech Builders · OFPPT Marrakech. Préparé par <strong>Abderrahmane Raquibi</strong>.
            </p>
            <p className={styles.built}>Construit avec Next.js</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
