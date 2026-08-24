const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 8;

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRecentlyViewed() {
  return read();
}

/** Records a product as viewed, most-recent-first, deduped, capped at MAX_ITEMS. */
export function addRecentlyViewed(product) {
  const existing = read().filter((p) => p.id !== product.id);
  const snapshot = {
    id: product.id,
    title: product.title,
    price: product.price,
    discountPercentage: product.discountPercentage ?? 0,
    thumbnail: product.thumbnail,
    category: product.category,
    rating: product.rating,
    stock: product.stock ?? 0,
  };
  const next = [snapshot, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
