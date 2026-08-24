import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import EmptyState from "../components/EmptyState";
import usePageTitle from "../hooks/usePageTitle";

export default function Wishlist() {
  usePageTitle("Wishlist");

  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  function handleAddToCart(item) {
    addToCart(item, 1);
    toast.success(`${item.title} added to cart`);
  }

  function handleRemove(item) {
    removeFromWishlist(item.id);
    toast.info("Removed from wishlist");
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Save products you love by tapping the heart icon on any product card."
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-extrabold text-base-100 sm:text-3xl">
        Your <span className="text-gradient">Wishlist</span>{" "}
        <span className="text-base font-medium text-base-400">({wishlist.length})</span>
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => {
          const discounted = item.price * (1 - item.discountPercentage / 100);
          return (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-overlay/8 bg-base-900 p-4">
              <Link to={`/products/${item.id}`} className="shrink-0">
                <img src={item.thumbnail} alt={item.title} className="h-20 w-20 rounded-xl object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link to={`/products/${item.id}`}>
                  <h3 className="truncate text-sm font-semibold text-base-100 hover:text-base-100">{item.title}</h3>
                </Link>
                <StarRating rating={item.rating} size={12} />
                <span className="mt-1 text-sm font-bold text-base-100">${discounted.toFixed(2)}</span>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    <ShoppingCart size={12} /> Add
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-base-400 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
