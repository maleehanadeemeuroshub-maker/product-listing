import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Pool } from "pg";

const DB_PATH = path.join(process.cwd(), "data", "orders-db.json");
const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

let pool = null;
let schemaReady = null;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seq SERIAL,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        stripe_session_id TEXT UNIQUE NOT NULL,
        items JSONB NOT NULL,
        subtotal NUMERIC NOT NULL,
        discount_amount NUMERIC NOT NULL DEFAULT 0,
        coupon_code TEXT,
        total NUMERIC NOT NULL,
        currency TEXT NOT NULL DEFAULT 'usd',
        shipping_address JSONB,
        status TEXT NOT NULL DEFAULT 'Confirmed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS emails (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        html TEXT,
        text TEXT,
        delivered BOOLEAN NOT NULL DEFAULT false,
        error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }
  return schemaReady;
}

// Local-only fallback store, used when POSTGRES_URL isn't configured (e.g.
// running `npm run dev:api` without pulling production env vars). Lets the
// whole checkout + email flow be tested end-to-end with zero DB setup.
function ensureFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ orders: [], emails: [] }, null, 2));
  }
}

function readFileDB() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeFileDB(db) {
  ensureFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function formatOrderNumber(seq) {
  return `ORD-${String(seq).padStart(6, "0")}`;
}

/** Returns the existing order for a Stripe session, or null — used so a
 * webhook delivered more than once never creates a duplicate order. */
export async function getOrderBySessionId(stripeSessionId) {
  if (connectionString) {
    await ensureSchema();
    const { rows } = await getPool().query("SELECT * FROM orders WHERE stripe_session_id = $1", [stripeSessionId]);
    return rows[0] || null;
  }
  const db = readFileDB();
  return db.orders.find((o) => o.stripeSessionId === stripeSessionId) || null;
}

export async function insertOrder(order) {
  if (connectionString) {
    await ensureSchema();
    const { rows } = await getPool().query(
      `INSERT INTO orders
        (user_id, user_email, stripe_session_id, items, subtotal, discount_amount, coupon_code, total, currency, shipping_address, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (stripe_session_id) DO NOTHING
       RETURNING *`,
      [
        order.userId,
        order.userEmail,
        order.stripeSessionId,
        JSON.stringify(order.items),
        order.subtotal,
        order.discountAmount,
        order.couponCode,
        order.total,
        order.currency,
        JSON.stringify(order.shippingAddress || null),
        order.status,
      ]
    );
    const row = rows[0] || (await getOrderBySessionId(order.stripeSessionId));
    return { ...row, orderNumber: formatOrderNumber(row.seq) };
  }

  const db = readFileDB();
  if (db.orders.some((o) => o.stripeSessionId === order.stripeSessionId)) {
    return db.orders.find((o) => o.stripeSessionId === order.stripeSessionId);
  }
  const seq = db.orders.length + 1;
  const saved = { id: crypto.randomUUID(), seq, orderNumber: formatOrderNumber(seq), createdAt: new Date().toISOString(), ...order };
  db.orders.unshift(saved);
  writeFileDB(db);
  return saved;
}

export async function getOrdersForUser(userId) {
  if (connectionString) {
    await ensureSchema();
    const { rows } = await getPool().query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return rows.map((row) => ({ ...row, orderNumber: formatOrderNumber(row.seq) }));
  }
  const db = readFileDB();
  return db.orders.filter((o) => o.userId === userId);
}

export async function insertEmailLog(record) {
  if (connectionString) {
    await ensureSchema();
    await getPool().query(
      `INSERT INTO emails (to_email, subject, html, text, delivered, error) VALUES ($1,$2,$3,$4,$5,$6)`,
      [record.to, record.subject, record.html || null, record.text || null, record.delivered, record.error || null]
    );
    return;
  }
  const db = readFileDB();
  db.emails.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...record });
  db.emails = db.emails.slice(0, 200);
  writeFileDB(db);
}

export async function getRecentEmails(limit = 50) {
  if (connectionString) {
    await ensureSchema();
    const { rows } = await getPool().query("SELECT * FROM emails ORDER BY created_at DESC LIMIT $1", [limit]);
    return rows;
  }
  const db = readFileDB();
  return db.emails.slice(0, limit);
}
