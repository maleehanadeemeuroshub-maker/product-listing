import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

const PRODUCT_A = { id: 1, title: "Product A", price: 100, discountPercentage: 10, thumbnail: "a.jpg", stock: 5 };
const PRODUCT_B = { id: 2, title: "Product B", price: 50, discountPercentage: 0, thumbnail: "b.jpg", stock: 2 };

function setup() {
  return renderHook(() => useCart(), { wrapper: CartProvider });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("CartContext", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.cart).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("adds a new product to the cart", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_A, 1));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toMatchObject({ id: 1, quantity: 1 });
  });

  it("increases quantity instead of duplicating when adding the same product again", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_A, 1));
    act(() => result.current.addToCart(PRODUCT_A, 2));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(3);
  });

  it("never lets quantity exceed the product's stock", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_B, 1)); // stock is 2
    act(() => result.current.increaseQuantity(PRODUCT_B.id));
    act(() => result.current.increaseQuantity(PRODUCT_B.id));
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it("never decreases quantity below 1", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_A, 1));
    act(() => result.current.decreaseQuantity(PRODUCT_A.id));
    act(() => result.current.decreaseQuantity(PRODUCT_A.id));
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it("removes an item from the cart", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_A, 1));
    act(() => result.current.removeFromCart(PRODUCT_A.id));
    expect(result.current.cart).toHaveLength(0);
  });

  it("clears the whole cart", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_A, 1));
    act(() => result.current.addToCart(PRODUCT_B, 1));
    act(() => result.current.clearCart());
    expect(result.current.cart).toHaveLength(0);
  });

  it("computes totals using the discounted price", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_A, 2)); // $100 - 10% = $90 x 2 = $180
    act(() => result.current.addToCart(PRODUCT_B, 1)); // $50 x 1 = $50
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBeCloseTo(230);
  });

  it("persists the cart to localStorage", () => {
    const { result } = setup();
    act(() => result.current.addToCart(PRODUCT_A, 1));
    const stored = JSON.parse(localStorage.getItem("cart"));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(1);
  });
});
