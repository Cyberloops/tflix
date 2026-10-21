import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { INITIAL_CHANNELS } from '../src/data/channels';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'tflix.sqlite');
const LEGACY_DB_CANDIDATE = path.join(DATA_DIR, 'previous_catalog.sqlite');
const CSV_FILE = path.resolve(process.cwd(), 'public/assets/aistudio/iptv_all_channels_50635ccd.csv');

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  // If new DB doesn't exist but legacy DB does, copy/migrate seamlessly
  if (!fs.existsSync(DB_FILE) && fs.existsSync(LEGACY_DB_CANDIDATE)) {
    try {
      fs.copyFileSync(LEGACY_DB_CANDIDATE, DB_FILE);
      console.log('[TFLIX SQLite] Migrated legacy database to tflix.sqlite');
    } catch (e) {
      console.warn('[TFLIX SQLite] Legacy migration notice:', e);
    }
  }

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    console.log('[TFLIX SQLite] Loaded persistent database from:', DB_FILE);
  } else {
    db = new SQL.Database();
    console.log('[TFLIX SQLite] Initialized fresh database at:', DB_FILE);
  }

  initSchema(db);
  persistDatabase();
  return db;
}

export function persistDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('[TFLIX SQLite] Error persisting database to disk:', err);
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_cyberloops_secret_salt_2026').digest('hex');
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'channel';
}

function parseCsvContent(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const nextCh = content[i + 1];

    if (ch === '"') {
      if (inQuotes && nextCh === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
      if (ch === '\r' && nextCh === '\n') {
        i++;
      }
      currentRow.push(currentVal);
      currentVal = '';
      if (currentRow.length > 1) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += ch;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.length > 1) rows.push(currentRow);
  }
  return rows;
}

function initSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      language TEXT NOT NULL,
      category TEXT NOT NULL,
      country TEXT DEFAULT 'International',
      country_code TEXT DEFAULT 'INT',
      quality TEXT DEFAULT 'HD',
      logo TEXT,
      stream_url TEXT NOT NULL,
      alternate_streams TEXT,
      is_custom INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      description TEXT,
      current_program TEXT,
      next_program TEXT,
      program_time TEXT,
      tags TEXT,
      website TEXT DEFAULT '',
      network TEXT DEFAULT '',
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS favorites (
      channel_id TEXT PRIMARY KEY,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS watch_history (
      channel_id TEXT PRIMARY KEY,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS entry_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      plan_tier TEXT NOT NULL DEFAULT 'vip',
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL,
      expires_at INTEGER,
      max_activations INTEGER DEFAULT 1,
      activation_count INTEGER DEFAULT 0,
      assigned_to TEXT,
      phone_or_email TEXT,
      price REAL DEFAULT 0.0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'superadmin',
      last_login INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      session_token TEXT PRIMARY KEY,
      code_id TEXT NOT NULL,
      device_fingerprint TEXT,
      created_at INTEGER NOT NULL,
      last_active INTEGER NOT NULL
    );
  `);

  // Migrate columns in case existing table was created without them
  try { database.run('ALTER TABLE channels ADD COLUMN country TEXT DEFAULT "International"'); } catch {}
  try { database.run('ALTER TABLE channels ADD COLUMN country_code TEXT DEFAULT "INT"'); } catch {}
  try { database.run('ALTER TABLE channels ADD COLUMN quality TEXT DEFAULT "HD"'); } catch {}
  try { database.run('ALTER TABLE channels ADD COLUMN website TEXT DEFAULT ""'); } catch {}
  try { database.run('ALTER TABLE channels ADD COLUMN network TEXT DEFAULT ""'); } catch {}

  // Record TFLIX metadata
  database.run(`
    INSERT OR REPLACE INTO app_metadata (key, value) VALUES
    ('app_name', 'TFLIX'),
    ('brand', 'tflix'),
    ('copyright', 'cybertech by cyberloops'),
    ('developer', 'cyberloops'),
    ('version', '3.5.0-global-catalog');
  `);

  // Initialize Default Admin User if not exists
  const adminCheck = database.exec("SELECT COUNT(*) FROM admin_users WHERE username = 'admin'");
  const adminCount = adminCheck.length > 0 && adminCheck[0].values.length > 0 ? (adminCheck[0].values[0][0] as number) : 0;
  if (adminCount === 0) {
    const defaultHash = hashPassword('cybertech@2026');
    database.run(`
      INSERT INTO admin_users (username, password_hash, role, last_login)
      VALUES ('admin', '${defaultHash}', 'superadmin', ${Date.now()});
    `);
    console.log('[TFLIX Admin] Seeded default admin account: admin / cybertech@2026');
  }

  // Pre-seed Entry Codes for immediate user testing & VIP access
  const codesCheck = database.exec("SELECT COUNT(*) FROM entry_codes");
  const codesCount = codesCheck.length > 0 && codesCheck[0].values.length > 0 ? (codesCheck[0].values[0][0] as number) : 0;
  if (codesCount === 0) {
    const now = Date.now();
    const oneYear = now + 365 * 24 * 60 * 60 * 1000;
    const oneWeek = now + 7 * 24 * 60 * 60 * 1000;

    const seedCodes = [
      {
        id: 'code-vip-master',
        code: 'TFLIX-VIP-ACCESS',
        plan: 'lifetime',
        status: 'active',
        created: now,
        expires: null,
        max: 9999,
        assigned: 'Official Master VIP',
        phone: '+919876543210',
        price: 99.00,
        notes: 'Master VIP access pass with infinite activations'
      },
      {
        id: 'code-prem-2026',
        code: 'TFLIX-PREMIUM-2026',
        plan: 'premium',
        status: 'active',
        created: now,
        expires: oneYear,
        max: 100,
        assigned: 'Premium OTT Pass',
        phone: '',
        price: 49.00,
        notes: 'Annual Premium Pass for TFLIX OTT'
      },
      {
        id: 'code-cyber-pass',
        code: 'CYBER-TFLIX-PASS',
        plan: 'trial',
        status: 'active',
        created: now,
        expires: oneWeek,
        max: 50,
        assigned: 'Cybertech Trial Pass',
        phone: '',
        price: 9.99,
        notes: '7-Day full trial pass by cyberloops'
      }
    ];

    const stmt = database.prepare(`
      INSERT INTO entry_codes (id, code, plan_tier, status, created_at, expires_at, max_activations, activation_count, assigned_to, phone_or_email, price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    `);

    for (const c of seedCodes) {
      stmt.run([c.id, c.code, c.plan, c.status, c.created, c.expires, c.max, c.assigned, c.phone, c.price, c.notes]);
    }
    stmt.free();
    console.log('[TFLIX Security] Seeded default VIP access entry codes.');
  }

  // Seed curated VIP channels
  seedInitialChannels(database);

  // Check if all channels from CSV are loaded
  const countRes = database.exec('SELECT COUNT(*) FROM channels');
  const totalChannelsCount = countRes.length > 0 && countRes[0].values.length > 0 ? (countRes[0].values[0][0] as number) : 0;

  if (totalChannelsCount < 5000 && fs.existsSync(CSV_FILE)) {
    console.log(`[TFLIX SQLite] Detected ${totalChannelsCount} channels. Auto-importing complete catalog from CSV...`);
    importCsvChannelsInternal(database);
  }
}

function seedInitialChannels(database: Database) {
  const stmt = database.prepare(`
    INSERT OR REPLACE INTO channels (
      id, name, language, category, country, country_code, quality, logo, stream_url, alternate_streams,
      is_custom, featured, description, current_program, next_program, program_time, tags, website, network, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.run('BEGIN TRANSACTION');
  for (const ch of INITIAL_CHANNELS) {
    stmt.run([
      ch.id,
      ch.name,
      ch.language || 'Tamil',
      ch.category || 'Tamil Entertainment',
      'India',
      'IN',
      '1080p',
      ch.logo || '',
      ch.streamUrl,
      JSON.stringify(ch.alternateStreams || []),
      ch.isCustom ? 1 : 0,
      1, // featured VIP channels
      ch.description || `Official broadcast of ${ch.name} on TFLIX OTT`,
      ch.currentProgram || 'Live Stream HD',
      ch.nextProgram || 'Upcoming Program',
      ch.programTime || 'Live Now',
      JSON.stringify(ch.tags || [ch.language, ch.category, 'India', 'TFLIX VIP']),
      '',
      'TFLIX Curated OTT',
      Date.now()
    ]);
  }
  stmt.free();
  database.run('COMMIT');
}

function importCsvChannelsInternal(database: Database): number {
  if (!fs.existsSync(CSV_FILE)) {
    console.warn('[TFLIX SQLite] Channels CSV file not found at:', CSV_FILE);
    return 0;
  }

  const fileContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const rows = parseCsvContent(fileContent);
  const header = rows[0];
  const nameIdx = header.findIndex(h => h.includes('Channel (database name)'));
  const altNameIdx = header.findIndex(h => h.includes('Channel (playlist name)'));
  const qualityIdx = header.findIndex(h => h.trim() === 'Quality');
  const idIdx = header.findIndex(h => h.trim() === 'Channel ID');
  const countryCodeIdx = header.findIndex(h => h.trim() === 'Country Code');
  const countryIdx = header.findIndex(h => h.trim() === 'Country');
  const langIdx = header.findIndex(h => h.includes('Language'));
  const catIdx = header.findIndex(h => h.trim() === 'Category');
  const netIdx = header.findIndex(h => h.trim() === 'Network');
  const ownIdx = header.findIndex(h => h.trim() === 'Owners');
  const webIdx = header.findIndex(h => h.trim() === 'Website');
  const streamIdx = header.findIndex(h => h.trim() === 'Stream URL');

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO channels (
      id, name, language, category, country, country_code, quality, logo, stream_url, alternate_streams,
      is_custom, featured, description, current_program, next_program, program_time, tags, website, network, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.run('BEGIN TRANSACTION');
  const seenIds = new Set<string>();
  let imported = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[nameIdx] || row[altNameIdx] || '').trim();
    const stream = (row[streamIdx] || '').trim();
    if (!name || !stream) continue;

    const rawId = (row[idIdx] || '').trim();
    const baseId = rawId ? slugify(rawId) : slugify(name);
    let cid = 'iptv-' + baseId;
    let dup = 1;
    while (seenIds.has(cid)) {
      dup++;
      cid = 'iptv-' + baseId + '-' + dup;
    }
    seenIds.add(cid);

    const country = (row[countryIdx] || '').trim() || 'International';
    const countryCode = (row[countryCodeIdx] || '').trim().toUpperCase() || 'INT';
    const rawLang = (row[langIdx] || '').trim() || 'English';
    const language = rawLang.split(';')[0].trim() || 'English';
    const rawCat = (row[catIdx] || '').trim() || 'General';
    const category = rawCat.split(';')[0].trim() || 'General';
    const quality = (row[qualityIdx] || '').trim() || 'HD';
    const website = (row[webIdx] || '').trim();
    const network = (row[netIdx] || row[ownIdx] || '').trim();

    stmt.run([
      cid,
      name,
      language,
      category,
      country,
      countryCode,
      quality,
      '',
      stream,
      '[]',
      0,
      0,
      `Official ${country} ${category} broadcast feed for ${name} on TFLIX`,
      'Live Stream',
      'Upcoming Schedule',
      '24/7 Live',
      JSON.stringify([country, language, category, quality, 'TFLIX Live TV']),
      website,
      network,
      Date.now()
    ]);
    imported++;
  }

  stmt.free();
  database.run('COMMIT');
  console.log(`[TFLIX SQLite] Successfully imported ${imported} global channels from CSV.`);
  return imported;
}

export async function importChannelsFromCsv(forceReset: boolean = false): Promise<{ imported: number; total: number }> {
  const database = await getDatabase();
  if (forceReset) {
    database.run('DELETE FROM channels WHERE is_custom = 0');
    seedInitialChannels(database);
  }
  const count = importCsvChannelsInternal(database);
  persistDatabase();
  const totalRes = database.exec('SELECT COUNT(*) FROM channels');
  const total = totalRes.length > 0 && totalRes[0].values.length > 0 ? (totalRes[0].values[0][0] as number) : 0;
  return { imported: count, total };
}

// ----------------- Entry Code & Access Security -----------------

export async function verifyEntryCode(codeRaw: string, deviceFingerprint?: string) {
  const database = await getDatabase();
  const code = (codeRaw || '').trim().toUpperCase();

  const stmt = database.prepare('SELECT * FROM entry_codes WHERE UPPER(code) = ?');
  stmt.bind([code]);

  if (!stmt.step()) {
    stmt.free();
    return { valid: false, error: 'Invalid Entry Code. Please request a valid pass from the administrator.' };
  }

  const row = stmt.getAsObject();
  stmt.free();

  if (row.status === 'revoked') {
    return { valid: false, error: 'This Access Pass has been revoked by the administrator.' };
  }

  const now = Date.now();
  if (row.expires_at && (row.expires_at as number) < now) {
    database.run(`UPDATE entry_codes SET status = 'expired' WHERE id = '${row.id}'`);
    persistDatabase();
    return { valid: false, error: 'This Access Pass has expired. Please contact admin for a renewal.' };
  }

  const currentActivations = (row.activation_count as number) || 0;
  const maxActivations = (row.max_activations as number) || 1;

  if (currentActivations >= maxActivations) {
    return { valid: false, error: `Maximum allowed devices (${maxActivations}) reached for this access code.` };
  }

  const newCount = currentActivations + 1;
  const newStatus = newCount >= maxActivations ? 'used' : 'active';
  database.run(`UPDATE entry_codes SET activation_count = ${newCount}, status = '${newStatus}' WHERE id = '${row.id}'`);

  const sessionToken = 'tflix_sess_' + crypto.randomBytes(16).toString('hex');
  database.run(`
    INSERT INTO user_sessions (session_token, code_id, device_fingerprint, created_at, last_active)
    VALUES ('${sessionToken}', '${row.id}', '${deviceFingerprint || 'web-browser'}', ${now}, ${now})
  `);
  persistDatabase();

  return {
    valid: true,
    sessionToken,
    planTier: row.plan_tier,
    expiresAt: row.expires_at,
    assignedTo: row.assigned_to,
    code: row.code
  };
}

export async function validateSession(sessionToken: string) {
  if (!sessionToken) return { valid: false };
  const database = await getDatabase();

  const stmt = database.prepare(`
    SELECT s.*, c.code, c.plan_tier, c.status as code_status, c.expires_at, c.assigned_to
    FROM user_sessions s
    JOIN entry_codes c ON s.code_id = c.id
    WHERE s.session_token = ?
  `);
  stmt.bind([sessionToken]);

  if (!stmt.step()) {
    stmt.free();
    return { valid: false, error: 'Session not found or expired' };
  }

  const row = stmt.getAsObject();
  stmt.free();

  const now = Date.now();
  if (row.expires_at && (row.expires_at as number) < now) {
    return { valid: false, error: 'Access Pass expired' };
  }
  if (row.code_status === 'revoked') {
    return { valid: false, error: 'Access Pass revoked by administrator' };
  }

  database.run(`UPDATE user_sessions SET last_active = ${now} WHERE session_token = '${sessionToken}'`);
  return {
    valid: true,
    planTier: row.plan_tier,
    code: row.code,
    expiresAt: row.expires_at,
    assignedTo: row.assigned_to
  };
}

// ----------------- Admin Authentication -----------------

export async function adminLogin(username: string, passwordPlain: string) {
  const database = await getDatabase();
  const stmt = database.prepare('SELECT * FROM admin_users WHERE username = ?');
  stmt.bind([username.trim()]);

  if (!stmt.step()) {
    stmt.free();
    return { success: false, error: 'Invalid admin credentials' };
  }

  const admin = stmt.getAsObject();
  stmt.free();

  const givenHash = hashPassword(passwordPlain);
  if (givenHash !== admin.password_hash) {
    return { success: false, error: 'Invalid admin credentials' };
  }

  const now = Date.now();
  database.run(`UPDATE admin_users SET last_login = ${now} WHERE username = '${username}'`);
  persistDatabase();

  const adminToken = 'tflix_adm_' + crypto.randomBytes(24).toString('hex');
  return {
    success: true,
    adminToken,
    username: admin.username,
    role: admin.role
  };
}

export async function adminChangePassword(username: string, newPasswordPlain: string) {
  const database = await getDatabase();
  const newHash = hashPassword(newPasswordPlain);
  database.run(`UPDATE admin_users SET password_hash = '${newHash}' WHERE username = '${username}'`);
  persistDatabase();
  return { success: true };
}

// ----------------- Code Management & Profit Tracking -----------------

export async function generateEntryCode(options: {
  planTier: string;
  durationDays: number | null;
  maxActivations?: number;
  assignedTo?: string;
  phoneOrEmail?: string;
  price?: number;
  notes?: string;
  customPrefix?: string;
}) {
  const database = await getDatabase();
  const id = 'code_' + crypto.randomBytes(8).toString('hex');
  
  const prefix = options.customPrefix ? options.customPrefix.toUpperCase() : 'TFLIX';
  const tierTag = options.planTier === 'vip' ? 'VIP' : options.planTier === 'lifetime' ? 'LIFE' : 'OTT';
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const code = `${prefix}-${tierTag}-${randomSuffix}`;

  const now = Date.now();
  const expiresAt = options.durationDays ? now + options.durationDays * 24 * 60 * 60 * 1000 : null;
  const maxActivations = options.maxActivations || 1;
  const price = options.price !== undefined ? options.price : (options.planTier === 'vip' ? 25.00 : 9.99);

  const stmt = database.prepare(`
    INSERT INTO entry_codes (id, code, plan_tier, status, created_at, expires_at, max_activations, activation_count, assigned_to, phone_or_email, price, notes)
    VALUES (?, ?, ?, 'active', ?, ?, ?, 0, ?, ?, ?, ?)
  `);

  stmt.run([
    id,
    code,
    options.planTier || 'vip',
    now,
    expiresAt,
    maxActivations,
    options.assignedTo || 'Valued Subscriber',
    options.phoneOrEmail || '',
    price,
    options.notes || 'Generated by cybertech Admin'
  ]);
  stmt.free();
  persistDatabase();

  return {
    id,
    code,
    planTier: options.planTier,
    expiresAt,
    maxActivations,
    price,
    assignedTo: options.assignedTo,
    phoneOrEmail: options.phoneOrEmail
  };
}

export async function getAllEntryCodes() {
  const database = await getDatabase();
  const res = database.exec(`
    SELECT id, code, plan_tier, status, created_at, expires_at, max_activations, activation_count, assigned_to, phone_or_email, price, notes
    FROM entry_codes
    ORDER BY created_at DESC
  `);

  if (res.length === 0) return [];
  const columns = res[0].columns;
  const rows = res[0].values;

  return rows.map((val) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      const camel = col.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      obj[camel] = val[idx];
    });
    return obj;
  });
}

