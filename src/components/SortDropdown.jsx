import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 p-1.5 px-3 rounded-2xl glass-panel border border-white/10 text-xs font-mono">
      <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
      <span className="text-slate-400 hidden sm:inline">Sort by:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-slate-100 focus:outline-none cursor-pointer font-semibold pr-2"
      >
        <option value="default" className="bg-slate-900 text-slate-100">
          Default Order
        </option>
        <option value="price-asc" className="bg-slate-900 text-slate-100">
          Price: Low to High
        </option>
        <option value="price-desc" className="bg-slate-900 text-slate-100">
          Price: High to Low
        </option>
        <option value="rating-desc" className="bg-slate-900 text-slate-100">
          Rating: High to Low
        </option>
        <option value="title-asc" className="bg-slate-900 text-slate-100">
          Name: A to Z
        </option>
        <option value="title-desc" className="bg-slate-900 text-slate-100">
          Name: Z to A
        </option>
      </select>
    </div>
  );
}
