import type { FoodItem, Foods, Meal, MealOptions } from "./foods";

export interface RandomizerOptions {
  foods: Foods;
  options: MealOptions;
  /** Recent meal ids to avoid re-generating exact duplicates. */
  history: string[];
  /** How far back to check for exact-duplicate meals. */
  historyWindow?: number;
  /** Max re-roll attempts before giving up on dedupe. */
  maxAttempts?: number;
  random?: () => number;
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickOne<T>(items: T[], random: () => number = Math.random): T {
  const shuffled = shuffle(items, random);
  return shuffled[0];
}

export function buildMealId(meal: Omit<Meal, "id" | "generatedAt" | "calories">): string {
  const parts = [meal.protein.id, meal.legume.id, meal.vegetable.id];
  if (meal.fermented) parts.push(meal.fermented.id);
  if (meal.herbSpice) parts.push(meal.herbSpice.id);
  if (meal.fat) parts.push(meal.fat.id);
  return parts.join("+");
}

function hasRecentDuplicate(
  mealId: string,
  history: string[],
  historyWindow: number,
): boolean {
  return history.slice(0, historyWindow).some((pastId) => pastId === mealId);
}

export function generateMeal(settings: RandomizerOptions): Meal {
  const { foods, options, history, historyWindow = 10, maxAttempts = 20, random = Math.random } = settings;

  const candidate = (): Meal => {
    const protein = pickOne(foods.protein, random);
    const legume = pickOne(foods.legume, random);
    const vegetable = pickOne(foods.vegetable, random);
    const fermented = options.includeFermented && foods.fermented.length > 0
      ? pickOne(foods.fermented, random)
      : undefined;
    const herbSpice = options.includeHerbSpice && foods.herbSpice.length > 0
      ? pickOne(foods.herbSpice, random)
      : undefined;
    const fat = options.includeFat && foods.fat.length > 0
      ? pickOne(foods.fat, random)
      : undefined;

    const base = { protein, legume, vegetable, fermented, herbSpice, fat };
    const calories = calculateCalories(base);

    return {
      ...base,
      id: buildMealId(base),
      calories,
      generatedAt: Date.now(),
    };
  };

  let meal = candidate();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!hasRecentDuplicate(meal.id, history, historyWindow)) {
      return meal;
    }
    meal = candidate();
  }
  return meal;
}

export function calculateCalories(meal: {
  protein: FoodItem;
  legume: FoodItem;
  vegetable: FoodItem;
  fermented?: FoodItem;
  herbSpice?: FoodItem;
  fat?: FoodItem;
}): number {
  return (
    meal.protein.calories +
    meal.legume.calories +
    meal.vegetable.calories +
    (meal.fermented?.calories ?? 0) +
    (meal.herbSpice?.calories ?? 0) +
    (meal.fat?.calories ?? 0)
  );
}

export function mealToText(meal: Meal): string {
  const lines = [
    `${meal.protein.emoji} ${meal.protein.name}`,
    `${meal.legume.emoji} ${meal.legume.name}`,
    `${meal.vegetable.emoji} ${meal.vegetable.name}`,
  ];
  if (meal.fermented) lines.push(`${meal.fermented.emoji} ${meal.fermented.name}`);
  if (meal.herbSpice) lines.push(`${meal.herbSpice.emoji} ${meal.herbSpice.name}`);
  if (meal.fat) lines.push(`${meal.fat.emoji} ${meal.fat.name}`);
  return lines.join("\n");
}
