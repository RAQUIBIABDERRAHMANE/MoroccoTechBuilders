'use client';

import React, { useState } from 'react';
import styles from './ProgramAgenda.module.css';

interface Module {
  id: number;
  time: string;
  tag: string;
  color: string;
  title: string;
  desc: string;
  points: string[];
}

const MODULES: Module[] = [
  {
    id: 1, time: '15 min', tag: 'Fondation', color: 'blue',
    title: 'Présence en Ligne & Identité Numérique',
    desc: 'Comprendre pourquoi la réputation technique en ligne est le premier filtre des recruteurs avant même l\'entretien de stage.',
    points: [
      'Importance de l\'identité numérique pour un stagiaire DD',
      'Présence passive vs présence active valorisante',
      'Comment les recruteurs sourcent les profils juniors au Maroc',
    ],
  },
  {
    id: 2, time: '25 min', tag: 'GitHub', color: 'green',
    title: 'Profil GitHub : Structuration & Impact',
    desc: 'Transformer vos dépôts de classe en une vitrine de code claire et lisible pour les recruteurs.',
    points: [
      'Organisation des dépôts — épingler les meilleurs projets',
      'README de profil soigné avec vos technologies phares',
      'Documentation : architecture, démos, instructions d\'exécution',
    ],
  },
  {
    id: 3, time: '25 min', tag: 'Portfolio', color: 'orange',
    title: 'Portfolio Personnel : Conception & Déploiement',
    desc: 'Concevoir un site portfolio qui démontre vos compétences au-delà d\'un CV classique.',
    points: [
      'Structure optimale d\'un portfolio de développeur digital',
      'Mise en valeur des réalisations avec captures et liens',
      'Hébergement moderne et gratuit — Vercel, GitHub Pages',
    ],
  },
  {
    id: 4, time: '20 min', tag: 'LinkedIn', color: 'blue',
    title: 'Optimisation LinkedIn pour Développeurs',
    desc: 'Bâtir un profil LinkedIn qui attire l\'attention des recruteurs et des maîtres de stage PFE.',
    points: [
      'Titre percutant orienté compétences tech',
      'Présentation synthétique de vos projets techniques',
      'Contacter les recruteurs et professionnels du secteur',
    ],
  },
  {
    id: 5, time: '15 min', tag: 'Éthique', color: 'purple',
    title: 'Bonnes Pratiques & Erreurs à Éviter',
    desc: 'Préserver votre crédibilité professionnelle et respecter les règles de confidentialité.',
    points: [
      'Véracité absolue des compétences annoncées',
      'Protection des clés d\'API et secrets de configuration',
      'Posture professionnelle dans les échanges écrits',
    ],
  },
  {
    id: 6, time: '25 min', tag: 'Atelier', color: 'green',
    title: 'Audit Live, Pratique & Questions/Réponses',
    desc: 'Démonstrations concrètes, retours en direct sur vos profils et réponses à vos questions.',
    points: [
      'Audit GitHub et portfolios de stagiaires volontaires',
      'Recommandations immédiates par l\'intervenant',
      'Session ouverte Q&R avec la salle',
    ],
  },
];

export default function ProgramAgenda() {
  const [activeId, setActiveId] = useState(1);
  const current = MODULES.find((m) => m.id === activeId) || MODULES[0];

  return (
    <section id="programme" className="section-white">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className="section-label">Programme officiel</span>
          <h2 className="section-h2">
            6 modules pratiques
          </h2>
          <p className="section-sub">
            Un programme conçu pour l'action — chaque module a un objectif opérationnel clair.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Module cards grid */}
          <div className={styles.grid} role="tablist" aria-label="Modules du programme">
            {MODULES.map((m) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={activeId === m.id}
                aria-controls={`module-panel-${m.id}`}
                className={`${styles.moduleCard} ${styles[`color_${m.color}`]} ${activeId === m.id ? styles.active : ''}`}
                onClick={() => setActiveId(m.id)}
              >
                <div className={styles.cardTop}>
                  <span className={`${styles.tag} ${styles[`tag_${m.color}`]}`}>{m.tag}</span>
                  <span className={styles.duration}>{m.time}</span>
                </div>
                <h3 className={styles.cardTitle}>{m.title}</h3>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div
            className={styles.detailPanel}
            role="tabpanel"
            id={`module-panel-${current.id}`}
            aria-label={current.title}
          >
            <div key={current.id} className={styles.detailContent}>
              <div className={styles.detailTop}>
                <span className={`${styles.tag} ${styles[`tag_${current.color}`]}`}>{current.tag}</span>
                <span className={styles.detailDuration}>{current.time}</span>
              </div>
              <h3 className={styles.detailTitle}>{current.title}</h3>
              <p className={styles.detailDesc}>{current.desc}</p>

              <ul className={styles.points}>
                {current.points.map((pt, i) => (
                  <li key={i} className={styles.point}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {pt}
                  </li>
                ))}
              </ul>

              <a href="#inscription" className="btn-green" style={{ marginTop: '20px', alignSelf: 'flex-start' }}>
                Participer à ce module
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
