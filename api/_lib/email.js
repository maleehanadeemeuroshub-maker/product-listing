import crypto from "crypto";
import { readDB, writeDB } from "./db.js";

const FROM = process.env.RESEND_FROM_EMAIL || "Shoply <onboarding@resend.dev>";

/**
 * Sends a transactional email. Every email is recorded in the local dev
 * inbox (data/db.json -> emails) regardless of provider, which makes the
 * whole auth/order flow testable without a real inbox. When RESEND_API_KEY
 * is set, it's also actually delivered via the Resend API.
 *
 * The Resend key never leaves this server-side module — the frontend only
 * ever calls our own /api routes, never Resend directly.
 */
export async function sendEmail({ to, subject, html, text }) {
  const db = readDB();
  const record = {
    id: crypto.randomUUID(),
    to,
    subject,
    html,
    text,
    createdAt: new Date().toISOString(),
    delivered: false,
  };

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

  db.emails.unshift(record);
  db.emails = db.emails.slice(0, 200); // keep the local inbox from growing unbounded
  writeDB(db);

  return record;
}
