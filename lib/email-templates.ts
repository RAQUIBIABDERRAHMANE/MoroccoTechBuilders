/**
 * Responsive HTML Email Templates for Morocco Tech Builders
 */

interface ReminderEmailData {
  fullName: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  ticketId: string;
  qrCodeUrl?: string;
  passUrl: string;
  calendarUrl: string;
}

export function generateReminderEmailHtml(data: ReminderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel : ${data.eventName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 20px; line-height: 1.6; }
    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #059669, #10b981); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; }
    .content { padding: 32px 28px; }
    .h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 9999px; color: #34d399; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    .meta-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; margin: 20px 0; }
    .meta-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
    .meta-row:last-child { border-bottom: none; }
    .meta-lbl { color: #94a3b8; }
    .meta-val { color: #f8fafc; font-weight: 600; text-align: right; }
    .qr-box { text-align: center; padding: 20px; background: #ffffff; border-radius: 12px; margin: 24px auto; max-width: 220px; }
    .qr-box img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    .ticket-label { font-size: 13px; color: #0f172a; font-weight: 700; margin-top: 8px; font-family: monospace; }
    .cta-btn { display: block; text-align: center; background: #10b981; color: #ffffff !important; padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 24px 0 12px; }
    .sec-btn { display: block; text-align: center; background: rgba(255,255,255,0.06); color: #94a3b8 !important; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none; }
    .checklist { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; color: #93c5fd; }
    .checklist ul { margin: 8px 0 0; padding-left: 20px; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">Morocco Tech Builders</div>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Rappel de votre session demain</p>
    </div>

    <div class="content">
      <span class="badge">J-1 · Rendez-vous Demain</span>
      <h1 class="h1">Bonjour ${data.fullName},</h1>
      <p style="color: #cbd5e1; font-size: 14px;">
        Votre événement <strong>${data.eventName}</strong> a lieu demain ! Nous avons hâte de vous accueillir parmi la communauté de développeurs de l'OFPPT Marrakech.
      </p>

      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-lbl">Date & Heure :</span>
          <span class="meta-val">${data.date} à ${data.time}</span>
        </div>
        <div class="meta-row">
          <span class="meta-lbl">Lieu :</span>
          <span class="meta-val">${data.location}</span>
        </div>
        <div class="meta-row">
          <span class="meta-lbl">Billet N° :</span>
          <span class="meta-val">${data.ticketId}</span>
        </div>
      </div>

      ${data.qrCodeUrl ? `
      <div class="qr-box">
        <img src="${data.qrCodeUrl}" alt="Votre QR Pass" width="180" height="180" />
        <div class="ticket-label">${data.ticketId}</div>
      </div>
      ` : ''}

      <div class="checklist">
        <strong>Conseils pour le Jour J :</strong>
        <ul>
          <li>Arrivez 15 minutes en avance pour le contrôle d'accès fluide.</li>
          <li>Ayez votre pass digital prêt sur smartphone ou imprimé.</li>
          <li>Apportez votre ordinateur portable pour les ateliers pratiques.</li>
        </ul>
      </div>

      <a href="${data.passUrl}" class="cta-btn">Accéder à mon Pass Digital</a>
      <a href="${data.calendarUrl}" class="sec-btn">Ajouter à mon agenda Google / Apple</a>
    </div>

    <div class="footer">
      Morocco Tech Builders · Propulsé par la communauté tech & OFPPT Marrakech.<br>
      Pour toute question, contactez l'équipe d'organisation.
    </div>
  </div>
</body>
</html>
  `;
}

interface ThankYouEmailData {
  fullName: string;
  eventName: string;
  profileUrl: string;
  directoryUrl: string;
}

export function generateThankYouEmailHtml(data: ThankYouEmailData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Merci pour votre participation ! · ${data.eventName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 20px; line-height: 1.6; }
    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; }
    .content { padding: 32px 28px; }
    .h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
    .verified-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 9999px; color: #34d399; font-size: 13px; font-weight: 700; margin-bottom: 20px; }
    .cta-btn { display: block; text-align: center; background: #10b981; color: #ffffff !important; padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 20px 0 10px; }
    .sec-btn { display: block; text-align: center; background: rgba(255,255,255,0.06); color: #cbd5e1 !important; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; border: 1px solid rgba(255,255,255,0.1); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">Morocco Tech Builders</div>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Merci pour votre présence</p>
    </div>

    <div class="content">
      <div class="verified-badge">✓ Présence Validée à l'Événement</div>
      <h1 class="h1">Félicitations ${data.fullName},</h1>
      <p style="color: #cbd5e1; font-size: 14px;">
        Un grand merci d'avoir participé activement à <strong>${data.eventName}</strong> ! Votre présence a été officiellement enregistrée et validée.
      </p>

      <p style="color: #cbd5e1; font-size: 14px;">
        Votre badge de présence est désormais affiché sur votre profil public développeur. Vous pouvez le partager directement sur LinkedIn pour valoriser votre engagement.
      </p>

      <a href="${data.profileUrl}" class="cta-btn">Voir mon Profil Public Certifié</a>
      <a href="${data.directoryUrl}" class="sec-btn">Explorer l'Annuaire & Continuer le Réseau</a>
    </div>

    <div class="footer">
      Morocco Tech Builders · Communauté des Développeurs de Demain.<br>
      Restez connectés pour les prochaines éditions et hackathons !
    </div>
  </div>
</body>
</html>
  `;
}
