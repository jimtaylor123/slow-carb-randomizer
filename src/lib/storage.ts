import type { Meal, MealOptions } from "./foods";
import { DEFAULT_MEAL_OPTIONS } from "./foods";

const KEYS = {
  saved: "scr:saved",
  settings: "scr:settings",
  history: "scr:history",
} as const;

const HISTORY_LIMIT = 20;

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode, quota) — fail silently.
  }
}

export function loadSavedMeals(): Meal[] {
  return read<Meal[]>(KEYS.saved) ?? [];
}

export function saveSavedMeals(meals: Meal[]): void {
  write(KEYS.saved, meals);
}

export function isMealSaved(saved: Meal[], meal: Meal): boolean {
  return saved.some((m) => m.id === meal.id);
}

export function toggleSavedMeal(meals: Meal[], meal: Meal): Meal[] {
  if (isMealSaved(meals, meal)) {
    return meals.filter((m) => m.id !== meal.id);
  }
  return [meal, ...meals];
}

export function loadSettings(): MealOptions {
  return { ...DEFAULT_MEAL_OPTIONS, ...(read<Partial<MealOptions>>(KEYS.settings) ?? {}) };
}

export function saveSettings(settings: MealOptions): void {
  write(KEYS.settings, settings);
}

export function loadHistory(): string[] {
  return read<string[]>(KEYS.history) ?? [];
}

export function saveHistory(ids: string[]): void {
  write(KEYS.history, ids.slice(0, HISTORY_LIMIT));
}

export function pushHistory(ids: string[], mealId: string): string[] {
  const next = [mealId, ...ids.filter((id) => id !== mealId)].slice(0, HISTORY_LIMIT);
  saveHistory(next);
  return next;
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEYS.saved);
    window.localStorage.removeItem(KEYS.settings);
    window.localStorage.removeItem(KEYS.history);
  } catch {
    // ignore
  }
}
