import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import Card3DCanvas from '../3d/Card3DCanvasLazy';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Eye,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function Spatial3DCarousel({ products }) {
  const { openProductDetail, addToCart } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const spread = viewportWidth < 480 ? 130 : viewportWidth < 640 ? 170 : viewportWidth < 1024 ? 210 : 260;

  const total = products.length;
  if (total === 0) return null;

  const handlePrev = () => {
    sound.playClick();
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    sound.playClick();
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  // Keyboard arrow listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  const activeProduct = products[activeIndex] || products[0];

  return (
    <div className="relative w-full py-12 px-4 select-none overflow-hidden">
      
      {/* Background Spatial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 3D Carousel Stage */}
      <div className="relative h-[480px] sm:h-[520px] max-w-5xl mx-auto flex items-center justify-center perspective-1000">
        {products.map((product, idx) => {
          // Calculate circular offset
          let offset = idx - activeIndex;
          if (offset < -Math.floor(total / 2)) offset += total;
          if (offset > Math.floor(total / 2)) offset -= total;

          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          // 3D Matrix Transformations
          const translateX = offset * spread; // horizontal spread, scaled to viewport
          const translateZ = isCenter ? 100 : -Math.abs(offset) * 140; // depth
          const rotateY = offset * -25; // angle toward center
          const opacity = isCenter ? 1 : Math.max(0.2, 1 - Math.abs(offset) * 0.4);
          const scale = isCenter ? 1.05 : 0.85;

          return (
            <div
              key={product.id}
              onClick={() => {
                if (!isCenter) {
                  sound.playClick();
                  setActiveIndex(idx);
                }
              }}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex: 20 - Math.abs(offset),
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className={`absolute w-72 sm:w-84 rounded-3xl p-6 glass-panel border transition-shadow duration-500 cursor-pointer ${
                isCenter
                  ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20 bg-white/90'
                  : 'border-slate-900/10 hover:border-slate-900/15 bg-white/70'
              }`}
            >
              {/* Top Tag */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {product.badge || 'Showcase'}
                </span>
                <div className="flex items-center gap-1 text-xs font-mono text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating}</span>
                </div>
              </div>

              {/* 3D Mini Canvas */}
              <div className="relative w-full h-44 flex items-center justify-center my-2">
                <Card3DCanvas product={product} isHovered={isCenter} />
              </div>

              {/* Product Info */}
              <div className="space-y-2 mt-2">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 font-light">
                  {product.shortDesc}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-900/10">
                  <span className="text-xl font-extrabold font-mono text-slate-900">
                    ${product.price}
                  </span>

                  {isCenter ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openProductDetail(product);
                        }}
                        className="p-2 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                        title="3D Teardown Studio"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-slate-500">
                      Click to focus
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl glass-panel border border-slate-900/10 text-slate-600 hover:text-slate-900 hover:border-cyan-500/40 hover:scale-110 active:scale-95 transition-all shadow-lg"
          title="Previous Product (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-panel border border-slate-900/10 font-mono text-xs text-slate-500">
          <span className="text-cyan-400 font-bold">{activeIndex + 1}</span>
          <span>/</span>
          <span>{total}</span>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl glass-panel border border-slate-900/10 text-slate-600 hover:text-slate-900 hover:border-cyan-500/40 hover:scale-110 active:scale-95 transition-all shadow-lg"
          title="Next Product (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
