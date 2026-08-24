import { Link } from "react-router-dom";
import { GitCompareArrows, X, ShoppingCart } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import EmptyState from "../components/EmptyState";
import usePageTitle from "../hooks/usePageTitle";

const ROWS = [
  { label: "Price", render: (p) => `$${(p.price * (1 - p.discountPercentage / 100)).toFixed(2)}` },
  { label: "Category", render: (p) => p.category },
  { label: "Brand", render: (p) => p.brand || "—" },
  { label: "Rating", render: (p) => <StarRating rating={p.rating} size={13} /> },
  { label: "Stock", render: (p) => (p.stock > 0 ? `${p.stock} available` : "Out of stock") },
  { label: "Description", render: (p) => <span className="line-clamp-4 text-xs">{p.description}</span> },
];

export default function Compare() {
  usePageTitle("Compare Products");

  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const toast = useToast();

  if (compareItems.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={GitCompareArrows}
          title="Nothing to compare yet"
          message="Add at least 2 products to compare using the compare icon on any product card."
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-base-100 sm:text-3xl">
          Compare <span className="text-gradient">Products</span>
        </h1>
        <button onClick={clearCompare} className="text-sm font-medium text-base-400 hover:text-base-100">
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-overlay/8">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32 bg-base-900 p-4 text-left align-bottom text-xs font-medium text-base-400"></th>
              {compareItems.map((p) => (
                <th key={p.id} className="min-w-[200px] border-l border-overlay/8 bg-base-900 p-4 text-left align-top">
                  <button
                    onClick={() => removeFromCompare(p.id)}
                    className="mb-2 flex items-center gap-1 text-xs text-base-400 hover:text-red-400"
                  >
                    <X size={12} /> Remove
                  </button>
                  <Link to={`/products/${p.id}`}>
                    <img src={p.thumbnail} alt={p.title} className="mb-2 h-32 w-full rounded-lg object-cover" />
                    <h3 className="line-clamp-2 text-sm font-semibold text-base-100 hover:text-base-100">{p.title}</h3>
                  </Link>
                  <button
                    onClick={() => {
                      addToCart(p, 1);
                      toast.success(`${p.title} added to cart`);
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent2-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    <ShoppingCart size={12} /> Add to Cart
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-overlay/8">
                <td className="bg-base-900 p-4 text-xs font-semibold uppercase tracking-wide text-base-400">
                  {row.label}
                </td>
                {compareItems.map((p) => (
                  <td key={p.id} className="border-l border-overlay/8 p-4 text-base-300">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
