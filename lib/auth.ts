import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.mtb_TURSO_AUTH_TOKEN ||
  'mtb-ofppt-secret-2026-key-morocco-tech';

const COOKIE_NAME = 'mtb_session';

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  classe: string;
  exp: number;
}

// ── Password Security (scrypt with salt) ──────────────────────────────────
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// ── Session Token Management (HMAC SHA-256) ───────────────────────────────
export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 jours
  const fullPayload: SessionPayload = { ...payload, exp };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Cookie Helpers for Server Components & Route Handlers ──────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const token = createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
