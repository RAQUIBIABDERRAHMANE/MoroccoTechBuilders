'use client';

import React, { useState } from 'react';
import GoogleWalletModal from './GoogleWalletModal';
import AppleWalletModal from './AppleWalletModal';
import styles from './WalletPassButtons.module.css';

interface WalletPassButtonsProps {
  ticketId: string;
  fullName: string;
  classe: string;
  qrCodeData?: string;
  qrCodeUrl?: string;
  layout?: 'row' | 'column';
  showHint?: boolean;
  showAppleWallet?: boolean;
}

export default function WalletPassButtons({
  ticketId,
  fullName,
  classe,
  qrCodeData,
  qrCodeUrl,
  layout = 'row',
  showHint = true,
  showAppleWallet = false, // Hidden currently per user request
}: WalletPassButtonsProps) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [downloadingApple, setDownloadingApple] = useState(false);

  const qrDataVal = qrCodeData || `${fullName}-${classe}`;

  const applePassUrl = `/api/wallet/apple?ticketId=${encodeURIComponent(ticketId)}&fullName=${encodeURIComponent(
    fullName
  )}&classe=${encodeURIComponent(classe)}&qr=${encodeURIComponent(qrDataVal)}`;

  const googlePassUrl = `/api/wallet/google?ticketId=${encodeURIComponent(ticketId)}&fullName=${encodeURIComponent(
    fullName
  )}&classe=${encodeURIComponent(classe)}&qr=${encodeURIComponent(qrDataVal)}`;

  const handleAppleWalletClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloadingApple(true);

    const downloadLink = document.createElement('a');
    downloadLink.href = applePassUrl;
    downloadLink.download = `MTB-Pass-${ticketId}.pkpass`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      setDownloadingApple(false);
      setShowAppleModal(true);
    }, 400);
  };

  return (
    <>
      <div className={styles.walletContainer}>
        <div className={layout === 'column' ? styles.walletColumn : styles.walletRow}>
          {/* Apple Wallet Button (currently hidden per user request, set showAppleWallet={true} to re-enable) */}
          {showAppleWallet && (
            <button
              type="button"
              onClick={handleAppleWalletClick}
              className={styles.appleBtn}
              title="Ajouter votre badge à Apple Wallet & Calendrier (.pkpass)"
            >
              <div className={styles.iconCol}>
                {downloadingApple ? (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                ) : (
                  <svg width="22" height="26" viewBox="0 0 170 170" fill="currentColor">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.7-7.95-12-14.61-6.19-9.5-11.05-20.17-14.57-32.01-3.52-11.83-5.28-23.01-5.28-33.53 0-14.7 3.73-26.69 11.19-35.97 7.46-9.28 16.94-14.07 28.44-14.37 4.14 0 9.07 1.15 14.79 3.46 5.73 2.31 9.58 3.51 11.57 3.6 2.65-.24 6.77-1.55 12.37-3.92 5.6-2.38 10.39-3.4 14.38-3.08 12.8.96 22.84 5.92 30.13 14.88-11.54 6.94-17.18 16.59-16.91 28.94.27 9.87 4.08 18.06 11.43 24.58 7.35 6.51 16.14 10.23 26.37 11.16-2.22 6.64-4.85 13.53-7.89 20.67zM119.22 33.15c0-7.39 2.67-14.45 8.01-21.18 5.34-6.73 11.87-11.05 19.59-12.97.98 7.39-.77 14.47-5.25 21.24-4.48 6.77-11.02 11.17-19.63 13.2-1.82-.09-2.72-.2-2.72-.29z" />
                  </svg>
                )}
              </div>
              <div className={styles.textCol}>
                <span className={styles.btnSub}>Ajouter à</span>
                <span className={styles.btnMain}>Apple Wallet</span>
              </div>
            </button>
          )}

          {/* Google Wallet Button - Direct Native Link (Immune to popup blockers) */}
          <a
            href={googlePassUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.googleBtn}
            title="Enregistrer votre badge dans Google Wallet / Google Pay"
          >
            <div className={styles.iconCol}>
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
            </div>
            <div className={styles.textCol}>
              <span className={styles.btnSub}>Enregistrer dans</span>
              <span className={styles.btnMain}>Google Wallet</span>
            </div>
          </a>
        </div>

        {showHint && (
          <p className={styles.hint}>
            📱 Accédez à votre pass hors-ligne sur Google Wallet & smartphone.
          </p>
        )}
      </div>

      {showAppleModal && (
        <AppleWalletModal
          ticketId={ticketId}
          fullName={fullName}
          classe={classe}
          qrCodeUrl={qrCodeUrl}
          onClose={() => setShowAppleModal(false)}
        />
      )}

      {showGoogleModal && (
        <GoogleWalletModal
          ticketId={ticketId}
          fullName={fullName}
          classe={classe}
          qrCodeUrl={qrCodeUrl}
          onClose={() => setShowGoogleModal(false)}
        />
      )}
    </>
  );
}
