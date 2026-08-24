import { readDB, writeDB } from "../_lib/db.js";
import { generateSecureToken } from "../_lib/auth.js";
import { sendEmail } from "../_lib/email.js";
import { passwordResetEmailTemplate } from "../_lib/email-templates.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const RESET_TTL_MS = 60 * 60 * 1000;

// Always responds with the same generic message, whether or not the email
// exists, so this endpoint can't be used to discover registered accounts.
const GENERIC_RESPONSE = { message: "If an account exists for that email, a password reset link has been sent." };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email is required." });

  const db = readDB();
  const user = db.users.find((u) => u.email === email.trim().toLowerCase());

  if (user) {
    user.resetToken = generateSecureToken();
    user.resetTokenExpires = Date.now() + RESET_TTL_MS;
    writeDB(db);

    const resetUrl = `${CLIENT_URL}/reset-password?token=${user.resetToken}`;
    const { subject, html, text } = passwordResetEmailTemplate({ fullName: user.fullName, resetUrl });
    await sendEmail({ to: user.email, subject, html, text }).catch((err) => console.error("reset email failed:", err));
  }

  return res.status(200).json(GENERIC_RESPONSE);
}