export async function updateCodeStatus(codeId: string, status: string) {
  const database = await getDatabase();
  database.run(`UPDATE entry_codes SET status = '${status}' WHERE id = '${codeId}'`);
  persistDatabase();
  return { success: true };
}

export async function deleteEntryCode(codeId: string) {
  const database = await getDatabase();
  database.run(`DELETE FROM entry_codes WHERE id = '${codeId}'`);
  persistDatabase();
  return { success: true };
}

export async function getRevenueAndCodeStats() {
  const database = await getDatabase();
  
  const revRes = database.exec(`SELECT SUM(price) as totalRev, COUNT(*) as totalCodes FROM entry_codes`);
  const totalRevenue = revRes.length > 0 && revRes[0].values[0][0] ? (revRes[0].values[0][0] as number) : 0;
  const totalCodes = revRes.length > 0 && revRes[0].values[0][1] ? (revRes[0].values[0][1] as number) : 0;

  const activeRes = database.exec(`SELECT COUNT(*) FROM entry_codes WHERE status = 'active' OR status = 'used'`);
  const activePasses = activeRes.length > 0 && activeRes[0].values[0][0] ? (activeRes[0].values[0][0] as number) : 0;

  const expiredRes = database.exec(`SELECT COUNT(*) FROM entry_codes WHERE status = 'expired'`);
  const expiredPasses = expiredRes.length > 0 && expiredRes[0].values[0][0] ? (expiredRes[0].values[0][0] as number) : 0;

  const revokedRes = database.exec(`SELECT COUNT(*) FROM entry_codes WHERE status = 'revoked'`);
  const revokedPasses = revokedRes.length > 0 && revokedRes[0].values[0][0] ? (revokedRes[0].values[0][0] as number) : 0;

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCodesGenerated: totalCodes,
    activePassesCount: activePasses,
    expiredCodesCount: expiredPasses,
    revokedCodesCount: revokedPasses
  };
}

