import { Share } from "@capacitor/share";
import type { Meal } from "./foods";
import { mealToText } from "./randomizer";

export interface SharePayload {
  title: string;
  text: string;
}

export type ShareOutcome =
  | { method: "share-sheet" }
  | { method: "clipboard" }
  | { method: "unsupported"; text: string };

export function buildSharePayload(
  meal: Meal,
  { showCalories }: { showCalories: boolean },
): SharePayload {
  const parts = [mealToText(meal)];
  if (showCalories) parts.push(`≈ ${meal.calories} kcal`);
  parts.push("", "From Slow Carb Randomizer");
  return { title: "My slow-carb meal", text: parts.join("\n") };
}

export async function shareMeal(
  meal: Meal,
  { showCalories }: { showCalories: boolean },
): Promise<ShareOutcome> {
  const payload = buildSharePayload(meal, { showCalories });
  const can = await Share.canShare().catch(() => ({ value: false }));

  if (can.value) {
    try {
      await Share.share({ ...payload, dialogTitle: "Share meal" });
      return { method: "share-sheet" };
    } catch (error) {
      const cancelled =
        error instanceof Error &&
        (error.name === "AbortError" || /cancel/i.test(error.message));
      if (cancelled) {
        return { method: "share-sheet" };
      }
    }
  }

  // The clipboard and unsupported paths are web-only: native canShare() is always true.
  const clipboard = navigator.clipboard;
  if (!clipboard?.writeText) {
    return { method: "unsupported", text: payload.text };
  }
  try {
    await clipboard.writeText(payload.text);
    return { method: "clipboard" };
  } catch {
    return { method: "unsupported", text: payload.text };
  }
}
