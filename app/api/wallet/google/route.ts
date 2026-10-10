import { NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { getRegistrationByTicketId } from '@/lib/user-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketIdParam = searchParams.get('ticketId') || searchParams.get('ticket_id');
    const nameParam = searchParams.get('fullName') || searchParams.get('name');
    const classeParam = searchParams.get('classe') || searchParams.get('class');
    const qrDataParam = searchParams.get('qr') || searchParams.get('data');
    const format = searchParams.get('format'); // 'json' or undefined

    let fullName = nameParam || '';
    let classe = classeParam || '';
    let ticketId = ticketIdParam || 'OFPPT-DD-2026';
    let qrCodeData = qrDataParam || '';

    // If ticketId is available and params are missing, attempt to load exact data from Turso
    if (ticketIdParam && (!fullName || !classe || !qrCodeData)) {
      try {
        const found = await getRegistrationByTicketId(ticketIdParam);
        if (found) {
          if (!fullName && found.user) fullName = found.user.fullName;
          if (!classe && found.user) classe = found.user.classe;
          if (!qrCodeData) qrCodeData = found.registration.qrCodeData;
          ticketId = found.registration.ticketId;
        }
      } catch (err) {
        console.warn('Could not query Turso for google wallet pass, using query fallback:', err);
      }
    }

    if (!fullName) fullName = 'Stagiaire MTB';
    if (!classe) classe = 'Développement Digital';
    if (!qrCodeData) qrCodeData = `${fullName}-${classe}`;

    let issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    let serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY;

    // 1. Try parsing JSON from GOOGLE_WALLET_SERVICE_ACCOUNT_JSON_BASE64 (safest for cloud/production)
    if ((!serviceAccountEmail || !privateKey) && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON_BASE64) {
      try {
        const decoded = Buffer.from(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8');
        const sa = JSON.parse(decoded);
        if (sa.client_email && sa.private_key) {
          serviceAccountEmail = sa.client_email;
          privateKey = sa.private_key;
        }
      } catch (e) {
        console.warn('Could not parse GOOGLE_WALLET_SERVICE_ACCOUNT_JSON_BASE64:', e);
      }
    }

    // 2. Try parsing raw JSON from GOOGLE_WALLET_SERVICE_ACCOUNT_JSON
    if ((!serviceAccountEmail || !privateKey) && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON) {
      try {
        const sa = JSON.parse(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON);
        if (sa.client_email && sa.private_key) {
          serviceAccountEmail = sa.client_email;
          privateKey = sa.private_key;
        }
      } catch (e) {
        console.warn('Could not parse GOOGLE_WALLET_SERVICE_ACCOUNT_JSON:', e);
      }
    }

    // 3. Automatically check for service-account.json or google-wallet-key.json in root
    const keyCandidates = [
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      path.join(process.cwd(), 'service-account.json'),
      path.join(process.cwd(), 'google-wallet-key.json'),
    ].filter(Boolean) as string[];

    for (const keyPath of keyCandidates) {
      if ((!serviceAccountEmail || !privateKey) && fs.existsSync(keyPath)) {
        try {
          const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
          if (sa.client_email && sa.private_key) {
            serviceAccountEmail = sa.client_email;
            privateKey = sa.private_key;
            break;
          }
        } catch (e) {
          console.warn('Could not parse Google service account file:', e);
        }
      }
    }

    // Sanitize privateKey formatting (replace literal \n and Windows \r\n)
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
    }

    // If Google Wallet credentials exist, create RS256 signed JWT
    if (issuerId && serviceAccountEmail && privateKey) {
      const cleanId = ticketId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const objectId = `${issuerId}.${cleanId}`;
      const classId = `${issuerId}.mtb_workshop_2026`;

      // Build comprehensive and dynamic origins list
      const requestOrigin = new URL(request.url).origin;
      const origins = Array.from(
        new Set([
          requestOrigin,
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https://mtb.raquibi.com',
          'https://port.raquibi.com',
          'https://events.raquibi.com',
          'https://www.raquibi.com',
          'https://raquibi.com',
          ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')] : []),
        ])
      ).filter(Boolean);

      const claims = {
        iss: serviceAccountEmail,
        aud: 'google',
        origins: origins,
        typ: 'savetowallet',
        iat: Math.floor(Date.now() / 1000),
        payload: {
          eventTicketObjects: [
            {
              id: objectId,
              classId: classId,
              state: 'active',
              ticketHolderName: fullName,
              ticketNumber: ticketId,
              hexBackgroundColor: '#082D5B',
              barcode: {
                type: 'qrCode',
                value: qrCodeData,
                alternateText: ticketId,
              },
              textModulesData: [
                {
                  id: 'classe',
                  header: 'CLASSE',
                  body: classe,
                },
                {
                  id: 'session',
                  header: 'SESSION',
                  body: '25 Janvier 2026 · 09:30',
                },
                {
                  id: 'location',
                  header: 'LIEU',
                  body: 'Salle Polyvalente NTIC Sidi Youssef Ben Ali',
                },
                {
                  id: 'speaker',
                  header: 'INTERVENANT',
                  body: 'Abderrahmane Raquibi',
                },
              ],
            },
          ],
        },
      };

      const header = {
        alg: 'RS256',
        typ: 'JWT',
      };

      const base64UrlEncode = (obj: any) =>
        Buffer.from(JSON.stringify(obj))
          .toString('base64')
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');

      const encodedHeader = base64UrlEncode(header);
      const encodedClaims = base64UrlEncode(claims);
      const dataToSign = `${encodedHeader}.${encodedClaims}`;

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(dataToSign);
      signer.end();
      const signature = signer
        .sign(privateKey)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const jwt = `${dataToSign}.${signature}`;
      const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;

      if (format === 'json') {
        return NextResponse.json({ configured: true, saveUrl });
      }

      return NextResponse.redirect(saveUrl, 302);
    }

    // When Google Cloud Issuer credentials are not in environment:
    if (format === 'json') {
      return NextResponse.json({
        configured: false,
        message: 'Google Wallet Issuer credentials are not configured in production environment variables.',
        ticket: {
          ticketId,
          fullName,
          classe,
          qrCodeData,
        },
      });
    }

    // Return a clean, user-friendly HTML error page rather than downloading a broken .pkpass file on Android!
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Wallet · Configuration Requise</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #080d1a;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 20px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
    }
    h1 {
      font-size: 1.25rem;
      margin: 0 0 10px;
      font-weight: 700;
    }
    p {
      color: #94a3b8;
      font-size: 0.92rem;
      line-height: 1.5;
      margin: 0 0 24px;
    }
    .code-box {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 12px 14px;
      text-align: left;
      font-family: monospace;
      font-size: 0.82rem;
      color: #38bdf8;
      margin-bottom: 24px;
      overflow-x: auto;
    }
    .btn {
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
      padding: 12px 20px;
      background: #10b981;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      border-radius: 10px;
      font-size: 0.95rem;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h1>Google Wallet Non Configuré en Production</h1>
    <p>
      Le compte de service Google Wallet n'est pas encore renseigné dans les variables d'environnement de votre hébergeur (Vercel / VPS / Cloud).
    </p>
    <div class="code-box">
      GOOGLE_WALLET_ISSUER_ID=3388000000023194470<br>
      GOOGLE_WALLET_SERVICE_ACCOUNT_JSON_BASE64=...
    </div>
    <a href="/profile" class="btn">Retourner à mon Badge & QR Code</a>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err: any) {
    console.error('Google Wallet API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Erreur Google Wallet' },
      { status: 500 }
    );
  }
}
