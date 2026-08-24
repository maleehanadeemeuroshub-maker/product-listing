import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import Hero3DStage from '../3d/Hero3DStage';
import {
  Sparkles,
  ShoppingBag,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Box,
  Compass,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function HeroSection() {
  const {
    products,
    openProductDetail,
    addToCart,
    openARSimulator,
  } = useStore();

  // Featured flagship showcase items
  const heroProducts = products.slice(0, 5);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const currentProduct = heroProducts[activeHeroIndex];

  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const activeColor = currentProduct.colors[activeColorIndex] || currentProduct.colors[0];

  const handleProductSwitch = (idx) => {
    sound.playColorSwitch();
    setActiveHeroIndex(idx);
    setActiveColorIndex(0);
  };

  const handleColorSwitch = (idx) => {
    sound.playColorSwitch();
    setActiveColorIndex(idx);
  };

  const scrollToCatalog = () => {
    sound.playClick();
    const elem = document.getElementById('catalog');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-center pt-8 pb-16 overflow-hidden cyber-grid-bg">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center md:justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-lg shadow-cyan-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-semibold uppercase tracking-wider">Spatial Audio & Optics 2026 Collection</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>

        {/* Hero Grid: Left Content + Right 3D Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Product Info & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            
            {/* Flagship Switcher Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
              {heroProducts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleProductSwitch(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-300 ${
                    idx === activeHeroIndex
                      ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30 scale-105'
                      : 'glass-pill text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* Main Headline */}
            <div>
              <span className="inline-block text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2">
                {currentProduct.badge} • Series {currentProduct.releaseYear}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Space_Grotesk'] text-white leading-tight">
                {currentProduct.name}
              </h1>
              <p className="mt-3 text-lg text-slate-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                {currentProduct.tagline}
              </p>
            </div>

            {/* Colorway Switcher Bar */}
            <div className="flex items-center justify-center lg:justify-start gap-3 p-3 rounded-2xl glass-panel border border-white/10 w-fit mx-auto lg:mx-0">
              <span className="text-xs font-mono text-slate-400 font-medium">Colorway:</span>
              <div className="flex items-center gap-2">
                {currentProduct.colors.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorSwitch(idx)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full transition-all duration-300 relative p-0.5 ${
                      idx === activeColorIndex
                        ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <span
                      className="w-full h-full rounded-full block border border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-cyan-300 font-semibold pl-2 border-l border-white/10 hidden sm:inline">
                {activeColor.name}
              </span>
            </div>

            {/* Price & Rating Display */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  ${currentProduct.price}
                </span>
                {currentProduct.originalPrice && (
                  <span className="text-lg text-slate-500 line-through font-mono">
                    ${currentProduct.originalPrice}
                  </span>
                )}
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white text-sm">{currentProduct.rating}</span>
                <span className="text-slate-400">({currentProduct.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Interactive CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  addToCart(currentProduct, activeColor);
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm font-mono shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart — ${currentProduct.price}
              </button>

              <button
                onClick={scrollToCatalog}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-panel border border-white/15 text-white hover:border-cyan-500/50 hover:bg-white/10 font-semibold text-sm font-mono transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                Explore Products
              </button>

              <button
                onClick={() => openProductDetail(currentProduct, activeColor)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl glass-panel border border-white/15 text-slate-300 hover:text-white font-semibold text-sm font-mono transition-all flex items-center justify-center gap-2"
                title="Inspect in 3D Studio"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">3D Studio</span>
              </button>

              <button
                onClick={() => openARSimulator(currentProduct)}
                title="Preview AR Simulator"
                className="w-full sm:w-auto p-3.5 rounded-2xl glass-panel border border-white/15 text-purple-300 hover:text-white hover:border-purple-500/50 transition-all flex items-center justify-center"
              >
                <Box className="w-4 h-4" />
              </button>
            </div>

            {/* Mini Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-4 max-w-lg mx-auto lg:mx-0 text-left">
              {currentProduct.features.slice(0, 2).map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Interactive 3D Flagship Stage */}
          <div className="lg:col-span-6 relative w-full h-[450px] sm:h-[520px] lg:h-[580px] flex items-center justify-center">
            
            {/* 3D WebGL Canvas */}
            <div
              onClick={() => openProductDetail(currentProduct, activeColor)}
              className="w-full h-full cursor-pointer relative group"
            >
              <Hero3DStage product={currentProduct} activeColor={activeColor} />

              {/* Floating Explode Badge on Hover */}
              <div className="absolute top-6 right-6 p-2.5 rounded-xl glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2 shadow-xl opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                <Layers className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span>Click for 3D Teardown</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
