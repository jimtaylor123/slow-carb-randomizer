import { describe, expect, it, beforeEach } from "vitest";
import { FOODS, type Meal } from "./foods";
import {
  clearAllData,
  isMealSaved,
  loadHistory,
  loadSavedMeals,
  loadSettings,
  loadSoundEnabled,
  pushHistory,
  saveHistory,
  saveSavedMeals,
  saveSettings,
  saveSoundEnabled,
  toggleSavedMeal,
} from "./storage";

function sampleMeal(id: string): Meal {
  return {
    id,
    protein: FOODS.protein[0],
    legume: FOODS.legume[0],
    vegetable: FOODS.vegetable[0],
    calories: 100,
    generatedAt: Date.now(),
  };
}

const defaultSettings = {
  includeFermented: true,
  includeHerbSpice: true,
  includeFat: true,
  showCalories: true,
};

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads saved meals", () => {
    const meals = [sampleMeal("a"), sampleMeal("b")];
    saveSavedMeals(meals);
    expect(loadSavedMeals()).toEqual(meals);
  });

  it("returns an empty list when nothing is saved", () => {
    expect(loadSavedMeals()).toEqual([]);
  });

  it("toggleSavedMeal adds and removes a meal", () => {
    const meal = sampleMeal("x");
    let saved = toggleSavedMeal([], meal);
    expect(isMealSaved(saved, meal)).toBe(true);
    expect(saved).toHaveLength(1);

    saved = toggleSavedMeal(saved, meal);
    expect(isMealSaved(saved, meal)).toBe(false);
    expect(saved).toHaveLength(0);
  });

  it("persists settings with defaults merged", () => {
    saveSettings({ ...defaultSettings, includeFat: false });
    const loaded = loadSettings();
    expect(loaded.includeFat).toBe(false);
    expect(loaded.includeFermented).toBe(true);
  });

  it("tracks history ids, deduping and capping length", () => {
    const ids = Array.from({ length: 25 }, (_, i) => `meal-${i}`);
    saveHistory(ids);
    expect(loadHistory()).toHaveLength(20);

    let history = loadHistory();
    history = pushHistory(history, "meal-5");
    expect(history[0]).toBe("meal-5");
    expect(history.filter((id) => id === "meal-5")).toHaveLength(1);
  });

  it("clearAllData wipes saved, settings and history", () => {
    saveSavedMeals([sampleMeal("a")]);
    saveSettings(defaultSettings);
    saveHistory(["meal-1"]);
    saveSoundEnabled(false);
    clearAllData();
    expect(loadSavedMeals()).toEqual([]);
    expect(loadSettings()).toEqual(defaultSettings);
    expect(loadHistory()).toEqual([]);
    expect(loadSoundEnabled()).toBe(true);
  });

  it("sound enabled defaults to true", () => {
    expect(loadSoundEnabled()).toBe(true);
  });

  it("saves and loads the sound enabled flag", () => {
    saveSoundEnabled(false);
    expect(loadSoundEnabled()).toBe(false);
    saveSoundEnabled(true);
    expect(loadSoundEnabled()).toBe(true);
  });

  it("is safe before hydration (no window)", () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", { value: undefined, configurable: true });
    expect(loadSavedMeals()).toEqual([]);
    expect(loadSettings()).toEqual(defaultSettings);
    expect(loadSoundEnabled()).toBe(true);
    Object.defineProperty(globalThis, "window", { value: originalWindow, configurable: true });
  });
});
