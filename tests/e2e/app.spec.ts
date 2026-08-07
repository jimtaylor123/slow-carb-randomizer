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

test("sharing a meal invokes the web share API with the meal text", async ({ page }) => {
  interface SharedData {
    title: string;
    text: string;
  }

  await page.addInitScript(() => {
    const win = window as unknown as { __sharedData: unknown };
    const shareImpl = (data: unknown) => {
      win.__sharedData = data;
      return Promise.resolve();
    };
    Object.defineProperty(window.navigator, "share", { configurable: true, value: shareImpl });
    Object.defineProperty(Navigator.prototype, "share", { configurable: true, value: shareImpl });
    win.__sharedData = null;
  });

  await page.goto("/");
  const shareButton = page.getByRole("button", { name: /share/i });
  await expect(shareButton).toBeVisible();
  const ingredientNames = await page.locator("p.font-medium").allTextContents();

  await shareButton.click();
  await page.waitForFunction(
    () => (window as unknown as { __sharedData: unknown }).__sharedData !== null,
  );

  const data = await page.evaluate(
    () =>
      (window as unknown as { __sharedData: SharedData }).__sharedData as SharedData,
  );
  expect(data.title).toBe("My slow-carb meal");
  expect(data.text).toContain(ingredientNames[0]);
  expect(data.text).toContain(ingredientNames[1]);
  expect(data.text).toContain("From Slow Carb Randomizer");
});

test("sharing falls back to a clipboard notice when the share API is missing", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(Navigator.prototype, "share", { configurable: true, value: undefined });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /share/i }).click();
  await expect(page.getByText(/meal copied to clipboard/i)).toBeVisible();
});

test("sharing renders the inline text block when share and clipboard both fail", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(Navigator.prototype, "share", { configurable: true, value: undefined });
    const clipboard = window.navigator.clipboard;
    if (clipboard) {
      Object.defineProperty(clipboard, "writeText", {
        configurable: true,
        value: () => Promise.reject(new Error("clipboard blocked")),
      });
    }
  });
  await page.goto("/");
  const shareButton = page.getByRole("button", { name: /share/i });
  await expect(shareButton).toBeVisible();
  await shareButton.click();
  await expect(page.getByText(/open the share sheet/i)).toBeVisible();
  await expect(page.getByText(/from slow carb randomizer/i)).toBeVisible();
});
