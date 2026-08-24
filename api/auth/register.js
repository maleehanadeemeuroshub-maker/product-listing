import crypto from "crypto";
import { readDB, writeDB } from "../_lib/db.js";
import { hashPassword, generateSecureToken, sanitizeUser } from "../_lib/auth.js";
import { isValidEmail, isStrongEnough } from "../_lib/validate.js";
import { sendEmail } from "../_lib/email.js";
import { verificationEmailTemplate } from "../_lib/email-templates.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { fullName, email, password } = req.body || {};

  if (!fullName?.trim()) return res.status(400).json({ message: "Full name is required." });
  if (!isValidEmail(email || "")) return res.status(400).json({ message: "Please enter a valid email address." });
  if (!isStrongEnough(password || "")) {
    return res.status(400).json({ message: "Password must be at least 8 characters and include a letter and a number." });
  }

  const db = readDB();
  const normalizedEmail = email.trim().toLowerCase();

  if (db.users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateSecureToken();

  const user = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    verificationToken,
    verificationTokenExpires: Date.now() + VERIFICATION_TTL_MS,
    verificationLastSentAt: Date.now(),
    resetToken: null,
    resetTokenExpires: null,
    addresses: [],
  };

  db.users.push(user);
  writeDB(db);

  const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
  const { subject, html, text } = verificationEmailTemplate({ fullName: user.fullName, verifyUrl });
  await sendEmail({ to: user.email, subject, html, text });

  return res.status(201).json({
    message: "Account created! Check your email to verify your account before logging in.",
    user: sanitizeUser(user),
  });
}
