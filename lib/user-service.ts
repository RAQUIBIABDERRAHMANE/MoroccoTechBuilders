import { getTursoClient, initDb } from './turso';
import { hashPassword, verifyPassword } from './auth';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  classe: string;
  year: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  skills: string[];
  isDirectoryVisible?: boolean;
  createdAt: string;
}

export interface PublicUserRecord {
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
  isDirectoryVisible?: boolean;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  slug: string;
  name: string;
  description?: string;
  speaker: string;
  speakerRole?: string;
  speakerBio?: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  bannerUrl?: string;
  isActive: boolean;
  reminderSent: boolean;
  thankYouSent: boolean;
  createdAt: string;
}

export interface UserConnectionRecord {
  id: string;
  userId: string;
  connectedUserId: string;
  note?: string;
  createdAt: string;
  connectedUser?: PublicUserRecord;
}

export interface EventRegistrationRecord {
  id: string;
  userId: string;
  eventId: string;
  eventName: string;
  ticketId: string;
  qrCodeData: string;
  qrCodeUrl: string;
  status: 'registered' | 'attended';
  registeredAt: string;
  attendedAt?: string;
}

export interface UserProfileWithEvents extends UserRecord {
  registrations: EventRegistrationRecord[];
}

export async function createUser(data: {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  classe: string;
  year?: string;
}): Promise<UserRecord> {
  await initDb();
  const db = getTursoClient();

  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanFullName = data.fullName.trim();
  const cleanClasse = data.classe.trim().toUpperCase();
  const cleanYear = data.year || (cleanClasse.includes('1') ? '1ère Année' : '2ème Année');
  const cleanPhone = (data.phone || '').trim();
  const passwordHash = hashPassword(data.password || 'MTB2026!');
  const createdAt = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO users (
        id, full_name, email, password_hash, phone, classe, year, created_at, skills
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      cleanFullName,
      cleanEmail,
      passwordHash,
      cleanPhone,
      cleanClasse,
      cleanYear,
      createdAt,
      JSON.stringify([]),
    ],
  });

  return {
    id,
    fullName: cleanFullName,
    email: cleanEmail,
    phone: cleanPhone,
    classe: cleanClasse,
    year: cleanYear,
    skills: [],
    createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<(UserRecord & { passwordHash: string }) | null> {
  await initDb();
  const db = getTursoClient();
  const cleanEmail = email.trim().toLowerCase();

  const res = await db.execute({
    sql: `
      SELECT id, full_name, email, password_hash, phone, classe, year, avatar_url, github_username, linkedin_url, portfolio_url, bio, skills, is_directory_visible, created_at 
      FROM users WHERE email = ? LIMIT 1
    `,
    args: [cleanEmail],
  });

  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  let parsedSkills: string[] = [];
  try {
    parsedSkills = JSON.parse((row.skills as string) || '[]');
  } catch {
    parsedSkills = [];
  }

  const isDirectoryVisible =
    row.is_directory_visible === null || row.is_directory_visible === undefined
      ? true
      : Number(row.is_directory_visible) === 1;

  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    phone: String(row.phone || ''),
    classe: String(row.classe),
    year: String(row.year),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    githubUsername: row.github_username ? String(row.github_username) : undefined,
    linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : undefined,
    portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : undefined,
    bio: row.bio ? String(row.bio) : undefined,
    skills: parsedSkills,
    isDirectoryVisible,
    createdAt: String(row.created_at),
  };
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `
      SELECT id, full_name, email, phone, classe, year, avatar_url, github_username, linkedin_url, portfolio_url, bio, skills, is_directory_visible, created_at 
      FROM users WHERE id = ? LIMIT 1
    `,
    args: [id],
  });

  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  let parsedSkills: string[] = [];
  try {
    parsedSkills = JSON.parse((row.skills as string) || '[]');
  } catch {
    parsedSkills = [];
  }

  const isDirectoryVisible =
    row.is_directory_visible === null || row.is_directory_visible === undefined
      ? true
      : Number(row.is_directory_visible) === 1;

  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone || ''),
    classe: String(row.classe),
    year: String(row.year),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    githubUsername: row.github_username ? String(row.github_username) : undefined,
    linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : undefined,
    portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : undefined,
    bio: row.bio ? String(row.bio) : undefined,
    skills: parsedSkills,
    isDirectoryVisible,
    createdAt: String(row.created_at),
  };
}

