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
  createdAt: string;
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
    sql: `SELECT * FROM users WHERE email = ? LIMIT 1`,
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
    createdAt: String(row.created_at),
  };
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await initDb();
  const db = getTursoClient();

  const res = await db.execute({
    sql: `SELECT * FROM users WHERE id = ? LIMIT 1`,
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
    createdAt: String(row.created_at),
  };
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
  }
): Promise<UserRecord | null> {
  await initDb();
  const db = getTursoClient();

  const skillsJson = JSON.stringify(data.skills || []);

  await db.execute({
    sql: `
      UPDATE users SET
        github_username = COALESCE(?, github_username),
        linkedin_url = COALESCE(?, linkedin_url),
        portfolio_url = COALESCE(?, portfolio_url),
        bio = COALESCE(?, bio),
        skills = COALESCE(?, skills),
        avatar_url = COALESCE(?, avatar_url)
      WHERE id = ?
    `,
    args: [
      data.githubUsername !== undefined ? data.githubUsername.trim() : null,
      data.linkedinUrl !== undefined ? data.linkedinUrl.trim() : null,
      data.portfolioUrl !== undefined ? data.portfolioUrl.trim() : null,
      data.bio !== undefined ? data.bio.trim() : null,
      data.skills !== undefined ? skillsJson : null,
      data.avatarUrl !== undefined ? data.avatarUrl.trim() : null,
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

  // Check if existing registration for this event and user
  const existing = await db.execute({
    sql: `SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ? LIMIT 1`,
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
    sql: `SELECT * FROM event_registrations WHERE user_id = ? ORDER BY registered_at DESC`,
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
  const cleanQR = qrCodeData.trim();

  // Search case-insensitively or with exact trim
  const res = await db.execute({
    sql: `SELECT * FROM event_registrations WHERE LOWER(TRIM(qr_code_data)) = LOWER(TRIM(?)) LIMIT 1`,
    args: [cleanQR],
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
