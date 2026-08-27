import crypto from "crypto";
import { writeDB } from "../_lib/db.js";
import { requireAuth, generateOrderNumber } from "../_lib/auth.js";
import { computeOrderStatus, canCancel } from "../_lib/orderStatus.js";
import { getCoupon } from "../_lib/coupons.js";
import { sendEmail } from "../_lib/email.js";
import { orderConfirmationEmailTemplate } from "../_lib/email-templates.js";

async function listOrCreate(req, res) {
  const { user, db } = req;

  if (req.method === "GET") {
    const orders = db.orders
      .filter((o) => o.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((o) => ({ ...o, status: computeOrderStatus(o) }));
    return res.status(200).json({ orders });
  }

  if (req.method === "POST") {
    const { items, couponCode, shippingAddress } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cannot place an order with an empty cart." });
    }
    if (!shippingAddress?.fullName?.trim() || !shippingAddress?.line1?.trim() || !shippingAddress?.phone?.trim()) {
      return res.status(400).json({ message: "A shipping address with name, phone and address line is required." });
    }

    // Recompute totals server-side rather than trusting client-sent numbers.
    const normalizedItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      price: Number(item.price) || 0,
      discountPercentage: Number(item.discountPercentage) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      thumbnail: item.thumbnail,
    }));

    const subtotal = normalizedItems.reduce((sum, item) => {
      const discounted = item.price * (1 - item.discountPercentage / 100);
      return sum + discounted * item.quantity;
    }, 0);

    // Coupon is re-validated server-side rather than trusting a client-sent discount.
    const coupon = getCoupon(couponCode);
    const discountAmount = coupon ? subtotal * (coupon.discountPercent / 100) : 0;
    const total = subtotal - discountAmount;

    db.orderSeq = (db.orderSeq || 0) + 1;

    const order = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(db.orderSeq),
      userId: user.id,
      items: normalizedItems,
      subtotal,
      couponCode: coupon ? couponCode.trim().toUpperCase() : null,
      discountAmount,
      total,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        line1: shippingAddress.line1.trim(),
        city: shippingAddress.city?.trim() || "",
        state: shippingAddress.state?.trim() || "",
        zip: shippingAddress.zip?.trim() || "",
        country: shippingAddress.country?.trim() || "",
      },
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };

    db.orders.push(order);
    writeDB(db);

    await sendEmail({
      to: user.email,
      ...orderConfirmationEmailTemplate({ fullName: user.fullName, order }),
    }).catch((err) => console.error("order confirmation email failed:", err));

    return res.status(201).json({ order });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function getOne(req, res, id) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { user, db } = req;
  const order = db.orders.find((o) => o.id === id && o.userId === user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });

  return res.status(200).json({ order: { ...order, status: computeOrderStatus(order) } });
}

async function cancel(req, res, id) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { user, db } = req;
  const order = db.orders.find((o) => o.id === id && o.userId === user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });

  if (!canCancel(order)) {
    const message =
      computeOrderStatus(order) === "Cancelled"
        ? "This order has already been cancelled."
        : "This order has already shipped and can no longer be cancelled.";
    return res.status(400).json({ message });
  }

  order.status = "Cancelled";
  writeDB(db);

  return res.status(200).json({ order: { ...order, status: "Cancelled" } });
}

async function validateCoupon(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { code } = req.body || {};
  const coupon = getCoupon(code);

  if (!coupon) {
    return res.status(400).json({ message: "Invalid or expired coupon code." });
  }

  return res.status(200).json({ code: code.trim().toUpperCase(), ...coupon });
}

async function handler(req, res) {
  const slug = req.query.slug || [];

  // /api/orders
  if (slug.length === 0) return listOrCreate(req, res);

  // /api/orders/validate-coupon
  if (slug.length === 1 && slug[0] === "validate-coupon") return validateCoupon(req, res);

  // /api/orders/:id
  if (slug.length === 1) return getOne(req, res, slug[0]);

  // /api/orders/:id/cancel
  if (slug.length === 2 && slug[1] === "cancel") return cancel(req, res, slug[0]);

  return res.status(404).json({ message: "Not found." });
}

// Optional catch-all ("/api/orders/[[...slug]]") standing in for what used to
// be four separate serverless functions (index.js, [id].js, [id]/cancel.js,
// validate-coupon.js) — see api/auth/[action].js for why these were
// consolidated.
export default requireAuth(handler);
