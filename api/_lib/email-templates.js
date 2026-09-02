const BRAND = "AURA 3D";
const ACCENT = "#06b6d4";
const ACCENT2 = "#a855f7";
const BG = "#f8fafc";
const CARD = "#ffffff";
const BORDER = "#e2e8f0";
const TEXT = "#0f172a";
const MUTED = "#64748b";

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/**
 * Shared HTML shell for every transactional email — table-based layout with
 * inline styles so it renders consistently across email clients.
 */
function layout({ preheader = "", heading, bodyHtml, ctaText, ctaUrl, footerNote }) {
  const cta = ctaText && ctaUrl
    ? `
    <tr>
      <td align="center" style="padding: 32px 0 8px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background:${ACCENT};background-image:linear-gradient(90deg,${ACCENT},${ACCENT2});color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
          ${escapeHtml(ctaText)}
        </a>
      </td>
    </tr>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD};border:1px solid ${BORDER};border-radius:20px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:18px;font-weight:800;color:${TEXT};">${BRAND}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px;">
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${TEXT};">${escapeHtml(heading)}</h1>
                <div style="font-size:14px;line-height:22px;color:${MUTED};">${bodyHtml}</div>
              </td>
            </tr>
            ${cta}
            <tr>
              <td style="padding:32px 32px 28px;">
                <div style="height:1px;background:${BORDER};margin-bottom:20px;"></div>
                <p style="margin:0;font-size:12px;color:${MUTED};">
                  ${footerNote || `You're receiving this email because you have an account with ${BRAND}.`}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-size:12px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;">
            © ${new Date().getFullYear()} ${BRAND}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function welcomeEmailTemplate({ fullName, email }) {
  const html = layout({
    preheader: `Welcome to ${BRAND}, ${fullName}!`,
    heading: `Welcome to ${BRAND}!`,
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Your account (<strong style="color:${TEXT};">${escapeHtml(email)}</strong>) is ready. Thanks for joining ${BRAND} — explore the full spatial hardware catalog in interactive 3D.</p>
      <p style="color:${MUTED};font-size:13px;">If you didn't create this account, you can safely ignore this email.</p>`,
    ctaText: "Start Exploring",
    ctaUrl: process.env.CLIENT_URL || "http://localhost:5173",
  });
  return {
    subject: `Welcome to ${BRAND}!`,
    html,
    text: `Hi ${fullName}, welcome to ${BRAND}! Your account (${email}) is ready.`,
  };
}

export function loginNotificationEmailTemplate({ fullName, email, loginAt }) {
  const when = new Date(loginAt || Date.now()).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const html = layout({
    preheader: `New sign-in to your ${BRAND} account.`,
    heading: "New Sign-In",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>We noticed a new sign-in to your ${BRAND} account (<strong style="color:${TEXT};">${escapeHtml(email)}</strong>).</p>
      <p style="margin:16px 0 4px;font-size:13px;color:${MUTED};">Date &amp; time</p>
      <p style="margin:0 0 12px;font-size:13px;color:${TEXT};">${escapeHtml(when)}</p>
      <p style="color:${MUTED};font-size:13px;">If this was you, no action is needed. If you don't recognize this activity, reset your password immediately from the account menu.</p>`,
    footerNote: `Security notice from ${BRAND}. You're receiving this because sign-in alerts are on for your account.`,
  });
  return {
    subject: `New sign-in to your ${BRAND} account`,
    html,
    text: `Hi ${fullName}, a new sign-in to your ${BRAND} account (${email}) was recorded at ${when}. If this wasn't you, reset your password immediately.`,
  };
}

export function cartAddedEmailTemplate({ fullName, productName, price }) {
  const html = layout({
    preheader: `${productName} is waiting in your cart.`,
    heading: "Added to your cart",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p><strong style="color:${TEXT};">${escapeHtml(productName)}</strong> ($${Number(price).toFixed(2)}) has been added to your cart.</p>
      <p style="color:${MUTED};font-size:13px;">Head back to AURA 3D whenever you're ready to check out.</p>`,
    ctaText: "View Cart",
    ctaUrl: process.env.CLIENT_URL || "http://localhost:5173",
  });
  return {
    subject: `${productName} added to your cart`,
    html,
    text: `Hi ${fullName}, ${productName} ($${Number(price).toFixed(2)}) was added to your cart.`,
  };
}

export function orderConfirmationEmailTemplate({ fullName, order }) {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;color:${TEXT};font-size:13px;">${escapeHtml(item.name)} × ${item.quantity}</td>
        <td style="padding:10px 0;color:${TEXT};font-size:13px;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = layout({
    preheader: `Your order ${order.orderNumber} is confirmed.`,
    heading: "Order Confirmed!",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Thank you for your order — your payment was successful. Here's a summary:</p>
      <p style="margin:16px 0 4px;font-size:13px;color:${MUTED};">Order <strong style="color:${TEXT};">${order.orderNumber}</strong> &middot; ${new Date(order.createdAt).toLocaleString()}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;border-top:1px solid ${BORDER};">
        ${rows}
        <tr><td style="padding-top:14px;border-top:1px solid ${BORDER};color:${MUTED};font-size:13px;">Subtotal</td><td style="padding-top:14px;border-top:1px solid ${BORDER};text-align:right;color:${TEXT};font-size:13px;">$${order.subtotal.toFixed(2)}</td></tr>
        ${
          order.discountAmount > 0
            ? `<tr><td style="padding-top:6px;color:#059669;font-size:13px;">Coupon (${escapeHtml(order.couponCode)})</td><td style="padding-top:6px;text-align:right;color:#059669;font-size:13px;">-$${order.discountAmount.toFixed(2)}</td></tr>`
            : ""
        }
        <tr><td style="padding-top:6px;color:${TEXT};font-size:15px;font-weight:800;">Total</td><td style="padding-top:6px;text-align:right;color:${TEXT};font-size:15px;font-weight:800;">$${order.total.toFixed(2)}</td></tr>
      </table>
      ${
        order.shippingAddress
          ? `<p style="margin:16px 0 4px;font-size:13px;color:${MUTED};">Shipping to</p>
      <p style="margin:0 0 12px;font-size:13px;color:${TEXT};">${escapeHtml(order.shippingAddress.name || "")}<br/>${escapeHtml(order.shippingAddress.line1 || "")}${order.shippingAddress.city ? ", " + escapeHtml(order.shippingAddress.city) : ""}${order.shippingAddress.state ? ", " + escapeHtml(order.shippingAddress.state) : ""} ${escapeHtml(order.shippingAddress.postal_code || "")}</p>`
          : ""
      }
      <p style="font-size:13px;color:${MUTED};">Status: <span style="color:#059669;font-weight:700;">${escapeHtml(order.status)}</span></p>`,
  });
  return {
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
    text: `Thanks for your order ${order.orderNumber}. Total: $${order.total.toFixed(2)}.`,
  };
}
