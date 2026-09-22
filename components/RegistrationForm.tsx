'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import DigitalPassModal, { PassData } from './DigitalPassModal';
import styles from './RegistrationForm.module.css';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    classe: '',
    year: '1ère Année',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedPass, setGeneratedPass] = useState<PassData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la réservation.');
      }

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3fb950', '#2ea043', '#56d364', '#0e4429', '#ffffff'],
        });
      } catch (cErr) {
        // Fallback
      }

      setGeneratedPass(data.pass);
      setShowModal(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="inscription" className="section-gray">
      <div className="container">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <span className="section-label">Inscription gratuite</span>
          <h2 className="section-h2 section-h2-center">
            Réserver votre place
          </h2>
          <p className="section-sub section-sub-center">
            Complétez ce formulaire pour générer votre pass numérique nominatif et garantir votre place.
          </p>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Formulaire d'inscription</h3>
            <p className={styles.formDesc}>Chaque participant recevra son badge QR code individuel par Email & WhatsApp.</p>
          </div>

          {errorMsg && (
            <div className={styles.errorBox}>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="fullName">Nom & Prénom *</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Ex: Yassine El Amrani"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Adresse Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Ex: yassine@ofppt-edu.ma"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="classe">Classe / Groupe *</label>
                <input
                  id="classe"
                  name="classe"
                  type="text"
                  required
                  placeholder="Ex: DD101, DD201, DEV202"
                  value={formData.classe}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="year">Niveau de Formation</label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="1ère Année">1ère Année (Tronc Commun)</option>
                  <option value="2ème Année">2ème Année (Spécialisation)</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">
                Numéro WhatsApp * <span style={{ color: 'var(--green-dark)', fontSize: '0.75rem', fontWeight: '500' }}>(Réception instantanée du Pass QR)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="Ex: 06 12 34 56 78 ou +212 6..."
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.notice}>
              ✓ Pass QR généré immédiatement à l'écran<br />
              ✓ Copie officielle transmise par <strong>Email</strong> & <strong>WhatsApp</strong>
            </div>

            <button
              type="submit"
              className={`btn-green ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Génération en cours...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/>
                  </svg>
                  Générer mon Pass QR
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {showModal && generatedPass && (
        <DigitalPassModal 
          pass={generatedPass} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </section>
  );
}
