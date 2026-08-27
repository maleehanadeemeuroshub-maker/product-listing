import React from 'react';
import { useStore } from '../../context/StoreContext';
import ProductCard from './ProductCard';
import Spatial3DCarousel from './Spatial3DCarousel';
import SplitCinemaView from './SplitCinemaView';
import {
  LayoutGrid,
  Disc3,
  Columns,
  ArrowUpDown,
  SearchX,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/audio';

export default function ProductGrid() {
  const {
    filteredProducts,
    viewMode,
    setViewMode,
    filters,
    setFilters,
  } = useStore();

  const handleViewChange = (mode) => {
    sound.playClick();
    setViewMode(mode);
  };

  const handleSortChange = (e) => {
    sound.playClick();
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  return (
    <div className="flex-1 space-y-6">
      
      {/* Top Toolbar: View Switcher + Sort Options + Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-900/10">
        
        {/* Results Counter & Search Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 font-['Space_Grotesk']">
            {filteredProducts.length} Products Found
          </span>
          {filters.searchQuery && (
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
              "{filters.searchQuery}"
            </span>
          )}
        </div>

        {/* View Switcher & Sorting */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/80 border border-slate-900/10">
            <button
              onClick={() => handleViewChange('grid')}
              title="3D Card Grid View"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleViewChange('spatial-carousel')}
              title="3D Spatial Coverflow Carousel"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'spatial-carousel'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Disc3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleViewChange('split-cinema')}
              title="Split Cinema 3D Showcase"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'split-cinema'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 border border-slate-900/10 text-xs font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="popularity" className="bg-white">Most Popular</option>
              <option value="price-asc" className="bg-white">Price: Low to High</option>
              <option value="price-desc" className="bg-white">Price: High to Low</option>
              <option value="rating" className="bg-white">Highest Rated</option>
              <option value="newest" className="bg-white">Newest Release</option>
            </select>
          </div>

        </div>

      </div>

      {/* Conditional View Rendering */}
      {filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center rounded-3xl glass-panel border border-slate-900/10 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
            No 3D Products Match Your Filters
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, increasing your price range, or selecting "All Products".
          </p>
          <button
            onClick={() => {
              sound.playClick();
              setFilters({
                category: 'all',
                searchQuery: '',
                minPrice: 0,
                maxPrice: 1500,
                minRating: 0,
                inStockOnly: false,
                sortBy: 'popularity',
              });
            }}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono transition-all shadow-lg shadow-cyan-500/20"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'spatial-carousel' ? (
        <Spatial3DCarousel products={filteredProducts} />
      ) : viewMode === 'split-cinema' ? (
        <SplitCinemaView products={filteredProducts} />
      ) : (
        /* Standard 3D Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
