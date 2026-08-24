// A small fixed table stands in for a real promotions system — plenty for
// demonstrating coupon validation without needing an admin UI to manage them.
const COUPONS = {
  SAVE10: { discountPercent: 10, description: "10% off your order" },
  SAVE20: { discountPercent: 20, description: "20% off your order" },
  WELCOME15: { discountPercent: 15, description: "15% off — welcome to Shoply!" },
};

export function getCoupon(code) {
  if (!code) return null;
  return COUPONS[code.trim().toUpperCase()] || null;
}
