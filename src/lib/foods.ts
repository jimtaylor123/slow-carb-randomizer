export type Category =
  | "protein"
  | "legume"
  | "vegetable"
  | "fermented"
  | "herbSpice"
  | "fat";

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  calories: number;
  serving: string;
  emoji: string;
  note?: string;
}

export interface Foods {
  protein: FoodItem[];
  legume: FoodItem[];
  vegetable: FoodItem[];
  fermented: FoodItem[];
  herbSpice: FoodItem[];
  fat: FoodItem[];
}

export interface MealOptions {
  includeFermented: boolean;
  includeHerbSpice: boolean;
  includeFat: boolean;
  showCalories: boolean;
}

export const DEFAULT_MEAL_OPTIONS: MealOptions = {
  includeFermented: true,
  includeHerbSpice: true,
  includeFat: true,
  showCalories: true,
};

export interface Meal {
  id: string;
  protein: FoodItem;
  legume: FoodItem;
  vegetable: FoodItem;
  fermented?: FoodItem;
  herbSpice?: FoodItem;
  fat?: FoodItem;
  calories: number;
  generatedAt: number;
}

const protein: FoodItem[] = [
  { id: "egg-whites", name: "Egg whites", category: "protein", calories: 51, serving: "3 large", emoji: "🥚", note: "Add 1 whole egg for flavor" },
  { id: "whole-eggs", name: "Whole eggs", category: "protein", calories: 143, serving: "2 large", emoji: "🍳" },
  { id: "chicken-breast", name: "Chicken breast", category: "protein", calories: 231, serving: "6 oz (170g)", emoji: "🍗" },
  { id: "chicken-thigh", name: "Chicken thigh", category: "protein", calories: 250, serving: "6 oz (170g), skinless", emoji: "🍗" },
  { id: "beef", name: "Grass-fed beef", category: "protein", calories: 270, serving: "6 oz (170g), 90% lean", emoji: "🥩" },
  { id: "pork", name: "Pork loin", category: "protein", calories: 230, serving: "6 oz (170g)", emoji: "🥓" },
  { id: "lamb", name: "Lamb", category: "protein", calories: 270, serving: "6 oz (170g)", emoji: "🍖" },
  { id: "salmon", name: "Salmon", category: "protein", calories: 350, serving: "6 oz (170g)", emoji: "🐟" },
  { id: "white-fish", name: "White fish", category: "protein", calories: 150, serving: "6 oz (170g), e.g. cod", emoji: "🐠" },
  { id: "turkey", name: "Turkey breast", category: "protein", calories: 190, serving: "6 oz (170g)", emoji: "🦃" },
  { id: "tofu", name: "Tofu", category: "protein", calories: 175, serving: "6 oz (170g), firm", emoji: "🫘", note: "Vegetarian option" },
];

const legume: FoodItem[] = [
  { id: "lentils", name: "Lentils", category: "legume", calories: 230, serving: "1 cup cooked", emoji: "🫘" },
  { id: "black-beans", name: "Black beans", category: "legume", calories: 227, serving: "1 cup cooked", emoji: "🫘" },
  { id: "pinto-beans", name: "Pinto beans", category: "legume", calories: 245, serving: "1 cup cooked", emoji: "🫘" },
  { id: "red-beans", name: "Red beans", category: "legume", calories: 225, serving: "1 cup cooked", emoji: "🫘" },
  { id: "chickpeas", name: "Chickpeas", category: "legume", calories: 269, serving: "1 cup cooked", emoji: "🫘" },
  { id: "soybeans", name: "Soybeans / edamame", category: "legume", calories: 254, serving: "1 cup cooked", emoji: "🫛" },
];

