import { readDB } from "../_lib/db.js";

/**
 * Developer convenience only — lets the app be fully tested end-to-end
 * (verification links, password resets, order confirmations) before a real
 * Resend API key is configured. Every email is recorded here regardless of
 * whether it was also actually delivered.
 */
export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const db = readDB();
  return res.status(200).json({ emails: db.emails.slice(0, 50) });
}
