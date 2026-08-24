import { readDB } from "../_lib/db.js";
import { comparePassword, signToken, sanitizeUser, summarizeUserAgent } from "../_lib/auth.js";
import { sendEmail } from "../_lib/email.js";
import { loginNotificationEmailTemplate } from "../_lib/email-templates.js";

export default async function handler(req, res) {
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
