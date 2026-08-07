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

const canShareMock = vi.mocked(Share.canShare);
const shareMock = vi.mocked(Share.share);

beforeEach(() => {
  vi.clearAllMocks();
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
    shareMock.mockResolvedValue(undefined);

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

  it("falls back to the clipboard when the share call fails", async () => {
    canShareMock.mockResolvedValue({ value: true });
    shareMock.mockRejectedValue(new Error("share unavailable"));

    const outcome = await shareMeal(meal, { showCalories: true });

    expect(outcome).toEqual({ method: "clipboard" });
    expect(vi.mocked(navigator.clipboard.writeText)).toHaveBeenCalled();
  });

  it("treats a cancelled share sheet as a no-op", async () => {
    canShareMock.mockResolvedValue({ value: true });
    const abort = new Error("user cancelled");
    abort.name = "AbortError";
    shareMock.mockRejectedValue(abort);

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

    expect(outcome).toEqual({ method: "unsupported" });
  });
});
