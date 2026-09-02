import { requireSupabaseAuth } from "../_lib/supabaseAuth.js";
import { sendEmail } from "../_lib/email.js";
import { loginNotificationEmailTemplate } from "../_lib/email-templates.js";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  // Best-effort — a failed login notification should never block sign-in.
  sendEmail({
    to: req.user.email,
    ...loginNotificationEmailTemplate({ fullName: req.user.name, email: req.user.email, loginAt: new Date().toISOString() }),
  }).catch((err) => console.error("login notification email failed:", err));

  return res.status(202).json({ message: "Login notification queued." });
}

export default requireSupabaseAuth(handler);
