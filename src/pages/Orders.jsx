import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { getOrders } from "../services/orders";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import OrderStatusBadge from "../components/OrderStatusBadge";
import usePageTitle from "../hooks/usePageTitle";

export default function Orders() {
  usePageTitle("Order History");

  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setOrders(null);
    getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-extrabold text-base-100 sm:text-3xl">
        Order <span className="text-gradient">History</span>
      </h1>

      {orders === null && !error ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="When you place an order, it'll show up here."
          action={
            <Link to="/products" className="rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2 text-sm font-semibold text-white">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/orders/${order.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-overlay/8 bg-base-900 p-5 transition hover:border-overlay/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-base-100">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-base-400">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })} &middot;{" "}
                    {order.items.reduce((n, it) => n + it.quantity, 0)} item(s)
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-base-400">
                    {order.items.map((it) => it.title).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-base-100">${order.total.toFixed(2)}</span>
                  <ChevronRight size={18} className="text-base-400" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
