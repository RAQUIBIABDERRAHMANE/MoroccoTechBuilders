import { createClient, type Client } from '@libsql/client';

let clientInstance: Client | null = null;
let isInitialized = false;

export function getTursoClient(): Client {
  if (clientInstance) {
    return clientInstance;
  }

  const url =
    process.env.mtb_TURSO_DATABASE_URL ||
    process.env.TURSO_DATABASE_URL ||
    'file:local.db';

  const authToken =
    process.env.mtb_TURSO_AUTH_TOKEN ||
    process.env.TURSO_AUTH_TOKEN ||
    undefined;

  clientInstance = createClient({
    url,
    authToken,
  });

  return clientInstance;
}

export async function initDb(): Promise<void> {
  if (isInitialized) return;

  const db = getTursoClient();

  try {
    // 1. Table users
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        classe TEXT NOT NULL,
        year TEXT NOT NULL,
        avatar_url TEXT,
        github_username TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        bio TEXT,
        skills TEXT DEFAULT '[]',
        created_at TEXT NOT NULL
      );
    `);

    // 2. Table event_registrations
    await db.execute(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        ticket_id TEXT NOT NULL,
        qr_code_data TEXT NOT NULL,
        qr_code_url TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'registered',
        registered_at TEXT NOT NULL,
        attended_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 3. Indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON event_registrations(user_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_registrations_qr_data ON event_registrations(qr_code_data);`);

    isInitialized = true;
    console.log('✅ Turso database initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing Turso database:', error);
    throw error;
  }
}
