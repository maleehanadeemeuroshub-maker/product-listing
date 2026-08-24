import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { WishlistProvider, useWishlist } from "./WishlistContext";

const PRODUCT = { id: 1, title: "Product A", price: 100, discountPercentage: 0, thumbnail: "a.jpg", category: "beauty", rating: 4.5, stock: 5 };

function setup() {
  return renderHook(() => useWishlist(), { wrapper: WishlistProvider });
}

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("WishlistContext", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.wishlist).toEqual([]);
  });

  it("adds a product when toggled on", () => {
    const { result } = setup();
    act(() => result.current.toggleWishlist(PRODUCT));
    expect(result.current.isInWishlist(PRODUCT.id)).toBe(true);
    expect(result.current.wishlist).toHaveLength(1);
  });

  it("removes a product when toggled again", () => {
    const { result } = setup();
    act(() => result.current.toggleWishlist(PRODUCT));
    act(() => result.current.toggleWishlist(PRODUCT));
    expect(result.current.isInWishlist(PRODUCT.id)).toBe(false);
    expect(result.current.wishlist).toHaveLength(0);
  });

  it("removes a product directly by id", () => {
    const { result } = setup();
    act(() => result.current.toggleWishlist(PRODUCT));
    act(() => result.current.removeFromWishlist(PRODUCT.id));
    expect(result.current.wishlist).toHaveLength(0);
  });
});
