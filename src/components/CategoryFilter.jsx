import React from 'react';
import { Sparkles, Layers } from 'lucide-react';

export default function CategoryFilter({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  isLoading = false,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-600 font-bold">
          Categories
        </h3>
      </div>

      {isLoading ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded-xl bg-slate-100/70 animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {/* "All" Option */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20 scale-105'
                : 'glass-panel border-slate-900/10 text-slate-600 hover:text-slate-900 hover:border-slate-900/15'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>All Products</span>
          </button>

          {/* Dynamic Categories from DummyJSON API */}
          {categories.map((cat) => {
            const slug = typeof cat === 'string' ? cat : cat.slug || cat.name;
            const name = typeof cat === 'string' ? cat : cat.name || cat.slug;
            const isSelected = selectedCategory === slug;

            return (
              <button
                key={slug}
                onClick={() => onSelectCategory(slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20 scale-105'
                    : 'glass-panel border-slate-900/10 text-slate-500 hover:text-slate-900 hover:border-slate-900/15'
                }`}
              >
                {name.replace(/-/g, ' ')}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
