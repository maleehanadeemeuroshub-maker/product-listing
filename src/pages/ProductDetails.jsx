import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ErrorState from '../components/ErrorState';
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ArrowLeft,
  Check,
  CheckCircle2,
  Package,
  Zap,
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      setError(null);
      setQuantity(1);

      try {
        const data = await getProductById(id);
        setProduct(data);
        setSelectedImage(data.thumbnail || data.images?.[0] || '');

        // Fetch related products from same category
        if (data.category) {
          try {
            const related = await getProductsByCategory(data.category, { limit: 4 });
            const filtered = (related.products || []).filter((p) => p.id !== data.id);
            setRelatedProducts(filtered);
          } catch (e) {
            console.error('Failed to load related products', e);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch product details from the REST API.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="py-12 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 h-96 bg-slate-800/60 rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 w-3/4 bg-slate-800/80 rounded-md" />
            <div className="h-4 w-1/3 bg-slate-800/60 rounded-md" />
            <div className="h-24 w-full bg-slate-800/40 rounded-2xl" />
            <div className="h-10 w-1/2 bg-slate-800/80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12">
        <ErrorState
          message={error || 'Product could not be found.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const originalPrice = product.discountPercentage
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="space-y-12 pb-16">
      
      {/* Back to Products Navigation Breadcrumb */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-xl glass-panel border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main Details Grid: Left Gallery + Right Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Interactive Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image Stage */}
          <div className="relative w-full h-[380px] sm:h-[450px] rounded-3xl glass-panel border border-white/10 p-8 flex items-center justify-center overflow-hidden bg-slate-900/60 shadow-2xl">
            <img
              src={selectedImage}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
            />

            {product.discountPercentage && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase bg-rose-500/20 border border-rose-500/30 text-rose-300">
                -{Math.round(product.discountPercentage)}% Discount
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl p-2 shrink-0 bg-slate-900/80 border transition-all flex items-center justify-center overflow-hidden ${
                    selectedImage === img
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Specs, Price, Actions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Category, Brand, & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-slate-400">Brand: <strong className="text-white">{product.brand || 'Original Brand'}</strong></span>
              <span className="text-slate-500">• SKU: #{product.sku || product.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Space_Grotesk'] text-white leading-tight">
              {product.title}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 pt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white text-sm">{product.rating}</span>
              <span className="text-slate-400">({product.reviews?.length || 18} customer reviews)</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Price Box & Stock Indicator */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                  ${product.price}
                </span>
                {originalPrice && (
                  <span className="text-base text-slate-500 line-through font-mono">
                    ${originalPrice}
                  </span>
                )}
              </div>

              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-lg ${
                  isOutOfStock
                    ? 'bg-rose-500/20 text-rose-300'
                    : isLowStock
                    ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${product.stock} left in stock!` : `In Stock (${product.stock})`}
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs font-mono text-slate-300">Select Quantity:</span>
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-white/10">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-mono font-bold text-xs text-cyan-300">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart + Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 rounded-2xl font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
                  isAdded
                    ? 'bg-emerald-500 text-black shadow-emerald-500/25'
                    : isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25 hover:shadow-cyan-500/40'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>Instant Buy Now</span>
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-[10px] font-mono text-slate-400 text-center border-t border-white/5">
              <div className="flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fast Courier</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Verified Spec</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Easy Return</span>
              </div>
            </div>

          </div>

          {/* Customer Reviews Section */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Customer Reviews</span>
              </h3>

              <div className="space-y-3 pt-1">
                {product.reviews.map((rev, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{rev.reviewerName}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(rev.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, r) => (
                        <Star key={r} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 font-light">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Related Category Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                More in {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                Related Recommendations
              </h2>
            </div>
            <Link
              to={`/products?category=${product.category}`}
              className="text-xs font-mono text-cyan-400 hover:underline"
            >
              View All Category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
