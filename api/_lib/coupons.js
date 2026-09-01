import { PROMO_CODES } from "../../src/types/products.js";

/** Re-validates a coupon server-side against the same table the frontend
 * displays, rather than trusting a client-sent discount. */
export function getCoupon(code) {
  if (!code) return null;
  return PROMO_CODES[code.trim().toUpperCase()] || null;
}

/** Applies a coupon's percent-off or flat-amount-off to a subtotal. */
export function computeDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  if (coupon.discountPercent) return subtotal * (coupon.discountPercent / 100);
  if (coupon.discountAmount) return Math.min(subtotal, coupon.discountAmount);
  return 0;
}
