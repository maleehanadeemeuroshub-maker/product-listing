import { stripe } from "../_lib/stripeClient.js";
import { getOrderBySessionId, insertOrder } from "../_lib/db.js";
import { sendEmail } from "../_lib/email.js";
import { orderConfirmationEmailTemplate } from "../_lib/email-templates.js";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Needs the raw request body to verify Stripe's signature — must not run
// through a JSON body parser.
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/**
 * Fulfillment lives here, not on the success page — a customer can pay
 * successfully and lose their connection before the success page loads, so
 * anything that only runs there would silently drop the order and its email.
 */
async function fulfillCheckout(session) {
  if (session.payment_status === "unpaid") return;

  const existing = await getOrderBySessionId(session.id);
  if (existing) return; // already fulfilled — Stripe can deliver the same event more than once

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const items = lineItems.data.map((li) => ({
    name: li.description,
    price: li.price.unit_amount / 100,
    quantity: li.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = session.amount_total / 100;
  const discountAmount = Math.max(0, subtotal - total);
  const shipping = session.shipping_details?.address;

  const order = await insertOrder({
    userId: session.metadata?.supabase_user_id || "unknown",
    userEmail: session.customer_details?.email || session.customer_email,
    stripeSessionId: session.id,
    items,
    subtotal,
    discountAmount,
    couponCode: session.metadata?.coupon_code || null,
    total,
    currency: session.currency,
    shippingAddress: shipping
      ? {
          name: session.shipping_details?.name,
          line1: shipping.line1,
          city: shipping.city,
          state: shipping.state,
          postal_code: shipping.postal_code,
        }
      : null,
    status: "Confirmed",
  });

  await sendEmail({
    to: order.userEmail || order.user_email,
    ...orderConfirmationEmailTemplate({
      fullName: order.userEmail || order.user_email,
      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt || order.created_at || new Date().toISOString(),
        items,
        subtotal,
        discountAmount,
        couponCode: order.couponCode || order.coupon_code,
        total,
        shippingAddress: order.shippingAddress || order.shipping_address,
        status: "Confirmed",
      },
    }),
  }).catch((err) => console.error("order confirmation email failed:", err));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const rawBody = await readRawBody(req);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfillCheckout(event.data.object);
    }
    // checkout.session.async_payment_failed intentionally left as a no-op —
    // no order was ever created for it, so there's nothing to roll back.
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    return res.status(500).json({ message: "Webhook handler failed." });
  }

  return res.status(200).json({ received: true });
}
