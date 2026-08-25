import React from 'react';
import { SearchX, ShoppingBag, Box, RotateCcw } from 'lucide-react';

export default function EmptyState({
  title = 'No Products Found',
  description = 'We could not find any products matching your selected search or filters.',
  actionText = 'Clear Filters',
  onAction,
  icon = 'search', // 'search' | 'cart' | 'box'
}) {
  const IconComponent =
    icon === 'cart' ? ShoppingBag : icon === 'box' ? Box : SearchX;

  return (
    <div className="w-full py-16 px-6 rounded-3xl glass-panel border border-white/10 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
        <IconComponent className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
