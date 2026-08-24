import { requireAuth } from "../_lib/auth.js";
import { getCoupon } from "../_lib/coupons.js";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { code } = req.body || {};
  const coupon = getCoupon(code);

  if (!coupon) {
    return res.status(400).json({ message: "Invalid or expired coupon code." });
  }

  return res.status(200).json({ code: code.trim().toUpperCase(), ...coupon });
}

export default requireAuth(handler);
