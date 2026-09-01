import { requireSupabaseAuth } from "../_lib/supabaseAuth.js";
import { sendEmail } from "../_lib/email.js";
import { cartAddedEmailTemplate } from "../_lib/email-templates.js";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { productName, price } = req.body || {};
  if (!productName || price == null) {
    return res.status(400).json({ message: "productName and price are required." });
  }

  // Best-effort — a failed notification email should never block adding to cart.
  sendEmail({
    to: req.user.email,
    ...cartAddedEmailTemplate({ fullName: req.user.name, productName, price }),
  }).catch((err) => console.error("cart-added email failed:", err));

  return res.status(202).json({ message: "Notification queued." });
}

export default requireSupabaseAuth(handler);
