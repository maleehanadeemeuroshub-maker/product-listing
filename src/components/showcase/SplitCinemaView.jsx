import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import Product3DViewer from '../3d/Product3DViewer';
import {
  ShoppingBag,
  Star,
  Layers,
  Sparkles,
  CheckCircle2,
  Box,
  Eye,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function SplitCinemaView({ products }) {
  const { addToCart, openARSimulator, openProductDetail } = useStore();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const product = products[selectedIdx] || products[0];
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const activeColor = product?.colors[selectedColorIdx] || product?.colors[0];

  if (!product) return null;

  const handleSelectProduct = (idx) => {
    sound.playClick();
    setSelectedIdx(idx);
    setSelectedColorIdx(0);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Product Thumbnails Switcher */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {products.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => handleSelectProduct(idx)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono shrink-0 transition-all flex items-center gap-2 ${
              idx === selectedIdx
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25 scale-105'
                : 'glass-panel text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.colors[0]?.hex || '#06b6d4' }}
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Main Split Cinema Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl">
        
        {/* Left Column: Full 3D Interactive Viewer Canvas */}
        <div className="lg:col-span-7 h-[460px] sm:h-[520px] rounded-2xl overflow-hidden relative">
          <Product3DViewer
            product={product}
            selectedColor={activeColor}
            enableExplodeControl={true}
          />
        </div>

        {/* Right Column: Deep Engineering Specs & Fast Buy */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            {/* Tag & Rating */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {product.badge}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-white">{product.rating}</span>
                <span className="text-slate-400">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Title & Tagline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                {product.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-light leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Color Switcher */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Colorway</span>
                <span className="text-cyan-300 font-semibold">{activeColor?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {product.colors.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      sound.playColorSwitch();
                      setSelectedColorIdx(i);
                    }}
                    title={c.name}
                    className={`w-7 h-7 rounded-full transition-all ${
                      i === selectedColorIdx
                        ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                Technical Highlights
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-slate-200 font-semibold text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Price & Add Actions */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-500 line-through font-mono ml-2">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Free Express Delivery
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => addToCart(product, activeColor)}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm font-mono shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart — ${product.price}
              </button>

              <button
                onClick={() => openProductDetail(product, activeColor)}
                className="p-3.5 rounded-2xl glass-panel border border-white/20 text-cyan-400 hover:bg-cyan-500/10 transition-all"
                title="Full 3D Studio"
              >
                <Eye className="w-5 h-5" />
              </button>

              <button
                onClick={() => openARSimulator(product)}
                className="p-3.5 rounded-2xl glass-panel border border-white/20 text-purple-400 hover:bg-purple-500/10 transition-all"
                title="AR Simulator"
              >
                <Box className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
