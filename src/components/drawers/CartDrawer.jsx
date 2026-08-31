import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartItemsCount,
    cartSubtotal,
    cartTotal,
    cartLoading,
    checkoutUrl,
    updateCartQuantity,
    removeFromCart,
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 150;
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    if (!checkoutUrl) return;
    sound.playCartSuccess();
    // Hands off to Shopify's real hosted checkout — real payment processing happens there.
    window.location.href = checkoutUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-900/10 p-6 flex flex-col justify-between shadow-2xl shadow-cyan-500/10">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900/10 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-slate-900">
                Spatial Cart
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                {cartItemsCount}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setIsCartOpen(false);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-3 my-3 rounded-2xl glass-panel border border-slate-900/10 shrink-0 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-600">
                {cartSubtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked Free Courier Freight!
                  </span>
                ) : (
                  `Add $${(freeShippingThreshold - cartSubtotal).toFixed(2)} more for Free Shipping`
                )}
              </span>
              <span className="text-cyan-400 font-bold">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 py-2">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Your Cart is Empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our interactive 3D showcase and add futuristic audio, wearables, and computing devices.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl glass-panel border border-slate-900/10 flex items-center gap-3 relative group"
                >
                  {/* Color Thumbnail Dot */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-900/15 shrink-0"
                    style={{ backgroundColor: `${item.color.hex}22` }}
                  >
                    <span
                      className="w-5 h-5 rounded-full shadow-lg"
                      style={{ backgroundColor: item.color.hex }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span>{item.color.name}</span>
                      {item.material && <span>• {item.material.name}</span>}
                    </div>
                    <div className="text-xs font-mono font-extrabold text-cyan-300">
                      ${item.lineTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Manager & Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white border border-slate-900/10">
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 text-slate-500 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Controls */}
          {cart.length > 0 && (
            <div className="pt-4 border-t border-slate-900/10 space-y-4 shrink-0">

              {/* Price Breakdown — real totals from Shopify, incl. whatever tax/shipping it computes */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-700">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-900/10">
                  <span>Total</span>
                  <span className="font-extrabold text-cyan-400 font-mono">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  Shipping, tax, and discount codes are applied on the next step.
                </p>
              </div>

              {/* Checkout CTA — hands off to Shopify's real hosted checkout */}
              <button
                onClick={handleCheckout}
                disabled={cartLoading || !checkoutUrl}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm font-mono shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {cartLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Syncing Cart...</span>
                  </div>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
