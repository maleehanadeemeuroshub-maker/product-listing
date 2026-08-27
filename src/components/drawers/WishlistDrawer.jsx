import React from 'react';
import { useStore } from '../../context/StoreContext';
import Card3DCanvas from '../3d/Card3DCanvas';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function WishlistDrawer() {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    products,
    addToCart,
    openProductDetail,
  } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    sound.playCartSuccess();
    wishlistProducts.forEach(p => addToCart(p));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsWishlistOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-900/10 p-6 flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900/10 shrink-0">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400/20" />
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900">
                Saved Wishlist
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold">
                {wishlist.length}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setIsWishlistOpen(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 py-4">
            {wishlistProducts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Save your favorite 3D models and hardware gear to revisit and compare anytime.
                </p>
              </div>
            ) : (
              wishlistProducts.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl glass-panel border border-slate-900/10 flex items-center gap-3 relative group"
                >
                  <div className="w-16 h-16 rounded-xl bg-white/80 border border-slate-900/10 shrink-0 flex items-center justify-center">
                    <Card3DCanvas product={p} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-[11px] font-mono text-cyan-400 font-extrabold">
                      ${p.price}
                    </p>
                    <span className="inline-block text-[10px] font-mono text-emerald-400">
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openProductDetail(p)}
                        className="p-1.5 rounded-lg glass-panel border border-slate-900/10 text-cyan-300 hover:bg-cyan-500/20"
                        title="3D Inspect"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => addToCart(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow-md"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistProducts.length > 0 && (
            <div className="pt-4 border-t border-slate-900/10 space-y-3 shrink-0">
              <button
                onClick={handleMoveAllToCart}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm font-mono shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                Move All ({wishlistProducts.length}) to Cart
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
