import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Speaker.module.css';

const SKILLS = ['React / Next.js', 'Laravel & APIs', 'GitHub Professional', 'Portfolio & SEO', 'LinkedIn Networking'];

export default function Speaker() {
  return (
    <section id="intervenant" className="section-white">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Intervenant & Pair</span>
          <h2 className="section-h2">Animé par un pair pour des pairs</h2>
          <p className="section-sub">
            Un stagiaire DD qui partage sa méthode concrète, ses livrables et son retour d'expérience direct — pas un cours magistral abstrait.
          </p>
        </div>

        <div className={styles.card}>
          {/* Left: Profile */}
          <div className={styles.profileCol}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarPhotoFrame}>
                <Image
                  src="/speaker.jpg"
                  alt="Abderrahmane Raquibi - Stagiaire Développement Digital"
                  width={112}
                  height={112}
                  className={styles.avatarPhoto}
                />
              </div>
              <span className={styles.liveTag}>
                <span className={styles.livePulse} aria-hidden="true" />
                Animateur de la session
              </span>
            </div>
            
            <div className={styles.identity}>
              <h3 className={styles.name}>Abderrahmane Raquibi</h3>
              <p className={styles.role}>Stagiaire Développement Digital</p>
              <p className={styles.inst}>OFPPT Marrakech • Promotion 2025-2027</p>
            </div>

            <div className={styles.socialLinks} aria-label="Réseaux professionnels">
              <Link
                href="https://github.com/RAQUIBIABDERRAHMANE"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Profil GitHub d'Abderrahmane"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </Link>
              <Link
                href="https://linkedin.com/in/raquibi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Profil LinkedIn d'Abderrahmane"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 0 0-1.64 1.64 1.64 1.64 0 0 0 1.64 1.64c.9 0 1.64-.74 1.64-1.64 0-.9-.74-1.64-1.64-1.64z" />
                </svg>
                <span>LinkedIn</span>
              </Link>
            </div>

            <div className={styles.skills} role="list" aria-label="Compétences et domaines">
              {SKILLS.map((s) => (
                <span key={s} className={styles.skill} role="listitem">{s}</span>
              ))}
            </div>
          </div>

          {/* Right: Bio & Impact */}
          <div className={styles.bioCol}>
            <blockquote className={styles.quote}>
              « La meilleure façon de franchir le cap du premier stage PFE, c'est d'apprendre d'un pair qui a appliqué ces stratégies avec succès. »
            </blockquote>
            
            <p className={styles.bio}>
              Abderrahmane est stagiaire en 2ème année Développement Digital à l'OFPPT Marrakech. Convaincu que le diplôme seul ne suffit plus sur un marché tech compétitif, il a structuré sa propre présence en ligne (profil GitHub dynamique, portfolio déployé, réseau LinkedIn actif) et aide aujourd'hui ses camarades à en faire autant.
            </p>
            
            <p className={styles.bio}>
              Durant cet atelier de 2h30, vous ne resterez pas passifs : chaque concept abordé se transforme immédiatement en code, en template ou en profil actualisé sur votre propre machine.
            </p>

            <div className={styles.stats} role="list">
              {[
                { val: '2ème', label: 'Année DD à l\'OFPPT' },
                { val: '4', label: 'Livrables Pratiques' },
                { val: '50+', label: 'Stagiaires Conviés' },
                { val: '100%', label: 'Gratuit & Ouvert' },
              ].map(({ val, label }) => (
                <div key={label} className={styles.statItem} role="listitem">
                  <span className={styles.statVal}>{val}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <Link href="#inscription" className="btn-red">
                Réserver ma place avec Abderrahmane
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <span className={styles.actionNote}>Accès gratuit • Places limitées à 50 stagiaires</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
