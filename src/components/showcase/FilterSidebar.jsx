import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES, BRANDS } from '../../types/products';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Headphones,
  Watch,
  Smartphone,
  Gamepad2,
  Plane,
  Glasses,
  Star,
  Check,
  Search,
} from 'lucide-react';
import { sound } from '../../utils/audio';

const ICON_MAP = {
  Sparkles,
  Headphones,
  Watch,
  Smartphone,
  Gamepad2,
  Plane,
  Glasses,
};

export default function FilterSidebar({ className = '' }) {
  const {
    products,
    filters,
    setFilters,
  } = useStore();

  const handleCategoryChange = (catId) => {
    sound.playClick();
    setFilters(prev => ({ ...prev, category: catId }));
  };

  const handleBrandChange = (brandId) => {
    sound.playClick();
    setFilters(prev => ({ ...prev, brand: brandId }));
  };

  const handleReset = () => {
    sound.playClick();
    setFilters({
      category: 'all',
      brand: 'all',
      searchQuery: '',
      minPrice: 0,
      maxPrice: 1500,
      minRating: 0,
      inStockOnly: false,
      sortBy: 'popularity',
    });
  };

  // Get count per category
  const getCategoryCount = (catId) => {
    if (catId === 'all') return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <aside className={`w-full lg:w-72 space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-slate-900/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold font-['Space_Grotesk'] text-slate-900">
            Filters & Search
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-mono text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Quick Search in Filter */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
          Search Hardware
        </h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Keyword search..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-900/10 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Categories Checkbox / List */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold mb-2">
          Categories
        </h4>
        <div className="space-y-1.5">
          {CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            const isSelected = filters.category === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold shadow-sm shadow-cyan-500/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-2.5">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
          Hardware Brand
        </h4>
        <div className="space-y-1 text-xs font-mono">
          {BRANDS.map(brand => {
            const isSelected = filters.brand === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => handleBrandChange(brand.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                  isSelected ? 'border-cyan-400 bg-cyan-500 text-black' : 'border-slate-900/15 bg-white'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>{brand.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="uppercase tracking-widest text-slate-500 font-semibold">
            Max Price
          </span>
          <span className="text-cyan-400 font-bold text-sm">${filters.maxPrice}</span>
        </div>

        <input
          type="range"
          min="100"
          max="1500"
          step="50"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>$100</span>
          <span>$750</span>
          <span>$1,500</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-900/10 space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
          Customer Rating
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {[0, 4.8, 4.9].map((rating) => {
            const isSelected = filters.minRating === rating;
            return (
              <button
                key={rating}
                onClick={() => {
                  sound.playClick();
                  setFilters(prev => ({ ...prev, minRating: rating }));
                }}
                className={`py-2 px-1 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                    : 'glass-pill text-slate-500 hover:text-slate-900'
                }`}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{rating === 0 ? 'All' : `${rating}+`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-900/10">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-slate-600">In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => {
              sound.playClick();
              setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }));
            }}
            className="w-4 h-4 rounded border-slate-900/15 bg-white text-cyan-500 focus:ring-cyan-500 accent-cyan-400 cursor-pointer"
          />
        </label>
      </div>

    </aside>
  );
}
