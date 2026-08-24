import { writeDB } from "../_lib/db.js";
import { requireAuth, generateSecureToken } from "../_lib/auth.js";
import { sendEmail } from "../_lib/email.js";
import { verificationEmailTemplate } from "../_lib/email-templates.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { user, db } = req;

  if (user.emailVerified) {
    return res.status(200).json({ message: "Your email is already verified." });
  }

  const elapsed = Date.now() - (user.verificationLastSentAt || 0);
  if (elapsed < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
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

export default requireAuth(handler);
