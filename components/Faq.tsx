'use client';

import React, { useState } from 'react';
import styles from './Faq.module.css';

const FAQS = [
  {
    q: 'Qui peut participer à cette session ?',
    a: 'Tous les stagiaires inscrits en Développement Digital à l\'OFPPT, aussi bien en 1ère qu\'en 2ème année. La session est conçue pour les niveaux débutants à intermédiaires.',
  },
  {
    q: 'Faut-il amener un ordinateur portable ?',
    a: 'Il est recommandé d\'amener votre laptop pour pouvoir appliquer les conseils en direct pendant l\'atelier pratique. Sinon, vous pouvez observer et noter pour appliquer après.',
  },
  {
    q: 'L\'inscription est-elle obligatoire pour assister ?',
    a: 'Oui, l\'inscription est requise pour générer votre pass QR nominatif qui sert de billet d\'entrée à la salle de conférence. Les places sont limitées.',
  },
  {
    q: 'Faut-il déjà avoir un profil GitHub ou LinkedIn ?',
    a: 'Non, ce n\'est pas nécessaire. La session est adaptée à tous les niveaux. Si vous en avez déjà un, vous pourrez le faire auditer en direct.',
  },
  {
    q: 'Y aura-t-il un support ou des ressources à emporter ?',
    a: 'Oui ! Un guide récapitulatif avec les liens et ressources clés sera partagé avec les participants après la session.',
  },
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" className="section-white">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 0 }}>
          <span className="section-label">Questions fréquentes</span>
          <h2 className="section-h2 section-h2-center">
            Tout ce que vous devez savoir
          </h2>
        </div>

        <div className={styles.list} role="list">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className={`${styles.item} ${openIdx === i ? styles.open : ''}`} role="listitem">
              <button
                className={styles.question}
                onClick={() => toggle(i)}
                aria-expanded={openIdx === i}
                aria-controls={`faq-answer-${i}`}
                id={`faq-q-${i}`}
              >
                <span>{q}</span>
                <span className={styles.chevron} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </span>
              </button>
              <div
                className={`${styles.answerWrapper} ${openIdx === i ? styles.open : ''}`}
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
              >
                <div className={styles.answerInner}>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
