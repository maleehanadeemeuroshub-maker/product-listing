import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import Card3DCanvas from '../3d/Card3DCanvasLazy';
import {
  ShoppingBag,
  Eye,
  Heart,
  Scale,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function ProductCard({ product }) {
  const {
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    addToCart,
    openProductDetail,
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const activeSize = product.sizes ? product.sizes[selectedSizeIdx] : null;

  const isFavorited = wishlist.includes(product.id);
  const isCompared = compareList.some(p => p.id === product.id);

  // 3D Card Parallax Tilt Ref
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out',
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playHover();
  };

  return (
    <div
      ref={cardRef}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl glass-panel border border-slate-900/10 hover:border-cyan-500/40 transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      {/* Background Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Bar: Badge & Quick Wishlist / Compare Actions */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
        
        {/* Badge & Discount */}
        <div className="flex items-center gap-1.5">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              {product.badge}
            </span>
          )}
          {product.originalPrice && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-rose-500/15 border border-rose-500/30 text-rose-300">
              Save ${(product.originalPrice - product.price)}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product);
            }}
            title={isCompared ? 'Remove from Comparison' : 'Add to Comparison'}
            className={`p-2 rounded-xl transition-all ${
              isCompared
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`p-2 rounded-xl transition-all ${
              isFavorited
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-slate-500 hover:text-rose-400 hover:bg-white/5'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* 3D Model Interactive Preview Canvas */}
      <div
        onClick={() => openProductDetail(product, activeColor, activeSize)}
        className="relative w-full h-48 flex items-center justify-center cursor-pointer my-1 group/canvas"
      >
        <Card3DCanvas
          product={product}
          activeColor={activeColor}
          isHovered={isHovered}
        />

        {/* Hover "Quick 3D Teardown" Floating Pill */}
        <div className="absolute bottom-2 inset-x-4 py-1.5 px-3 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-md shadow-lg shadow-black/40">
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect 3D Teardown</span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="relative z-10 space-y-3 pt-2">
        
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="uppercase tracking-wider text-cyan-400/90 font-semibold">{product.category}</span>
          <span>{product.brandName}</span>
        </div>

        {/* Color Palette Selector Dots */}
        <div className="flex items-center gap-1.5">
          {product.colors.map((c, idx) => (
            <button
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                setSelectedColorIdx(idx);
              }}
              title={c.name}
              className={`w-4 h-4 rounded-full transition-all ${
                idx === selectedColorIdx
                  ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-125'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <span className="text-[10px] font-mono text-slate-500 ml-1">
            {activeColor.name}
          </span>
        </div>

        {/* Title & Short Description */}
        <div>
          <h3
            onClick={() => openProductDetail(product, activeColor, activeSize)}
            className="text-base font-bold text-slate-900 font-['Space_Grotesk'] hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-light leading-relaxed">
            {product.shortDesc}
          </p>
        </div>

        {/* Available Sizes / Variants Pills */}
        {product.sizes && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {product.sizes.map((s, idx) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  setSelectedSizeIdx(idx);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono shrink-0 transition-all ${
                  idx === selectedSizeIdx
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold'
                    : 'glass-panel text-slate-500 hover:text-slate-900 border-slate-900/6'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Rating & Stock Status */}
        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{product.rating}</span>
            <span className="text-slate-500 text-[11px]">({product.reviewCount})</span>
          </div>

          <span className={`text-[11px] font-semibold ${product.inStock ? 'text-emerald-400' : 'text-rose-400'}`}>
            {product.inStock ? `In Stock (${product.stockCount})` : 'Sold Out'}
          </span>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-900/6">
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-500 line-through font-mono ml-1.5">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openProductDetail(product, activeColor, activeSize)}
              className="px-3 py-2 rounded-xl glass-panel border border-slate-900/10 hover:border-cyan-500/40 text-slate-600 hover:text-slate-900 text-xs font-mono font-medium transition-all"
            >
              View Details
            </button>
            <button
              onClick={() => addToCart(product, activeColor, null, activeSize)}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 active:scale-95 transition-all flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
