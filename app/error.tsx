'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import MTBLogo from '@/components/MTBLogo';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error caught by error boundary:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#051d3b',
        backgroundImage: `
          radial-gradient(ellipse at 50% 20%, rgba(225, 29, 46, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 20% 80%, rgba(8, 45, 91, 0.4) 0%, transparent 50%)
        `,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(8, 45, 91, 0.9)',
          border: '1px solid rgba(225, 29, 46, 0.3)',
          borderRadius: '16px',
          padding: '44px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Link href="/" aria-label="Accueil" style={{ display: 'inline-block', marginBottom: '20px' }}>
          <MTBLogo size={40} variant="dark" />
        </Link>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(225, 29, 46, 0.15)',
            border: '2px solid rgba(225, 29, 46, 0.4)',
            color: '#E11D2E',
            fontSize: '2rem',
            margin: '0 auto 20px',
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            marginBottom: '10px',
            color: '#ffffff',
          }}
        >
          Une Erreur Inattendue est Survenue
        </h1>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: 1.5,
            marginBottom: '28px',
          }}
        >
          Une interruption technique temporaire a été détectée. Vous pouvez retenter l'opération immédiatement ou retourner à l'accueil.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#E11D2E',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            🔄 Réessayer l'opération
          </button>

          <Link
            href="/"
            style={{
              padding: '11px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            ← Retour à l'accueil du site
          </Link>
        </div>
      </div>
    </div>
  );
}
