import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getProducts,
  getCategories,
  getProductsByCategory,
  searchProducts,
} from '../services/api';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import SortDropdown from '../components/SortDropdown';
import PriceFilter from '../components/PriceFilter';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import { Sparkles, SlidersHorizontal, ArrowRight, Store, RotateCcw } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatLoading, setIsCatLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch Categories on mount
  useEffect(() => {
    async function fetchCategories() {
      setIsCatLoading(true);
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories from API', err);
      } finally {
        setIsCatLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // 2. Fetch Products based on Category, Search Query, & Pagination
  const fetchProductsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
      let response;

      if (searchQuery.trim()) {
        // Search API endpoint
        response = await searchProducts(searchQuery, {
          limit: ITEMS_PER_PAGE,
          skip,
        });
      } else if (selectedCategory && selectedCategory !== 'all') {
        // Category API endpoint
        response = await getProductsByCategory(selectedCategory, {
          limit: ITEMS_PER_PAGE,
          skip,
        });
      } else {
        // Main Products API endpoint
        response = await getProducts({
          limit: ITEMS_PER_PAGE,
          skip,
        });
      }

      setProducts(response.products || []);
      setTotalProducts(response.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch products from the REST API.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, currentPage]);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  // Sync Search & Category to URL
  useEffect(() => {
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  // Handle Category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchQuery(''); // clear search when category is clicked
    setCurrentPage(1);
  };

  // Handle Search Input (with automatic page reset)
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('default');
    setMaxPrice(2000);
    setCurrentPage(1);
  };

  // Client-side Sorting & Price Filter over fetched page items
  const processedProducts = products
    .filter((p) => p.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      return 0;
    });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 p-6 sm:p-10 lg:p-12 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#070b14]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Week 7 REST API E-Commerce Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Space_Grotesk'] text-white tracking-tight leading-tight">
            Discover Live Products from <span className="text-gradient-cyan">DummyJSON API</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            Real-time REST API integration with Axios, category filtering, dynamic searches, sorting algorithms, and persistent cart management.
          </p>
        </div>
      </section>

      {/* Main Filter & Search Control Panel */}
      <div className="space-y-6">
        
        {/* Top Row: Search + Sort + Reset */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <SortDropdown value={sortBy} onChange={setSortBy} />

            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2.5 rounded-2xl glass-panel border border-white/10 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="p-4 rounded-3xl glass-panel border border-white/10">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            isLoading={isCatLoading}
          />
        </div>

        {/* Secondary Filter: Max Price Slider & Live Results Status */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Active Status:</span>
            <span className="text-cyan-400 font-bold">
              {isLoading ? 'Fetching API...' : `${totalProducts} Total API Products`}
            </span>
            {selectedCategory !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-semibold uppercase">
                {selectedCategory}
              </span>
            )}
          </div>

          <div className="w-full lg:max-w-xs">
            <PriceFilter
              maxPrice={2000}
              currentPrice={maxPrice}
              onChange={setMaxPrice}
            />
          </div>
        </div>

      </div>

      {/* Product Grid Area */}
      <ProductGrid
        products={processedProducts}
        isLoading={isLoading}
        error={error}
        onRetry={fetchProductsData}
        onClearFilters={handleResetFilters}
      />

      {/* Pagination Bar */}
      {!isLoading && !error && (
        <Pagination
          total={totalProducts}
          limit={ITEMS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
        />
      )}

    </div>
  );
}
