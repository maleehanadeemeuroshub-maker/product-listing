import { Navigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, PartyPopper } from "lucide-react";

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) return <Navigate to="/orders" replace />;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="relative mb-6"
      >
        <motion.span
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl"
        />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-base-100 sm:text-3xl">
          Order Confirmed! <PartyPopper size={22} className="text-gold-400" />
        </h1>
        <p className="mt-2 text-sm text-base-400">
          Thank you for your order. A confirmation email is on its way to you.
        </p>

        <div className="glass mt-8 w-full rounded-2xl p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm text-base-400">Order number</span>
            <span className="font-mono text-sm font-bold text-base-100">{order.orderNumber}</span>
          </div>
          <div className="my-4 h-px bg-overlay/8" />
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-base-300">
                  {item.title} &times; {item.quantity}
                </span>
                <span className="text-base-100">
                  ${(item.price * (1 - item.discountPercentage / 100) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-4 h-px bg-overlay/8" />
          <div className="flex justify-between text-base font-bold text-base-100">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/products"
            className="flex-1 rounded-xl border border-overlay/10 px-5 py-3 text-sm font-semibold text-base-100 transition hover:border-overlay/20"
          >
            Continue Shopping
          </Link>
          <Link
            to={`/orders/${order.id}`}
            className="flex-1 rounded-xl bg-gradient-to-r from-accent-500 to-accent2-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition hover:opacity-90"
          >
            View Order
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
