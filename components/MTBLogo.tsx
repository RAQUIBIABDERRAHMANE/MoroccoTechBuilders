import React from 'react';
import Image from 'next/image';

interface MTBLogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
  useImage?: boolean;
}

export default function MTBLogo({
  size = 36,
  variant = 'dark',
  showTagline = false,
  className = '',
  useImage = false,
}: MTBLogoProps) {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#082D5B';
  const subColor = isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748B';
  const primaryMarkColor = isDark ? '#FFFFFF' : '#082D5B';

  const markWidth = Math.round(size * (200 / 140));

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size > 40 ? '12px' : '10px' }}>
      {useImage ? (
        <Image
          src={isDark ? '/mtb-logo-dark-transparent.png' : '/mtb-logo-light-transparent.png'}
          alt="Morocco Tech Builders Logo"
          width={markWidth}
          height={size}
          style={{ height: size, width: 'auto', flexShrink: 0 }}
          priority
        />
      ) : (
        /* Official Geometric Twin Mountain Peaks with Moroccan Star */
        <svg
          width={markWidth}
          height={size}
          viewBox="0 0 200 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          {/* Green 5-Point Moroccan Star */}
          <polygon
            points="104,4 99,19 84,19 96,28 92,42 104,34 116,42 112,28 123,19 109,19"
            fill="#10B981"
          />

          {/* Left Mountain Peak (Deep Navy on Light, Pure White on Dark) */}
          <polygon
            points="66,35 95,80 79,103 64,82 32,135 3,135"
            fill={primaryMarkColor}
          />

          {/* Right Mountain Peak (Moroccan Red) */}
          <polygon
            points="137,40 196,135 168,135 137,84 99,135 69,135"
            fill="#E11D2E"
          />

          {/* Inner Triangle Peak (Deep Navy on Light, Pure White on Dark) */}
          <polygon
            points="137,106 153,135 122,135"
            fill={primaryMarkColor}
          />
        </svg>
      )}

      {variant !== 'icon' && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 800, fontSize: Math.max(13, size * 0.42), color: textColor, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Morocco
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: 800, fontSize: Math.max(13, size * 0.42), color: textColor, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
              Tech Builders
            </span>
            <span style={{ fontWeight: 700, fontSize: Math.max(10, size * 0.28), color: '#E11D2E', letterSpacing: '0.02em' }}>
              (MTB)
            </span>
          </div>
          {showTagline && (
            <span style={{ fontSize: Math.max(9, size * 0.2), fontWeight: 700, letterSpacing: '0.12em', color: subColor, marginTop: '3px', textTransform: 'uppercase' }}>
              BUILD · LEARN · CONNECT · IMPACT
            </span>
          )}
        </div>
      )}
    </div>
  );
}
