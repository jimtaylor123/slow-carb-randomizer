"use client";

import type { FoodItem, Meal } from "@/lib/foods";
import { CATEGORY_LABELS } from "@/lib/foods";

function Row({
  item,
  showCalories,
  optional,
}: {
  item?: FoodItem;
  showCalories: boolean;
  optional?: boolean;
}) {
  if (!item) return null;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-3 py-2 ${
        optional
          ? "border-dashed border-zinc-700 bg-zinc-900/40"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {item.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-100">{item.name}</p>
        <p className="text-xs text-zinc-500">
          {CATEGORY_LABELS[item.category]}
          {optional ? " · optional" : ""}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {item.serving}
          {item.note ? ` · ${item.note}` : ""}
        </p>
      </div>
      {showCalories && (
        <span className="shrink-0 pt-0.5 text-xs tabular-nums text-zinc-500">
          ~{item.calories} kcal
        </span>
      )}
    </div>
  );
}

export default function MealCard({
  meal,
  showCalories,
}: {
  meal: Meal;
  showCalories: boolean;
}) {
  return (
    <div className="w-full space-y-2">
      <Row item={meal.protein} showCalories={showCalories} />
      <Row item={meal.legume} showCalories={showCalories} />
      <Row item={meal.vegetable} showCalories={showCalories} />
      <Row item={meal.fermented} showCalories={showCalories} optional />
      <Row item={meal.herbSpice} showCalories={showCalories} optional />
      <Row item={meal.fat} showCalories={showCalories} optional />
    </div>
  );
}
