import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CompareProvider, useCompare } from "./CompareContext";

const makeProduct = (id) => ({ id, title: `Product ${id}`, thumbnail: `${id}.jpg` });

function setup() {
  return renderHook(() => useCompare(), { wrapper: CompareProvider });
}

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("CompareContext", () => {
  it("adds products up to the max of 3", () => {
    const { result } = setup();
    act(() => result.current.toggleCompare(makeProduct(1)));
    act(() => result.current.toggleCompare(makeProduct(2)));
    act(() => result.current.toggleCompare(makeProduct(3)));
    expect(result.current.compareItems).toHaveLength(3);
    expect(result.current.canAddMore).toBe(false);
  });

  it("refuses to add a 4th product", () => {
    const { result } = setup();
    act(() => result.current.toggleCompare(makeProduct(1)));
    act(() => result.current.toggleCompare(makeProduct(2)));
    act(() => result.current.toggleCompare(makeProduct(3)));
    act(() => result.current.toggleCompare(makeProduct(4)));
    expect(result.current.compareItems).toHaveLength(3);
    expect(result.current.isInCompare(4)).toBe(false);
  });

  it("removes a product when toggled again", () => {
    const { result } = setup();
    act(() => result.current.toggleCompare(makeProduct(1)));
    act(() => result.current.toggleCompare(makeProduct(1)));
    expect(result.current.compareItems).toHaveLength(0);
  });

  it("clears all compared products", () => {
    const { result } = setup();
    act(() => result.current.toggleCompare(makeProduct(1)));
    act(() => result.current.toggleCompare(makeProduct(2)));
    act(() => result.current.clearCompare());
    expect(result.current.compareItems).toHaveLength(0);
  });
});
