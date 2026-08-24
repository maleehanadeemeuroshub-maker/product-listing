import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";
import EmptyState from "../components/EmptyState";
import usePageTitle from "../hooks/usePageTitle";

export default function Cart() {
  const { cart, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  usePageTitle("Your Cart");

  function handleCheckout() {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet. Start exploring our catalog."
          action={
            <Link
              to="/products"
              className="rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-base-400 transition hover:text-base-100"
      >
        <ArrowLeft size={16} />
        Continue shopping
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-base-100 sm:text-3xl">
          Your <span className="text-gradient">Cart</span>{" "}
          <span className="text-base font-medium text-base-400">({totalItems} items)</span>
        </h1>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-base-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {cart.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-overlay/8 bg-base-900 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-bold text-base-100">Order Summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-base-300">
              <span>Items ({totalItems})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base-300">
              <span>Shipping</span>
              <span className="text-emerald-400">Free</span>
            </div>
          </div>
          <div className="my-4 h-px bg-overlay/8" />
          <div className="flex justify-between text-base font-bold text-base-100">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition hover:opacity-90"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