// ----------------- Channels & Streaming Operations -----------------

export async function getAllChannels(options?: {
  country?: string;
  category?: string;
  language?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const database = await getDatabase();

  let sql = `
    SELECT id, name, language, category, country, country_code, quality, logo,
           stream_url, alternate_streams, is_custom, featured, description,
           current_program, next_program, program_time, tags, website, network
    FROM channels
  `;

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (options?.featured) {
    whereClauses.push('featured = 1');
  }
  if (options?.country && options.country !== 'All') {
    whereClauses.push('(country = ? OR country_code = ?)');
    params.push(options.country, options.country.toUpperCase());
  }
  if (options?.category && options.category !== 'All') {
    whereClauses.push('category = ?');
    params.push(options.category);
  }
  if (options?.language && options.language !== 'All') {
    whereClauses.push('language = ?');
    params.push(options.language);
  }
  if (options?.search && options.search.trim()) {
    const s = `%${options.search.trim().toLowerCase()}%`;
    whereClauses.push('(LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(country) LIKE ? OR LOWER(language) LIKE ?)');
    params.push(s, s, s, s);
  }

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }

  sql += ' ORDER BY featured DESC, (country = "India") DESC, category ASC, name ASC';

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`;
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`;
    }
  }

  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const channels: any[] = [];
  while (stmt.step()) {
    const val = stmt.getAsObject();
    let alternateStreams: string[] = [];
    let tags: string[] = [];
    try {
      alternateStreams = JSON.parse((val.alternate_streams as string) || '[]');
    } catch { alternateStreams = []; }
    try {
      tags = JSON.parse((val.tags as string) || '[]');
    } catch { tags = []; }

    channels.push({
      id: val.id as string,
      name: val.name as string,
      language: val.language as string,
      category: val.category as string,
      country: (val.country as string) || 'International',
      countryCode: (val.country_code as string) || 'INT',
      quality: (val.quality as string) || 'HD',
      logo: (val.logo as string) || '',
      streamUrl: val.stream_url as string,
      alternateStreams,
      isCustom: Boolean(val.is_custom),
      featured: Boolean(val.featured),
      description: val.description as string,
      currentProgram: val.current_program as string,
      nextProgram: val.next_program as string,
      programTime: val.program_time as string,
      tags,
      website: (val.website as string) || '',
      network: (val.network as string) || ''
    });
  }
  stmt.free();

  return channels;
}

