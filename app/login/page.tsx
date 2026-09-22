'use client';

import React, { useState } from 'react';
import MTBLogo from '@/components/MTBLogo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Identifiants invalides.');
      }

      // Route to profile dashboard
      window.location.href = '/profile';
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur de connexion.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logoWrap} aria-label="Retour à l'accueil">
            <MTBLogo size={40} variant="dark" />
          </Link>
          <br />
          <span className={styles.badge}>PORTAIL STAGIAIRE</span>
          <h1 className={styles.title}>Connexion Stagiaire</h1>
          <p className={styles.sub}>
            Accédez à votre pass numérique, votre badge de présence et votre profil développeur.
          </p>
        </div>

        {errorMsg && (
          <div className={styles.errorBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Ex: yassine@ofppt-edu.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
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

          <button
            type="submit"
            className={`btn-red ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Connexion en cours...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <div>
            Pas encore inscrit à l'événement ?{' '}
            <Link href="/#inscription">
              S'inscrire gratuitement
            </Link>
          </div>
          <div>
            <Link href="/" className={styles.backHome}>
              ← Retour au site de l'événement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
