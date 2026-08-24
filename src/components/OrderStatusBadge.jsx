const STYLES = {
  Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Shipped: "bg-accent2-500/10 text-accent2-400 border-accent2-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLES[status] || STYLES.Confirmed}`}>
      {status}
    </span>
  );
}
