import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Heart, GitCompareArrows } from "lucide-react";
import StarRating from "./StarRating";
import QuickViewModal from "./QuickViewModal";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useToast } from "../context/ToastContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare, canAddMore } = useCompare();
  const toast = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 10;
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  function handleAddToCart(e) {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(product, 1);
    toast.success(`${product.title} added to cart`);
  }

  function handleQuickView(e) {
    e.preventDefault();
    setQuickViewOpen(true);
  }

  function handleToggleWishlist(e) {
    e.preventDefault();
    toggleWishlist(product);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  }

  function handleToggleCompare(e) {
    e.preventDefault();
    if (!inCompare && !canAddMore) {
      toast.error("You can compare up to 3 products at a time.");
      return;
    }
    toggleCompare(product);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-overlay/8 bg-base-900 transition duration-300 hover:-translate-y-1 hover:border-overlay/15 hover:shadow-2xl hover:shadow-black/40">
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-base-850">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {product.discountPercentage > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}

        <span
          className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg ${
            outOfStock
              ? "bg-red-500/90 text-white"
              : lowStock
                ? "bg-amber-500/90 text-white"
                : "bg-emerald-500/90 text-white"
          }`}
        >
          {outOfStock ? "Out of Stock" : lowStock ? `Only ${product.stock} left` : "In Stock"}
        </span>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={handleToggleWishlist}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition ${
              inWishlist ? "bg-rose-500 text-white" : "bg-base-950/70 text-base-100 hover:bg-rose-500 hover:text-white"
            }`}
          >
            <Heart size={15} className={inWishlist ? "fill-current" : ""} />
          </button>
          <button
            onClick={handleToggleCompare}
            title={inCompare ? "Remove from compare" : "Add to compare"}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition ${
              inCompare
                ? "bg-accent-500 text-white"
                : "bg-base-950/70 text-base-100 hover:bg-accent-500 hover:text-white"
            }`}
          >
            <GitCompareArrows size={15} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-400">
          {product.category}
        </span>

        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-1 text-sm font-semibold text-base-100 transition group-hover:text-base-100">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} />
          <span className="text-xs text-base-400">{product.rating?.toFixed(1)}</span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-base-100">${discountedPrice.toFixed(2)}</span>
          {product.discountPercentage > 0 && (
            <span className="text-xs text-base-400 line-through">${product.price.toFixed(2)}</span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-3">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:from-base-700 disabled:to-base-700 disabled:text-base-400 disabled:opacity-100"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
          <button
            onClick={handleQuickView}
            className="flex items-center justify-center rounded-lg border border-overlay/10 p-2 text-base-300 transition hover:border-overlay/20 hover:text-base-100"
            title="Quick View"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
}
