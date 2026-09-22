'use client';

import React, { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EVENT_DATE = new Date('2026-10-15T09:00:00');

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  };
}

export default function Countdown() {
  const [tl, setTl] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTl(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: tl.days,    label: 'Jours'   },
    { value: tl.hours,   label: 'Heures'  },
    { value: tl.minutes, label: 'Minutes' },
    { value: tl.seconds, label: 'Secondes'},
  ];

  return (
    <div className={styles.wrap} role="timer" aria-live="off" aria-label="Compte à rebours avant l'événement">
      <p className={styles.label}>L'événement commence dans</p>
      <div className={styles.grid}>
        {units.map(({ value, label }, i) => (
          <React.Fragment key={label}>
            <div className={styles.unit}>
              <span className={styles.value}>{String(value).padStart(2, '0')}</span>
              <span className={styles.unitLabel}>{label}</span>
            </div>
            {i < 3 && <span className={styles.sep} aria-hidden="true">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
