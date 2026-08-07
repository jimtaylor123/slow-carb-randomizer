"use client";

import { useCallback, useState } from "react";
import type { Meal, MealOptions } from "@/lib/foods";
import { DEFAULT_MEAL_OPTIONS } from "@/lib/foods";
import * as storage from "@/lib/storage";
import { useHydrated } from "@/hooks/useHydrated";
import MealCard from "@/components/MealCard";
import BottomNav from "@/components/BottomNav";

interface HydratedState {
  saved: Meal[];
  settings: MealOptions;
}

const EMPTY_STATE: HydratedState = {
  saved: [],
  settings: DEFAULT_MEAL_OPTIONS,
};

export default function Saved() {
  const [hydrated, mounted] = useHydrated(
    () => ({ saved: storage.loadSavedMeals(), settings: storage.loadSettings() }),
    EMPTY_STATE,
  );
  const [saved, setSaved] = useState<Meal[] | null>(null);

  if (mounted && saved === null) {
    setSaved(hydrated.saved);
  }

  const meals = saved ?? [];

  const remove = useCallback((meal: Meal) => {
    setSaved((current) => {
      if (!current) return current;
      const next = current.filter((m) => m.id !== meal.id);
      storage.saveSavedMeals(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSaved([]);
    storage.saveSavedMeals([]);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">My Meals</h1>
          {mounted && meals.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              Clear all
            </button>
          )}
        </header>

        {!mounted ? (
          <div className="space-y-3">
            <div className="h-40 animate-pulse rounded-2xl bg-zinc-900" />
            <div className="h-40 animate-pulse rounded-2xl bg-zinc-900" />
          </div>
        ) : meals.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="text-5xl" aria-hidden>
              🥘
            </span>
            <p className="text-sm text-zinc-400">
              No saved meals yet. Shake up a combo you like and hit
              &ldquo;Like &amp; save&rdquo;.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {meals.map((meal) => (
              <li key={meal.id} className="space-y-2">
                <MealCard meal={meal} showCalories={hydrated.settings.showCalories} />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(meal)}
                    className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav savedCount={meals.length} />
    </div>
  );
}
