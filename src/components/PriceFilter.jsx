import React from 'react';
import { DollarSign } from 'lucide-react';

export default function PriceFilter({ maxPrice = 2000, currentPrice, onChange }) {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="flex items-center gap-1 uppercase tracking-widest text-slate-600 font-bold">
          <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          Max Price Filter
        </span>
        <span className="text-cyan-400 font-bold text-sm font-mono">
          ${currentPrice}
        </span>
      </div>

      <input
        type="range"
        min="5"
        max={maxPrice}
        step="10"
        value={currentPrice}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />

      <div className="flex justify-between text-[10px] font-mono text-slate-500">
        <span>$5</span>
        <span>${Math.round(maxPrice / 2)}</span>
        <span>${maxPrice}</span>
      </div>
    </div>
  );
}
