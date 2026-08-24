import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const DEFAULT_DB = { users: [], orders: [], emails: [], orderSeq: 0 };

function ensureFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
}

/**
 * Tiny file-backed JSON store — good enough for a learning project's local
 * dev server. A real deployment would swap this for a proper database.
 */
export function readDB() {
  ensureFile();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return { ...DEFAULT_DB, ...JSON.parse(raw) };
}

export function writeDB(db) {
  ensureFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
