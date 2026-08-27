import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Eye,
  Star,
  Check,
  Package,
} from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  // Calculate original price from discount percentage if available
  const originalPrice = product.discountPercentage
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative rounded-3xl glass-panel border border-slate-900/10 hover:border-cyan-500/40 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top Bar: Discount Badge & Stock Status */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {product.discountPercentage ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-rose-500/20 border border-rose-500/30 text-rose-300">
              -{Math.round(product.discountPercentage)}% OFF
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              Featured
            </span>
          )}
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
            isOutOfStock
              ? 'bg-rose-500/20 text-rose-300'
              : isLowStock
              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
              : 'bg-emerald-500/15 text-emerald-300'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock (${product.stock})` : 'In Stock'}
        </span>
      </div>

      {/* Product Image Area */}
      <Link
        to={`/products/${product.id}`}
        className="relative w-full h-48 sm:h-52 rounded-2xl bg-slate-50/90 overflow-hidden flex items-center justify-center p-3 my-2 block group/img"
      >
        <img
          src={product.thumbnail || product.images?.[0]}
          alt={product.title}
          loading="lazy"
          className="max-h-full max-w-full object-contain group-hover/img:scale-105 transition-transform duration-300"
        />

        {/* Quick View Details Overlay Tag */}
        <div className="absolute bottom-2 inset-x-3 py-1.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 shadow-lg">
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="relative z-10 space-y-2.5 pt-1">
        
        {/* Category & Brand info */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="uppercase tracking-wider text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md">
            {product.category}
          </span>
          <span className="truncate max-w-[120px]">{product.brand || 'Original'}</span>
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${product.id}`}
          className="text-sm font-bold text-slate-900 font-['Space_Grotesk'] hover:text-cyan-400 transition-colors line-clamp-1 block"
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Rating Stars & Score */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
          <div className="flex items-center">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <span className="font-bold text-slate-700">{product.rating}</span>
          <span className="text-slate-500 text-[10px]">({product.reviews?.length || 12} reviews)</span>
        </div>

        {/* Price & Action Button Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-900/6">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                ${product.price}
              </span>
              {originalPrice && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  ${originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${product.id}`}
              className="p-2 rounded-xl glass-panel border border-slate-900/10 hover:border-cyan-500/40 text-slate-600 hover:text-slate-900 transition-colors"
              title="View Product Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-3 py-2 rounded-xl font-bold text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                isAdded
                  ? 'bg-emerald-500 text-black shadow-emerald-500/25'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25 hover:shadow-cyan-500/40'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
