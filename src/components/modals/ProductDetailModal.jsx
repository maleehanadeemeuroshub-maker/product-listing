import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import Product3DViewer from '../3d/Product3DViewer';
import Card3DCanvas from '../3d/Card3DCanvas';
import {
  X,
  ShoppingBag,
  Heart,
  Scale,
  Star,
  Layers,
  Sparkles,
  CheckCircle2,
  Box,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function ProductDetailModal() {
  const {
    products,
    selectedProduct,
    closeProductDetail,
    activeColor,
    setActiveColor,
    activeMaterial,
    setActiveMaterial,
    activeSize,
    setActiveSize,
    addToCart,
    buyNow,
    wishlist,
    toggleWishlist,
    toggleCompare,
    compareList,
    openARSimulator,
    openProductDetail,
  } = useStore();

  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'specs' | 'reviews'
  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) return null;

  const isFavorited = wishlist.includes(selectedProduct.id);
  const isCompared = compareList.some(p => p.id === selectedProduct.id);

  // Related products
  const relatedProducts = products.filter(p =>
    (selectedProduct.relatedProductIds || []).includes(p.id)
  );

  const handleAddToCart = () => {
    addToCart(selectedProduct, activeColor, activeMaterial, activeSize, quantity);
  };

  const handleBuyNow = () => {
    buyNow(selectedProduct, activeColor, activeMaterial, activeSize, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-white/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Modal Card Backdrop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl rounded-3xl glass-panel border border-cyan-500/30 bg-white/95 shadow-2xl shadow-cyan-500/10 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-900/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {selectedProduct.badge}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1">
              {selectedProduct.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openARSimulator(selectedProduct)}
              className="p-2.5 rounded-xl glass-panel border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center gap-1.5 text-xs font-mono"
            >
              <Box className="w-4 h-4" />
              <span className="hidden sm:inline">AR Scale View</span>
            </button>

            <button
              onClick={closeProductDetail}
              className="p-2.5 rounded-xl glass-panel border border-slate-900/10 text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Full 3D Interactive Viewport Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full h-[380px] sm:h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-slate-900/10 relative">
              <Product3DViewer
                product={selectedProduct}
                selectedColor={activeColor}
                selectedMaterial={activeMaterial}
                enableExplodeControl={true}
              />
            </div>

            {/* Color & Material Customizer Studio */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  3D Material Customizer Studio
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  {activeColor?.name}
                </span>
              </div>

              {/* Color Swatches */}
              <div className="flex flex-wrap items-center gap-3">
                {selectedProduct.colors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => {
                      sound.playColorSwitch();
                      setActiveColor(color);
                    }}
                    title={color.name}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                      activeColor?.id === color.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-slate-900 font-bold shadow-md shadow-cyan-500/20'
                        : 'glass-panel border-slate-900/10 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-900/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>

              {/* Material Finishes if available */}
              {selectedProduct.materials && (
                <div className="pt-2 border-t border-slate-900/6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 mr-2">Finish:</span>
                  {selectedProduct.materials.map(mat => (
                    <button
                      key={mat.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveMaterial(mat);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        activeMaterial?.id === mat.id
                          ? 'bg-purple-500/20 border border-purple-400 text-purple-300 font-semibold'
                          : 'glass-pill text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {mat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hotspots & Exploded Components Info */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Exploded Layer Telemetry
              </span>
              <div className="space-y-1.5">
                {selectedProduct.explodedLayers.map((layer, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-600">
                    <span className="text-cyan-400 font-bold">0{idx + 1}.</span>
                    <div>
                      <strong className="text-slate-900">{layer.name}</strong> — {layer.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Information, Specs Tabs & Purchase Section */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tagline & Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-900 text-sm">{selectedProduct.rating}</span>
                <span className="text-slate-500">({selectedProduct.reviewCount} verified ratings)</span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-light">
                {selectedProduct.description}
              </p>
            </div>

            {/* Available Sizes / Variants */}
            {selectedProduct.sizes && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                  Select Edition / Size:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map(s => {
                    const isSelected = activeSize === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          sound.playClick();
                          setActiveSize(s);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                            : 'glass-panel border-slate-900/10 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-slate-900/10 pb-2">
              {[
                { id: 'studio', label: 'Key Features' },
                { id: 'specs', label: 'Tech Specs' },
                { id: 'reviews', label: 'Reviews (4.9★)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="space-y-4 min-h-[120px]">
              {activeTab === 'studio' && (
                <div className="space-y-2.5">
                  {selectedProduct.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-2 text-xs font-mono">
                  {Object.entries(selectedProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-900/6">
                      <span className="text-slate-500">{key}</span>
                      <span className="text-slate-700 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-900/6">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">Alex Chen • Verified Buyer</span>
                      <span className="text-slate-500 font-mono">2 days ago</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">
                      The 3D preview on the web app was already insane, but receiving the hardware in person completely blew my mind. Zero latency and build quality is sublime.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Price & Action Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-white/90 to-white/90 border border-cyan-500/20 space-y-4 shadow-xl">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    ${selectedProduct.price * quantity}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-slate-500 line-through font-mono ml-2">
                      ${selectedProduct.originalPrice * quantity}
                    </span>
                  )}
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white border border-slate-900/10">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-mono font-bold text-xs text-cyan-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setQuantity(quantity + 1);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart & Instant Buy Now Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 rounded-2xl glass-panel border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs font-mono shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900/6 text-xs">
                <button
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className={`flex items-center gap-1.5 font-mono ${
                    isFavorited ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-400' : ''}`} />
                  <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={() => toggleCompare(selectedProduct)}
                  className={`flex items-center gap-1.5 font-mono ${
                    isCompared ? 'text-cyan-400' : 'text-slate-500 hover:text-cyan-400'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
                </button>
              </div>

            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold block">
                  Related Spatial Devices
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {relatedProducts.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => openProductDetail(rel)}
                      className="p-2.5 rounded-xl glass-panel border border-slate-900/10 hover:border-cyan-500/40 cursor-pointer space-y-1.5 group transition-all"
                    >
                      <div className="h-16 flex items-center justify-center">
                        <Card3DCanvas product={rel} />
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1 group-hover:text-cyan-400">
                        {rel.name.split(' ')[0]} {rel.name.split(' ')[1]}
                      </h5>
                      <div className="text-[10px] font-mono text-cyan-300 font-extrabold">
                        ${rel.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