export async function getChannelsSummary() {
  const database = await getDatabase();
  
  const total = database.exec('SELECT COUNT(*) FROM channels')[0].values[0][0] as number;
  
  const countriesRes = database.exec(`
    SELECT country, country_code, COUNT(*) as count 
    FROM channels 
    WHERE country IS NOT NULL AND country != ''
    GROUP BY country 
    ORDER BY count DESC
  `);
  const countries = (countriesRes.length > 0 ? countriesRes[0].values : []).map(r => ({
    name: r[0] as string,
    code: r[1] as string,
    count: r[2] as number
  }));

  const categoriesRes = database.exec(`
    SELECT category, COUNT(*) as count 
    FROM channels 
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category 
    ORDER BY count DESC
  `);
  const categories = (categoriesRes.length > 0 ? categoriesRes[0].values : []).map(r => ({
    name: r[0] as string,
    count: r[1] as number
  }));

  const languagesRes = database.exec(`
    SELECT language, COUNT(*) as count 
    FROM channels 
    WHERE language IS NOT NULL AND language != ''
    GROUP BY language 
    ORDER BY count DESC
  `);
  const languages = (languagesRes.length > 0 ? languagesRes[0].values : []).map(r => ({
    name: r[0] as string,
    count: r[1] as number
  }));

  return {
    total,
    countries,
    categories,
    languages
  };
}

