import React from 'react';
import styles from './StatsStrip.module.css';

const STATS = [
  { value: '50+',  label: 'Stagiaires attendus' },
  { value: '4',    label: 'Modules pratiques' },
  { value: '2h+',  label: 'D\'atelier' },
  { value: 'Free', label: 'Inscription gratuite' },
];

export default function StatsStrip() {
  return (
    <div className={styles.strip} role="list" aria-label="Statistiques de l'événement">
      <div className="container">
        <div className={styles.inner}>
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.stat} role="listitem">
              <span className={styles.value}>{value}</span>
              <span className={styles.label}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
