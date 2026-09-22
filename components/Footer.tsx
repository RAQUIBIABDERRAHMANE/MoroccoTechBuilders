import React from 'react';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topInner}>
            <div className={styles.brand}>
              {/* Logo */}
              <div className={styles.brandLogo}>
                <Image
                  src="/logo.jpg"
                  alt="Logo Morocco Tech Builders"
                  width={30}
                  height={30}
                  className={styles.brandLogoImg}
                />
                <span className={styles.brandName}>Morocco <span className={styles.brandSub}>Tech Builders</span></span>
              </div>
              <p className={styles.brandDesc}>
                Morocco Tech Builders — Session d'échange & atelier pratique sur la valorisation de la présence en ligne pour les stagiaires développeurs.
              </p>
            </div>

            <nav className={styles.links} aria-label="Liens du pied de page">
              <p className={styles.linksTitle}>Navigation</p>
              <a href="#programme">Programme</a>
              <a href="#objectifs">Objectifs</a>
              <a href="#intervenant">Intervenant</a>
              <a href="#inscription">S'inscrire</a>
              <a href="#faq">FAQ</a>
              <a href="/scan" style={{ color: 'var(--green)', fontWeight: '600' }}>Contrôle d'accès</a>
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
