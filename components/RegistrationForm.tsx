'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import DigitalPassModal, { PassData } from './DigitalPassModal';
import styles from './RegistrationForm.module.css';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    classe: '',
    year: '1ère Année',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedPass, setGeneratedPass] = useState<PassData | null>(null);
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    const handlePrefill = (e: any) => {
      if (e.detail) {
        setFormData((prev) => ({ ...prev, fullName: e.detail }));
      }
    };
    window.addEventListener('mtb_prefill_name', handlePrefill);
    return () => window.removeEventListener('mtb_prefill_name', handlePrefill);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

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
          colors: ['#082D5B', '#E11D2E', '#10B981', '#2563EB', '#ffffff'],
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
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '44px' }}>
          <span className="section-label">Inscription & Billet d'accès</span>
          <h2 className="section-h2 section-h2-center">
            Réservez Votre Place & Activez Votre Profil
          </h2>
          <p className="section-sub section-sub-center">
            Accès 100% gratuit réservé aux stagiaires de l'OFPPT Marrakech. Votre pass nominatif et vos identifiants d'accès sont délivrés instantanément.
          </p>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formHeader}>
            <div className={styles.editionPill}>
              <span className={styles.editionDot} />
              Session Officielle • Salle Polyvalente OFPPT
            </div>
            <h3 className={styles.formTitle}>Formulaire d'enregistrement officiel</h3>
            <p className={styles.formDesc}>
              Remplissez vos informations pour générer votre QR Pass et configurer votre espace membre.
            </p>
          </div>

          {errorMsg && (
            <div className={styles.errorBox} role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
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
                  autoComplete="name"
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
                  autoComplete="email"
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
                  placeholder="Ex: DD201, DEV202"
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

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="phone">Numéro WhatsApp *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Ex: 06 12 34 56 78"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">
                  Mot de passe * <span className={styles.hintLabel}>(pour votre profil)</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min. 6 caractères"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ width: '100%', paddingRight: '40px' }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className={styles.pwdToggleBtn}
                  >
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Perks & Security Box */}
            <div className={styles.perksBox}>
              <div className={styles.perkItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Pass numérique QR nominatif généré instantanément</span>
              </div>
              <div className={styles.perkItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Espace profil développeur activé pour gérer vos projets</span>
              </div>
              <div className={styles.perkItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Confirmation officielle envoyée par Email et WhatsApp</span>
              </div>
            </div>

            <button
              type="submit"
              className={`btn-red ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Génération de votre Pass en cours...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                  </svg>
                  Générer mon Pass & Créer mon Compte
                </>
              )}
            </button>

            <div className={styles.loginRedirect}>
              Déjà inscrit ?{' '}
              <Link href="/login" className={styles.loginLink}>
                Accéder à mon espace profil →
              </Link>
            </div>
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
