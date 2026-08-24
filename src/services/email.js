import authApi from "./auth";

/**
 * The frontend never sends email directly (that requires a private Resend
 * API key, which only ever lives server-side in api/_lib/email.js). This
 * service just reads the local "sent mail" log for the /dev/inbox page,
 * which exists purely so the full verification/reset/order-email flow can
 * be tested before a real Resend key is configured.
 */
export async function getDevInbox() {
  const { data } = await authApi.get("/dev/inbox");
  return data.emails;
}
