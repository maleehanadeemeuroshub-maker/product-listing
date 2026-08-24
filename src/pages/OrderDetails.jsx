import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, XCircle, Loader2, MapPin } from "lucide-react";
import { getOrderById, cancelOrder } from "../services/orders";
import { useToast } from "../context/ToastContext";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderTimeline from "../components/OrderTimeline";
import usePageTitle from "../hooks/usePageTitle";

export default function OrderDetails() {
  usePageTitle("Order Details");

  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  function load() {
    setError(null);
    setOrder(null);
    getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }

  useEffect(load, [id]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const updated = await cancelOrder(id);
      setOrder(updated);
      toast.success("Order cancelled.");
    } catch (err) {
      toast.error(err.message || "Could not cancel this order.");
    } finally {
      setCancelling(false);
      setConfirmingCancel(false);
    }
  }

  const canCancel = order && (order.status === "Confirmed" || order.status === "Processing");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-base-400 hover:text-base-100">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      {!order && !error ? (
        <LoadingSkeleton count={1} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="rounded-2xl border border-overlay/8 bg-base-900 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-extrabold text-base-100">{order.orderNumber}</p>
              <p className="text-xs text-base-400">
                {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="my-6 h-px bg-overlay/8" />

          {order.status === "Cancelled" ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              <XCircle size={16} /> This order was cancelled.
            </div>
          ) : (
            <OrderTimeline status={order.status} />
          )}

          <div className="my-6 h-px bg-overlay/8" />

          {order.shippingAddress && (
            <>
              <div className="mb-6 flex items-start gap-2 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-base-400" />
                <div>
                  <p className="font-medium text-base-100">{order.shippingAddress.fullName}</p>
                  <p className="text-xs text-base-400">{order.shippingAddress.phone}</p>
                  <p className="text-xs text-base-400">
                    {order.shippingAddress.line1}
                    {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
                    {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.zip}
                  </p>
                </div>
              </div>
              <div className="mb-6 h-px bg-overlay/8" />
            </>
          )}

          <div className="flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={item.thumbnail} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-base-100">{item.title}</p>
                  <p className="text-xs text-base-400">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-base-100">
                  ${(item.price * (1 - item.discountPercentage / 100) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="my-6 h-px bg-overlay/8" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-base-300">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Coupon ({order.couponCode})</span>
                <span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-base-100">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {canCancel && (
            <div className="mt-6 border-t border-overlay/8 pt-6">
              {confirmingCancel ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <span className="text-sm text-red-400">Cancel this order? This can't be undone.</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmingCancel(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-base-300 hover:bg-overlay/5"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                    >
                      {cancelling ? <Loader2 size={13} className="animate-spin" /> : "Yes, Cancel"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingCancel(true)}
                  className="text-sm font-medium text-red-400 hover:text-red-300"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
