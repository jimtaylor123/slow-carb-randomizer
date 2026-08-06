import { describe, expect, it } from "vitest";
import { FOODS, type Category } from "./foods";

describe("FOODS data", () => {
  const required: Array<"protein" | "legume" | "vegetable"> = [
    "protein",
    "legume",
    "vegetable",
  ];

  const categories: Category[] = [
    "protein",
    "legume",
    "vegetable",
    "fermented",
    "herbSpice",
    "fat",
  ];

  it.each(required)("has at least one %s", (category) => {
    expect(FOODS[category].length).toBeGreaterThan(0);
  });

  it("includes optional pools (fermented, herbSpice, fat)", () => {
    expect(FOODS.fermented.length).toBeGreaterThan(0);
    expect(FOODS.herbSpice.length).toBeGreaterThan(0);
    expect(FOODS.fat.length).toBeGreaterThan(0);
  });

  it("has unique ids across all pools", () => {
    const ids = Object.values(FOODS).flat().map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has non-negative calories and required fields on every item", () => {
    for (const item of Object.values(FOODS).flat()) {
      expect(item.calories).toBeGreaterThanOrEqual(0);
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.serving.length).toBeGreaterThan(0);
      expect(item.emoji.length).toBeGreaterThan(0);
      expect(categories).toContain(item.category);
    }
  });
});
