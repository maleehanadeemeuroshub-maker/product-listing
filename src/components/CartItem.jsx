import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const discountedPrice = item.price * (1 - item.discountPercentage / 100);
  const subtotal = discountedPrice * item.quantity;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-overlay/8 bg-base-900 p-4 sm:flex-row sm:items-center">
      <Link to={`/products/${item.id}`} className="shrink-0">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-24 w-24 rounded-xl object-cover sm:h-20 sm:w-20"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/products/${item.id}`}>
          <h3 className="truncate text-sm font-semibold text-base-100 hover:text-base-100">{item.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-base-400">${discountedPrice.toFixed(2)} each</p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-overlay/8 bg-base-850 p-1">
          <button
            onClick={() => decreaseQuantity(item.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-base-100">{item.quantity}</span>
          <button
            onClick={() => increaseQuantity(item.id)}
            disabled={item.quantity >= item.stock}
            className="flex h-7 w-7 items-center justify-center rounded-md text-base-300 transition hover:bg-overlay/5 hover:text-base-100 disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <span className="w-20 text-right text-sm font-bold text-base-100">${subtotal.toFixed(2)}</span>

        <button
          onClick={() => removeFromCart(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-base-400 transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
