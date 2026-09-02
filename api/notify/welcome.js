import { requireSupabaseAuth } from "../_lib/supabaseAuth.js";
import { sendEmail } from "../_lib/email.js";
import { welcomeEmailTemplate } from "../_lib/email-templates.js";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  // Best-effort — a failed welcome email should never block signup.
  sendEmail({
    to: req.user.email,
    ...welcomeEmailTemplate({ fullName: req.user.name, email: req.user.email }),
  }).catch((err) => console.error("welcome email failed:", err));

  return res.status(202).json({ message: "Welcome email queued." });
}

export default requireSupabaseAuth(handler);
