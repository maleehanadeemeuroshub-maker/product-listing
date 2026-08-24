import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { getProducts, getProductsByCategory, searchProducts, getCategories, getAllBrands } from "../services/api";
import ProductGrid from "../components/ProductGrid";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import SortDropdown from "../components/SortDropdown";
import PriceFilter from "../components/PriceFilter";
import BrandFilter from "../components/BrandFilter";
import RatingFilter from "../components/RatingFilter";
import AvailabilityFilter from "../components/AvailabilityFilter";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import usePageTitle from "../hooks/usePageTitle";

const LIMIT = 12;
const MAX_PRICE = 2000;
const ALL_CATEGORIES = { slug: "all", name: "All" };

function mapSort(sortValue) {
  switch (sortValue) {
    case "price-asc":
      return { sortBy: "price", order: "asc" };
    case "price-desc":
      return { sortBy: "price", order: "desc" };
    case "rating-desc":
      return { sortBy: "rating", order: "desc" };
    case "title-asc":
      return { sortBy: "title", order: "asc" };
    case "title-desc":
      return { sortBy: "title", order: "desc" };
    default:
      return {};
  }
}

function fetchByMode({ search, category, limit, skip, sortBy, order }) {
  if (search) return searchProducts(search, { limit, skip, sortBy, order });
  if (category !== "all") return getProductsByCategory(category, { limit, skip, sortBy, order });
  return getProducts({ limit, skip, sortBy, order });
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState([ALL_CATEGORIES]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortValue, setSortValue] = useState("default");
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Debounce the raw search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Categories and brands are fetched once from the API and used to drive the filter controls.
  useEffect(() => {
    getCategories()
      .then((data) => setCategories([ALL_CATEGORIES, ...data]))
      .catch(() => {
        /* categories are non-critical to the page — fail silently */
      });
    getAllBrands()
      .then(setBrands)
      .catch(() => {
        /* brand filter is non-critical to the page — fail silently */
      });
  }, []);

  // Re-fetch the first page whenever search, category or sort changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSkip(0);

    const { sortBy, order } = mapSort(sortValue);
    fetchByMode({ search: debouncedSearch, category: selectedCategory, limit: LIMIT, skip: 0, sortBy, order })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedCategory, sortValue, retryKey]);

  async function handleLoadMore() {
    const nextSkip = skip + LIMIT;
    setLoadingMore(true);
    try {
      const { sortBy, order } = mapSort(sortValue);
      const data = await fetchByMode({
        search: debouncedSearch,
        category: selectedCategory,
        limit: LIMIT,
        skip: nextSkip,
        sortBy,
        order,
      });
      setProducts((prev) => [...prev, ...data.products]);
      setSkip(nextSkip);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.price >= priceRange[0] &&
          p.price <= priceRange[1] &&
          (selectedBrand === "all" || p.brand === selectedBrand) &&
          (p.rating || 0) >= minRating &&
          (!inStockOnly || p.stock > 0)
      ),
    [products, priceRange, selectedBrand, minRating, inStockOnly]
  );

  usePageTitle(
    "Shop All Products",
    total > 0 ? `Browse ${total} products across every category, with live search, filters and sorting.` : undefined
  );

  const hasMore = products.length < total;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-base-100 sm:text-3xl">
          Discover <span className="text-gradient">Products</span>
        </h1>
        <p className="mt-1 text-sm text-base-400">
          {loading ? "Fetching the latest catalog..." : `${total} products available`}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBar value={searchInput} onChange={setSearchInput} />
          <div className="flex flex-wrap gap-3">
            <SortDropdown value={sortValue} onChange={setSortValue} />
            <BrandFilter brands={brands} value={selectedBrand} onChange={setSelectedBrand} />
            <RatingFilter value={minRating} onChange={setMinRating} />
            <PriceFilter min={0} max={MAX_PRICE} value={priceRange} onChange={setPriceRange} />
            <AvailabilityFilter value={inStockOnly} onChange={setInStockOnly} />
          </div>
        </div>
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {loading ? (
        <LoadingSkeleton count={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={debouncedSearch ? "No results found" : "No products match your filters"}
          message={
            debouncedSearch
              ? `We couldn't find anything matching "${debouncedSearch}".`
              : "Try widening the price range, rating, or availability, or picking a different brand or category."
          }
        />
      ) : (
        <>
          <ProductGrid products={filteredProducts} />
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-xl border border-overlay/10 bg-base-900 px-6 py-2.5 text-sm font-semibold text-base-100 transition hover:border-overlay/20 hover:bg-base-800 disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
