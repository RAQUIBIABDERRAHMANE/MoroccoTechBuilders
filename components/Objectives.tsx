import React from 'react';
import styles from './Objectives.module.css';

const OBJECTIVES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
    title: 'Profil GitHub Professionnel',
    desc: 'Structurer vos dépôts et README pour impressionner les recruteurs IT dès le premier regard.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>,
    title: 'Portfolio Personnel en Ligne',
    desc: 'Déployer un site web qui valorise vos projets, compétences et identité de développeur.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
    title: 'LinkedIn Optimisé',
    desc: 'Bâtir un profil LinkedIn attractif pour contacter les recruteurs et décrocher votre PFE.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Éthique & Bonne Pratique',
    desc: 'Adopter les standards professionnels de sécurité, véracité et communication.',
  },
];

export default function Objectives() {
  return (
    <section id="objectifs" className="section-gray">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Ce que vous allez apprendre</span>
          <h2 className="section-h2">4 objectifs concrets</h2>
          <p className="section-sub">
            Chaque module a un livrable réel — vous repartez avec des assets directement utilisables.
          </p>
        </div>

        <div className={styles.grid} role="list">
          {OBJECTIVES.map(({ icon, title, desc }) => (
            <div key={title} className={`card ${styles.card}`} role="listitem">
              <div className={styles.iconWrap}>{icon}</div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
