'use client';

import React, { useState } from 'react';
import MTBLogo from './MTBLogo';
import styles from './GoogleWalletModal.module.css';

interface GoogleWalletModalProps {
  ticketId: string;
  fullName: string;
  classe: string;
  qrCodeUrl?: string;
  onClose: () => void;
}

export default function GoogleWalletModal({
  ticketId,
  fullName,
  classe,
  qrCodeUrl,
  onClose,
}: GoogleWalletModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const qrDataVal = `${fullName}-${classe}`;
  const qrSource = qrCodeUrl && !qrCodeUrl.includes('api.qrserver.com')
    ? qrCodeUrl
    : `/api/qr?data=${encodeURIComponent(qrDataVal)}`;

  const passDownloadUrl = `/api/wallet/apple?ticketId=${encodeURIComponent(ticketId)}&fullName=${encodeURIComponent(
    fullName
  )}&classe=${encodeURIComponent(classe)}&qr=${encodeURIComponent(qrDataVal)}`;

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    'Pass Événement: Construire sa Présence en Ligne (Morocco Tech Builders)'
  )}&dates=20260125T093000Z/20260125T130000Z&details=${encodeURIComponent(
    `Billet Officiel MTB: ${ticketId}\nStagiaire: ${fullName}\nClasse: ${classe}\nLieu: Salle Polyvalente NTIC Sidi Youssef Ben Ali, Marrakech\n\nPrésentez ce pass à l'accueil pour valider votre entrée.`
  )}&location=${encodeURIComponent('Salle Polyvalente NTIC Sidi Youssef Ben Ali, Marrakech')}`;

  const handleDownloadPass = () => {
    const a = document.createElement('a');
    a.href = passDownloadUrl;
    a.download = `MTB-Pass-${ticketId}.pkpass`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(true);
  };

  const handleDownloadQrImage = () => {
    const a = document.createElement('a');
    a.href = qrSource;
    a.download = `MTB-Pass-QR-${ticketId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.googleBrand}>
            {/* Google 4-color 'G' icon */}
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <div>
              <h3 className={styles.googleTitle}>Google Wallet</h3>
              <p className={styles.googleSubtitle}>Pass d’Événement Officiel</p>
            </div>
          </div>

          <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.content}>
          {/* Card Preview */}
          <div className={styles.walletCard}>
            <div className={styles.cardTop}>
              <div className={styles.cardBrand}>
                <MTBLogo size={26} variant="icon" />
                <div>
                  <h4 className={styles.orgName}>Morocco Tech Builders</h4>
                  <p className={styles.orgSub}>OFPPT Marrakech · NTIC</p>
                </div>
              </div>
              <span className={styles.cardBadge}>Session 2026</span>
            </div>

            <div className={styles.cardMiddle}>
              <h4 className={styles.eventName}>Construire sa Présence en Ligne</h4>
              <p className={styles.eventSpeaker}>Animé par <strong>Abderrahmane Raquibi</strong></p>
            </div>

            <div className={styles.attendeeRow}>
              <div>
                <div className={styles.fieldLabel}>Stagiaire</div>
                <div className={styles.attendeeName}>{fullName}</div>
              </div>
              <div>
                <div className={styles.fieldLabel} style={{ textAlign: 'right' }}>Classe</div>
                <span className={styles.classBadge}>{classe}</span>
              </div>
            </div>

            <div className={styles.cardQrBox}>
              <img
                src={qrSource}
                alt={`QR code d'accès de ${fullName}`}
                className={styles.qrImage}
              />
              <span className={styles.ticketSerial}>{ticketId}</span>
              <span className={styles.scanNotice}>Présenter à la borne d'accueil</span>
            </div>
          </div>

          {/* Download feedback banner */}
          {downloaded && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <strong>Fichier Pass téléchargé !</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  Sur votre smartphone Android, ouvrez ce fichier dans vos téléchargements pour l’enregistrer directement dans Google Wallet.
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={styles.actions}>
            {/* Primary: Direct Pass File Download for Google Wallet */}
            <button
              onClick={handleDownloadPass}
              className={styles.btnPrimaryGoogle}
              style={{
                background: '#ffffff',
                color: '#1a1d20',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger le Pass pour Google Wallet
            </button>

            {/* Secondary: Google Calendar Integration */}
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.btnSecondary}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Ajouter à Google Agenda avec Billet & Rappel
            </a>

            {/* Image QR Download */}
            <button
              onClick={handleDownloadQrImage}
              className={styles.btnSecondary}
              style={{ fontSize: '0.82rem', opacity: 0.85 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
              </svg>
              Sauvegarder l’Image QR (Google Photos / Hors-ligne)
            </button>
          </div>

          {/* Android instruction notice */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '0.74rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.45',
          }}>
            <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '3px' }}>
              💡 Comment ajouter à Google Wallet sur Android :
            </div>
            1. Cliquez sur <strong>Télécharger le Pass</strong> ci-dessus.<br />
            2. Ouvrez la notification de téléchargement sur votre smartphone.<br />
            3. Choisissez <strong>Google Wallet</strong> : le pass est instantanément ajouté à vos cartes !
          </div>

          {/* Toggle for API Keys / Cloud 1-Click Save */}
          <button
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '2px 0',
              textAlign: 'center',
            }}
          >
            {showConfigHelp ? 'Masquer la configuration API' : '🔧 Activer l’enregistrement Cloud 1-clic (pay.google.com)'}
          </button>

          {showConfigHelp && (
            <div style={{
              background: '#0d1117',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.7rem',
              color: '#94a3b8',
              fontFamily: 'monospace',
              lineHeight: '1.5',
            }}>
              <div># Pour rediriger directement vers pay.google.com/gp/v/save/ :</div>
              <div>GOOGLE_WALLET_ISSUER_ID=votre_issuer_id</div>
              <div>GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL=...</div>
              <div>GOOGLE_WALLET_PRIVATE_KEY=&quot;-----BEGIN PRIVATE KEY...&quot;</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
