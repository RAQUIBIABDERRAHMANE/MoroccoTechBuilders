'use client';

import React, { useState, Suspense } from 'react';
import MTBLogo from '@/components/MTBLogo';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './reset.module.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  // Mode: if token is present, we are setting a new password; otherwise requesting a reset link
  const isSettingNewPassword = Boolean(token);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [debugUrl, setDebugUrl] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setDebugUrl('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la demande.');
      }

      setSuccessMsg(data.message);
      if (data.debugResetUrl) {
        setDebugUrl(data.debugResetUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour.');
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logoWrap} aria-label="Retour à l'accueil">
            <MTBLogo size={38} variant="dark" />
          </Link>
          <br />
          <span className={styles.badge}>SÉCURITÉ DU COMPTE</span>
          <h1 className={styles.title}>
            {isSettingNewPassword ? 'Nouveau Mot de Passe' : 'Mot de Passe Oublié'}
          </h1>
          <p className={styles.sub}>
            {isSettingNewPassword
              ? 'Choisissez un mot de passe sécurisé pour votre compte stagiaire.'
              : 'Saisissez votre email académique pour recevoir un lien sécurisé de réinitialisation.'}
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

        {successMsg && (
          <div className={styles.successBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {debugUrl && (
          <div className={styles.debugBox}>
            <strong>Lien direct (Dev / Test) :</strong><br />
            <a href={debugUrl} style={{ color: '#93c5fd', textDecoration: 'underline' }}>
              Cliquez ici pour réinitialiser immédiatement
            </a>
          </div>
        )}

        {isSettingNewPassword ? (
          <form onSubmit={handleResetSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="new-password">Nouveau mot de passe (min 6 caractères)</label>
              <input
                id="new-password"
                type="password"
                required
                placeholder="Votre nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm-password">Confirmer le nouveau mot de passe</label>
              <input
                id="confirm-password"
                type="password"
                required
                placeholder="Répétez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={`btn-red ${styles.submitBtn}`} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Mise à jour en cours...
                </>
              ) : (
                'Enregistrer le nouveau mot de passe'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="reset-email">Adresse Email</label>
              <input
                id="reset-email"
                type="email"
                required
                placeholder="Ex: stagiaire@ofppt-edu.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className={`btn-red ${styles.submitBtn}`} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Envoi du lien...
                </>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <div>
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link href="/login">Se connecter</Link>
          </div>
          <div>
            <Link href="/" style={{ color: 'var(--text-dark-f)' }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.pageWrapper}>Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
