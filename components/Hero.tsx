'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Countdown from './Countdown';
import styles from './Hero.module.css';

export default function Hero() {
  const [attendeeName, setAttendeeName] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tracking to tilt around the signature isometric angle & move light glare
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Subtle tilt response around the natural isometric rotation
    const rotateX = -(y / (rect.height / 2)) * 9;
    const rotateY = (x / (rect.width / 2)) * 11;
    setTilt({ x: rotateX, y: rotateY });

    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
    setIsHovered(false);
  };

  const handlePreFillAndScroll = () => {
    if (attendeeName.trim() && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mtb_prefill_name', { detail: attendeeName.trim() }));
    }
  };

  // Full name displayed on the card
  const rawName = attendeeName.trim() || 'Your Name';
  const displayCardName = rawName.includes('OFPPT') ? rawName : `${rawName} - OFPPT DD`;

  // Deterministic realistic serial code derived from name
  const passSerial = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < displayCardName.length; i++) {
      hash = (hash << 5) - hash + displayCardName.charCodeAt(i);
      hash |= 0;
    }
    const code = Math.abs(hash % 9000) + 1000;
    return `MTB-2026-${code}`;
  }, [displayCardName]);

  return (
    <section className={styles.hero} aria-label="Événement principal">
      {/* Light Eyebrow Notification Bar */}
      <div className={styles.eyebrow}>
        <div className="container">
          <div className={styles.eyebrowInner}>
            <span className={styles.eyebrowBadge}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Édition Officielle 2026
            </span>
            <span className={styles.eyebrowText}>
              Atelier Pratique Présentiel · Salle Polyvalente, Complexe OFPPT Marrakech
            </span>
            <span className={styles.eyebrowFree}>Pass 100% Gratuit</span>
          </div>
        </div>
      </div>

      <div className={`container ${styles.grid}`}>
        {/* ── Left Column: Editorial & Live Customization ── */}
        <div className={styles.textCol}>
          <div className={styles.categoryBadge}>
            <span className={styles.badgeStar} aria-hidden="true">★</span>
            Session Spéciale Stagiaires Développement Digital (OFPPT)
          </div>

          <h1 className={styles.title}>
            Construire sa{' '}
            <span className={styles.titleRed}>Présence en Ligne</span>
            <span className={styles.titleSub}>
              Le guide pratique pour valoriser vos compétences et décrocher votre stage PFE
            </span>
          </h1>

          <p className={styles.description}>
            Transformez vos dépôts scolaires en une vitrine d'ingénierie percutante. Repartez avec un profil <strong>GitHub</strong> audité, un <strong>Portfolio</strong> déployé et un profil <strong>LinkedIn</strong> qui attire les recruteurs IT au Maroc.
          </p>

          {/* Interactive Live Name Customizer Box */}
          <div className={styles.personalizerBox}>
            <label htmlFor="heroNameInput" className={styles.personalizerLabel}>
              <span className={styles.sparkle} aria-hidden="true">✨</span>
              <span>Personnalisez votre Pass en direct :</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="heroNameInput"
                type="text"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder="Tapez votre prénom & nom (ex: Yassine El Amrani)"
                className={styles.nameInput}
                maxLength={30}
              />
              {attendeeName && (
                <button
                  type="button"
                  onClick={() => setAttendeeName('')}
                  className={styles.clearBtn}
                  aria-label="Effacer le nom"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Value Checklist */}
          <div className={styles.perksList} role="list" aria-label="Avantages de l'atelier">
            <div className={styles.perk} role="listitem">
              <span className={styles.checkIcon}>✓</span>
              <span>Pass QR Nominatif Immédiat</span>
            </div>
            <div className={styles.perk} role="listitem">
              <span className={styles.checkIcon}>✓</span>
              <span>4 Livrables Concrets Déployés</span>
            </div>
            <div className={styles.perk} role="listitem">
              <span className={styles.checkIcon}>✓</span>
              <span>100% Gratuit sur Inscription</span>
            </div>
          </div>

          {/* CTAs */}
          <div className={styles.ctas}>
            <Link
              href="#inscription"
              onClick={handlePreFillAndScroll}
              className="btn-red"
            >
              <span>Réserver mon Pass Gratuit</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
            <Link href="#programme" className={styles.btnOutlineNavy}>
              Explorer les 6 modules
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Link>
          </div>



          <div className={styles.countdownBox}>
            <Countdown />
          </div>
        </div>

        {/* ── Right Column: The Exact Isometric 3D Event Pass Card ── */}
        <div className={styles.visualCol}>
          <div
            className={styles.perspectiveStage}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* The Isometric 3D Card */}
            <div
              className={`${styles.isoCard} ${isHovered ? styles.isoCardHovered : ''}`}
              style={{
                transform: `rotateX(${20 + tilt.x}deg) rotateY(${-16 + tilt.y}deg) rotateZ(12deg)`,
                ['--glare-x' as string]: `${glarePos.x}%`,
                ['--glare-y' as string]: `${glarePos.y}%`,
              } as React.CSSProperties}
            >
              {/* Card Physical Edge Bevel */}
              <div className={styles.cardBevelEdge} aria-hidden="true" />

              {/* Dynamic Specular Light Glare Sheen */}
              <div className={styles.cardGlare} aria-hidden="true" />

              {/* Micro-mesh Security Guilloche Pattern */}
              <div className={styles.cardSecurityPattern} aria-hidden="true" />

              {/* Holographic Foil Corner Ribbon (Top Right) */}
              <div className={styles.topRightHoloRibbon} aria-hidden="true" />

              {/* Holographic Foil Corner Ribbon (Bottom Left) */}
              <div className={styles.bottomLeftHoloRibbon} aria-hidden="true" />

              {/* Top-Left Deep Navy Banner */}
              <div className={styles.eventPassBanner}>
                <div className={styles.bannerContent}>
                  <span className={styles.bannerStar} aria-hidden="true">★</span>
                  <span className={styles.bannerText}>EVENT PASS</span>
                </div>
                <div className={styles.bannerLivePill}>
                  <span className={styles.liveDot} />
                  <span>ACTIF</span>
                </div>
              </div>

              {/* Card Main Body Content */}
              <div className={styles.cardContent}>
                {/* Attendee Name Block */}
                <div className={styles.attendeeBlock}>
                  <div className={styles.attendeeHeader}>
                    <span className={styles.attendeeSubtitle}>PARTICIPANT OFFICIEL</span>
                    <span className={styles.verifiedBadge}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>VÉRIFIÉ</span>
                    </span>
                  </div>
                  <h3 className={styles.attendeeTitle} title={displayCardName}>
                    {displayCardName}
                  </h3>
                  <div className={styles.attendeeRoleTag}>
                    <span>DÉVELOPPEMENT DIGITAL · OFPPT MARRAKECH</span>
                  </div>
                </div>

                {/* Bottom Row: Glowing QR Code + Divider + Event Meta */}
                <div className={styles.bottomCardRow}>
                  {/* Glowing QR Box */}
                  <div className={styles.qrGlowFrame}>
                    {/* Glowing Corner Brackets */}
                    <span className={`${styles.cornerBracket} ${styles.tl}`} />
                    <span className={`${styles.cornerBracket} ${styles.tr}`} />
                    <span className={`${styles.cornerBracket} ${styles.bl}`} />
                    <span className={`${styles.cornerBracket} ${styles.br}`} />

                    <svg
                      width="66"
                      height="66"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#082D5B"
                      strokeWidth="1.8"
                      className={styles.qrSvg}
                      aria-label="Code QR du Pass"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                      <rect width="3.5" height="3.5" x="6" y="6" fill="#082D5B" stroke="none" />
                      <rect width="3.5" height="3.5" x="14.5" y="6" fill="#082D5B" stroke="none" />
                      <rect width="3.5" height="3.5" x="6" y="14.5" fill="#082D5B" stroke="none" />
                      <path d="M12 7v4M12 15v2M15 12h2M10.5 12h2.5M15 16h2" />
                    </svg>
                    <span className={styles.qrScanLabel}>SCAN VIP</span>
                  </div>

                  {/* Right: Thin Line + Event Info */}
                  <div className={styles.footerInfoBox}>
                    <div className={styles.footerTopMeta}>
                      <span className={styles.serialCode}>{passSerial}</span>
                      <span className={styles.nfcIndicator}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                          <path d="M6 18a10 10 0 0 1 0-12" />
                          <path d="M10 15a6 6 0 0 1 0-6" />
                          <path d="M14 12a2 2 0 0 1 0 0" />
                        </svg>
                        <span>NFC SECURE</span>
                      </span>
                    </div>
                    <div className={styles.thinDivider} />
                    <div className={styles.footerDetailsRow}>
                      <p className={styles.footerOfficialText}>
                        PASS OFFICIEL 2026 · SALLE POLYVALENTE OFPPT MARRAKECH
                      </p>
                      <span className={styles.eventDateBadge}>25 OCT 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Soft Ambient Diffuse Drop Shadow Under the Card */}
            <div className={styles.ambientDropShadow} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
