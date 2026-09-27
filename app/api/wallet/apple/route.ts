import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import JSZip from 'jszip';
import { getRegistrationByTicketId } from '@/lib/user-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketIdParam = searchParams.get('ticketId') || searchParams.get('ticket_id');
    const nameParam = searchParams.get('fullName') || searchParams.get('name');
    const classeParam = searchParams.get('classe') || searchParams.get('class');
    const qrDataParam = searchParams.get('qr') || searchParams.get('data');

    let fullName = nameParam || '';
    let classe = classeParam || '';
    let ticketId = ticketIdParam || 'OFPPT-DD-2026';
    let qrCodeData = qrDataParam || '';

    // If ticketId is available, attempt to load exact data from Turso
    if (ticketIdParam) {
      try {
        const found = await getRegistrationByTicketId(ticketIdParam);
        if (found) {
          if (!fullName && found.user) fullName = found.user.fullName;
          if (!classe && found.user) classe = found.user.classe;
          if (!qrCodeData) qrCodeData = found.registration.qrCodeData;
          ticketId = found.registration.ticketId;
        }
      } catch (err) {
        console.warn('Could not query Turso for wallet pass, using query parameters fallback:', err);
      }
    }

    if (!fullName) fullName = 'Stagiaire MTB';
    if (!classe) classe = 'Développement Digital';
    if (!qrCodeData) qrCodeData = `${fullName}-${classe}`;

    // PassKit pass.json structure conforming to Apple Event Ticket specs
    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || 'pass.ma.moroccotechbuilders.events',
      serialNumber: ticketId,
      teamIdentifier: process.env.APPLE_TEAM_ID || 'MTB2026',
      organizationName: 'Morocco Tech Builders',
      description: 'Atelier Présence en Ligne — Morocco Tech Builders',
      logoText: 'Morocco Tech Builders',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(8, 45, 91)', // MTB Deep Navy #082D5B
      labelColor: 'rgb(16, 185, 129)', // MTB Green #10B981
      eventTicket: {
        headerFields: [
          {
            key: 'status',
            label: 'ACCÈS',
            value: 'VALIDÉ',
          },
        ],
        primaryFields: [
          {
            key: 'event',
            label: 'CONFÉRENCE & ATELIER',
            value: 'Présence en Ligne',
          },
        ],
        secondaryFields: [
          {
            key: 'attendee',
            label: 'STAGIAIRE',
            value: fullName,
          },
          {
            key: 'classe',
            label: 'CLASSE',
            value: classe,
          },
        ],
        auxiliaryFields: [
          {
            key: 'date',
            label: 'DATE & HEURE',
            value: '25 Janv. 2026 · 09:30',
          },
          {
            key: 'venue',
            label: 'LIEU',
            value: 'NTIC Sidi Youssef Ben Ali',
          },
          {
            key: 'speaker',
            label: 'INTERVENANT',
            value: 'A. Raquibi',
          },
        ],
        backFields: [
          {
            key: 'ticket_id',
            label: 'Numéro de Billet',
            value: ticketId,
          },
          {
            key: 'event_full',
            label: 'Intitulé Complet',
            value: 'Construire sa Présence en Ligne: Portfolio, Réseaux & Visibilité Pro',
          },
          {
            key: 'organizers',
            label: 'Organisateurs',
            value: 'Morocco Tech Builders & OFPPT NTIC Marrakech',
          },
          {
            key: 'venue_address',
            label: 'Adresse',
            value: 'Salle Polyvalente NTIC Sidi Youssef Ben Ali, Marrakech',
          },
          {
            key: 'instructions',
            label: 'Consignes de Contrôle',
            value: "Présentez ce code QR à l'accueil pour valider votre entrée et activer votre profil certifié.",
          },
          {
            key: 'support',
            label: 'Portail Officiel',
            value: 'https://mtb.raquibi.com',
          },
        ],
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: qrCodeData,
          messageEncoding: 'iso-8859-1',
          altText: ticketId,
        },
      ],
      barcode: {
        format: 'PKBarcodeFormatQR',
        message: qrCodeData,
        messageEncoding: 'iso-8859-1',
        altText: ticketId,
      },
    };

    const zip = new JSZip();
    const manifest: Record<string, string> = {};

    const passJsonStr = JSON.stringify(passJson, null, 2);
    zip.file('pass.json', passJsonStr);
    manifest['pass.json'] = crypto.createHash('sha1').update(passJsonStr).digest('hex');

    // Assets from public directory
    const publicDir = path.join(process.cwd(), 'public');
    const iconPath = path.join(publicDir, 'apple-touch-icon.png');
    const logoPath = path.join(publicDir, 'mtb-logo-light-transparent.png');

    if (fs.existsSync(iconPath)) {
      const iconBuffer = fs.readFileSync(iconPath);
      zip.file('icon.png', iconBuffer);
      zip.file('icon@2x.png', iconBuffer);
      const iconSha = crypto.createHash('sha1').update(iconBuffer).digest('hex');
      manifest['icon.png'] = iconSha;
      manifest['icon@2x.png'] = iconSha;
    }

    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      zip.file('logo.png', logoBuffer);
      zip.file('logo@2x.png', logoBuffer);
      const logoSha = crypto.createHash('sha1').update(logoBuffer).digest('hex');
      manifest['logo.png'] = logoSha;
      manifest['logo@2x.png'] = logoSha;
    }

    // Manifest file
    const manifestJsonStr = JSON.stringify(manifest, null, 2);
    zip.file('manifest.json', manifestJsonStr);

    // Optional cryptographic signature if certificates are configured
    if (process.env.APPLE_PASS_CERT && process.env.APPLE_PASS_KEY) {
      try {
        const sign = crypto.createSign('SHA256');
        sign.update(manifestJsonStr);
        sign.end();
        const signature = sign.sign(process.env.APPLE_PASS_KEY);
        zip.file('signature', signature);
      } catch (signErr) {
        console.warn('Failed to generate Apple Pass signature with provided keys:', signErr);
      }
    }

    // Generate .pkpass zip buffer
    const passBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    const safeTicket = ticketId.replace(/[^a-zA-Z0-9_-]/g, '_');

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="MTB-Pass-${safeTicket}.pkpass"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    console.error('Apple Wallet pass generation error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Erreur lors de la génération du pass Apple Wallet' },
      { status: 500 }
    );
  }
}
