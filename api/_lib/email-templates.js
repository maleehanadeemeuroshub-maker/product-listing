const BRAND = "Shoply";
const ACCENT = "#8b5cf6";
const ACCENT2 = "#06b6d4";
const BG = "#08080c";
const CARD = "#12121a";
const BORDER = "#24242f";
const TEXT = "#f0f0f5";
const MUTED = "#8a8a9a";

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/**
 * Shared HTML shell for every transactional email — table-based layout with
 * inline styles so it renders consistently across email clients, styled to
 * match the website's dark, glassmorphism brand.
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
    </tr>
    <tr>
      <td align="center" style="padding: 4px 24px 0;">
        <p style="margin:0;font-size:12px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;word-break:break-all;">
          Or paste this link into your browser:<br/>
          <a href="${ctaUrl}" style="color:${ACCENT2};">${ctaUrl}</a>
        </p>
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
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:36px;height:36px;border-radius:11px;background:${ACCENT};background-image:linear-gradient(135deg,${ACCENT},${ACCENT2});text-align:center;vertical-align:middle;">
                      <span style="color:#fff;font-size:16px;font-weight:800;line-height:36px;">S</span>
                    </td>
                    <td style="padding-left:10px;">
                      <span style="font-size:18px;font-weight:800;color:${TEXT};">${BRAND}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px;">
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${TEXT};">${escapeHtml(heading)}</h1>
                <div style="font-size:14px;line-height:22px;color:#c4c4d0;">${bodyHtml}</div>
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

export function verificationEmailTemplate({ fullName, verifyUrl }) {
  const html = layout({
    preheader: "Confirm your email to activate your Shoply account.",
    heading: "Verify your email",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Thanks for creating a ${BRAND} account. Click the button below to verify your email address and activate your account.</p>
      <p style="color:${MUTED};font-size:13px;">This link expires in 24 hours.</p>`,
    ctaText: "Verify Email",
    ctaUrl: verifyUrl,
  });
  return {
    subject: "Verify your email address",
    html,
    text: `Hi ${fullName}, verify your email by visiting: ${verifyUrl}`,
  };
}

export function welcomeEmailTemplate({ fullName }) {
  const html = layout({
    preheader: `Welcome to ${BRAND}!`,
    heading: `Welcome to ${BRAND}!`,
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Your account has been successfully verified. You can now explore products, save items to your cart, and check out whenever you're ready.</p>
      <p>We're glad to have you with us.</p>`,
    ctaText: "Start Shopping",
    ctaUrl: process.env.CLIENT_URL || "http://localhost:5173",
  });
  return {
    subject: `Welcome to ${BRAND}!`,
    html,
    text: `Hi ${fullName}, your account has been verified. Welcome to ${BRAND}!`,
  };
}

export function loginNotificationEmailTemplate({ fullName, email, dateStr, deviceInfo }) {
  const html = layout({
    preheader: "New login to your account",
    heading: "New Login Detected",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Your account was just logged in successfully.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;border:1px solid ${BORDER};border-radius:12px;">
        <tr><td style="padding:12px 16px;color:${MUTED};font-size:13px;">Account</td><td style="padding:12px 16px;color:${TEXT};font-size:13px;text-align:right;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:12px 16px;color:${MUTED};font-size:13px;border-top:1px solid ${BORDER};">Date & time</td><td style="padding:12px 16px;color:${TEXT};font-size:13px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(dateStr)}</td></tr>
        <tr><td style="padding:12px 16px;color:${MUTED};font-size:13px;border-top:1px solid ${BORDER};">Device</td><td style="padding:12px 16px;color:${TEXT};font-size:13px;text-align:right;border-top:1px solid ${BORDER};">${escapeHtml(deviceInfo)}</td></tr>
      </table>
      <p style="color:${MUTED};font-size:13px;">If this wasn't you, please reset your password immediately to secure your account.</p>`,
    footerNote: "This is an automated security notification.",
  });
  return {
    subject: "New login to your Shoply account",
    html,
    text: `Hi ${fullName}, your account was logged in on ${dateStr} from ${deviceInfo}. If this wasn't you, please secure your account.`,
  };
}

export function passwordResetEmailTemplate({ fullName, resetUrl }) {
  const html = layout({
    preheader: "Reset your Shoply password",
    heading: "Reset your password",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <p style="color:${MUTED};font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
    ctaText: "Reset Password",
    ctaUrl: resetUrl,
  });
  return {
    subject: "Reset your password",
    html,
    text: `Hi ${fullName}, reset your password by visiting: ${resetUrl}`,
  };
}

export function passwordChangedEmailTemplate({ fullName }) {
  const html = layout({
    preheader: "Your password was changed",
    heading: "Your Password Was Changed",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Your password has been successfully changed.</p>
      <p style="color:${MUTED};font-size:13px;">If you did not make this change, please contact support or secure your account immediately.</p>`,
    footerNote: "This is an automated security notification.",
  });
  return {
    subject: "Your password was changed",
    html,
    text: `Hi ${fullName}, your password has been changed. If this wasn't you, please secure your account.`,
  };
}

export function orderConfirmationEmailTemplate({ fullName, order }) {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;color:${TEXT};font-size:13px;">${escapeHtml(item.title)} × ${item.quantity}</td>
        <td style="padding:10px 0;color:${TEXT};font-size:13px;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = layout({
    preheader: `Your order ${order.orderNumber} is confirmed.`,
    heading: "Order Confirmed!",
    bodyHtml: `<p>Hi ${escapeHtml(fullName)},</p>
      <p>Thank you for your order. Here's a summary:</p>
      <p style="margin:16px 0 4px;font-size:13px;color:${MUTED};">Order <strong style="color:${TEXT};">${order.orderNumber}</strong> &middot; ${new Date(order.createdAt).toLocaleString()}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;border-top:1px solid ${BORDER};">
        ${rows}
        <tr><td style="padding-top:14px;border-top:1px solid ${BORDER};color:${MUTED};font-size:13px;">Subtotal</td><td style="padding-top:14px;border-top:1px solid ${BORDER};text-align:right;color:${TEXT};font-size:13px;">$${order.subtotal.toFixed(2)}</td></tr>
        ${
          order.discountAmount > 0
            ? `<tr><td style="padding-top:6px;color:#34d399;font-size:13px;">Coupon (${escapeHtml(order.couponCode)})</td><td style="padding-top:6px;text-align:right;color:#34d399;font-size:13px;">-$${order.discountAmount.toFixed(2)}</td></tr>`
            : ""
        }
        <tr><td style="padding-top:6px;color:${TEXT};font-size:15px;font-weight:800;">Total</td><td style="padding-top:6px;text-align:right;color:${TEXT};font-size:15px;font-weight:800;">$${order.total.toFixed(2)}</td></tr>
      </table>
      ${
        order.shippingAddress
          ? `<p style="margin:16px 0 4px;font-size:13px;color:${MUTED};">Shipping to</p>
      <p style="margin:0 0 12px;font-size:13px;color:${TEXT};">${escapeHtml(order.shippingAddress.fullName)}<br/>${escapeHtml(order.shippingAddress.line1)}${order.shippingAddress.city ? ", " + escapeHtml(order.shippingAddress.city) : ""}${order.shippingAddress.state ? ", " + escapeHtml(order.shippingAddress.state) : ""} ${escapeHtml(order.shippingAddress.zip || "")}</p>`
          : ""
      }
      <p style="font-size:13px;color:${MUTED};">Status: <span style="color:#34d399;font-weight:700;">${escapeHtml(order.status)}</span></p>`,
    ctaText: "View Order",
    ctaUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/orders/${order.id}`,
  });
  return {
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
    text: `Thanks for your order ${order.orderNumber}. Total: $${order.total.toFixed(2)}.`,
  };
}
