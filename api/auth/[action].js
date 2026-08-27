import crypto from "crypto";
import { readDB, writeDB } from "../_lib/db.js";
import {
  hashPassword,
  comparePassword,
  signToken,
  generateSecureToken,
  sanitizeUser,
  summarizeUserAgent,
  requireAuth,
} from "../_lib/auth.js";
import { isValidEmail, isStrongEnough } from "../_lib/validate.js";
import { sendEmail } from "../_lib/email.js";
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  passwordChangedEmailTemplate,
  loginNotificationEmailTemplate,
  welcomeEmailTemplate,
} from "../_lib/email-templates.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

async function login(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  const db = readDB();
  const user = db.users.find((u) => u.email === email.trim().toLowerCase());
  const genericError = { message: "Invalid email or password." };

  if (!user) return res.status(401).json(genericError);

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return res.status(401).json(genericError);

  const token = signToken(user.id);

  // Best-effort security notification — never blocks the login itself.
  sendEmail({
    to: user.email,
    ...loginNotificationEmailTemplate({
      fullName: user.fullName,
      email: user.email,
      dateStr: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      deviceInfo: summarizeUserAgent(req.headers["user-agent"]),
    }),
  }).catch((err) => console.error("login notification email failed:", err));

  return res.status(200).json({ token, user: sanitizeUser(user) });
}

async function register(req, res) {
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

async function me(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  return res.status(200).json({ user: sanitizeUser(req.user) });
}

async function changePassword(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { currentPassword, newPassword } = req.body || {};
  const { user, db } = req;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required." });
  }
  if (!isStrongEnough(newPassword)) {
    return res.status(400).json({ message: "New password must be at least 8 characters and include a letter and a number." });
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Current password is incorrect." });

  user.passwordHash = await hashPassword(newPassword);
  writeDB(db);

  await sendEmail({ to: user.email, ...passwordChangedEmailTemplate({ fullName: user.fullName }) }).catch((err) =>
    console.error("password changed email failed:", err)
  );

  return res.status(200).json({ message: "Password updated successfully." });
}

async function forgotPassword(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email is required." });

  const db = readDB();
  const user = db.users.find((u) => u.email === email.trim().toLowerCase());

  // Always responds with the same generic message, whether or not the email
  // exists, so this endpoint can't be used to discover registered accounts.
  const genericResponse = { message: "If an account exists for that email, a password reset link has been sent." };

  if (user) {
    user.resetToken = generateSecureToken();
    user.resetTokenExpires = Date.now() + RESET_TTL_MS;
    writeDB(db);

    const resetUrl = `${CLIENT_URL}/reset-password?token=${user.resetToken}`;
    const { subject, html, text } = passwordResetEmailTemplate({ fullName: user.fullName, resetUrl });
    await sendEmail({ to: user.email, subject, html, text }).catch((err) => console.error("reset email failed:", err));
  }

  return res.status(200).json(genericResponse);
}

async function resetPassword(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { token, password } = req.body || {};
  if (!token) return res.status(400).json({ message: "Missing reset token." });
  if (!isStrongEnough(password || "")) {
    return res.status(400).json({ message: "Password must be at least 8 characters and include a letter and a number." });
  }

  const db = readDB();
  const user = db.users.find((u) => u.resetToken === token);

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
    return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
  }

  user.passwordHash = await hashPassword(password);
  user.resetToken = null;
  user.resetTokenExpires = null;
  writeDB(db);

  await sendEmail({ to: user.email, ...passwordChangedEmailTemplate({ fullName: user.fullName }) }).catch((err) =>
    console.error("password changed email failed:", err)
  );

  return res.status(200).json({ message: "Your password has been reset successfully." });
}

async function resendVerification(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { user, db } = req;

  if (user.emailVerified) {
    return res.status(200).json({ message: "Your email is already verified." });
  }

  const elapsed = Date.now() - (user.verificationLastSentAt || 0);
  if (elapsed < RESEND_COOLDOWN_MS) {
    const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return res.status(429).json({ message: `Please wait ${retryAfter}s before requesting another email.`, retryAfter });
  }

  user.verificationToken = generateSecureToken();
  user.verificationTokenExpires = Date.now() + VERIFICATION_TTL_MS;
  user.verificationLastSentAt = Date.now();
  writeDB(db);

  const verifyUrl = `${CLIENT_URL}/verify-email?token=${user.verificationToken}`;
  const { subject, html, text } = verificationEmailTemplate({ fullName: user.fullName, verifyUrl });
  await sendEmail({ to: user.email, subject, html, text });

  return res.status(200).json({ message: "Verification email sent!", retryAfter: 60 });
}

async function verifyEmail(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Missing verification token." });

  const db = readDB();
  const user = db.users.find((u) => u.verificationToken === token);

  if (!user) {
    return res.status(400).json({ message: "This verification link is invalid." });
  }

  if (user.emailVerified) {
    return res.status(200).json({ alreadyVerified: true, message: "Your email is already verified." });
  }

  if (user.verificationTokenExpires < Date.now()) {
    return res.status(400).json({ expired: true, message: "This verification link has expired. Please request a new one." });
  }

  user.emailVerified = true;
  user.emailVerifiedAt = new Date().toISOString();
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  writeDB(db);

  await sendEmail({ to: user.email, ...welcomeEmailTemplate({ fullName: user.fullName }) }).catch((err) =>
    console.error("welcome email failed:", err)
  );

  return res.status(200).json({ message: "Your email has been verified!" });
}

const PUBLIC_ACTIONS = {
  login,
  register,
  "forgot-password": forgotPassword,
  "reset-password": resetPassword,
  "verify-email": verifyEmail,
};

const PROTECTED_ACTIONS = {
  me,
  "change-password": changePassword,
  "resend-verification": resendVerification,
};

// Single dynamic route ("/api/auth/[action]") standing in for what used to be
// eight separate serverless functions — Vercel's Hobby plan caps a deployment
// at 12 functions, so every action is dispatched through one handler here
// instead of one file per action.
export default async function handler(req, res) {
  const { action } = req.query;

  if (PUBLIC_ACTIONS[action]) return PUBLIC_ACTIONS[action](req, res);
  if (PROTECTED_ACTIONS[action]) return requireAuth(PROTECTED_ACTIONS[action])(req, res);

  return res.status(404).json({ message: "Not found." });
}
