import { insertEmailLog } from "./db.js";

const FROM = process.env.RESEND_FROM_EMAIL || "AURA 3D <onboarding@resend.dev>";

/**
 * Sends a transactional email via the Resend HTTP API. Every attempt is
 * logged (see GET /api/dev/inbox) regardless of outcome, which makes the
 * whole checkout/notification flow testable without a real inbox — useful
 * since an unverified sending domain can only deliver to the Resend
 * account's own email until a real domain is verified.
 *
 * The Resend key never leaves this server-side module — the frontend only
 * ever calls our own /api routes, never Resend directly.
 */
export async function sendEmail({ to, subject, html, text }) {
  const record = { to, subject, html, text, delivered: false, error: null };

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM, to, subject, html, text }),
      });
      record.delivered = response.ok;
      if (!response.ok) {
        record.error = await response.text();
        console.error("Resend send failed:", record.error);
      }
    } catch (err) {
      record.error = err.message;
      console.error("Resend send error:", err);
    }
  }

  await insertEmailLog(record);
  return record;
}
