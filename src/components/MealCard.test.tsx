import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FOODS } from "@/lib/foods";
import { generateMeal } from "@/lib/randomizer";
import MealCard from "./MealCard";

const meal = generateMeal({
  foods: FOODS,
  options: { includeFermented: true, includeHerbSpice: true, includeFat: true, showCalories: true },
  history: [],
});

describe("MealCard", () => {
  it("renders the three core ingredients", () => {
    render(<MealCard meal={meal} showCalories={true} />);
    expect(screen.getByText(meal.protein.name)).toBeInTheDocument();
    expect(screen.getByText(meal.legume.name)).toBeInTheDocument();
    expect(screen.getByText(meal.vegetable.name)).toBeInTheDocument();
  });

  it("renders optional slots when present", () => {
    render(<MealCard meal={meal} showCalories={true} />);
    if (meal.fermented) expect(screen.getByText(meal.fermented.name)).toBeInTheDocument();
    if (meal.herbSpice) expect(screen.getByText(meal.herbSpice.name)).toBeInTheDocument();
    if (meal.fat) expect(screen.getByText(meal.fat.name)).toBeInTheDocument();
  });

  it("hides calorie figures when showCalories is false", () => {
    render(<MealCard meal={meal} showCalories={false} />);
    expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
  });

  it("shows calorie figures per ingredient when enabled", () => {
    render(<MealCard meal={meal} showCalories={true} />);
    const kcal = screen.getAllByText(/kcal/);
    expect(kcal.length).toBeGreaterThanOrEqual(3);
    expect(within(kcal[0]).getByText(/kcal/)).toBeInTheDocument();
  });
});
