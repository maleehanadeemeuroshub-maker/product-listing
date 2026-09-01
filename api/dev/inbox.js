import { getRecentEmails } from "../_lib/db.js";

/**
 * Developer convenience only — lets the whole checkout/notification flow be
 * tested end-to-end before a real (domain-verified) Resend sender is set up.
 * Every email attempt is recorded here regardless of whether it was also
 * actually delivered.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const emails = await getRecentEmails(50);
  return res.status(200).json({ emails });
}
