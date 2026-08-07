"use client";

import { useCallback, useState } from "react";
import { FOODS, type Meal, type MealOptions, DEFAULT_MEAL_OPTIONS } from "@/lib/foods";
import { generateMeal } from "@/lib/randomizer";
import { buildSharePayload, shareMeal } from "@/lib/share";
import * as storage from "@/lib/storage";
import { useShake } from "@/hooks/useShake";
import { useHydrated } from "@/hooks/useHydrated";
import MealCard from "@/components/MealCard";
import BottomNav from "@/components/BottomNav";

interface HydratedState {
  settings: MealOptions;
  history: string[];
  saved: Meal[];
}

interface LocalState {
  history: string[];
  saved: Meal[];
}

const EMPTY_STATE: HydratedState = {
  settings: DEFAULT_MEAL_OPTIONS,
  history: [],
  saved: [],
};

export default function Generator() {
  const [hydrated, mounted] = useHydrated(
    () => ({
      settings: storage.loadSettings(),
      history: storage.loadHistory(),
      saved: storage.loadSavedMeals(),
    }),
    EMPTY_STATE,
  );

  const [local, setLocal] = useState<LocalState | null>(null);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unsupportedText, setUnsupportedText] = useState<string | null>(null);

  // Populate local state once the real stored values are available.
  if (mounted && local === null) {
    setLocal({ history: hydrated.history, saved: hydrated.saved });
  }

  const settings = hydrated.settings;
  const history = local?.history ?? [];
  const savedMeals = local?.saved ?? [];

  // Generate the first meal once the real settings are available.
  if (mounted && meal === null) {
    setMeal(generateMeal({ foods: FOODS, options: settings, history }));
  }

  const reroll = useCallback(() => {
    if (!local) return;
    const next = generateMeal({
      foods: FOODS,
      options: settings,
      history: [meal ? meal.id : "", ...local.history],
    });
    setMeal(next);
    setLocal({ ...local, history: storage.pushHistory(local.history, next.id) });
  }, [settings, meal, local]);

  const { trigger } = useShake(reroll, mounted);

  const toggleSave = useCallback(() => {
    if (!meal || !local) return;
    const next = storage.toggleSavedMeal(local.saved, meal);
    storage.saveSavedMeals(next);
    setLocal({ ...local, saved: next });
    setNotice("Saved to your meals 💚");
    window.setTimeout(() => setNotice(null), 800);
  }, [meal, local]);

  const share = useCallback(async () => {
    if (!meal) return;
    setUnsupportedText(null);
    const outcome = await shareMeal(meal, { showCalories: settings.showCalories });
    if (outcome.method === "clipboard") {
      setNotice("Meal copied to clipboard 💚");
      window.setTimeout(() => setNotice(null), 2000);
    } else if (outcome.method === "unsupported") {
      setUnsupportedText(
        buildSharePayload(meal, { showCalories: settings.showCalories }).text,
      );
    }
  }, [meal, settings.showCalories]);

  const savedIds = savedMeals.map((m) => m.id);
  const isSaved = meal !== null && savedIds.includes(meal.id);

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-8 pt-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Slow Carb<span className="text-emerald-400"> Randomizer</span>
            </h1>
            <p className="text-xs text-zinc-500">Shake to cook something new</p>
          </div>
          {mounted && meal && settings.showCalories && (
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold tabular-nums text-emerald-300">
              ≈ {meal.calories} kcal
            </div>
          )}
        </header>

        <section className="flex flex-1 flex-col items-center justify-center gap-6">
          {!mounted || !meal ? (
            <div className="h-64 w-full animate-pulse rounded-2xl bg-zinc-900" />
          ) : (
            <MealCard meal={meal} showCalories={settings.showCalories} />
          )}

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={trigger}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 text-5xl font-black text-zinc-950 shadow-lg shadow-emerald-500/30 transition-transform active:scale-90"
              aria-label="Generate a new meal (or shake your device)"
            >
              🍲
            </button>
            <p className="text-xs text-zinc-500">
              Shake your device or tap the pot to reroll
            </p>
          </div>

          {mounted && meal && (
            <div className="flex w-full max-w-xs items-center gap-2">
              <button
                type="button"
                onClick={toggleSave}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isSaved
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {isSaved ? "Saved" : "Like & save"}
                <span aria-hidden>{isSaved ? "❤️" : "🤍"}</span>
              </button>
              <button
                type="button"
                onClick={share}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700"
                aria-label="Share this meal"
              >
                Share
                <span aria-hidden>📤</span>
              </button>
            </div>
          )}

          {unsupportedText && (
            <div className="w-full max-w-xs rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="mb-2 text-xs text-zinc-400">
                Your browser can&rsquo;t open the share sheet — copy the text below:
              </p>
              <p className="select-all whitespace-pre-wrap text-sm text-zinc-100">
                {unsupportedText}
              </p>
            </div>
          )}
        </section>

        {notice && (
          <p className="text-center text-xs text-emerald-400">{notice}</p>
        )}
      </main>

      <BottomNav savedCount={savedMeals.length} />
    </div>
  );
}