/**
 * Public profile fetcher - strictly omits email, phone, and password_hash
 */
export async function getPublicProfile(id: string): Promise<PublicUserRecord | null> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `
      SELECT id, full_name, classe, year, avatar_url, github_username, linkedin_url, portfolio_url, bio, skills, is_directory_visible, created_at 
      FROM users WHERE id = ? LIMIT 1
    `,
    args: [id],
  });

  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  let parsedSkills: string[] = [];
  try {
    parsedSkills = JSON.parse((row.skills as string) || '[]');
  } catch {
    parsedSkills = [];
  }

  const isDirectoryVisible =
    row.is_directory_visible === null || row.is_directory_visible === undefined
      ? true
      : Number(row.is_directory_visible) === 1;

  return {
    id: String(row.id),
    fullName: String(row.full_name),
    classe: String(row.classe),
    year: String(row.year),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    githubUsername: row.github_username ? String(row.github_username) : undefined,
    linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : undefined,
    portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : undefined,
    bio: row.bio ? String(row.bio) : undefined,
    skills: parsedSkills,
    isDirectoryVisible,
    createdAt: String(row.created_at),
  };
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  await initDb();
  const db = getTursoClient();
  const newHash = hashPassword(newPassword);

  const res = await db.execute({
    sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
    args: [newHash, userId],
  });

  return (res.rowsAffected || 0) > 0;
}

export async function updateUserProfile(
  id: string,
  data: {
    githubUsername?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    bio?: string;
    skills?: string[];
    avatarUrl?: string;
    isDirectoryVisible?: boolean;
  }
): Promise<UserRecord | null> {
  await initDb();
  const db = getTursoClient();

  const skillsJson = JSON.stringify(data.skills || []);
  const isVisibleNum =
    data.isDirectoryVisible !== undefined
      ? data.isDirectoryVisible
        ? 1
        : 0
      : null;

  await db.execute({
    sql: `
      UPDATE users SET
        github_username = COALESCE(?, github_username),
        linkedin_url = COALESCE(?, linkedin_url),
        portfolio_url = COALESCE(?, portfolio_url),
        bio = COALESCE(?, bio),
        skills = COALESCE(?, skills),
        avatar_url = COALESCE(?, avatar_url),
        is_directory_visible = COALESCE(?, is_directory_visible)
      WHERE id = ?
    `,
    args: [
      data.githubUsername !== undefined ? data.githubUsername.trim() : null,
      data.linkedinUrl !== undefined ? data.linkedinUrl.trim() : null,
      data.portfolioUrl !== undefined ? data.portfolioUrl.trim() : null,
      data.bio !== undefined ? data.bio.trim() : null,
      data.skills !== undefined ? skillsJson : null,
      data.avatarUrl !== undefined ? data.avatarUrl.trim() : null,
      isVisibleNum,
      id,
    ],
  });

  return findUserById(id);
}

