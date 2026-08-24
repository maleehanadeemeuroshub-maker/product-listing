import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readDB } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function generateOrderNumber(seq) {
  return `ORD-${String(seq).padStart(6, "0")}`;
}

/** Strips sensitive fields before a user object ever leaves the server. */
export function sanitizeUser(user) {
  if (!user) return null;
  const { id, fullName, email, emailVerified, createdAt, addresses } = user;
  return { id, fullName, email, emailVerified, createdAt, addresses: addresses || [] };
}

/** Reads the Bearer token from the request and resolves the owning user, or null. */
export function getUserFromRequest(req, db) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return db.users.find((u) => u.id === payload.sub) || null;
  } catch {
    return null;
  }
}

/** Wraps a handler so it 401s automatically when there's no valid session. */
export function requireAuth(handler) {
  return async (req, res) => {
    const db = readDB();
    const user = getUserFromRequest(req, db);
    if (!user) {
      return res.status(401).json({ message: "You must be logged in to do that." });
    }
    req.user = user;
    req.db = db;
    return handler(req, res);
  };
}

/** Very small User-Agent summarizer — just enough for a login-notification email. */
export function summarizeUserAgent(ua = "") {
  if (!ua) return "Unknown device";

  let browser = "Unknown browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}
