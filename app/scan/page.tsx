'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './scan.module.css';

interface ScanResult {
  status: 'approve' | 'already_attended' | 'decline';
  fullName: string;
  classe: string;
  scannedAt: string;
  message?: string;
}

const SCAN_PIN = process.env.NEXT_PUBLIC_SCAN_PIN || '2126';

export default function ScanPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Scanner States
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isScanningPaused, setIsScanningPaused] = useState(false);

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const cooldownRef = useRef<boolean>(false);
  const isScanningPausedRef = useRef<boolean>(false);

  // Check existing session authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('scan_pin_authenticated');
    setIsAuthenticated(auth === 'true');
  }, []);

  // Focus scanner input automatically once authenticated in manual mode
  useEffect(() => {
    if (isAuthenticated && scanMode === 'manual') {
      inputRef.current?.focus();
    }
  }, [isAuthenticated, scanMode]);

  // Camera lifecycle handlers
  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);

      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch (e) {}
      }

      const { Html5Qrcode } = await import('html5-qrcode');

      const readerElem = document.getElementById('qr-reader-viewport');
      if (!readerElem) return;

      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      html5QrCodeRef.current = html5QrCode;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 1) {
          setHasMultipleCameras(true);
        }
      } catch (e) {
        // Devices query may fail if permission not yet granted
      }

      const qrConfig = {
        fps: 12,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
          return { width: Math.max(edge, 180), height: Math.max(edge, 180) };
        },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: facing },
        qrConfig,
        (decodedText: string) => {
          if (cooldownRef.current || isScanningPausedRef.current) return;
          cooldownRef.current = true;
          handleScanSubmit(decodedText);
          // Cooldown 3.5s to prevent scanning same code repeatedly in 1s
          setTimeout(() => {
            cooldownRef.current = false;
          }, 3500);
        },
        () => {
          // ignore scan frame misses
        }
      );

      setIsCameraRunning(true);
      setIsScanningPaused(false);
      isScanningPausedRef.current = false;
    } catch (err: any) {
      console.warn('Camera start error:', err);
      const msg = err?.message || String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError("Permission d'accès à la caméra refusée. Veuillez autoriser la caméra dans votre navigateur.");
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
        setCameraError("Aucune caméra détectée sur cet appareil.");
      } else {
        setCameraError("Impossible d'activer la caméra. Si vous êtes sur smartphone en réseau local (HTTP), Chrome bloque l'accès caméra sans HTTPS ou localhost.");
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
      } catch (e) {
        // Ignore stop error
      }
    }
    setIsCameraRunning(false);
  };

  const togglePauseScan = () => {
    const next = !isScanningPaused;
    setIsScanningPaused(next);
    isScanningPausedRef.current = next;
  };

  const switchCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraRunning) {
      await stopCamera();
      await startCamera(nextFacing);
    }
  };

  // Start or stop camera depending on authentication and active mode
  useEffect(() => {
    if (isAuthenticated && scanMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isAuthenticated, scanMode]);

  // Sound feedback using Web Audio API
  const playBeep = (type: 'approve' | 'already_attended' | 'decline') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'approve') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'already_attended') {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.1); // F4
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(146.83, ctx.currentTime + 0.1); // D3
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }

      if (navigator.vibrate) {
        navigator.vibrate(
          type === 'approve'
            ? [100, 50, 100]
            : type === 'already_attended'
            ? [150, 80, 150]
            : [300]
        );
      }
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  // PIN Keypad Handlers
  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setPinError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handlePinClear = () => {
    setPinInput('');
    setPinError(false);
  };

  const verifyPin = (code: string) => {
    if (code === SCAN_PIN) {
      sessionStorage.setItem('scan_pin_authenticated', 'true');
      setIsAuthenticated(true);
      setPinError(false);
      playBeep('approve');
    } else {
      setPinError(true);
      playBeep('decline');
      setTimeout(() => {
        setPinInput('');
      }, 500);
    }
  };

  const handleLock = () => {
    stopCamera();
    sessionStorage.removeItem('scan_pin_authenticated');
    setIsAuthenticated(false);
    setPinInput('');
  };

  // Listen to physical keyboard typing on PIN screen
  useEffect(() => {
    if (isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        handlePinBackspace();
      } else if (e.key === 'Escape') {
        handlePinClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, pinInput]);

  // Scan Submission
  const handleScanSubmit = async (dataToSubmit?: string) => {
    const raw = (dataToSubmit || inputVal).trim();
    if (!raw) return;

    setLoading(true);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: raw }),
      });

      const data = await res.json();
      const status: 'approve' | 'already_attended' | 'decline' =
        data.status === 'approve'
          ? 'approve'
          : data.status === 'already_attended'
          ? 'already_attended'
          : 'decline';

      const resultItem: ScanResult = {
        status,
        fullName: data.participant?.fullName || raw.split('-')[0] || raw,
        classe: data.participant?.classe || raw.split('-').pop() || 'N/A',
        scannedAt: data.participant?.scannedAt || new Date().toLocaleTimeString('fr-FR'),
        message: data.message,
      };

      setLatestResult(resultItem);
      setHistory((prev) => [resultItem, ...prev]);
      playBeep(status);
      setInputVal('');
    } catch (err) {
      const fallbackItem: ScanResult = {
        status: 'decline',
        fullName: raw,
        classe: 'Erreur réseau',
        scannedAt: new Date().toLocaleTimeString('fr-FR'),
        message: 'Erreur de communication avec le serveur.',
      };
      setLatestResult(fallbackItem);
      playBeep('decline');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Prevent flash before session check
  if (isAuthenticated === null) {
    return (
      <main className={styles.page}>
        <div className={styles.container} />
      </main>
    );
  }

  // ── PIN Screen ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          {/* Top bar */}
          <div className={styles.topBar}>
            <Link href="/" className={styles.brand}>
              <Image
                src="/logo.jpg"
                alt="Logo Morocco Tech Builders"
                width={34}
                height={34}
                className={styles.brandLogo}
                priority
              />
              <span className={styles.brandName}>
                Morocco <span className={styles.brandSub}>Tech Builders</span>
              </span>
            </Link>

            <Link href="/" className={styles.backLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Retour au site
            </Link>
          </div>

          <div className={styles.pinWrapper}>
            <div className={styles.pinCard}>
              <div className={styles.pinIconWrap}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <div className={styles.pinHeader}>
                <h1 className={styles.pinTitle}>Contrôle d'Accès Sécurisé</h1>
                <p className={styles.pinSub}>
                  Entrez le code PIN organisateur pour déverrouiller le scanner d'entrée.
                </p>
              </div>

              {/* 4 Digit Boxes */}
              <div className={styles.pinDisplay}>
                {[0, 1, 2, 3].map((idx) => {
                  const digit = pinInput[idx];
                  const hasDigit = Boolean(digit);
                  return (
                    <div
                      key={idx}
                      className={`${styles.pinDot} ${hasDigit ? styles.pinDotActive : ''} ${
                        pinError ? styles.pinDotError : ''
                      }`}
                    >
                      {hasDigit ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              {pinError && (
                <p className={styles.pinErrorMsg}>Code PIN incorrect. Veuillez réessayer.</p>
              )}

              {/* On-screen Keypad */}
              <div className={styles.pinKeypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={styles.keypadBtn}
                    onClick={() => handlePinDigit(num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.keypadBtn} ${styles.keypadBtnAction}`}
                  onClick={handlePinClear}
                  title="Effacer tout"
                >
                  C
                </button>
                <button
                  type="button"
                  className={styles.keypadBtn}
                  onClick={() => handlePinDigit('0')}
                >
                  0
                </button>
                <button
                  type="button"
                  className={`${styles.keypadBtn} ${styles.keypadBtnAction}`}
                  onClick={handlePinBackspace}
                  title="Effacer le dernier chiffre"
                >
                  ⌫
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Authenticated Scanner Screen ───────────────────────────
  const approvedCount = history.filter((h) => h.status === 'approve').length;
  const alreadyAttendedCount = history.filter((h) => h.status === 'already_attended').length;
  const declinedCount = history.filter((h) => h.status === 'decline').length;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/logo.jpg"
              alt="Logo Morocco Tech Builders"
              width={34}
              height={34}
              className={styles.brandLogo}
              priority
            />
            <span className={styles.brandName}>
              Morocco <span className={styles.brandSub}>Tech Builders</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="button" className={styles.lockBtn} onClick={handleLock} title="Verrouiller la session">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Verrouiller
            </button>

            <Link href="/" className={styles.backLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Retour au site
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Système de Contrôle d'Accès · Jour J
          </div>
          <h1 className={styles.title}>Scanner les Pass d'Entrée</h1>
          <p className={styles.desc}>
            Scannez le QR code des stagiaires à l'entrée de la salle. Le système vérifie en direct l'inscription sur n8n, valide l'accès et déclenche l'email de présence.
          </p>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{history.length}</span>
            <span className={styles.statLabel}>Total Scans</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statNum} ${styles.statNumGreen}`}>{approvedCount}</span>
            <span className={styles.statLabel}>Accès Autorisés</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statNum} ${styles.statNumAmber}`}>{alreadyAttendedCount}</span>
            <span className={styles.statLabel}>Déjà Entrés</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statNum} ${styles.statNumRed}`}>{declinedCount}</span>
            <span className={styles.statLabel}>Refusés</span>
          </div>
        </div>

        {/* Scanner Card */}
        <div className={styles.scannerCard}>
          {/* Mode Selector Tabs */}
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.modeTab} ${scanMode === 'camera' ? styles.modeTabActive : ''}`}
              onClick={() => setScanMode('camera')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Caméra en Direct
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${scanMode === 'manual' ? styles.modeTabActive : ''}`}
              onClick={() => setScanMode('manual')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
              </svg>
              Saisie Manuelle / Douchette
            </button>
          </div>

          {/* Camera Scanner Mode */}
          {scanMode === 'camera' && (
            <div>
              <div className={styles.cameraWrapper}>
                {/* Viewport for Html5Qrcode */}
                <div id="qr-reader-viewport" className={styles.cameraView} />

                {/* Viewfinder Reticle & Laser when camera is running */}
                {isCameraRunning && !isScanningPaused && (
                  <div className={styles.viewfinderOverlay}>
                    <div className={styles.reticleBox}>
                      <span className={styles.cornerTL} />
                      <span className={styles.cornerTR} />
                      <span className={styles.cornerBL} />
                      <span className={styles.cornerBR} />
                      <div className={styles.laserLine} />
                    </div>
                    <span className={styles.cameraStatusText}>
                      {loading ? 'Vérification en cours...' : 'Alignez le QR code dans le cadre'}
                    </span>
                  </div>
                )}

                {/* Scanning Paused Overlay */}
                {isCameraRunning && isScanningPaused && (
                  <div className={styles.viewfinderOverlay} style={{ background: 'rgba(0,0,0,0.65)' }}>
                    <span className={styles.cameraStatusText} style={{ color: '#fbbf24' }}>
                      Scanner en pause
                    </span>
                  </div>
                )}

                {/* Camera Inactive / Error Placeholder */}
                {!isCameraRunning && (
                  <div className={styles.cameraPlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-dark-f)' }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    {cameraError ? (
                      <p style={{ color: '#ff7b72', maxWidth: '320px', margin: 0 }}>
                        {cameraError}
                      </p>
                    ) : (
                      <p style={{ margin: 0 }}>Caméra prête à être activée</p>
                    )}
                    <button
                      type="button"
                      className="btn-green"
                      style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                      onClick={() => startCamera(facingMode)}
                    >
                      Démarrer la caméra
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              {isCameraRunning && (
                <div className={styles.cameraControls}>
                  <button
                    type="button"
                    className={`${styles.camBtn} ${isScanningPaused ? styles.camBtnActive : ''}`}
                    onClick={togglePauseScan}
                  >
                    {isScanningPaused ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Reprendre le scan
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        Mettre en pause
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={styles.camBtn}
                    onClick={switchCameraFacing}
                    title="Changer de caméra"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    {facingMode === 'environment' ? 'Caméra Arrière' : 'Caméra Avant'}
                  </button>

                  <button
                    type="button"
                    className={styles.camBtn}
                    onClick={stopCamera}
                    title="Arrêter la caméra"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Arrêter
                  </button>
                </div>
              )}

              {/* Notice for mobile / LAN HTTP access */}
              <div className={styles.cameraNotice} style={{ marginTop: '14px' }}>
                <span style={{ fontWeight: '700' }}>💡 Conseil d'utilisation mobile :</span>
                <span>
                  Pour scanner avec la caméra d'un smartphone sur le réseau Wi-Fi local (<code>http://192.168.11.114:3000/scan</code>), autorisez l'accès caméra dans votre navigateur. Si votre navigateur bloque la caméra en HTTP non sécurisé, vous pouvez utiliser l'onglet <strong>Saisie Manuelle / Douchette</strong> ou ouvrir la page en <code>localhost</code>.
                </span>
              </div>
            </div>
          )}

          {/* Manual / Barcode Scanner Gun Mode */}
          {scanMode === 'manual' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanSubmit();
              }}
              className={styles.scanForm}
            >
              <div className={styles.inputGroup}>
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.scanInput}
                  placeholder="Scanner le QR code ou entrer : Nom-Classe..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className={styles.scanBtn}
                  disabled={loading || !inputVal.trim()}
                >
                  {loading ? (
                    'Vérification...'
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Valider le Pass
                    </>
                  )}
                </button>
              </div>

              {/* Quick Test Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dark-b)', fontWeight: '600' }}>
                  Exemples de test :
                </span>
                {[
                  'Abderrahmane Raquibi-DD201',
                  'Yassine El Amrani-DD101',
                  'Inconnu-DD999',
                ].map((testData) => (
                  <button
                    key={testData}
                    type="button"
                    onClick={() => {
                      setInputVal(testData);
                      handleScanSubmit(testData);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      color: '#e6edf3',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {testData}
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* Result Alert Box */}
          {latestResult && (
            <div
              className={`${styles.resultBox} ${
                latestResult.status === 'approve'
                  ? styles.resultApprove
                  : latestResult.status === 'already_attended'
                  ? styles.resultAlreadyAttended
                  : styles.resultDecline
              }`}
              role="alert"
            >
              <div className={styles.resultHeader}>
                <div
                  className={`${styles.resultIcon} ${
                    latestResult.status === 'approve'
                      ? styles.iconApprove
                      : latestResult.status === 'already_attended'
                      ? styles.iconAlreadyAttended
                      : styles.iconDecline
                  }`}
                >
                  {latestResult.status === 'approve' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : latestResult.status === 'already_attended' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>

                <div>
                  <h2
                    className={`${styles.resultTitle} ${
                      latestResult.status === 'approve'
                        ? styles.titleApprove
                        : latestResult.status === 'already_attended'
                        ? styles.titleAlreadyAttended
                        : styles.titleDecline
                    }`}
                  >
                    {latestResult.status === 'approve'
                      ? 'ACCÈS AUTORISÉ'
                      : latestResult.status === 'already_attended'
                      ? 'DÉJÀ VALIDÉ (DÉJÀ ENTRÉ) ⚠️'
                      : 'ACCÈS REFUSÉ'}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dark-b)' }}>
                    Scanné à {latestResult.scannedAt}
                  </span>
                </div>
              </div>

              <div className={styles.participantDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Participant</span>
                  <span className={styles.detailValue}>{latestResult.fullName}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Classe / Groupe</span>
                  <span className={styles.detailValue}>{latestResult.classe}</span>
                </div>
              </div>

              <div className={styles.resultNotice}>
                {latestResult.status === 'approve' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>
                      Statut mis à jour en <strong>« attended »</strong> · Email officiel de confirmation de présence envoyé.
                    </span>
                  </>
                ) : latestResult.status === 'already_attended' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e3b341" strokeWidth="2.5">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>
                      {latestResult.message || 'Ce participant a déjà été scanné et est déjà dans la salle. Ré-entrée refusée.'}
                    </span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>
                      {latestResult.message || "QR code invalide ou participant introuvable dans la base d'inscriptions."}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className={styles.historySection}>
          <div className={styles.historyTitle}>
            <span>Historique des scans récents</span>
            <span className={styles.historyCount}>{history.length} scans</span>
          </div>

          {history.length === 0 ? (
            <p className={styles.emptyHistory}>Aucun scan effectué pour l'instant.</p>
          ) : (
            <ul className={styles.historyList}>
              {history.map((item, idx) => (
                <li key={idx} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <span
                      className={`${styles.historyBadge} ${
                        item.status === 'approve'
                          ? styles.badgeApprove
                          : item.status === 'already_attended'
                          ? styles.badgeAlreadyAttended
                          : styles.badgeDecline
                      }`}
                    >
                      {item.status === 'approve' ? 'Approuvé' : item.status === 'already_attended' ? 'Déjà Entré' : 'Refusé'}
                    </span>
                    <div>
                      <div className={styles.historyName}>{item.fullName}</div>
                      <div className={styles.historyClasse}>{item.classe}</div>
                    </div>
                  </div>
                  <span className={styles.historyTime}>{item.scannedAt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
