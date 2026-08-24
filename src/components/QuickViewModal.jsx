import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import Modal from "./Modal";
import StarRating from "./StarRating";
import { useCart } from "../context/CartContext";

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const outOfStock = product.stock === 0;

  function handleAddToCart() {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-base-900">
          <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col gap-3 pr-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-400">
            {product.category}
          </span>
          <h2 className="text-xl font-extrabold text-base-100">{product.title}</h2>

          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} />
            <span className="text-xs text-base-400">
              {product.rating?.toFixed(1)} ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          <p className="line-clamp-3 text-sm text-base-300">{product.description}</p>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-base-100">${discountedPrice.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <span className="text-sm text-base-400 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${outOfStock ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
            {outOfStock ? "Out of Stock" : `${product.stock} in stock`}
          </span>

          {!outOfStock && (
            <div className="flex items-center gap-1 rounded-lg border border-overlay/8 bg-base-900 p-1 w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-base-100">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md text-base-300 transition hover:bg-overlay/5 hover:text-base-100"
              >
                <Plus size={14} />
              </button>
            </div>
          )}

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> {outOfStock ? "Out of Stock" : "Add to Cart"}
                </>
              )}
            </button>
            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-lg border border-overlay/10 px-4 py-2.5 text-sm font-semibold text-base-100 transition hover:border-overlay/20"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
