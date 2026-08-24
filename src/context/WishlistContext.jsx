import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "wishlist";

function readStoredWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(readStoredWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  function isInWishlist(id) {
    return wishlist.some((item) => item.id === id);
  }

  function toggleWishlist(product) {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          discountPercentage: product.discountPercentage ?? 0,
          thumbnail: product.thumbnail ?? product.images?.[0],
          category: product.category,
          rating: product.rating,
          stock: product.stock ?? 0,
        },
      ];
    });
  }

  function removeFromWishlist(id) {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  }

  const value = { wishlist, isInWishlist, toggleWishlist, removeFromWishlist, totalWishlistItems: wishlist.length };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
