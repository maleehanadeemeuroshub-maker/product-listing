import { requireAuth } from "../_lib/auth.js";
import { computeOrderStatus } from "../_lib/orderStatus.js";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { user, db } = req;
  const { id } = req.query;

  const order = db.orders.find((o) => o.id === id && o.userId === user.id);
  if (!order) return res.status(404).json({ message: "Order not found." });

  return res.status(200).json({ order: { ...order, status: computeOrderStatus(order) } });
}

export default requireAuth(handler);
