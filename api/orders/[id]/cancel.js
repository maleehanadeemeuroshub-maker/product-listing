import { writeDB } from "../../_lib/db.js";
import { requireAuth } from "../../_lib/auth.js";
import { canCancel, computeOrderStatus } from "../../_lib/orderStatus.js";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { user, db } = req;
  const { id } = req.query;

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

export default requireAuth(handler);
