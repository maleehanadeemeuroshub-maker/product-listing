import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart, Check, Tag, Package, Boxes, Heart, GitCompareArrows } from "lucide-react";
import { getProductById, getRelatedProducts } from "../services/api";
import StarRating from "../components/StarRating";
import ErrorState from "../components/ErrorState";
import ProductGrid from "../components/ProductGrid";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ReviewCard from "../components/ReviewCard";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useToast } from "../context/ToastContext";
import usePageTitle from "../hooks/usePageTitle";
import { addRecentlyViewed } from "../utils/recentlyViewed";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare, canAddMore } = useCompare();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProduct(null);
    setActiveImage(0);
    setQuantity(1);
    setRelatedProducts(null);

    getProductById(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setLoading(false);
        addRecentlyViewed(data);

        // Related products are a nice-to-have — a failure here shouldn't
        // take down the whole page, so it's handled independently.
        getRelatedProducts(data.category, data.id)
          .then((related) => {
            if (!cancelled) setRelatedProducts(related);
          })
          .catch(() => {
            if (!cancelled) setRelatedProducts([]);
          });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  usePageTitle(product?.title, product?.description);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="skeleton-shimmer aspect-square rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="skeleton-shimmer h-4 w-24 rounded-full" />
            <div className="skeleton-shimmer h-8 w-3/4 rounded-full" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-full" />
            <div className="skeleton-shimmer h-24 w-full rounded-xl" />
            <div className="skeleton-shimmer h-10 w-1/3 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.thumbnail];
  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const outOfStock = product.stock === 0;

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  function handleAddToCart() {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleToggleWishlist() {
    toggleWishlist(product);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  }

  function handleToggleCompare() {
    if (!inCompare && !canAddMore) {
      toast.error("You can compare up to 3 products at a time.");
      return;
    }
    toggleCompare(product);
  }

  // Structured data so search engines can render this as a rich Product result.
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: images,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand || "Shoply" },
    aggregateRating: product.rating
      ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews?.length || 1 }
      : undefined,
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "USD",
      price: discountedPrice.toFixed(2),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-base-400 transition hover:text-base-100"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-overlay/8 bg-base-900">
            <img
              src={images[activeImage]}
              alt={product.title}
              className="h-full w-full object-cover animate-fade-in"
              key={activeImage}
            />
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    activeImage === i ? "border-accent-500" : "border-overlay/8 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-400">
              {product.category}
            </span>
            {product.brand && (
              <span className="flex items-center gap-1 text-xs text-base-400">
                <Tag size={13} /> {product.brand}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-base-100 sm:text-3xl">{product.title}</h1>

          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} size={16} />
            <span className="text-sm text-base-400">
              {product.rating?.toFixed(2)} &middot; {product.reviews?.length || 0} review
              {product.reviews?.length === 1 ? "" : "s"}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-base-300">{product.description}</p>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-base-100">${discountedPrice.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <>
                <span className="pb-1 text-base text-base-400 line-through">${product.price.toFixed(2)}</span>
                <span className="mb-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                  -{Math.round(product.discountPercentage)}%
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-overlay/8 bg-base-900 px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 text-base-300">
              <Boxes size={15} className={outOfStock ? "text-red-400" : "text-emerald-400"} />
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </span>
            <span className="flex items-center gap-1.5 text-base-300">
              <Package size={15} /> {product.category}
            </span>
          </div>

          {!outOfStock && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-base-300">Quantity</span>
              <div className="flex items-center gap-1 rounded-lg border border-overlay/8 bg-base-900 p-1">
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
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent2-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:from-base-700 disabled:to-base-700 disabled:text-base-400 disabled:opacity-100 disabled:shadow-none"
            >
              {added ? (
                <>
                  <Check size={17} /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={17} /> {outOfStock ? "Out of Stock" : "Add to Cart"}
                </>
              )}
            </button>
            <button
              onClick={handleToggleWishlist}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                inWishlist
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                  : "border-overlay/8 bg-base-900 text-base-300 hover:border-overlay/20 hover:text-base-100"
              }`}
            >
              <Heart size={18} className={inWishlist ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleToggleCompare}
              title={inCompare ? "Remove from compare" : "Add to compare"}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                inCompare
                  ? "border-accent-500/40 bg-accent-500/10 text-accent-400"
                  : "border-overlay/8 bg-base-900 text-base-300 hover:border-overlay/20 hover:text-base-100"
              }`}
            >
              <GitCompareArrows size={18} />
            </button>
          </div>
        </div>
      </div>

      {product.reviews?.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-base-100">
            Customer Reviews <span className="text-base-400">({product.reviews.length})</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.reviews.map((review, i) => (
              <ReviewCard key={`${review.reviewerEmail}-${i}`} review={review} />
            ))}
          </div>
        </div>
      )}

      {relatedProducts === null ? (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-base-100">Related Products</h2>
          <LoadingSkeleton count={4} />
        </div>
      ) : relatedProducts.length > 0 ? (
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-base-100">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      ) : null}
    </div>
  );
}
