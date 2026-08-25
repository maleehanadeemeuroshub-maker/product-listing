import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import {
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Cart() {
  const {
    cart,
    totalItems,
    subtotalPrice,
    discountAmount,
    shippingFee,
    isFreeShipping,
    freeShippingThreshold,
    totalPrice,
    appliedPromo,
    applyPromoCode,
    clearCart,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const freeShippingProgress = Math.min(100, (subtotalPrice / freeShippingThreshold) * 100);

  const handlePromoSubmit = (e) => {
    e.preventDefault();
    setPromoError('');
    const res = applyPromoCode(promoInput);
    if (res.success) {
      setPromoInput('');
    } else {
      setPromoError(res.message);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1500);
  };

  const handleStartNewOrder = () => {
    clearCart();
    setOrderComplete(false);
  };

  if (orderComplete) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto space-y-6 rounded-3xl glass-panel border border-emerald-500/40 p-8 shadow-2xl bg-emerald-950/20">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-white">
            Order Confirmed!
          </h2>
          <p className="text-sm font-mono text-emerald-300">
            Order Reference: #{Math.floor(100000 + Math.random() * 900000)}
          </p>
          <p className="text-xs text-slate-300 font-light max-w-md mx-auto">
            Your items have been successfully dispatched for express delivery. We have sent the confirmation telemetry to your registered account.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStartNewOrder}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow-lg"
          >
            Start New Order
          </button>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl glass-panel border border-white/10 text-white hover:border-cyan-500/40 font-bold text-xs font-mono"
          >
            Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any products to your cart yet. Explore our live REST API product catalog to find great deals."
          actionText="Explore Products Catalog"
          icon="cart"
          onAction={() => (window.location.href = '/products')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-white">
            Shopping Cart ({totalItems} items)
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Manage your selected hardware & consumer items
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1.5 p-2 rounded-xl glass-panel border border-white/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Entire Cart</span>
        </button>
      </div>

      {/* Free Shipping Notification Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-cyan-400" />
            {isFreeShipping ? (
              <span className="text-emerald-400 font-bold">
                🎉 Congratulations! You have unlocked Free Courier Delivery!
              </span>
            ) : (
              `Add $${(freeShippingThreshold - subtotalPrice).toFixed(2)} more for Free Shipping`
            )}
          </span>
          <span className="text-cyan-400 font-bold">{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Cart Grid: Left List + Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: List of Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Right Column: Order Summary & Checkout Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 bg-slate-900/80 shadow-2xl space-y-5 sticky top-24">
            
            <h2 className="text-lg font-bold font-['Space_Grotesk'] text-white pb-3 border-b border-white/10">
              Order Summary
            </h2>

            {/* Promo Code Form */}
            <form onSubmit={handlePromoSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Coupon (WEEK7 or SAVE10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-cyan-300 border border-white/10"
                >
                  Apply
                </button>
              </div>

              {promoError && (
                <p className="text-[11px] font-mono text-rose-400">{promoError}</p>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <span>Applied: {appliedPromo.code}</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </form>

            {/* Financial Calculations */}
            <div className="space-y-2.5 text-xs font-mono pt-2 border-t border-white/10">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal ({totalItems})</span>
                <span className="text-slate-200 font-semibold">${subtotalPrice.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Courier Freight</span>
                <span className={isFreeShipping ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                  {isFreeShipping ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-white/10">
                <span>Estimated Total</span>
                <span className="text-xl font-extrabold text-cyan-400 font-mono">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm font-mono shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isCheckingOut ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing Secure Checkout...</span>
                </div>
              ) : (
                <>
                  <span>Complete Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Assurances */}
            <div className="space-y-1 text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>256-Bit SSL Encrypted Transaction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>30-Day Money-Back Satisfaction Guarantee</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
