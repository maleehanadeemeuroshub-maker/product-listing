import { writeDB } from "../_lib/db.js";
import { requireAuth, hashPassword, comparePassword } from "../_lib/auth.js";
import { isStrongEnough } from "../_lib/validate.js";
import { sendEmail } from "../_lib/email.js";
import { passwordChangedEmailTemplate } from "../_lib/email-templates.js";

async function handler(req, res) {
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

export default requireAuth(handler);
