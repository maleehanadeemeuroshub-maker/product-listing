import { requireAuth, sanitizeUser } from "../_lib/auth.js";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  return res.status(200).json({ user: sanitizeUser(req.user) });
}

export default requireAuth(handler);
