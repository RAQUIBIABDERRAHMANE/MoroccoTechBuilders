export interface VCardUserInput {
  id?: string;
  fullName: string;
  classe?: string;
  year?: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  skills?: string[];
  createdAt?: string;
  email?: string;
  phone?: string;
}

/**
 * Generate 100% compliant RFC 2426 vCard 3.0 format for Android and iOS.
 * Avoids non-standard properties that cause Android's VCardParser to crash on import.
 */
export function generateVCardString(user: VCardUserInput): string {
  const nameParts = (user.fullName || '').trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || 'Participant';

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${user.fullName}`,
    `ORG:Morocco Tech Builders - OFPPT Marrakech`,
    `TITLE:Stagiaire Classe ${user.classe || 'DEV'} · ${user.year || '2026'}`,
  ];

  if (user.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${user.email}`);
  }

  if (user.phone) {
    lines.push(`TEL;TYPE=CELL:${user.phone}`);
  }

  if (typeof window !== 'undefined' && user.id) {
    lines.push(`URL:${window.location.origin}/u/${user.id}`);
  }

  // Social links & notes formatted in standard NOTE field (prevents Android VCardParser crash)
  const noteLines = [
    `Morocco Tech Builders - OFPPT Marrakech`,
    user.classe ? `Classe: ${user.classe} (${user.year || '2026'})` : '',
    user.skills && user.skills.length > 0 ? `Compétences: ${user.skills.join(', ')}` : '',
    user.linkedinUrl ? `LinkedIn: ${user.linkedinUrl}` : '',
    user.githubUsername ? `GitHub: https://github.com/${user.githubUsername.replace('@', '').replace('https://github.com/', '')}` : '',
    user.portfolioUrl ? `Portfolio: ${user.portfolioUrl}` : '',
    user.bio ? `Bio: ${user.bio}` : '',
  ].filter(Boolean);

  lines.push(`NOTE:${noteLines.join(' \\n ')}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Download raw .vcf file directly
 */
export function downloadVCardRaw(user: VCardUserInput): void {
  if (typeof window === 'undefined') return;
  const vCardContent = generateVCardString(user);
  const cleanName = (user.fullName || 'contact').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `${cleanName}_mtb.vcf`;
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Triggers saving the contact to the phone:
 * - If user.id is available, uses server-side endpoint with strict text/vcard MIME type
 * - Fallback to client-side blob download
 */
export function triggerContactSave(user: VCardUserInput): void {
  if (typeof window === 'undefined') return;

  if (user.id) {
    // Both Android and iOS handle server-served .vcf with proper Content-Disposition
    window.location.href = `/api/contact/vcf?id=${encodeURIComponent(user.id)}`;
    return;
  }

  downloadVCardRaw(user);
}

// Backwards compatibility alias
export const downloadVCardFile = triggerContactSave;
export function getAndroidIntentUrl(_user?: VCardUserInput): string {
  return '';
}
export const saveToPhoneContacts = async (user: VCardUserInput) => {
  triggerContactSave(user);
  return {
    success: true,
    method: 'qr_modal' as const,
    message: 'Fiche contact prête. Touchez "Ouvrir" pour l\'ajouter à votre répertoire.',
  };
};
