import { beforeEach, describe, expect, it, vi } from "vitest";
import { Share } from "@capacitor/share";
import { FOODS } from "./foods";
import { generateMeal } from "./randomizer";
import { buildSharePayload, shareMeal } from "./share";

vi.mock("@capacitor/share", () => ({
  Share: {
    canShare: vi.fn(),
    share: vi.fn(),
  },
}));

const meal = generateMeal({
  foods: FOODS,
  options: { includeFermented: true, includeHerbSpice: true, includeFat: true, showCalories: true },
  history: [],
});

const coreMeal = generateMeal({
  foods: FOODS,
  options: { includeFermented: false, includeHerbSpice: false, includeFat: false, showCalories: true },
  history: [],
});

const canShareMock = vi.mocked(Share.canShare);
const shareMock = vi.mocked(Share.share);

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
});

describe("buildSharePayload", () => {
  it("includes every present slot", () => {
    const payload = buildSharePayload(meal, { showCalories: true });
    expect(payload.text).toContain(meal.protein.name);
    expect(payload.text).toContain(meal.legume.name);
    expect(payload.text).toContain(meal.vegetable.name);
    if (meal.fermented) expect(payload.text).toContain(meal.fermented.name);
    if (meal.herbSpice) expect(payload.text).toContain(meal.herbSpice.name);
    if (meal.fat) expect(payload.text).toContain(meal.fat.name);
  });

  it("renders only core slots for a meal without optional slots", () => {
    const payload = buildSharePayload(coreMeal, { showCalories: true });
    const lines = payload.text.split("\n").filter(Boolean);
    expect(lines).toHaveLength(5);
    expect(payload.text).toContain(coreMeal.protein.name);
    expect(payload.text).toContain(coreMeal.legume.name);
    expect(payload.text).toContain(coreMeal.vegetable.name);
  });

  it("omits the calorie line when disabled", () => {
    const payload = buildSharePayload(meal, { showCalories: false });
    expect(payload.text).not.toContain("kcal");
  });

  it("includes the calorie line when enabled", () => {
    const payload = buildSharePayload(meal, { showCalories: true });
    expect(payload.text).toContain(`≈ ${meal.calories} kcal`);
  });

  it("appends the brand footer", () => {
    const payload = buildSharePayload(meal, { showCalories: false });
    expect(payload.text).toContain("From Slow Carb Randomizer");
  });

  it("uses a share title", () => {
    expect(buildSharePayload(meal, { showCalories: false }).title).toBe("My slow-carb meal");
  });
});

describe("shareMeal", () => {
  it("uses the native share sheet when available", async () => {
    canShareMock.mockResolvedValue({ value: true });
    shareMock.mockResolvedValue({});

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({ method: "share-sheet" });
    expect(shareMock).toHaveBeenCalledWith({
      title: "My slow-carb meal",
      text: expect.stringContaining(meal.protein.name),
      dialogTitle: "Share meal",
    });
  });

  it("falls back to the clipboard when sharing is unavailable", async () => {
    canShareMock.mockResolvedValue({ value: false });

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({ method: "clipboard" });
    expect(vi.mocked(navigator.clipboard.writeText)).toHaveBeenCalledWith(
      expect.stringContaining(meal.protein.name),
    );
  });

  it("falls back to the clipboard when canShare rejects", async () => {
    canShareMock.mockRejectedValue(new Error("plugin error"));

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({ method: "clipboard" });
    expect(vi.mocked(navigator.clipboard.writeText)).toHaveBeenCalled();
  });

  it("falls back to the clipboard when the share call fails", async () => {
    canShareMock.mockResolvedValue({ value: true });
    shareMock.mockRejectedValue(new Error("share unavailable"));

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({ method: "clipboard" });
    expect(vi.mocked(navigator.clipboard.writeText)).toHaveBeenCalled();
  });

  it("treats a cancelled web share sheet as a no-op", async () => {
    canShareMock.mockResolvedValue({ value: true });
    const abort = new Error("user cancelled");
    abort.name = "AbortError";
    shareMock.mockRejectedValue(abort);

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({ method: "share-sheet" });
    expect(vi.mocked(navigator.clipboard.writeText)).not.toHaveBeenCalled();
  });

  it("treats a cancelled native share sheet as a no-op", async () => {
    canShareMock.mockResolvedValue({ value: true });
    shareMock.mockRejectedValue(new Error("Share canceled"));

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({ method: "share-sheet" });
    expect(vi.mocked(navigator.clipboard.writeText)).not.toHaveBeenCalled();
  });

  it("returns unsupported when both share and clipboard fail", async () => {
    canShareMock.mockResolvedValue({ value: false });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({
      method: "unsupported",
      text: expect.stringContaining(meal.protein.name),
    });
  });

  it("returns unsupported when the clipboard API is missing", async () => {
    canShareMock.mockResolvedValue({ value: false });
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({
      method: "unsupported",
      text: expect.stringContaining(meal.protein.name),
    });
  });
});
