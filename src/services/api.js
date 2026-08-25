import axios from 'axios';

/**
 * Dedicated REST API service layer using Axios
 * Base URL: https://dummyjson.com
 */
const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the REST API.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetch list of products with pagination, sorting, and limit parameters
 * @param {Object} params - { limit, skip, sortBy, order }
 */
export async function getProducts({ limit = 12, skip = 0, sortBy = '', order = 'asc' } = {}) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order;
  }
  return apiClient.get('/products', { params });
}

/**
 * Fetch a single product by its ID
 * @param {number|string} id - Product ID
 */
export async function getProductById(id) {
  if (!id) throw new Error('Product ID is required');
  return apiClient.get(`/products/${id}`);
}

/**
 * Fetch list of all product categories
 */
export async function getCategories() {
  return apiClient.get('/products/categories');
}

/**
 * Fetch products by category name with pagination
 * @param {string} category - Category slug
 * @param {Object} params - { limit, skip }
 */
export async function getProductsByCategory(category, { limit = 12, skip = 0 } = {}) {
  if (!category || category === 'all') {
    return getProducts({ limit, skip });
  }
  return apiClient.get(`/products/category/${encodeURIComponent(category)}`, {
    params: { limit, skip },
  });
}

/**
 * Search products by query string
 * @param {string} query - Search query
 * @param {Object} params - { limit, skip }
 */
export async function searchProducts(query, { limit = 12, skip = 0 } = {}) {
  if (!query || !query.trim()) {
    return getProducts({ limit, skip });
  }
  return apiClient.get('/products/search', {
    params: { q: query.trim(), limit, skip },
  });
}

/**
 * Authenticate user credentials against DummyJSON Auth API
 * @param {Object} credentials - { username, password }
 */
export async function loginUser({ username, password }) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  return apiClient.post('/auth/login', {
    username: username.trim(),
    password: password.trim(),
    expiresInMins: 60,
  });
}

/**
 * Fetch current user profile with auth token
 * @param {string} token - Bearer auth token
 */
export async function getCurrentUser(token) {
  if (!token) throw new Error('Auth token is required');
  return apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default apiClient;