export async function insertChannel(channel: any) {
  const database = await getDatabase();
  const id = channel.id || `custom-${Date.now()}-${slugify(channel.name)}`;

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO channels (
      id, name, language, category, country, country_code, quality, logo,
      stream_url, alternate_streams, is_custom, featured, description,
      current_program, next_program, program_time, tags, website, network, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    id,
    channel.name,
    channel.language || 'English',
    channel.category || 'General',
    channel.country || 'International',
    channel.countryCode || 'INT',
    channel.quality || '1080p',
    channel.logo || '',
    channel.streamUrl,
    JSON.stringify(channel.alternateStreams || []),
    channel.isCustom !== undefined ? (channel.isCustom ? 1 : 0) : 1,
    channel.featured ? 1 : 0,
    channel.description || `Official broadcast of ${channel.name} on TFLIX`,
    channel.currentProgram || 'Live Broadcast HD',
    channel.nextProgram || 'Upcoming Schedule',
    channel.programTime || 'Live Now',
    JSON.stringify(channel.tags || ['TFLIX Custom', channel.category, channel.language]),
    channel.website || '',
    channel.network || '',
    Date.now()
  ]);
  stmt.free();
  persistDatabase();
  return id;
}

export async function updateChannel(channelId: string, channel: any) {
  const database = await getDatabase();
  const stmt = database.prepare(`
    UPDATE channels SET
      name = ?,
      language = ?,
      category = ?,
      country = ?,
      country_code = ?,
      quality = ?,
      logo = ?,
      stream_url = ?,
      alternate_streams = ?,
      featured = ?,
      description = ?,
      current_program = ?,
      next_program = ?,
      tags = ?,
      website = ?,
      network = ?
    WHERE id = ?
  `);

  stmt.run([
    channel.name,
    channel.language,
    channel.category,
    channel.country || 'International',
    channel.countryCode || 'INT',
    channel.quality || '1080p',
    channel.logo || '',
    channel.streamUrl,
    JSON.stringify(channel.alternateStreams || []),
    channel.featured ? 1 : 0,
    channel.description || '',
    channel.currentProgram || 'Live Stream',
    channel.nextProgram || 'Upcoming Program',
    JSON.stringify(channel.tags || []),
    channel.website || '',
    channel.network || '',
    channelId
  ]);
  stmt.free();
  persistDatabase();
}

