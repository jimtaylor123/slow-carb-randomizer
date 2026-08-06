import { expect, test } from "@playwright/test";

test("generator shows a meal and rerolls it", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /slow carb randomizer/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/generate a new meal/i)).toBeVisible();
  await expect(page.locator("text=Protein").first()).toBeVisible();
  await expect(page.locator("text=Legume").first()).toBeVisible();
  await expect(page.locator("text=Vegetable").first()).toBeVisible();
});

test("liking a meal saves it and it appears in My Meals", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /like & save/i }).click();
  await expect(page.getByRole("button", { name: /saved/i })).toBeVisible();

  await page.getByRole("link", { name: "Saved" }).click();
  await expect(page.getByRole("heading", { name: /my meals/i })).toBeVisible();
  await expect(page.locator("text=Remove").first()).toBeVisible();
});

test("a saved meal can be removed from My Meals", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /like & save/i }).click();
  await page.getByRole("link", { name: "Saved" }).click();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText(/no saved meals yet/i)).toBeVisible();
});

test("settings toggles persist", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();

  const fatToggle = page.getByRole("button", { name: /healthy fats/i });
  await fatToggle.click();

  await page.getByRole("link", { name: "Shake" }).click();
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("button", { name: /healthy fats/i })).toBeVisible();
});

test("diet page lists the five rules", async ({ page }) => {
  await page.goto("/diet");
  await expect(page.getByRole("heading", { name: /the slow-carb diet/i })).toBeVisible();
  await expect(page.getByText(/rule 1/i)).toBeVisible();
  await expect(page.getByText(/rule 5/i)).toBeVisible();
});
