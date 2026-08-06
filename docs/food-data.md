# Food Data

This document defines the ingredient data model, the seed pools, how calories are sourced, and
how the randomizer behaves. It's the source of truth for `src/lib/foods.ts` and
`src/lib/randomizer.ts`.

## Data Model

```ts
type Category = "protein" | "legume" | "vegetable" | "fermented" | "herbSpice" | "fat";

interface FoodItem {
  id: string;        // stable unique slug, used in meal ids
  name: string;      // display name
  category: Category;
  calories: number;  // approximate kcal per serving
  serving: string;   // human-readable typical serving, e.g. "1 cup cooked"
  emoji: string;     // display icon
  note?: string;     // optional extra info (allowed-exception flags etc.)
}
```

### Meal

A generated meal always contains one `protein`, one `legume`, one `vegetable`, and — when the
relevant setting is on — one `fermented`, one `herbSpice` and one `fat`. A meal's stable `id` is
the `+`-joined ids of its ingredients, so identical combinations dedupe naturally.

```ts
interface Meal {
  id: string;            // "salmon+pinto-beans+avocado+kimchi+garlic+olive-oil"
  protein: FoodItem;
  legume: FoodItem;
  vegetable: FoodItem;
  fermented?: FoodItem;  // present when includeFermented is on
  herbSpice?: FoodItem;  // present when includeHerbSpice is on
  fat?: FoodItem;        // present when includeFat is on
  calories: number;      // sum of all present ingredients
  generatedAt: number;   // ms timestamp
}
```

### Settings

```ts
interface MealOptions {
  includeFermented: boolean; // default true
  includeHerbSpice: boolean; // default true
  includeFat: boolean;       // default true
  showCalories: boolean;     // default true
}
```

Settings persist in `localStorage` under `scr:settings` (see `src/lib/storage.ts`).

## Calorie Estimates

- Each ingredient has `calories` for a **typical single serving** (see `serving`).
- Meal total = simple sum. No portion logic in v1.
- Figures are ballpark (common nutrition references), shown in the UI as **"≈ N kcal"**.
- The app carries a disclaimer: *estimates, not medical advice / not nutrition facts*.

## v1 Seed Pools

### Protein (11)

| Ingredient | Serving | kcal | Notes |
|------------|---------|-----:|-------|
| Egg whites | 3 large | 51 | add 1 whole egg for flavor |
| Whole eggs | 2 large | 143 | |
| Chicken breast | 6 oz (170g) | 231 | |
| Chicken thigh | 6 oz, skinless | 250 | |
| Grass-fed beef | 6 oz, 90% lean | 270 | |
| Pork loin | 6 oz | 230 | |
| Lamb | 6 oz | 270 | |
| Salmon | 6 oz | 350 | |
| White fish (cod) | 6 oz | 150 | |
| Turkey breast | 6 oz | 190 | |
| Tofu | 6 oz firm | 175 | vegetarian option |

### Legume (6)

| Ingredient | Serving | kcal |
|------------|---------|-----:|
| Lentils | 1 cup cooked | 230 |
| Black beans | 1 cup cooked | 227 |
| Pinto beans | 1 cup cooked | 245 |
| Red beans | 1 cup cooked | 225 |
| Chickpeas | 1 cup cooked | 269 |
| Soybeans / edamame | 1 cup cooked | 254 |

### Vegetable (17)

Includes the diet's allowed list plus the exceptions (tomato, avocado in moderation).

| Ingredient | Serving | kcal | Notes |
|------------|---------|-----:|-------|
| Spinach | 1 cup cooked | 41 | |
| Broccoli | 1 cup cooked | 55 | |
| Cauliflower | 1 cup cooked | 27 | |
| Asparagus | 1 cup cooked | 40 | |
| Peas | 1 cup cooked | 134 | |
| Green beans | 1 cup cooked | 44 | |
| Kale | 1 cup cooked | 42 | |
| Brussels sprouts | 1 cup cooked | 56 | |
| Cabbage | 1 cup cooked | 22 | |
| Mixed vegetables | 1 cup | 60 | |
| Salad greens | 2 cups raw | 15 | |
| Cucumber | 1 cup sliced | 16 | |
| Bell peppers | 1 cup sliced | 30 | |
| Zucchini | 1 cup sliced | 20 | |
| Mushrooms | 1 cup sliced | 28 | |
| Tomatoes | 1 cup | 32 | allowed exception |
| Avocado | ½ medium | 120 | moderation |

### Fermented (optional, 3)

| Ingredient | Serving | kcal | Notes |
|------------|---------|-----:|-------|
| Kimchi | ½ cup | 18 | |
| Sauerkraut | ½ cup | 13 | |
| Dill pickles | 1 cup | 17 | unsweetened only |

### Herb & spice (optional, 13)

Calories are negligible (~2–6 kcal) and always shown small.

Garlic, ginger, chili, cumin, coriander, paprika, turmeric, rosemary, thyme, oregano, basil,
cinnamon, black pepper.

### Healthy fat (optional, 4)

| Ingredient | Serving | kcal | Notes |
|------------|---------|-----:|-------|
| Olive oil | 1 tbsp | 119 | |
| Ghee | 1 tbsp | 112 | |
| Guacamole | 2 tbsp | 45 | |
| Almonds | 1 oz (28g) | 164 | small handful |

## Randomizer Behaviour

- **Fisher–Yates shuffle** for unbiased picks; `pickOne` returns `shuffle(...)[0]`.
- **No-repeat:** a meal whose id appears in the recent history (default last 10, stored in
  `localStorage` under `scr:history`, capped at 20) is re-rolled, up to 20 attempts.
- Meal ids are deterministic per combination, so "like" dedupes identical meals across sessions.
- `random` is injectable for deterministic tests (see `src/lib/randomizer.test.ts`).

## Adding Ingredients

1. Add the item to the matching array in `src/lib/foods.ts`.
2. Use a stable `id`; never reuse an existing one.
3. Provide realistic `serving` and `calories`; add a `note` for diet exceptions.
4. Run `npm run test` (a data-sanity test enforces unique ids, non-negative calories, required
   fields) and `npm run qa`.
5. Keep the ingredient list **strictly slow-carb compliant** — a review step is part of the
   GitHub issue workflow.
