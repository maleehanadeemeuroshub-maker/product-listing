import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search products by name, brand, category...' }) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/80 border border-slate-900/10 rounded-2xl text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          title="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
