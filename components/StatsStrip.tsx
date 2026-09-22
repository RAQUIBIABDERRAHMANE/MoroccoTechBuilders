import React from 'react';
import styles from './StatsStrip.module.css';

const STATS = [
  { value: '50+',  label: 'Stagiaires Développeurs attendus', highlight: 'var(--mtb-green)' },
  { value: '4',    label: 'Modules pratiques & Livrables réels', highlight: 'var(--mtb-red)' },
  { value: '2h30', label: 'Atelier interactif & Session live', highlight: '#FFFFFF' },
  { value: '100%', label: 'Gratuit sur inscription avec Pass QR', highlight: 'var(--mtb-green)' },
];

export default function StatsStrip() {
  return (
    <div className={styles.strip} role="list" aria-label="Statistiques clés de l'événement">
      <div className="container">
        <div className={styles.inner}>
          {STATS.map(({ value, label, highlight }) => (
            <div key={label} className={styles.stat} role="listitem">
              <span className={styles.value} style={{ color: highlight }}>{value}</span>
              <span className={styles.label}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
