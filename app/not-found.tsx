import React from 'react';
import Link from 'next/link';
import MTBLogo from '@/components/MTBLogo';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#051d3b',
        backgroundImage: `
          radial-gradient(ellipse at 50% 20%, rgba(225, 29, 46, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
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
          background: 'rgba(8, 45, 91, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '48px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Link href="/" aria-label="Accueil" style={{ display: 'inline-block', marginBottom: '24px' }}>
          <MTBLogo size={42} variant="dark" />
        </Link>

        <div
          style={{
            fontSize: '5rem',
            fontWeight: 900,
            lineHeight: 1,
            color: '#E11D2E',
            fontFamily: 'var(--font-heading, sans-serif)',
            marginBottom: '16px',
            textShadow: '0 0 30px rgba(225, 29, 46, 0.3)',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '12px',
            color: '#ffffff',
          }}
        >
          Page Introuvable
        </h1>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: 1.5,
            marginBottom: '32px',
          }}
        >
          La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'espace officiel de l'événement.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              backgroundColor: '#10B981',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            ← Retour à l'accueil
          </Link>

          <Link
            href="/login"
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
            Portail Stagiaire & Mon Pass
          </Link>
        </div>
      </div>
    </div>
  );
}