export async function createEventRegistration(data: {
  userId: string;
  eventId: string;
  eventName: string;
  ticketId: string;
  qrCodeData: string;
  qrCodeUrl: string;
}): Promise<EventRegistrationRecord> {
  await initDb();
  const db = getTursoClient();

  const id = `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const registeredAt = new Date().toISOString();

  // Deduplication: Check if existing registration for this event and user
  const existing = await db.execute({
    sql: `
      SELECT id, user_id, event_id, event_name, ticket_id, qr_code_data, qr_code_url, status, registered_at, attended_at 
      FROM event_registrations WHERE user_id = ? AND event_id = ? LIMIT 1
    `,
    args: [data.userId, data.eventId],
  });

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    return {
      id: String(row.id),
      userId: String(row.user_id),
      eventId: String(row.event_id),
      eventName: String(row.event_name),
      ticketId: String(row.ticket_id),
      qrCodeData: String(row.qr_code_data),
      qrCodeUrl: String(row.qr_code_url),
      status: row.status as 'registered' | 'attended',
      registeredAt: String(row.registered_at),
      attendedAt: row.attended_at ? String(row.attended_at) : undefined,
    };
  }

  await db.execute({
    sql: `
      INSERT INTO event_registrations (
        id, user_id, event_id, event_name, ticket_id, qr_code_data, qr_code_url, status, registered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'registered', ?)
    `,
    args: [
      id,
      data.userId,
      data.eventId,
      data.eventName,
      data.ticketId,
      data.qrCodeData,
      data.qrCodeUrl,
      registeredAt,
    ],
  });

  return {
    id,
    userId: data.userId,
    eventId: data.eventId,
    eventName: data.eventName,
    ticketId: data.ticketId,
    qrCodeData: data.qrCodeData,
    qrCodeUrl: data.qrCodeUrl,
    status: 'registered',
    registeredAt,
  };
}

export async function getUserRegistrations(userId: string): Promise<EventRegistrationRecord[]> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `
      SELECT id, user_id, event_id, event_name, ticket_id, qr_code_data, qr_code_url, status, registered_at, attended_at 
      FROM event_registrations WHERE user_id = ? ORDER BY registered_at DESC
    `,
    args: [userId],
  });

  return res.rows.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    eventId: String(row.event_id),
    eventName: String(row.event_name),
    ticketId: String(row.ticket_id),
    qrCodeData: String(row.qr_code_data),
    qrCodeUrl: String(row.qr_code_url),
    status: row.status as 'registered' | 'attended',
    registeredAt: String(row.registered_at),
    attendedAt: row.attended_at ? String(row.attended_at) : undefined,
  }));
}

export async function markRegistrationAttended(qrCodeData: string): Promise<{
  success: boolean;
  alreadyAttended: boolean;
  registration?: EventRegistrationRecord;
  user?: UserRecord;
}> {
  await initDb();
  const db = getTursoClient();
  let cleanQR = qrCodeData.trim();

  // If payload is a URL, extract ticketId or query param
  if (cleanQR.startsWith('http://') || cleanQR.startsWith('https://')) {
    try {
      const parsed = new URL(cleanQR);
      const ticketParam = parsed.searchParams.get('ticketId') || parsed.searchParams.get('ticket_id') || parsed.searchParams.get('data');
      if (ticketParam) {
        cleanQR = ticketParam.trim();
      } else {
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          cleanQR = decodeURIComponent(segments[segments.length - 1]).trim();
        }
      }
    } catch {
      // Keep cleanQR as is
    }
  }

  // If payload is a Google Wallet objectId (e.g. 3388000000023194470.OFPPT-XXXX), extract ticketId
  let altClean = cleanQR;
  if (cleanQR.includes('.') && cleanQR.length > 20) {
    const afterDot = cleanQR.split('.').pop();
    if (afterDot) altClean = afterDot;
  }

  // Search case-insensitively across ticket_id, qr_code_data, registration id, and user_id
  const res = await db.execute({
    sql: `
      SELECT id, user_id, event_id, event_name, ticket_id, qr_code_data, qr_code_url, status, registered_at, attended_at 
      FROM event_registrations 
      WHERE LOWER(TRIM(ticket_id)) = LOWER(TRIM(?))
         OR LOWER(TRIM(ticket_id)) = LOWER(TRIM(?))
         OR LOWER(TRIM(qr_code_data)) = LOWER(TRIM(?))
         OR LOWER(TRIM(id)) = LOWER(TRIM(?))
         OR LOWER(TRIM(user_id)) = LOWER(TRIM(?))
      LIMIT 1
    `,
    args: [cleanQR, altClean, cleanQR, cleanQR, cleanQR],
  });

  if (res.rows.length === 0) {
    return { success: false, alreadyAttended: false };
  }

  const row = res.rows[0];
  const currentStatus = row.status as string;

  if (currentStatus === 'attended') {
    const user = await findUserById(String(row.user_id));
    return {
      success: true,
      alreadyAttended: true,
      registration: {
        id: String(row.id),
        userId: String(row.user_id),
        eventId: String(row.event_id),
        eventName: String(row.event_name),
        ticketId: String(row.ticket_id),
        qrCodeData: String(row.qr_code_data),
        qrCodeUrl: String(row.qr_code_url),
        status: 'attended',
        registeredAt: String(row.registered_at),
        attendedAt: row.attended_at ? String(row.attended_at) : undefined,
      },
      user: user || undefined,
    };
  }

  const attendedAt = new Date().toISOString();
  await db.execute({
    sql: `UPDATE event_registrations SET status = 'attended', attended_at = ? WHERE id = ?`,
    args: [attendedAt, String(row.id)],
  });

  const user = await findUserById(String(row.user_id));

  return {
    success: true,
    alreadyAttended: false,
    registration: {
      id: String(row.id),
      userId: String(row.user_id),
      eventId: String(row.event_id),
      eventName: String(row.event_name),
      ticketId: String(row.ticket_id),
      qrCodeData: String(row.qr_code_data),
      qrCodeUrl: String(row.qr_code_url),
      status: 'attended',
      registeredAt: String(row.registered_at),
      attendedAt,
    },
    user: user || undefined,
  };
}

export async function getUserProfileWithEvents(userId: string): Promise<UserProfileWithEvents | null> {
  const user = await findUserById(userId);
  if (!user) return null;

  const registrations = await getUserRegistrations(userId);
  return {
    ...user,
    registrations,
  };
}

export async function getRegistrationByTicketId(ticketId: string): Promise<{
  registration: EventRegistrationRecord;
  user: UserRecord | null;
} | null> {
  await initDb();
  const db = getTursoClient();
  const cleanTicket = ticketId.trim();

  const res = await db.execute({
    sql: `
      SELECT id, user_id, event_id, event_name, ticket_id, qr_code_data, qr_code_url, status, registered_at, attended_at 
      FROM event_registrations WHERE LOWER(TRIM(ticket_id)) = LOWER(TRIM(?)) LIMIT 1
    `,
    args: [cleanTicket],
  });

  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  const registration: EventRegistrationRecord = {
    id: String(row.id),
    userId: String(row.user_id),
    eventId: String(row.event_id),
    eventName: String(row.event_name),
    ticketId: String(row.ticket_id),
    qrCodeData: String(row.qr_code_data),
    qrCodeUrl: String(row.qr_code_url),
    status: row.status as 'registered' | 'attended',
    registeredAt: String(row.registered_at),
    attendedAt: row.attended_at ? String(row.attended_at) : undefined,
  };

  const user = await findUserById(registration.userId);

  return { registration, user };
}

// ── Admin, Stats & Sitemap Helpers ──────────────────────────────────────────

export async function getEventStats(eventId = 'mtb-2026-online-presence') {
  await initDb();
  const db = getTursoClient();

  const countRes = await db.execute({
    sql: `
      SELECT 
        COUNT(*) as total_registered,
        SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as total_attended
      FROM event_registrations
      WHERE event_id = ?
    `,
    args: [eventId],
  });

  const totalRegistered = Number(countRes.rows[0]?.total_registered || 0);
  const totalAttended = Number(countRes.rows[0]?.total_attended || 0);

  // Group by class
  const classRes = await db.execute({
    sql: `
      SELECT u.classe, COUNT(*) as reg_count, SUM(CASE WHEN er.status = 'attended' THEN 1 ELSE 0 END) as att_count
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = ?
      GROUP BY u.classe
      ORDER BY reg_count DESC
    `,
    args: [eventId],
  });

  const classesBreakdown: Record<string, { registered: number; attended: number }> = {};
  for (const row of classRes.rows) {
    const cls = String(row.classe || 'Inconnu');
    classesBreakdown[cls] = {
      registered: Number(row.reg_count || 0),
      attended: Number(row.att_count || 0),
    };
  }

  // Recent scans (last 30)
  const recentScansRes = await db.execute({
    sql: `
      SELECT 
        er.ticket_id, er.status, er.attended_at, er.registered_at,
        u.id as user_id, u.full_name, u.classe, u.email
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = ?
      ORDER BY COALESCE(er.attended_at, er.registered_at) DESC
      LIMIT 30
    `,
    args: [eventId],
  });

  const recentScans = recentScansRes.rows.map((row) => ({
    ticketId: String(row.ticket_id),
    userId: String(row.user_id),
    fullName: String(row.full_name),
    classe: String(row.classe),
    status: String(row.status),
    attendedAt: row.attended_at ? String(row.attended_at) : null,
    registeredAt: String(row.registered_at),
  }));

  return {
    totalRegistered,
    totalAttended,
    classesBreakdown,
    recentScans,
  };
}

export async function getAllAttendees(eventId = 'mtb-2026-online-presence') {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `
      SELECT 
        er.ticket_id, er.status, er.registered_at, er.attended_at,
        u.id as user_id, u.full_name, u.email, u.phone, u.classe, u.year
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = ?
      ORDER BY u.full_name ASC
    `,
    args: [eventId],
  });

  return res.rows.map((row) => ({
    ticketId: String(row.ticket_id),
    userId: String(row.user_id),
    fullName: String(row.full_name),
    email: String(row.email),
    phone: String(row.phone || ''),
    classe: String(row.classe),
    year: String(row.year),
    status: String(row.status),
    registeredAt: String(row.registered_at),
    attendedAt: row.attended_at ? String(row.attended_at) : null,
  }));
}

export async function getAllUsersForSitemap(): Promise<{ id: string; createdAt: string }[]> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `SELECT id, created_at FROM users ORDER BY created_at DESC LIMIT 500`,
    args: [],
  });

  return res.rows.map((r) => ({
    id: String(r.id),
    createdAt: String(r.created_at),
  }));
}

// ── Directory & Opt-in ────────────────────────────────────────────────────────

export async function updateUserDirectoryVisibility(userId: string, isVisible: boolean): Promise<boolean> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `UPDATE users SET is_directory_visible = ? WHERE id = ?`,
    args: [isVisible ? 1 : 0, userId],
  });

  return (res.rowsAffected || 0) > 0;
}

export async function getDirectoryAttendees(params?: {
  eventId?: string;
  search?: string;
  classe?: string;
  skill?: string;
}): Promise<{
  attendees: (PublicUserRecord & {
    ticketId?: string;
    eventStatus?: 'registered' | 'attended';
  })[];
  total: number;
  availableClasses: string[];
  availableSkills: string[];
}> {
  await initDb();
  const db = getTursoClient();

  const eventId = params?.eventId || 'mtb-2026-online-presence';
  const search = params?.search ? `%${params.search.toLowerCase().trim()}%` : null;
  const classe = params?.classe && params.classe !== 'ALL' ? params.classe.trim().toUpperCase() : null;
  const skill = params?.skill && params.skill !== 'ALL' ? params.skill.toLowerCase().trim() : null;

  let query = `
    SELECT 
      u.id, u.full_name, u.classe, u.year, u.avatar_url, 
      u.github_username, u.linkedin_url, u.portfolio_url, u.bio, u.skills, u.created_at,
      er.ticket_id, er.status as event_status
    FROM users u
    JOIN event_registrations er ON u.id = er.user_id AND er.event_id = ?
    WHERE (u.is_directory_visible IS NULL OR u.is_directory_visible = 1)
  `;

  const args: any[] = [eventId];

  if (classe) {
    query += ` AND UPPER(u.classe) = ?`;
    args.push(classe);
  }

  if (search) {
    query += ` AND (LOWER(u.full_name) LIKE ? OR LOWER(u.classe) LIKE ? OR LOWER(COALESCE(u.bio, '')) LIKE ?)`;
    args.push(search, search, search);
  }

  query += ` ORDER BY er.status = 'attended' DESC, er.registered_at DESC`;

  const res = await db.execute({ sql: query, args });

  const classesSet = new Set<string>();
  const skillsSet = new Set<string>();

  let results = res.rows.map((row) => {
    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse((row.skills as string) || '[]');
    } catch {
      parsedSkills = [];
    }

    const cls = String(row.classe || '').toUpperCase();
    if (cls) classesSet.add(cls);
    parsedSkills.forEach((s) => {
      if (s) skillsSet.add(s);
    });

    return {
      id: String(row.id),
      fullName: String(row.full_name),
      classe: cls,
      year: String(row.year),
      avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
      githubUsername: row.github_username ? String(row.github_username) : undefined,
      linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : undefined,
      portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : undefined,
      bio: row.bio ? String(row.bio) : undefined,
      skills: parsedSkills,
      createdAt: String(row.created_at),
      ticketId: row.ticket_id ? String(row.ticket_id) : undefined,
      eventStatus: row.event_status as 'registered' | 'attended',
    };
  });

  if (skill) {
    results = results.filter((u) =>
      u.skills.some((s) => s.toLowerCase().includes(skill))
    );
  }

  return {
    attendees: results,
    total: results.length,
    availableClasses: Array.from(classesSet).sort(),
    availableSkills: Array.from(skillsSet).slice(0, 30).sort(),
  };
}

// ── Peer-to-Peer Networking & Contact QR Resolution ─────────────────────────

export async function resolvePublicContactFromQR(qrData: string): Promise<PublicUserRecord | null> {
  await initDb();
  const db = getTursoClient();
  let cleanQR = (qrData || '').trim();

  // If URL, parse out ticketId, token, or /u/[id]
  if (cleanQR.startsWith('http://') || cleanQR.startsWith('https://')) {
    try {
      const parsed = new URL(cleanQR);
      const ticketParam =
        parsed.searchParams.get('ticketId') ||
        parsed.searchParams.get('ticket_id') ||
        parsed.searchParams.get('data');
      if (ticketParam) {
        cleanQR = ticketParam.trim();
      } else {
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          cleanQR = decodeURIComponent(segments[segments.length - 1]).trim();
        }
      }
    } catch { }
  }

  // Google Wallet object id format
  let altClean = cleanQR;
  if (cleanQR.includes('.') && cleanQR.length > 20) {
    const afterDot = cleanQR.split('.').pop();
    if (afterDot) altClean = afterDot;
  }

  // Check direct user ID
  if (cleanQR.startsWith('usr_')) {
    const directUser = await getPublicProfile(cleanQR);
    if (directUser) return directUser;
  }

  // Check event registration ticket
  const res = await db.execute({
    sql: `
      SELECT u.id
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE LOWER(TRIM(er.ticket_id)) = LOWER(TRIM(?))
         OR LOWER(TRIM(er.ticket_id)) = LOWER(TRIM(?))
         OR LOWER(TRIM(er.qr_code_data)) = LOWER(TRIM(?))
         OR LOWER(TRIM(er.id)) = LOWER(TRIM(?))
         OR LOWER(TRIM(er.user_id)) = LOWER(TRIM(?))
      LIMIT 1
    `,
    args: [cleanQR, altClean, cleanQR, cleanQR, cleanQR],
  });

  if (res.rows.length === 0) {
    if (cleanQR.includes('-')) {
      const parts = cleanQR.split('-');
      const namePart = parts.slice(0, -1).join('-').trim();
      const classePart = parts[parts.length - 1].trim();

      const userByName = await db.execute({
        sql: `SELECT id FROM users WHERE LOWER(TRIM(full_name)) = LOWER(TRIM(?)) AND LOWER(TRIM(classe)) = LOWER(TRIM(?)) LIMIT 1`,
        args: [namePart, classePart],
      });
      if (userByName.rows.length > 0) {
        return getPublicProfile(String(userByName.rows[0].id));
      }
    }
    return null;
  }

  const userId = String(res.rows[0].id);
  return getPublicProfile(userId);
}

export async function saveUserConnection(
  userId: string,
  connectedUserId: string,
  note?: string
): Promise<{ success: boolean; connectionId?: string }> {
  if (userId === connectedUserId) return { success: false };
  await initDb();
  const db = getTursoClient();

  const id = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();

  try {
    await db.execute({
      sql: `
        INSERT INTO user_connections (id, user_id, connected_user_id, note, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, connected_user_id) DO UPDATE SET
          note = COALESCE(?, note),
          created_at = ?
      `,
      args: [id, userId, connectedUserId, note || null, createdAt, note || null, createdAt],
    });
    return { success: true, connectionId: id };
  } catch (err) {
    console.error('saveUserConnection error:', err);
    return { success: false };
  }
}

export async function getUserConnections(userId: string): Promise<UserConnectionRecord[]> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `
      SELECT 
        c.id, c.user_id, c.connected_user_id, c.note, c.created_at,
        u.full_name, u.classe, u.year, u.avatar_url, u.github_username, u.linkedin_url, u.portfolio_url, u.bio, u.skills
      FROM user_connections c
      JOIN users u ON c.connected_user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `,
    args: [userId],
  });

  return res.rows.map((row) => {
    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse((row.skills as string) || '[]');
    } catch {
      parsedSkills = [];
    }

    return {
      id: String(row.id),
      userId: String(row.user_id),
      connectedUserId: String(row.connected_user_id),
      note: row.note ? String(row.note) : undefined,
      createdAt: String(row.created_at),
      connectedUser: {
        id: String(row.connected_user_id),
        fullName: String(row.full_name),
        classe: String(row.classe),
        year: String(row.year),
        avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
        githubUsername: row.github_username ? String(row.github_username) : undefined,
        linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : undefined,
        portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : undefined,
        bio: row.bio ? String(row.bio) : undefined,
        skills: parsedSkills,
        createdAt: String(row.created_at),
      },
    };
  });
}

export async function removeUserConnection(userId: string, connectedUserId: string): Promise<boolean> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `DELETE FROM user_connections WHERE user_id = ? AND connected_user_id = ?`,
    args: [userId, connectedUserId],
  });

  return (res.rowsAffected || 0) > 0;
}

// ── Multi-Event Support (CRUD & Active Management) ───────────────────────────

export async function getAllEvents(): Promise<EventRecord[]> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `SELECT * FROM events ORDER BY is_active DESC, date ASC`,
    args: [],
  });

  return res.rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug || r.id),
    name: String(r.name),
    description: r.description ? String(r.description) : '',
    speaker: String(r.speaker),
    speakerRole: r.speaker_role ? String(r.speaker_role) : undefined,
    speakerBio: r.speaker_bio ? String(r.speaker_bio) : undefined,
    location: String(r.location),
    date: String(r.date),
    startTime: r.start_time ? String(r.start_time) : undefined,
    endTime: r.end_time ? String(r.end_time) : undefined,
    capacity: Number(r.capacity || 120),
    bannerUrl: r.banner_url ? String(r.banner_url) : undefined,
    isActive: Number(r.is_active || 0) === 1,
    reminderSent: Number(r.reminder_sent || 0) === 1,
    thankYouSent: Number(r.thank_you_sent || 0) === 1,
    createdAt: String(r.created_at),
  }));
}

export async function getActiveEvent(): Promise<EventRecord | null> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `SELECT * FROM events WHERE is_active = 1 LIMIT 1`,
    args: [],
  });

  if (res.rows.length === 0) {
    const all = await getAllEvents();
    return all.length > 0 ? all[0] : null;
  }

  const r = res.rows[0];
  return {
    id: String(r.id),
    slug: String(r.slug || r.id),
    name: String(r.name),
    description: r.description ? String(r.description) : '',
    speaker: String(r.speaker),
    speakerRole: r.speaker_role ? String(r.speaker_role) : undefined,
    speakerBio: r.speaker_bio ? String(r.speaker_bio) : undefined,
    location: String(r.location),
    date: String(r.date),
    startTime: r.start_time ? String(r.start_time) : undefined,
    endTime: r.end_time ? String(r.end_time) : undefined,
    capacity: Number(r.capacity || 120),
    bannerUrl: r.banner_url ? String(r.banner_url) : undefined,
    isActive: Number(r.is_active || 0) === 1,
    reminderSent: Number(r.reminder_sent || 0) === 1,
    thankYouSent: Number(r.thank_you_sent || 0) === 1,
    createdAt: String(r.created_at),
  };
}

export async function getEventById(id: string): Promise<EventRecord | null> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `SELECT * FROM events WHERE id = ? OR slug = ? LIMIT 1`,
    args: [id, id],
  });

  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    id: String(r.id),
    slug: String(r.slug || r.id),
    name: String(r.name),
    description: r.description ? String(r.description) : '',
    speaker: String(r.speaker),
    speakerRole: r.speaker_role ? String(r.speaker_role) : undefined,
    speakerBio: r.speaker_bio ? String(r.speaker_bio) : undefined,
    location: String(r.location),
    date: String(r.date),
    startTime: r.start_time ? String(r.start_time) : undefined,
    endTime: r.end_time ? String(r.end_time) : undefined,
    capacity: Number(r.capacity || 120),
    bannerUrl: r.banner_url ? String(r.banner_url) : undefined,
    isActive: Number(r.is_active || 0) === 1,
    reminderSent: Number(r.reminder_sent || 0) === 1,
    thankYouSent: Number(r.thank_you_sent || 0) === 1,
    createdAt: String(r.created_at),
  };
}

export async function createEvent(data: {
  name: string;
  slug: string;
  description?: string;
  speaker: string;
  speakerRole?: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  isActive?: boolean;
}): Promise<EventRecord> {
  await initDb();
  const db = getTursoClient();

  const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = new Date().toISOString();
  const isActiveNum = data.isActive ? 1 : 0;

  if (isActiveNum === 1) {
    await db.execute(`UPDATE events SET is_active = 0`);
  }

  await db.execute({
    sql: `
      INSERT INTO events (
        id, slug, name, description, speaker, speaker_role, location, date, start_time, end_time, capacity, is_active, reminder_sent, thank_you_sent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `,
    args: [
      id,
      data.slug.trim().toLowerCase(),
      data.name.trim(),
      data.description?.trim() || '',
      data.speaker.trim(),
      data.speakerRole?.trim() || '',
      data.location.trim(),
      data.date.trim(),
      data.startTime?.trim() || '14:00',
      data.endTime?.trim() || '17:30',
      data.capacity || 120,
      isActiveNum,
      createdAt,
    ],
  });

  return (await getEventById(id))!;
}

export async function updateEvent(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    speaker: string;
    speakerRole: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    isActive: boolean;
  }>
): Promise<boolean> {
  await initDb();
  const db = getTursoClient();

  if (data.isActive) {
    await db.execute(`UPDATE events SET is_active = 0`);
  }

  const res = await db.execute({
    sql: `
      UPDATE events SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        speaker = COALESCE(?, speaker),
        speaker_role = COALESCE(?, speaker_role),
        location = COALESCE(?, location),
        date = COALESCE(?, date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        capacity = COALESCE(?, capacity),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `,
    args: [
      data.name !== undefined ? data.name.trim() : null,
      data.slug !== undefined ? data.slug.trim().toLowerCase() : null,
      data.description !== undefined ? data.description.trim() : null,
      data.speaker !== undefined ? data.speaker.trim() : null,
      data.speakerRole !== undefined ? data.speakerRole.trim() : null,
      data.location !== undefined ? data.location.trim() : null,
      data.date !== undefined ? data.date.trim() : null,
      data.startTime !== undefined ? data.startTime.trim() : null,
      data.endTime !== undefined ? data.endTime.trim() : null,
      data.capacity !== undefined ? data.capacity : null,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
      id,
    ],
  });

  return (res.rowsAffected || 0) > 0;
}

export async function markEventCampaignSent(eventId: string, type: 'reminder' | 'thank_you'): Promise<boolean> {
  await initDb();
  const db = getTursoClient();

  const column = type === 'reminder' ? 'reminder_sent' : 'thank_you_sent';
  const res = await db.execute({
    sql: `UPDATE events SET ${column} = 1 WHERE id = ?`,
    args: [eventId],
  });

  return (res.rowsAffected || 0) > 0;
}
