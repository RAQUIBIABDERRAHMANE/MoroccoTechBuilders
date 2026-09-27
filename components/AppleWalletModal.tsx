'use client';

import React, { useState } from 'react';
import MTBLogo from './MTBLogo';
import styles from './AppleWalletModal.module.css';

interface AppleWalletModalProps {
  ticketId: string;
  fullName: string;
  classe: string;
  qrCodeUrl?: string;
  onClose: () => void;
}

export default function AppleWalletModal({
  ticketId,
  fullName,
  classe,
  qrCodeUrl,
  onClose,
}: AppleWalletModalProps) {
  const [downloadedPkpass, setDownloadedPkpass] = useState(false);

  const qrDataVal = `${fullName}-${classe}`;
  const qrSource = qrCodeUrl && !qrCodeUrl.includes('api.qrserver.com')
    ? qrCodeUrl
    : `/api/qr?data=${encodeURIComponent(qrDataVal)}`;

  const pkpassUrl = `/api/wallet/apple?ticketId=${encodeURIComponent(ticketId)}&fullName=${encodeURIComponent(
    fullName
  )}&classe=${encodeURIComponent(classe)}&qr=${encodeURIComponent(qrDataVal)}`;

  const calendarUrl = `/api/calendar?ticketId=${encodeURIComponent(ticketId)}&fullName=${encodeURIComponent(
    fullName
  )}&classe=${encodeURIComponent(classe)}`;

  const handleDownloadPkpass = () => {
    const a = document.createElement('a');
    a.href = pkpassUrl;
    a.download = `MTB-Pass-${ticketId}.pkpass`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadedPkpass(true);
  };

  const handleDownloadQrImage = () => {
    const a = document.createElement('a');
    a.href = qrSource;
    a.download = `MTB-Pass-ApplePhotos-${ticketId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.appleBrand}>
            {/* Apple Logo */}
            <svg width="22" height="26" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.7-7.95-12-14.61-6.19-9.5-11.05-20.17-14.57-32.01-3.52-11.83-5.28-23.01-5.28-33.53 0-14.7 3.73-26.69 11.19-35.97 7.46-9.28 16.94-14.07 28.44-14.37 4.14 0 9.07 1.15 14.79 3.46 5.73 2.31 9.58 3.51 11.57 3.6 2.65-.24 6.77-1.55 12.37-3.92 5.6-2.38 10.39-3.4 14.38-3.08 12.8.96 22.84 5.92 30.13 14.88-11.54 6.94-17.18 16.59-16.91 28.94.27 9.87 4.08 18.06 11.43 24.58 7.35 6.51 16.14 10.23 26.37 11.16-2.22 6.64-4.85 13.53-7.89 20.67zM119.22 33.15c0-7.39 2.67-14.45 8.01-21.18 5.34-6.73 11.87-11.05 19.59-12.97.98 7.39-.77 14.47-5.25 21.24-4.48 6.77-11.02 11.17-19.63 13.2-1.82-.09-2.72-.2-2.72-.29z" />
            </svg>
            <div>
              <h3 className={styles.appleTitle}>Apple Pass & Calendrier</h3>
              <p className={styles.appleSubtitle}>Pour iPhone, iPad & Mac</p>
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

          {/* Download feedback */}
          {downloadedPkpass && (
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
                <strong>Fichier .pkpass téléchargé !</strong>
                <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                  Ouvrable sur Mac, ou via l'application gratuite <em>Pass2U Wallet</em> sur iPhone.
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {/* Primary Action: Apple Calendar (Native on 100% of iPhones) */}
            <a
              href={calendarUrl}
              className={styles.btnPrimaryApple}
              title="Ajouter directement à l'application Calendrier Apple"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Ajouter à Calendrier Apple (iPhone & Watch)
            </a>

            {/* Secondary Action: Save image to Apple Photos */}
            <button
              onClick={handleDownloadQrImage}
              className={styles.btnSecondary}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Sauvegarder l’Image QR dans Photos
            </button>

            {/* Tertiary Action: Direct .pkpass download */}
            <button
              onClick={handleDownloadPkpass}
              className={styles.btnSecondary}
              style={{ fontSize: '0.8rem', opacity: 0.85 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger le fichier .pkpass (Pass2U / Mac)
            </button>
          </div>

          {/* Apple developer notice */}
          <div className={styles.appleNote}>
            <div className={styles.appleNoteTitle}>
              <span>ℹ️</span> Fonctionnement sur iPhone sans compte développeur :
            </div>
            Apple réserve l’application native <strong>Cartes</strong> aux organisations disposant d’un compte <em>Apple Developer ($99/an)</em>.
            <div style={{ marginTop: '6px' }}>
              👉 <strong>L’option Calendrier Apple</strong> ci-dessus fonctionne immédiatement sur <strong>100% des iPhone</strong>, avec rappel automatique et accès depuis l’écran de verrouillage !
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
