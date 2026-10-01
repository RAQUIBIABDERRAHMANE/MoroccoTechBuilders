import { createClient, type Client } from '@libsql/client';

let clientInstance: Client | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

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
  if (initPromise) return initPromise;

  initPromise = (async () => {
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

      // 3. Table events (Multi-event support)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          speaker TEXT NOT NULL,
          speaker_role TEXT,
          location TEXT NOT NULL,
          date TEXT NOT NULL,
          start_time TEXT,
          end_time TEXT,
          capacity INTEGER DEFAULT 120,
          banner_url TEXT,
          is_active INTEGER DEFAULT 1,
          reminder_sent INTEGER DEFAULT 0,
          thank_you_sent INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `);

      // 4. Table user_connections (Peer-to-Peer Networking)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS user_connections (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          connected_user_id TEXT NOT NULL,
          note TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (connected_user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, connected_user_id)
        );
      `);

      // 5. Safe Schema Alterations (for existing databases)
      try {
        await db.execute(`ALTER TABLE users ADD COLUMN is_directory_visible INTEGER DEFAULT 1;`);
      } catch (e) {
        // column may already exist
      }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN slug TEXT;`);
      } catch (e) { }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN description TEXT;`);
      } catch (e) { }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN speaker_role TEXT;`);
      } catch (e) { }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN start_time TEXT;`);
      } catch (e) { }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN end_time TEXT;`);
      } catch (e) { }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN banner_url TEXT;`);
      } catch (e) { }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN reminder_sent INTEGER DEFAULT 0;`);
      } catch (e) { }
      try {
        await db.execute(`ALTER TABLE events ADD COLUMN thank_you_sent INTEGER DEFAULT 0;`);
      } catch (e) { }

      // 6. Indexes
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON event_registrations(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_registrations_qr_data ON event_registrations(qr_code_data);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_registrations_ticket_id ON event_registrations(ticket_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_connections_user ON user_connections(user_id);`);
      try {
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);`);
      } catch (e) { }

      // 7. Seed initial default event if table empty
      const existingEvt = await db.execute({
        sql: `SELECT id FROM events WHERE id = ? LIMIT 1`,
        args: ['mtb-2026-online-presence'],
      });
      if (existingEvt.rows.length === 0) {
        await db.execute({
          sql: `
            INSERT OR IGNORE INTO events (
              id, slug, name, description, speaker, speaker_role, location, date, start_time, end_time, capacity, is_active, reminder_sent, thank_you_sent, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            'mtb-2026-online-presence',
            'presence-en-ligne-2026',
            'Construire sa Présence en Ligne en tant que Développeur',
            'Atelier pratique & Masterclass sur l’optimisation de votre profil GitHub, LinkedIn, portfolio et personal branding tech au Maroc.',
            'Abderrahmane Raquibi',
            'Lead Tech & Entrepreneur',
            'Amphithéâtre OFPPT Marrakech',
            '2026-10-15',
            '14:00',
            '17:30',
            150,
            1,
            0,
            0,
            new Date().toISOString(),
          ],
        });
      }

      isInitialized = true;
    } catch (error) {
      console.error('❌ Error initializing Turso database:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

