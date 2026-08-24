// Order status "progresses" purely based on elapsed time since creation —
// no cron job needed, and it makes the timeline demoable in minutes rather
// than days. A cancelled order is the one persisted exception to this.
const STAGES = [
  { status: "Confirmed", afterSec: 0 },
  { status: "Processing", afterSec: 20 },
  { status: "Shipped", afterSec: 50 },
  { status: "Delivered", afterSec: 90 },
];

export function computeOrderStatus(order) {
  if (order.status === "Cancelled") return "Cancelled";

  const elapsedSec = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  let current = STAGES[0].status;
  for (const stage of STAGES) {
    if (elapsedSec >= stage.afterSec) current = stage.status;
  }
  return current;
}

export function canCancel(order) {
  const status = computeOrderStatus(order);
  return status === "Confirmed" || status === "Processing";
}
