import { describe, expect, it } from "vitest";
import { FOODS, type Meal, type MealOptions } from "./foods";
import {
  buildMealId,
  calculateCalories,
  generateMeal,
  mealToText,
  shuffle,
} from "./randomizer";

const ALL_ON: MealOptions = {
  includeFermented: true,
  includeHerbSpice: true,
  includeFat: true,
  showCalories: true,
};

const CORE_ONLY: MealOptions = {
  includeFermented: false,
  includeHerbSpice: false,
  includeFat: false,
  showCalories: false,
};

// Deterministic pseudo-random sequence so tests are stable.
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function makeHistory(ids: string[]): string[] {
  return ids;
}

describe("shuffle", () => {
  it("returns a permutation of the input", () => {
    const items = [1, 2, 3, 4, 5];
    const out = shuffle(items, seededRandom(7));
    expect(out.sort((a, b) => a - b)).toEqual(items);
  });
});

describe("generateMeal", () => {
  it("picks exactly one item from each core category", () => {
    const meal = generateMeal({
      foods: FOODS,
      options: ALL_ON,
      history: [],
      random: seededRandom(1),
    });
    expect(FOODS.protein).toContain(meal.protein);
    expect(FOODS.legume).toContain(meal.legume);
    expect(FOODS.vegetable).toContain(meal.vegetable);
  });

  it("includes optional slots when enabled", () => {
    const meal = generateMeal({
      foods: FOODS,
      options: ALL_ON,
      history: [],
      random: seededRandom(2),
    });
    expect(meal.fermented).toBeDefined();
    expect(meal.herbSpice).toBeDefined();
    expect(meal.fat).toBeDefined();
  });

  it("omits optional slots when disabled", () => {
    const meal = generateMeal({
      foods: FOODS,
      options: CORE_ONLY,
      history: [],
      random: seededRandom(3),
    });
    expect(meal.fermented).toBeUndefined();
    expect(meal.herbSpice).toBeUndefined();
    expect(meal.fat).toBeUndefined();
  });

  it("calculates calories as the sum of all parts", () => {
    const meal = generateMeal({
      foods: FOODS,
      options: ALL_ON,
      history: [],
      random: seededRandom(4),
    });
    const expected =
      meal.protein.calories +
      meal.legume.calories +
      meal.vegetable.calories +
      (meal.fermented?.calories ?? 0) +
      (meal.herbSpice?.calories ?? 0) +
      (meal.fat?.calories ?? 0);
    expect(meal.calories).toBe(expected);
    expect(meal.calories).toBe(
      calculateCalories({
        protein: meal.protein,
        legume: meal.legume,
        vegetable: meal.vegetable,
        fermented: meal.fermented,
        herbSpice: meal.herbSpice,
        fat: meal.fat,
      }),
    );
  });

  it("avoids re-generating meals already in recent history", () => {
    // Force the first candidate to be the same as the one in history by
    // using a random sequence that converges on one meal, then assert the
    // result differs from the sole history entry.
    const mealA = generateMeal({
      foods: FOODS,
      options: ALL_ON,
      history: [],
      random: seededRandom(5),
    });
    const history = [mealA.id];
    const mealB = generateMeal({
      foods: FOODS,
      options: ALL_ON,
      history,
      random: seededRandom(5),
    });
    expect(mealB.id).not.toBe(mealA.id);
  });
});

describe("buildMealId", () => {
  it("is stable for the same combination", () => {
    const meal: Meal = {
      id: "",
      protein: FOODS.protein[0],
      legume: FOODS.legume[0],
      vegetable: FOODS.vegetable[0],
      fermented: FOODS.fermented[0],
      herbSpice: FOODS.herbSpice[0],
      fat: FOODS.fat[0],
      calories: 0,
      generatedAt: 0,
    };
    expect(buildMealId(meal)).toBe(buildMealId(meal));
  });
});

describe("mealToText", () => {
  it("renders every ingredient on its own line", () => {
    const meal = generateMeal({
      foods: FOODS,
      options: ALL_ON,
      history: [],
      random: seededRandom(6),
    });
    const text = mealToText(meal);
    expect(text).toContain(meal.protein.name);
    expect(text).toContain(meal.legume.name);
    expect(text).toContain(meal.vegetable.name);
    expect(text.split("\n")).toHaveLength(6);
  });
});

describe("history dedupe helpers", () => {
  it("respects a provided history list", () => {
    const history = makeHistory(["egg-whites+lentils+spinach+kimchi+garlic+olive-oil"]);
    const meal = generateMeal({
      foods: FOODS,
      options: ALL_ON,
      history,
      random: seededRandom(8),
    });
    expect(history).not.toContain(meal.id);
  });
});
