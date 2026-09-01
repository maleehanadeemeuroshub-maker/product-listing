import { requireSupabaseAuth } from "../_lib/supabaseAuth.js";
import { getCoupon, computeDiscount } from "../_lib/coupons.js";
import { stripe } from "../_lib/stripeClient.js";
import { PRODUCTS } from "../../src/types/products.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const SHIPPING_COUNTRIES = ["US", "CA", "GB", "AU", "PK", "IN", "AE", "SG", "DE", "FR"];

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { items, couponCode } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cannot check out with an empty cart." });
  }

  // Recompute everything from the server-side catalog rather than trusting
  // client-sent prices — a client could otherwise pay whatever it wants.
  const coupon = getCoupon(couponCode);

  let subtotal = 0;
  const lineItems = [];
  for (const item of items) {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (!product) return res.status(400).json({ message: `Unknown product: ${item.id}` });

    const quantity = Math.max(1, Number(item.quantity) || 1);
    subtotal += product.price * quantity;

    lineItems.push({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          metadata: { productId: product.id },
        },
      },
    });
  }

  const discountAmount = computeDiscount(subtotal, coupon);

  try {
    // Coupon discounts are applied as a one-off Stripe coupon on the whole
    // order (rather than prorated per line item), since one of ours
    // (VIP50) is a flat amount that isn't naturally proportional.
    let discounts;
    if (coupon) {
      const stripeCoupon = await stripe.coupons.create(
        coupon.discountPercent
          ? { percent_off: coupon.discountPercent, duration: "once" }
          : { amount_off: Math.round(discountAmount * 100), currency: "usd", duration: "once" }
      );
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      discounts,
      customer_email: req.user.email,
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      success_url: `${CLIENT_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/?checkout=cancel`,
      metadata: {
        supabase_user_id: req.user.id,
        coupon_code: coupon ? couponCode.trim().toUpperCase() : "",
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return res.status(500).json({ message: "Could not start checkout. Please try again." });
  }
}

export default requireSupabaseAuth(handler);