const vegetable: FoodItem[] = [
  { id: "spinach", name: "Spinach", category: "vegetable", calories: 41, serving: "1 cup cooked", emoji: "🥬" },
  { id: "broccoli", name: "Broccoli", category: "vegetable", calories: 55, serving: "1 cup cooked", emoji: "🥦" },
  { id: "cauliflower", name: "Cauliflower", category: "vegetable", calories: 27, serving: "1 cup cooked", emoji: "🥦" },
  { id: "asparagus", name: "Asparagus", category: "vegetable", calories: 40, serving: "1 cup cooked", emoji: "🥒" },
  { id: "peas", name: "Peas", category: "vegetable", calories: 134, serving: "1 cup cooked", emoji: "🫛" },
  { id: "green-beans", name: "Green beans", category: "vegetable", calories: 44, serving: "1 cup cooked", emoji: "🫛" },
  { id: "kale", name: "Kale", category: "vegetable", calories: 42, serving: "1 cup cooked", emoji: "🥬" },
  { id: "brussels", name: "Brussels sprouts", category: "vegetable", calories: 56, serving: "1 cup cooked", emoji: "🥬" },
  { id: "cabbage", name: "Cabbage", category: "vegetable", calories: 22, serving: "1 cup cooked", emoji: "🥬" },
  { id: "mixed-veg", name: "Mixed vegetables", category: "vegetable", calories: 60, serving: "1 cup", emoji: "🥕" },
  { id: "salad-greens", name: "Salad greens", category: "vegetable", calories: 15, serving: "2 cups raw", emoji: "🥗" },
  { id: "cucumber", name: "Cucumber", category: "vegetable", calories: 16, serving: "1 cup sliced", emoji: "🥒" },
  { id: "bell-pepper", name: "Bell peppers", category: "vegetable", calories: 30, serving: "1 cup sliced", emoji: "🫑" },
  { id: "zucchini", name: "Zucchini", category: "vegetable", calories: 20, serving: "1 cup sliced", emoji: "🥒" },
  { id: "mushrooms", name: "Mushrooms", category: "vegetable", calories: 28, serving: "1 cup sliced", emoji: "🍄" },
  { id: "tomatoes", name: "Tomatoes", category: "vegetable", calories: 32, serving: "1 cup", emoji: "🍅", note: "Allowed exception to no-fruit rule" },
  { id: "avocado", name: "Avocado", category: "vegetable", calories: 120, serving: "½ medium", emoji: "🥑", note: "Allowed in moderation" },
];

const fermented: FoodItem[] = [
  { id: "kimchi", name: "Kimchi", category: "fermented", calories: 18, serving: "½ cup", emoji: "🥬" },
  { id: "sauerkraut", name: "Sauerkraut", category: "fermented", calories: 13, serving: "½ cup", emoji: "🥬" },
  { id: "pickles", name: "Dill pickles", category: "fermented", calories: 17, serving: "1 cup", emoji: "🥒", note: "Unsweetened only" },
];

const herbSpice: FoodItem[] = [
  { id: "garlic", name: "Garlic", category: "herbSpice", calories: 5, serving: "1–2 cloves", emoji: "🧄" },
  { id: "ginger", name: "Ginger", category: "herbSpice", calories: 5, serving: "1 tbsp grated", emoji: "🫚" },
  { id: "chili", name: "Chili", category: "herbSpice", calories: 2, serving: "to taste", emoji: "🌶️" },
  { id: "cumin", name: "Cumin", category: "herbSpice", calories: 4, serving: "1 tsp", emoji: "🫙" },
  { id: "coriander", name: "Coriander", category: "herbSpice", calories: 4, serving: "1 tsp", emoji: "🌿" },
  { id: "paprika", name: "Paprika", category: "herbSpice", calories: 6, serving: "1 tsp", emoji: "🫙" },
  { id: "turmeric", name: "Turmeric", category: "herbSpice", calories: 4, serving: "1 tsp", emoji: "🫙" },
  { id: "rosemary", name: "Rosemary", category: "herbSpice", calories: 2, serving: "1 sprig", emoji: "🌿" },
  { id: "thyme", name: "Thyme", category: "herbSpice", calories: 2, serving: "1 tsp", emoji: "🌿" },
  { id: "oregano", name: "Oregano", category: "herbSpice", calories: 3, serving: "1 tsp", emoji: "🌿" },
  { id: "basil", name: "Basil", category: "herbSpice", calories: 2, serving: "handful", emoji: "🌿" },
  { id: "cinnamon", name: "Cinnamon", category: "herbSpice", calories: 6, serving: "½ tsp", emoji: "🫙" },
  { id: "pepper", name: "Black pepper", category: "herbSpice", calories: 3, serving: "to taste", emoji: "🧂" },
];

const fat: FoodItem[] = [
  { id: "olive-oil", name: "Olive oil", category: "fat", calories: 119, serving: "1 tbsp", emoji: "🫒" },
  { id: "ghee", name: "Ghee", category: "fat", calories: 112, serving: "1 tbsp", emoji: "🧈" },
  { id: "guacamole", name: "Guacamole", category: "fat", calories: 45, serving: "2 tbsp", emoji: "🥑" },
  { id: "nuts", name: "Nuts (almonds)", category: "fat", calories: 164, serving: "1 oz (28g)", emoji: "🌰", note: "Small handful" },
];

export const FOODS: Foods = {
  protein,
  legume,
  vegetable,
  fermented,
  herbSpice,
  fat,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  protein: "Protein",
  legume: "Legume",
  vegetable: "Vegetable",
  fermented: "Fermented",
  herbSpice: "Herb & spice",
  fat: "Healthy fat",
};

export function byId(foods: Foods, id: string): FoodItem | undefined {
  for (const list of Object.values(foods)) {
    const found = list.find((item: FoodItem) => item.id === id);
    if (found) return found;
  }
  return undefined;
}
