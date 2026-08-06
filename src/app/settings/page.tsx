"use client";

import { useState } from "react";
import type { MealOptions } from "@/lib/foods";
import { DEFAULT_MEAL_OPTIONS } from "@/lib/foods";
import * as storage from "@/lib/storage";
import { useHydrated } from "@/hooks/useHydrated";
import BottomNav from "@/components/BottomNav";

type ToggleKey = keyof MealOptions;

const TOGGLES: { key: ToggleKey; label: string; hint: string }[] = [
  {
    key: "includeFermented",
    label: "Fermented foods",
    hint: "Kimchi, sauerkraut, dill pickles",
  },
  {
    key: "includeHerbSpice",
    label: "Herbs & spices",
    hint: "Garlic, ginger, cumin, chili…",
  },
  {
    key: "includeFat",
    label: "Healthy fats",
    hint: "Olive oil, ghee, guacamole, nuts",
  },
  {
    key: "showCalories",
    label: "Show calorie estimates",
    hint: "Rough per-serving approximations",
  },
];

export default function Settings() {
  const [hydratedSettings, mounted] = useHydrated(
    () => storage.loadSettings(),
    DEFAULT_MEAL_OPTIONS,
  );
  const [settings, setSettings] = useState<MealOptions | null>(null);

  if (mounted && settings === null) {
    setSettings(hydratedSettings);
  }

  const current = settings ?? DEFAULT_MEAL_OPTIONS;

  const update = (key: ToggleKey) => {
    setSettings((value) => {
      if (!value) return value;
      const next = { ...value, [key]: !value[key] };
      storage.saveSettings(next);
      return next;
    });
  };

  const resetData = () => {
    storage.clearAllData();
    setSettings(DEFAULT_MEAL_OPTIONS);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-8 pt-6">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Meal options
          </h2>
          {!mounted ? (
            <div className="h-48 animate-pulse rounded-2xl bg-zinc-900" />
          ) : (
            <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              {TOGGLES.map((toggle) => (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => update(toggle.key)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span>
                    <span className="block text-sm font-medium text-zinc-100">
                      {toggle.label}
                    </span>
                    <span className="block text-xs text-zinc-500">{toggle.hint}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      current[toggle.key] ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        current[toggle.key] ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Data
          </h2>
          <button
            type="button"
            onClick={resetData}
            className="w-full rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
          >
            Reset all data
            <span className="block text-xs font-normal text-zinc-500">
              Clears saved meals, history and settings on this device.
            </span>
          </button>
        </section>

        <p className="text-xs leading-relaxed text-zinc-600">
          Everything is stored locally on this device — no accounts, no servers.
          Calorie figures are rough approximations and not medical advice.
        </p>
      </main>

      <BottomNav savedCount={0} />
    </div>
  );
}
