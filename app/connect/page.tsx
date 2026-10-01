'use client';

import React, { useState, useRef, useEffect } from 'react';
import MTBLogo from '@/components/MTBLogo';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import { triggerContactSave } from '@/lib/vcard';
import SaveContactModal from '@/components/SaveContactModal';
import styles from './connect.module.css';

interface ScannedContact {
  id: string;
  fullName: string;
  classe: string;
  year: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  skills: string[];
}

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'myqr'>('scan');
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [loading, setLoading] = useState(false);

  // Scanned match state
  const [match, setMatch] = useState<ScannedContact | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingConnection, setSavingConnection] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSavedGuide, setContactSavedGuide] = useState(false);

  // Logged in user info for "Mon Pass QR"
  const [user, setUser] = useState<{ id: string; fullName: string; classe: string } | null>(null);
  const [myQrUrl, setMyQrUrl] = useState<string>('');

  const html5QrCodeRef = useRef<any>(null);
  const cooldownRef = useRef<boolean>(false);

  // Load user session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          const primaryTicket = data.registrations?.[0]?.ticketId || data.user.id;
          QRCode.toDataURL(primaryTicket, {
            width: 280,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' },
          }).then(setMyQrUrl).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Audio & Haptic feedback
  const playFriendlyChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const play = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.start(start);
        osc.stop(start + dur);
      };
      play(523.25, ctx.currentTime, 0.15); // C5
      play(659.25, ctx.currentTime + 0.1, 0.15); // E5
      play(783.99, ctx.currentTime + 0.2, 0.3); // G5
    } catch {}

    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 80]);
    }
  };

  // Camera start / stop
  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch {}
      }

      const { Html5Qrcode } = await import('html5-qrcode');
      const readerElem = document.getElementById('qr-peer-viewport');
      if (!readerElem) return;

      const html5QrCode = new Html5Qrcode('qr-peer-viewport');
      html5QrCodeRef.current = html5QrCode;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 1) {
          setHasMultipleCameras(true);
        }
      } catch {}

      const qrConfig = {
        fps: 12,
        qrbox: (w: number, h: number) => {
          const edge = Math.floor(Math.min(w, h) * 0.72);
          return { width: Math.max(edge, 180), height: Math.max(edge, 180) };
        },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: facing },
        qrConfig,
        (decodedText: string) => {
          if (cooldownRef.current) return;
          cooldownRef.current = true;
          handleScanReceived(decodedText);
          setTimeout(() => {
            cooldownRef.current = false;
          }, 3000);
        },
        () => {}
      );

      setIsCameraRunning(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      const msg = err?.message || String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError("Permission de caméra refusée. Veuillez l'autoriser dans vos paramètres.");
      } else {
        setCameraError("Impossible d'activer la caméra. Assurez-vous d'être en HTTPS ou sur un appareil compatible.");
      }
      setIsCameraRunning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch {}
    }
    setIsCameraRunning(false);
  };

  useEffect(() => {
    if (activeTab === 'scan') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

  const switchCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraRunning) {
      await stopCamera();
      await startCamera(nextFacing);
    }
  };

  // Submit scan to resolve contact
  const handleScanReceived = async (decoded: string) => {
    const clean = (decoded || '').trim();
    if (!clean) return;

    setLoading(true);
    try {
      const res = await fetch('/api/network/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: clean }),
      });

      const data = await res.json();
      if (data.success && data.contact) {
        playFriendlyChime();
        setMatch(data.contact);
        setSavedSuccess(false);
      } else {
        alert(data.error || 'QR code non reconnu comme pass MTB.');
      }
    } catch {
      alert('Erreur lors de la lecture du QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNetwork = async () => {
    if (!match) return;
    setSavingConnection(true);
    try {
      const res = await fetch('/api/network/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: match.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
      } else {
        alert(data.error || 'Impossible d’enregistrer le contact.');
      }
    } catch {
      alert('Erreur réseau.');
    } finally {
      setSavingConnection(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'MTB';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <Link href="/" aria-label="Retour à l'accueil">
          <MTBLogo size={28} variant="dark" />
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/attendees" className={styles.navAction}>
            Annuaire
          </Link>
          <Link href="/profile" className={styles.navAction}>
            Mon Profil
          </Link>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Tab Switch: Scanner vs Mon QR */}
        <div className={styles.tabSwitch}>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`${styles.tabBtn} ${activeTab === 'scan' ? styles.tabBtnActive : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Scanner un Camarade
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('myqr')}
            className={`${styles.tabBtn} ${activeTab === 'myqr' ? styles.tabBtnActive : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <rect x="7" y="7" width="3" height="3" />
              <rect x="14" y="7" width="3" height="3" />
              <rect x="7" y="14" width="3" height="3" />
            </svg>
            Mon Pass QR
          </button>
        </div>

        {/* Tab 1: Scanner */}
        {activeTab === 'scan' && (
          <div className={styles.scannerCard}>
            <div className={styles.scannerHeader}>
              <span className={styles.scannerTitle}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Caméra Réseau MTB
              </span>

              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={switchCameraFacing}
                  className={styles.cameraToggleBtn}
                  title="Changer de caméra"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7h-3a2 2 0 0 1-2-2V3M4 17h3a2 2 0 0 1 2 2v2" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Changer
                </button>
              )}
            </div>

            <div className={styles.viewportContainer}>
              <div id="qr-peer-viewport" className={styles.qrViewport} />

              {/* Viewfinder Overlay */}
              {isCameraRunning && (
                <>
                  <div className={styles.laserLine} />
                  <div className={`${styles.cornerBorder} ${styles.cornerTL}`} />
                  <div className={`${styles.cornerBorder} ${styles.cornerTR}`} />
                  <div className={`${styles.cornerBorder} ${styles.cornerBL}`} />
                  <div className={`${styles.cornerBorder} ${styles.cornerBR}`} />
                </>
              )}

              {!isCameraRunning && !cameraError && (
                <div className={styles.cameraPermissionNotice}>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: 12 }}>
                    Activez la caméra pour scanner le QR code d'un autre participant.
                  </p>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className={styles.cameraStartBtn}
                  >
                    Activer la caméra
                  </button>
                </div>
              )}

              {cameraError && (
                <div className={styles.cameraPermissionNotice}>
                  <p style={{ fontSize: '0.86rem', color: '#ff7b72', marginBottom: 12 }}>
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className={styles.cameraStartBtn}
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>

            <p className={styles.scanHelperText}>
              Pointez la caméra vers le pass digital d'un camarade (sur son écran ou son badge imprimé)
            </p>
          </div>
        )}

        {/* Tab 2: Mon Pass QR */}
        {activeTab === 'myqr' && (
          <div className={styles.myQrCard}>
            {user ? (
              <>
                <h2 className={styles.myQrName}>{user.fullName}</h2>
                <div className={styles.myQrMeta}>Classe {user.classe} · Pass Stagiaire</div>

                <div className={styles.myQrBox}>
                  {myQrUrl ? (
                    <img src={myQrUrl} alt={`Pass QR de ${user.fullName}`} width={240} height={240} />
                  ) : (
                    <div style={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Chargement...
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: 360, margin: '0 auto 16px' }}>
                  Faites scanner ce QR code à vos camarades pour qu'ils obtiennent votre contact et votre profil développeur.
                </p>

                <Link href="/profile" className={styles.navAction}>
                  Accéder à mon espace profil complet →
                </Link>
              </>
            ) : (
              <div style={{ padding: '30px 10px' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Connectez-vous pour afficher votre Pass</h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: 20 }}>
                  Vous devez être connecté avec votre compte pour faire scanner votre propre pass QR.
                </p>
                <Link href="/login" className={styles.cameraStartBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Match Result Modal / Bottom Sheet */}
      {match && (
        <div className={styles.modalOverlay} onClick={() => setMatch(null)}>
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.matchHeader}>
              <span className={styles.matchTag}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Nouveau Contact Détecté !
              </span>
              <button
                type="button"
                onClick={() => setMatch(null)}
                className={styles.closeBtn}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className={styles.profilePreview}>
              <div className={styles.matchAvatar}>
                {match.avatarUrl ? (
                  <Image src={match.avatarUrl} alt={match.fullName} width={64} height={64} style={{ objectFit: 'cover' }} />
                ) : (
                  getInitials(match.fullName)
                )}
              </div>
              <div>
                <h3 className={styles.matchName}>{match.fullName}</h3>
                <span className={styles.matchClassBadge}>Classe {match.classe} · {match.year}</span>
              </div>
            </div>

            {match.bio && (
              <p className={styles.matchBio}>{match.bio}</p>
            )}

            {match.skills && match.skills.length > 0 && (
              <div className={styles.matchSkills}>
                {match.skills.map((sk) => (
                  <span key={sk} className={styles.matchSkillPill}>{sk}</span>
                ))}
              </div>
            )}

            <div className={styles.matchActions}>
              <button
                type="button"
                onClick={() => {
                  if (!match) return;
                  triggerContactSave(match);
                  setContactSavedGuide(true);
                }}
                className={styles.btnVCard}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Enregistrer dans mes contacts
              </button>

              {contactSavedGuide && (
                <div className={styles.contactDownloadGuide}>
                  <span className={styles.guideIcon}>📲</span>
                  <div>
                    <strong>Fiche contact prête !</strong>
                    <p>
                      Appuyez sur <strong>« Ouvrir »</strong> sur la notification en bas ou en haut de votre écran : votre téléphone ouvrira directement le répertoire Contacts avec toutes les informations pré-remplies.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className={styles.btnShowQrAlt}
              >
                Afficher le QR Code contact (pour qu&apos;un ami scanne)
              </button>

              <Link
                href={`/u/${match.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnViewProfile}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Voir son profil public complet
              </Link>

              {user && (
                <button
                  type="button"
                  onClick={handleSaveToNetwork}
                  disabled={savingConnection || savedSuccess}
                  className={styles.btnSaveConnection}
                >
                  {savedSuccess
                    ? '✓ Ajouté à vos connexions MTB !'
                    : savingConnection
                      ? 'Enregistrement...'
                      : '+ Sauvegarder dans mon réseau MTB'}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMatch(null)}
                className={styles.scanNextBtn}
              >
                Scanner une autre personne
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Contact Modal (Direct Phone Add via QR / Google Contacts) */}
      <SaveContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contact={match}
      />
    </div>
  );
}
