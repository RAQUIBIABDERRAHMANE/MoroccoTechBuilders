'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  VCardUserInput,
  generateVCardString,
  downloadVCardRaw,
} from '@/lib/vcard';
import styles from './SaveContactModal.module.css';

interface SaveContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: VCardUserInput | null;
}

export default function SaveContactModal({
  isOpen,
  onClose,
  contact,
}: SaveContactModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      setIsAndroid(/Android/i.test(ua));
      setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
      setCanShare(!!navigator.share);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !contact) return;
    const vCard = generateVCardString(contact);
    QRCode.toDataURL(vCard, {
      width: 260,
      margin: 2,
      color: { dark: '#0b162c', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating contact QR:', err));
  }, [isOpen, contact]);

  if (!isOpen || !contact) return null;


  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      const shareUrl = typeof window !== 'undefined' && contact.id ? `${window.location.origin}/u/${contact.id}` : '';
      await navigator.share({
        title: contact.fullName,
        text: `Contact de ${contact.fullName} · Stagiaire ${contact.classe || 'DEV'} (Morocco Tech Builders)`,
        url: shareUrl || undefined,
      });
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Share error:', e);
      }
    }
  };

  const handleDownloadFile = () => {
    downloadVCardRaw(contact);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              {contact.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={contact.avatarUrl} alt={contact.fullName} />
              ) : (
                <span>{(contact.fullName || 'MTB').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3 className={styles.title}>{contact.fullName}</h3>
              <p className={styles.subtitle}>
                Classe {contact.classe || 'DEV'} · Morocco Tech Builders
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Direct Phone Native Contact App Button */}
        <div className={styles.directActionBox}>
          <button
            type="button"
            onClick={() => {
              handleDownloadFile();
              onClose();
            }}
            className={styles.btnOpenContactApp}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Enregistrer dans mes contacts
          </button>
        </div>

        {/* QR Code Section for Camera Scan */}
        <div className={styles.qrSection}>
          <div className={styles.badge}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            À scanner par un autre smartphone
          </div>

          <div className={styles.qrFrame}>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR Contact pour ${contact.fullName}`}
                className={styles.qrImage}
              />
            ) : (
              <div className={styles.qrSkeleton}>Génération du QR Code...</div>
            )}
          </div>

          <p className={styles.qrInstruction}>
            Un camarade peut pointer son <strong>appareil photo</strong> vers ce QR Code pour importer directement votre fiche dans ses <strong>Contacts</strong>.
          </p>
        </div>

        {/* Secondary Actions */}
        <div className={styles.actions}>
          {canShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className={styles.btnShare}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {shareSuccess ? '✓ Partagé !' : 'Partager la fiche contact'}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadFile}
            className={styles.btnVcfDownload}
          >
            Télécharger le fichier .vcf pour PC
          </button>
        </div>
      </div>
    </div>
  );
}
