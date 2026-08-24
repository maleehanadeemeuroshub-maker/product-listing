import { readDB, writeDB } from "../_lib/db.js";
import { hashPassword } from "../_lib/auth.js";
import { isStrongEnough } from "../_lib/validate.js";
import { sendEmail } from "../_lib/email.js";
import { passwordChangedEmailTemplate } from "../_lib/email-templates.js";

export default async function handler(req, res) {
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