export async function deleteChannel(channelId: string) {
  const database = await getDatabase();
  database.run(`DELETE FROM channels WHERE id = '${channelId}'`);
  database.run(`DELETE FROM favorites WHERE channel_id = '${channelId}'`);
  database.run(`DELETE FROM watch_history WHERE channel_id = '${channelId}'`);
  persistDatabase();
}

export async function resetToDefaultChannels() {
  const database = await getDatabase();
  database.run('DELETE FROM channels WHERE is_custom = 0');
  seedInitialChannels(database);
  importCsvChannelsInternal(database);
  persistDatabase();
  return getAllChannels();
}

// ----------------- Favorites & Watch History -----------------

export async function getFavorites(): Promise<string[]> {
  const database = await getDatabase();
  const res = database.exec('SELECT channel_id FROM favorites ORDER BY created_at DESC');
  if (res.length === 0) return [];
  return res[0].values.map(row => row[0] as string);
}

export async function toggleFavorite(channelId: string): Promise<string[]> {
  const database = await getDatabase();
  const check = database.exec(`SELECT 1 FROM favorites WHERE channel_id = '${channelId}'`);
  if (check.length > 0 && check[0].values.length > 0) {
    database.run(`DELETE FROM favorites WHERE channel_id = '${channelId}'`);
  } else {
    database.run(`INSERT INTO favorites (channel_id, created_at) VALUES ('${channelId}', ${Date.now()})`);
  }
  persistDatabase();
  return getFavorites();
}

