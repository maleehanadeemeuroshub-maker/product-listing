import React from 'react';
import { useStore } from '../../context/StoreContext';
import Card3DCanvas from '../3d/Card3DCanvas';
import {
  X,
  Scale,
  ShoppingBag,
  Trash2,
  Check,
  Star,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function CompareDrawer() {
  const {
    isCompareOpen,
    setIsCompareOpen,
    compareList,
    toggleCompare,
    addToCart,
  } = useStore();

  if (!isCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/80 backdrop-blur-xl p-4 sm:p-6 md:p-8 flex items-center justify-center animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-6xl rounded-3xl glass-panel border border-cyan-500/30 bg-white/95 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-900/10">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900">
                Side-by-Side 3D Hardware Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Comparing {compareList.length} of 4 maximum devices
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setIsCompareOpen(false);
            }}
            className="p-2.5 rounded-xl glass-panel border border-slate-900/10 text-slate-500 hover:text-slate-900 hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {compareList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
              <Scale className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
              No Products Selected for Comparison
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Click the scale icon on any product card in the listing to benchmark technical specs and 3D teardown details.
            </p>
          </div>
        ) : (
          /* Comparison Matrix Table */
          <div className="overflow-x-auto">
            <div className="min-w-[650px] grid grid-cols-5 gap-4">
              
              {/* Feature / Spec Label Column */}
              <div className="space-y-6 pt-52 text-xs font-mono text-slate-500 border-r border-slate-900/10 pr-3">
                <div className="font-bold text-slate-600">Category</div>
                <div className="font-bold text-slate-600">Price</div>
                <div className="font-bold text-slate-600">Customer Rating</div>
                <div className="font-bold text-slate-600">Availability</div>
                <div className="font-bold text-slate-600">Release Year</div>
                <div className="font-bold text-slate-600">Color Variants</div>
              </div>

              {/* Product Columns */}
              {compareList.map(p => (
                <div key={p.id} className="space-y-6 text-xs font-mono text-slate-700">
                  {/* Top Preview Card */}
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-900/10 space-y-2 relative group">
                    <button
                      onClick={() => toggleCompare(p)}
                      title="Remove from comparison"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-32 flex items-center justify-center">
                      <Card3DCanvas product={p} />
                    </div>

                    <h4 className="font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1">
                      {p.name}
                    </h4>

                    <button
                      onClick={() => addToCart(p)}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>${p.price}</span>
                    </button>
                  </div>

                  {/* Spec Row Values */}
                  <div className="capitalize">{p.category}</div>
                  <div className="font-bold text-cyan-400">${p.price}</div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{p.rating} ({p.reviewCount})</span>
                  </div>
                  <div className={p.inStock ? 'text-emerald-400' : 'text-rose-400'}>
                    {p.inStock ? `In Stock (${p.stockCount})` : 'Sold Out'}
                  </div>
                  <div>{p.releaseYear}</div>
                  <div className="flex items-center gap-1">
                    {p.colors.map(c => (
                      <span
                        key={c.id}
                        className="w-3.5 h-3.5 rounded-full border border-slate-900/15"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>

                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
