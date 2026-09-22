'use client';

import React from 'react';
import styles from './DigitalPassModal.module.css';

export interface PassData {
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string;
  classe: string;
  year?: string;
  qrCodeUrl: string;
  eventName: string;
  speaker: string;
  location: string;
  duration: string;
  date: string;
}

interface DigitalPassModalProps {
  pass: PassData | null;
  onClose: () => void;
}

export default function DigitalPassModal({ pass, onClose }: DigitalPassModalProps) {
  if (!pass) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.ticket} id="printable-pass">
          {/* Main Ticket Section */}
          <div className={styles.ticketMain}>
            <div className={styles.ticketHeader}>
              <div className={styles.brandRow}>
                <span className={styles.brandBadge}>MTB</span>
                <div>
                  <h4 className={styles.ticketInstitution}>Morocco Tech Builders</h4>
                  <p className={styles.ticketSub}>OFPPT Marrakech · Développement Digital</p>
                </div>
              </div>
              <span className={styles.ticketSerial}>{pass.ticketId}</span>
            </div>

            <div className={styles.eventInfo}>
              <span className={styles.eventCategory}>CONFÉRENCE & ATELIER TECHNIQUE</span>
              <h3 className={styles.eventTitle}>Construire sa Présence en Ligne</h3>
              <p className={styles.eventSpeaker}>Animé par <strong>{pass.speaker}</strong></p>
            </div>

            <div className={styles.traineeRow}>
              <div className={styles.traineeField}>
                <span className={styles.label}>STAGIAIRE</span>
                <strong className={styles.traineeName}>{pass.fullName}</strong>
              </div>

              <div className={styles.metaCols}>
                <div className={styles.traineeField}>
                  <span className={styles.label}>CLASSE</span>
                  <span className={styles.valBadge}>{pass.classe}</span>
                </div>
                <div className={styles.traineeField}>
                  <span className={styles.label}>LIEU</span>
                  <span className={styles.valText}>{pass.location}</span>
                </div>
              </div>
            </div>

            <div className={styles.ticketStatusRow}>
              <span className={styles.statusConfirmed}>● Inscription Validée</span>
              <span className={styles.sessionYear}>Session 2026</span>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className={styles.perforation}>
            <span className={styles.notchTop}></span>
            <div className={styles.dashLine}></div>
            <span className={styles.notchBottom}></span>
          </div>

          {/* QR Stub Section */}
          <div className={styles.ticketStub}>
            <div className={styles.qrBox}>
              <img 
                src={pass.qrCodeUrl} 
                alt={`QR Code pour ${pass.fullName}`} 
                className={styles.qrCode}
              />
            </div>
            <span className={styles.qrCaption}>Scan Entrée</span>
            <span className={styles.qrSub}>Présenter à l'accueil</span>
          </div>
        </div>

        {/* Delivery confirmation banner */}
        <div style={{
          background: 'rgba(63, 185, 80, 0.08)',
          border: '1px solid rgba(63, 185, 80, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          fontSize: '0.8rem',
          color: 'var(--green-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Une copie de ce pass vous a également été envoyée par Email et WhatsApp.
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className="btn-green" onClick={handlePrint} style={{ flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            Imprimer / Enregistrer
          </button>
          <button className="btn-outline-dark" onClick={onClose} style={{ flex: 0.4 }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
