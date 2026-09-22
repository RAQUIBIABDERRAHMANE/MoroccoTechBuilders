import React from 'react';
import styles from './Speaker.module.css';

const SKILLS = ['React', 'Next.js', 'Laravel', 'GitHub', 'Portfolio Design', 'LinkedIn'];

export default function Speaker() {
  return (
    <section id="intervenant" className="section-white">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Intervenant principal</span>
          <h2 className="section-h2">Animé par un pair</h2>
          <p className="section-sub">
            Un stagiaire DD qui partage son expérience concrète — pas un expert théorique.
          </p>
        </div>

        <div className={styles.card}>
          {/* Left: Profile */}
          <div className={styles.profileCol}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>AR</div>
              <span className={styles.liveTag}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <circle cx="4" cy="4" r="4" fill="#3fb950"/>
                </svg>
                Animateur
              </span>
            </div>
            <div className={styles.identity}>
              <h3 className={styles.name}>Abderrahmane Raquibi</h3>
              <p className={styles.role}>Stagiaire Développement Digital</p>
              <p className={styles.inst}>OFPPT Marrakech</p>
            </div>

            <div className={styles.socialLinks} aria-label="Réseaux professionnels">
              <a
                href="https://github.com/RAQUIBIABDERRAHMANE"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Profil GitHub d'Abderrahmane"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/raquibi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Profil LinkedIn d'Abderrahmane"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 0 0-1.64 1.64 1.64 1.64 0 0 0 1.64 1.64c.9 0 1.64-.74 1.64-1.64 0-.9-.74-1.64-1.64-1.64z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>

            <div className={styles.skills} role="list" aria-label="Compétences">
              {SKILLS.map((s) => (
                <span key={s} className={styles.skill} role="listitem">{s}</span>
              ))}
            </div>
          </div>

          {/* Right: Bio */}
          <div className={styles.bioCol}>
            <blockquote className={styles.quote}>
              « La meilleure façon d'apprendre, c'est d'un pair qui vient de vivre la même expérience. »
            </blockquote>
            <p className={styles.bio}>
              Abderrahmane est stagiaire en 2ème année de Développement Digital à l'OFPPT de Marrakech. Passionné par l'écosystème web moderne, il a développé une expertise pratique en construction de présence en ligne pour les développeurs juniors.
            </p>
            <p className={styles.bio}>
              À travers cette session, il partage ses retours d'expérience concrets sur GitHub, portfolio et LinkedIn — les outils qui transforment véritablement les perspectives de stage.
            </p>

            <div className={styles.stats} role="list">
              {[
                { val: '2ème', label: 'Année DD' },
                { val: '6', label: 'Modules préparés' },
                { val: '50+', label: 'Participants attendus' },
              ].map(({ val, label }) => (
                <div key={label} className={styles.statItem} role="listitem">
                  <span className={styles.statVal}>{val}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>

            <a href="#inscription" className="btn-green" style={{ alignSelf: 'flex-start' }}>
              S'inscrire à la session
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
