'use client';

import React, { useEffect, useState, Suspense } from 'react';
import MTBLogo from '@/components/MTBLogo';
import WalletPassButtons from '@/components/WalletPassButtons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import styles from './confirmed.module.css';

interface PassInfo {
  ticketId: string;
  fullName: string;
  classe: string;
  year?: string;
  email?: string;
  qrCodeUrl: string;
  qrCodeData: string;
  userId?: string;
}

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId') || '';
  const userIdParam = searchParams.get('userId') || '';

  const [pass, setPass] = useState<PassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#E11D2E', '#2563EB', '#082D5B', '#ffffff'],
      });
    } catch {
      // Fallback
    }

    async function loadData() {
      if (!ticketIdParam && !userIdParam) {
        // Try to load current session
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
              const reg = data.registrations?.[0] || data.user.registrations?.[0];
              if (reg) {
                setPass({
                  ticketId: reg.ticketId || reg.ticket_id || 'OFPPT-2026',
                  fullName: data.user.fullName,
                  classe: data.user.classe,
                  year: data.user.year,
                  email: data.user.email,
                  qrCodeUrl: reg.qrCodeUrl || `/api/qr?data=${encodeURIComponent(reg.ticketId || reg.qrCodeData)}`,
                  qrCodeData: reg.qrCodeData || reg.ticketId || '',
                  userId: data.user.id,
                });
              }
            }
          }
        } catch {
          // ignore
        }
        setLoading(false);
        return;
      }

      try {
        // Fetch session or registration details
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            const reg = (data.registrations || []).find(
              (r: any) => r.ticketId === ticketIdParam || r.id === ticketIdParam
            ) || data.registrations?.[0];

            setPass({
              ticketId: reg?.ticketId || ticketIdParam || 'OFPPT-2026',
              fullName: data.user.fullName,
              classe: data.user.classe,
              year: data.user.year,
              email: data.user.email,
              qrCodeUrl: reg?.qrCodeUrl || `/api/qr?data=${encodeURIComponent(ticketIdParam)}`,
              qrCodeData: reg?.qrCodeData || ticketIdParam,
              userId: data.user.id,
            });
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [ticketIdParam, userIdParam]);

  const activeTicketId = pass?.ticketId || ticketIdParam || 'OFPPT-2026';
  const activeFullName = pass?.fullName || 'Stagiaire OFPPT';
  const activeClasse = pass?.classe || 'Développement Digital';
  const activeUserId = pass?.userId || userIdParam;
  const qrUrl = pass?.qrCodeUrl || `/api/qr?data=${encodeURIComponent(activeTicketId)}`;
  const publicProfileUrl = activeUserId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${activeUserId}`
    : '';

  const handleCopyProfile = () => {
    if (!publicProfileUrl) return;
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calendarUrl = `/api/calendar?ticketId=${encodeURIComponent(activeTicketId)}&name=${encodeURIComponent(
    activeFullName
  )}&classe=${encodeURIComponent(activeClasse)}`;

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" aria-label="Accueil">
          <MTBLogo size={32} variant="dark" />
        </Link>
        <Link href="/" className={styles.homeLink}>
          ← Retour à l'accueil
        </Link>
      </nav>

      <main className={styles.card}>
        <header className={styles.header}>
          <div className={styles.badgeSuccess}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Réservation Confirmée
          </div>
          <h1 className={styles.title}>Votre Pass d'Accès Officiel</h1>
          <p className={styles.subtitle}>
            Félicitations {activeFullName} ! Votre place est réservée. Présentez ce QR code à l'entrée de la salle ou ajoutez-le à votre smartphone.
          </p>
        </header>

        {/* Prominent QR Code Section */}
        <section className={styles.ticketSection}>
          <div className={styles.qrWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`QR Code Pass - ${activeTicketId}`}
              width={220}
              height={220}
              className={styles.qrImage}
            />
          </div>

          <div className={styles.ticketNumber}>{activeTicketId}</div>
          <p className={styles.scanInstruction}>
            Ce code unique certifie votre inscription. Il sera scanné à l'entrée le jour de l'événement.
          </p>

          <a
            href={qrUrl}
            download={`Pass-MTB-${activeTicketId}.png`}
            className={styles.downloadQrBtn}
          >
            📥 Télécharger l'image du QR Code
          </a>

          <div className={styles.gridDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Nom & Prénom</span>
              <span className={styles.detailValue}>{activeFullName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Classe & Année</span>
              <span className={styles.detailValue}>{activeClasse} · OFPPT Marrakech</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Événement</span>
              <span className={styles.detailValue}>Construire sa Présence en Ligne</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Date & Lieu</span>
              <span className={styles.detailValue}>25 Janvier 2026 · Salle Polyvalente NTIC</span>
            </div>
          </div>
        </section>

        {/* Action Buttons: Wallets & Calendar */}
        <section className={styles.actionsSection}>
          {/* Google & Apple Wallet Buttons */}
          <WalletPassButtons
            ticketId={activeTicketId}
            fullName={activeFullName}
            classe={activeClasse}
            qrCodeData={activeTicketId}
            qrCodeUrl={qrUrl}
            layout="column"
          />

          {/* Add to Calendar Button */}
          <a href={calendarUrl} className={styles.calendarBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Ajouter à mon calendrier (.ics / Google / Outlook)
          </a>

          {/* Share Public Profile */}
          {publicProfileUrl && (
            <div className={styles.shareBox}>
              <span className={styles.shareLabel}>Votre profil public développeur :</span>
              <div className={styles.shareRow}>
                <input
                  type="text"
                  readOnly
                  value={publicProfileUrl}
                  className={styles.shareInput}
                />
                <button type="button" onClick={handleCopyProfile} className={styles.copyBtn}>
                  {copied ? '✓ Copié !' : 'Copier'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Navigation CTAs */}
        <div className={styles.bottomCtaRow}>
          <Link href="/profile" className={styles.portalBtn}>
            Compléter mon profil développeur →
          </Link>
          {activeUserId && (
            <Link
              href={`/u/${activeUserId}`}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.92rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Voir mon profil public
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div className={styles.page}>Chargement de votre pass...</div>}>
      <ConfirmedContent />
    </Suspense>
  );
}
