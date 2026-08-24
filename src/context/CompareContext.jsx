import { createContext, useContext, useEffect, useState } from "react";

const CompareContext = createContext(null);
const STORAGE_KEY = "compare";
const MAX_COMPARE = 3;

function readStoredCompare() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(readStoredCompare);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems]);

  function isInCompare(id) {
    return compareItems.some((item) => item.id === id);
  }

  function toggleCompare(product) {
    setCompareItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }

  function removeFromCompare(id) {
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCompare() {
    setCompareItems([]);
  }

  const value = {
    compareItems,
    isInCompare,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    canAddMore: compareItems.length < MAX_COMPARE,
    maxCompare: MAX_COMPARE,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}
