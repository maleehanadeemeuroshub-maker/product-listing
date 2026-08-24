import axios from "axios";

// Central axios instance for the DummyJSON product catalog — kept separate
// from services/auth.js, which talks to our own backend instead.
const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000,
});

// Normalizes every failure into a plain Error with a readable message,
// so components only ever have to deal with one error shape.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

// Removes undefined/empty values so axios doesn't serialize them as
// literal "undefined" query params.
function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

/**
 * Fetches a paginated list of products.
 * options: { limit, skip, sortBy, order }
 */
export async function getProducts(options = {}) {
  const { limit = 12, skip = 0, sortBy, order } = options;
  const { data } = await api.get("/products", {
    params: cleanParams({ limit, skip, sortBy, order }),
  });
  return data; // { products, total, skip, limit }
}

/** Fetches a single product by its id. */
export async function getProductById(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

/** Fetches the list of available product categories. */
export async function getCategories() {
  const { data } = await api.get("/products/categories");
  // Normalize: some API versions return plain strings instead of objects.
  return data.map((entry) =>
    typeof entry === "string" ? { slug: entry, name: entry } : { slug: entry.slug, name: entry.name }
  );
}

/**
 * Fetches products belonging to a single category.
 * options: { limit, skip, sortBy, order }
 */
export async function getProductsByCategory(category, options = {}) {
  const { limit = 12, skip = 0, sortBy, order } = options;
  const { data } = await api.get(`/products/category/${category}`, {
    params: cleanParams({ limit, skip, sortBy, order }),
  });
  return data;
}

/**
 * Searches products by a free-text query.
 * options: { limit, skip, sortBy, order }
 */
export async function searchProducts(query, options = {}) {
  const { limit = 12, skip = 0, sortBy, order } = options;
  const { data } = await api.get("/products/search", {
    params: cleanParams({ q: query, limit, skip, sortBy, order }),
  });
  return data;
}

/**
 * Fetches every distinct brand across the whole catalog, using `select` to
 * pull back only the `brand` field so the request stays lightweight even
 * though it covers all ~194 products.
 */
export async function getAllBrands() {
  const { data } = await api.get("/products", { params: { limit: 0, select: "brand" } });
  const brands = new Set(data.products.map((p) => p.brand).filter(Boolean));
  return [...brands].sort();
}

/**
 * Fetches related products from the same category, using the native Fetch
 * API directly rather than the Axios instance above — the rest of this
 * service layer standardizes on Axios, but this shows the fetch()-based
 * approach works the same way: request, check `ok`, parse JSON, handle errors.
 */
export async function getRelatedProducts(category, excludeId, limit = 4) {
  const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=${limit + 1}`);

  if (!response.ok) {
    throw new Error(`Failed to load related products (status ${response.status})`);
  }

  const data = await response.json();
  return data.products.filter((p) => p.id !== Number(excludeId)).slice(0, limit);
}

export default api;
