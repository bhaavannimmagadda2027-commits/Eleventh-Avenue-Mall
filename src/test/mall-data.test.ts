import { describe, expect, it } from "vitest";

import {
  calculateCartCount,
  calculateCartTotal,
  getCategory,
  getProductsForCategory,
  searchProducts,
} from "@/lib/mall-data";

describe("mall shopping data", () => {
  it("offers a store for each featured mall category", () => {
    expect(["grocery", "beauty", "electronics", "fashion", "kids", "home"].map(getCategory)).toHaveLength(6);
  });

  it("filters product discovery to the selected store", () => {
    expect(getProductsForCategory("beauty").every((product) => product.category === "beauty")).toBe(true);
  });

  it("finds products by common shopper terms", () => {
    expect(searchProducts("headphones").map((product) => product.id)).toContain("studio-headphones");
  });

  it("calculates a shared cart total and item count across merchants", () => {
    const cart = [
      { productId: "market-basket", quantity: 2 },
      { productId: "daily-ritual", quantity: 1 },
    ];

    expect(calculateCartTotal(cart)).toBe(68);
    expect(calculateCartCount(cart)).toBe(3);
  });
});