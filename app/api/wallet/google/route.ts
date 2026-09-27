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
    let privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Automatically check for service-account.json or google-wallet-key.json in root
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

    // If Google Wallet credentials exist, create RS256 signed JWT
    if (issuerId && serviceAccountEmail && privateKey) {
      const cleanId = ticketId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const objectId = `${issuerId}.${cleanId}`;
      const classId = `${issuerId}.mtb_workshop_2026`;

      const claims = {
        iss: serviceAccountEmail,
        aud: 'google',
        origins: ['http://localhost:3000', 'https://events.raquibi.com'],
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

    // When Google Cloud Issuer credentials are not in .env:
    // If format=json requested by client, return status
    if (format === 'json') {
      return NextResponse.json({
        configured: false,
        message: 'Google Wallet Issuer credentials are not configured in .env',
        ticket: {
          ticketId,
          fullName,
          classe,
          qrCodeData,
        },
      });
    }

    // For direct browser clicks without Google API keys:
    // Redirect to the pass download (.pkpass) which Android & Google Wallet open natively!
    const applePassUrl = `/api/wallet/apple?ticketId=${encodeURIComponent(ticketId)}&fullName=${encodeURIComponent(
      fullName
    )}&classe=${encodeURIComponent(classe)}&qr=${encodeURIComponent(qrCodeData)}`;

    return NextResponse.redirect(new URL(applePassUrl, request.url), 302);
  } catch (err: any) {
    console.error('Google Wallet API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Erreur Google Wallet' },
      { status: 500 }
    );
  }
}
