import { readDB, writeDB } from "../_lib/db.js";
import { sendEmail } from "../_lib/email.js";
import { welcomeEmailTemplate } from "../_lib/email-templates.js";

export default async function handler(req, res) {
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
