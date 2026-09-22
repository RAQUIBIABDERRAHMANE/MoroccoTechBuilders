'use client';

import React, { useState } from 'react';
import styles from './ProgramAgenda.module.css';
import Link from 'next/link';

interface Module {
  id: number;
  time: string;
  tag: string;
  color: 'navy' | 'green' | 'red' | 'blue';
  title: string;
  desc: string;
  deliverable: string;
  points: string[];
}

const MODULES: Module[] = [
  {
    id: 1,
    time: '15 min',
    tag: 'Fondation',
    color: 'navy',
    title: 'Présence en Ligne & Identité Numérique',
    desc: 'Comprendre pourquoi la réputation technique en ligne est le premier filtre des recruteurs IT avant même l\'entretien de stage.',
    deliverable: 'Audit personnel de visibilité Google & GitHub',
    points: [
      'Importance stratégique de l\'identité numérique pour un stagiaire DD',
      'Différence clé entre présence passive (CV papier) et présence active valorisante',
      'Méthodologie concrète de sourcing des recruteurs au Maroc et à l\'international',
    ],
  },
  {
    id: 2,
    time: '25 min',
    tag: 'GitHub',
    color: 'red',
    title: 'Profil GitHub : Vitrine de Code & Impact',
    desc: 'Transformer vos dépôts scolaires en une vitrine d\'ingénierie soignée, lisible et attractive pour les leads techniques.',
    deliverable: 'README.md de profil interactif complet avec stats & badges',
    points: [
      'Sélection et épinglage des 4 à 6 meilleurs projets (TPs nettoyés)',
      'Rédaction d\'un README de profil moderne avec technologies et bio impactante',
      'Documentation exemplaire : schémas d\'architecture, démos vidéo et commandes d\'installation',
    ],
  },
  {
    id: 3,
    time: '25 min',
    tag: 'Portfolio',
    color: 'blue',
    title: 'Portfolio Personnel : Conception & Déploiement',
    desc: 'Concevoir et publier un site web personnel qui prouve vos compétences au-delà des mots.',
    deliverable: 'Site portfolio live déployé sur Vercel avec domaine personnalisé',
    points: [
      'Architecture UX optimale d\'un portfolio développeur junior (sans fioritures)',
      'Présentation des études de cas : problème résolu, stack, démo live et code source',
      'Hébergement continu gratuit (Vercel, GitHub Pages) & optimisation SEO',
    ],
  },
  {
    id: 4,
    time: '20 min',
    tag: 'LinkedIn',
    color: 'blue',
    title: 'LinkedIn Tech : Réseau & Visibilité PFE',
    desc: 'Bâtir un profil LinkedIn qui capte l\'attention des recruteurs et des directeurs techniques à la recherche de stagiaires.',
    deliverable: 'Titre technique optimisé + Template d\'approche recruteur PFE',
    points: [
      'Formulation d\'un titre orienté stack ciblée plutôt qu\'un simple statut d\'étudiant',
      'Rédaction de la section Infos avec preuve par les réalisations et projets concrets',
      'Technique d\'approche directe : modèles de messages respectueux et efficaces',
    ],
  },
  {
    id: 5,
    time: '15 min',
    tag: 'Éthique',
    color: 'navy',
    title: 'Bonnes Pratiques, Sécurité & Droits de Code',
    desc: 'Préserver votre crédibilité professionnelle et éviter les pièges critiques de sécurité.',
    deliverable: 'Checklist de sécurité des dépôts publics (.gitignore, API keys)',
    points: [
      'Véracité absolue des compétences déclarées (zéro faux projets)',
      'Protection impérative des clés d\'API, jetons .env et mots de passe',
      'Licences open-source (MIT), respect de la propriété intellectuelle et collaboration',
    ],
  },
  {
    id: 6,
    time: '25 min',
    tag: 'Atelier Live',
    color: 'green',
    title: 'Audit Live, Pratique & Questions / Réponses',
    desc: 'Mise en pratique directe, revue de profils volontaires sur grand écran et conseils personnalisés.',
    deliverable: 'Feedback sur-mesure pour 3 à 5 participants en direct',
    points: [
      'Audit en direct de 3 profils GitHub et portfolios de stagiaires volontaires',
      'Corrections immédiates des points faibles par Abderrahmane Raquibi',
      'Session libre d\'échange et questions/réponses sans tabou',
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
          <span className="section-label">Feuille de route officielle</span>
          <h2 className="section-h2">
            6 Modules Pratiques • 2h30 Intensives
          </h2>
          <p className="section-sub">
            Chaque module apporte une compétence immédiatement testable. Cliquez sur un module pour afficher son plan détaillé et son livrable garanti.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Module cards grid */}
          <div className={styles.grid} role="tablist" aria-label="Modules du programme">
            {MODULES.map((m) => {
              const isActive = activeId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`module-panel-${m.id}`}
                  className={`${styles.moduleCard} ${styles[`color_${m.color}`]} ${isActive ? styles.active : ''}`}
                  onClick={() => setActiveId(m.id)}
                >
                  <div className={styles.cardTop}>
                    <span className={`${styles.tag} ${styles[`tag_${m.color}`]}`}>{m.tag}</span>
                    <span className={styles.duration}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {m.time}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{m.title}</h3>
                  <div className={styles.cardBottom}>
                    <span className={styles.deliverableSnippet}>
                      Livrable : {m.deliverable.split(' ')[0]} {m.deliverable.split(' ')[1] || ''}...
                    </span>
                    <span className={styles.arrowIcon} aria-hidden="true">→</span>
                  </div>
                </button>
              );
            })}
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
                <span className={styles.moduleIndex}>Module {current.id} sur 6</span>
                <span className={styles.detailDuration}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Durée : {current.time}
                </span>
              </div>

              <h3 className={styles.detailTitle}>{current.title}</h3>
              <p className={styles.detailDesc}>{current.desc}</p>

              {/* Deliverable Box */}
              <div className={styles.deliverableBox}>
                <div className={styles.deliverableBoxHeader}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Livrable garanti du module</span>
                </div>
                <p className={styles.deliverableBoxText}>{current.deliverable}</p>
              </div>

              {/* Detailed Points */}
              <div className={styles.pointsHeader}>Points clés abordés :</div>
              <ul className={styles.points}>
                {current.points.map((pt, i) => (
                  <li key={i} className={styles.point}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.panelActions}>
                <Link href="#inscription" className="btn-red">
                  Participer à la session complète
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <span className={styles.freeMention}>Entrée libre sur inscription • 50 places</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