export async function getWatchHistory(): Promise<{ channelId: string; timestamp: number }[]> {
  const database = await getDatabase();
  const res = database.exec('SELECT channel_id, timestamp FROM watch_history ORDER BY timestamp DESC LIMIT 50');
  if (res.length === 0) return [];
  return res[0].values.map(row => ({
    channelId: row[0] as string,
    timestamp: row[1] as number
  }));
}

export async function recordWatch(channelId: string) {
  const database = await getDatabase();
  database.run(`
    INSERT OR REPLACE INTO watch_history (channel_id, timestamp)
    VALUES ('${channelId}', ${Date.now()})
  `);
  persistDatabase();
}

export async function clearWatchHistory() {
  const database = await getDatabase();
  database.run('DELETE FROM watch_history');
  persistDatabase();
}

export async function getDatabaseStats() {
  const database = await getDatabase();
  const channelsCount = database.exec('SELECT COUNT(*) FROM channels')[0].values[0][0];
  const customChannelsCount = database.exec('SELECT COUNT(*) FROM channels WHERE is_custom = 1')[0].values[0][0];
  const favoritesCount = database.exec('SELECT COUNT(*) FROM favorites')[0].values[0][0];
  const historyCount = database.exec('SELECT COUNT(*) FROM watch_history')[0].values[0][0];
  const revStats = await getRevenueAndCodeStats();

  let fileSize = 0;
  if (fs.existsSync(DB_FILE)) {
    fileSize = fs.statSync(DB_FILE).size;
  }

  return {
    engine: 'SQLite (sql.js persistent engine)',
    dbFile: DB_FILE,
    fileSizeKb: (fileSize / 1024).toFixed(2),
    totalChannels: channelsCount,
    customChannelsCount,
    totalFavorites: favoritesCount,
    totalHistory: historyCount,
    totalRevenue: revStats.totalRevenue,
    activePassesCount: revStats.activePassesCount,
    totalCodesGenerated: revStats.totalCodesGenerated,
    appName: 'TFLIX',
    copyright: 'cybertech by cyberloops'
  };
}
