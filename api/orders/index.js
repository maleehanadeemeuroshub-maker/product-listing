import crypto from "crypto";
import { writeDB } from "../_lib/db.js";
import { requireAuth, generateOrderNumber } from "../_lib/auth.js";
import { computeOrderStatus } from "../_lib/orderStatus.js";
import { getCoupon } from "../_lib/coupons.js";
import { sendEmail } from "../_lib/email.js";
import { orderConfirmationEmailTemplate } from "../_lib/email-templates.js";

async function handler(req, res) {
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

export default requireAuth(handler);
