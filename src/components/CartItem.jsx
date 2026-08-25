import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  if (!item) return null;

  return (
    <div className="p-4 rounded-3xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-cyan-500/30">
      
      {/* Product Image & Details */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Link
          to={`/products/${item.id}`}
          className="w-20 h-20 rounded-2xl bg-slate-900/80 border border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden group"
        >
          <img
            src={item.thumbnail}
            alt={item.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="space-y-1 min-w-0 flex-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
            {item.category}
          </span>
          <Link
            to={`/products/${item.id}`}
            className="text-sm font-bold text-white font-['Space_Grotesk'] hover:text-cyan-400 transition-colors line-clamp-1 block"
          >
            {item.title}
          </Link>
          <div className="text-xs font-mono text-slate-400">
            Unit Price: <span className="text-white font-semibold">${item.price}</span>
          </div>
        </div>
      </div>

      {/* Quantity Manager & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-white/10">
          <button
            type="button"
            onClick={() => decreaseQuantity(item.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-8 text-center font-mono font-bold text-xs text-cyan-300">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => increaseQuantity(item.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total Price */}
        <div className="text-right min-w-[80px]">
          <div className="text-sm font-extrabold font-mono text-cyan-400">
            ${(item.price * item.quantity).toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            ${item.price} × {item.quantity}
          </div>
        </div>

        {/* Delete Item Button */}
        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
