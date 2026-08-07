import { expect, test } from "@playwright/test";

function motionPermissionInitScript(state: "granted" | "denied") {
  return () => {
    const win = window as unknown as { __permissionCalls: number };
    win.__permissionCalls = 0;
    if (typeof DeviceMotionEvent !== "undefined") {
      Object.defineProperty(DeviceMotionEvent, "requestPermission", {
        configurable: true,
        value: () => {
          win.__permissionCalls += 1;
          return Promise.resolve(state);
        },
      });
    }
  };
}

test("sound effects toggle persists", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();

  const soundToggle = page.getByRole("button", { name: /sound effects/i });
  await expect(soundToggle).toHaveAttribute("aria-pressed", "true");
  await soundToggle.click();
  await expect(soundToggle).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("link", { name: "Shake" }).click();
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("button", { name: /sound effects/i })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("first pot tap grants motion permission once and unlocks audio", async ({ page }) => {
  await page.addInitScript(() => {
    const win = window as unknown as { __audioContexts: number; __permissionCalls: number };
    win.__audioContexts = 0;
    win.__permissionCalls = 0;
    if (typeof DeviceMotionEvent !== "undefined") {
      Object.defineProperty(DeviceMotionEvent, "requestPermission", {
        configurable: true,
        value: () => {
          win.__permissionCalls += 1;
          return Promise.resolve("granted");
        },
      });
    }
    class MockAudioContext {
      sampleRate = 48000;
      currentTime = 0;
      state = "running";
      destination = {};
      resume = () => Promise.resolve();
      createBuffer = () => ({ getChannelData: () => new Float32Array(0) });
      createBufferSource = () => ({
        connect: () => {},
        start: () => {},
        stop: () => {},
      });
      createBiquadFilter = () => ({
        type: "",
        frequency: { value: 0 },
        Q: { value: 0 },
        connect: () => {},
      });
      createGain = () => ({
        gain: {
          value: 0,
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
        connect: () => {},
      });
      createOscillator = () => ({
        type: "",
        frequency: { value: 0, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {},
      });
    }
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: class extends MockAudioContext {
        constructor() {
          super();
          win.__audioContexts += 1;
        }
      },
    });
  });

  await page.goto("/");
  const pot = page.getByLabel(/generate a new meal/i);
  await expect(pot).toBeVisible();

  expect(
    await page.evaluate(() => (window as unknown as { __audioContexts: number }).__audioContexts),
  ).toBe(0);
  expect(
    await page.evaluate(() => (window as unknown as { __permissionCalls: number }).__permissionCalls),
  ).toBe(0);

  await pot.click();
  await expect(page.getByText(/motion on.*shake to reroll/i)).toBeVisible();
  expect(
    await page.evaluate(() => (window as unknown as { __audioContexts: number }).__audioContexts),
  ).toBeGreaterThanOrEqual(1);
  expect(
    await page.evaluate(() => (window as unknown as { __permissionCalls: number }).__permissionCalls),
  ).toBe(1);

  await pot.click();
  expect(
    await page.evaluate(() => (window as unknown as { __permissionCalls: number }).__permissionCalls),
  ).toBe(1);
});

test("denied motion permission still allows tap-to-roll", async ({ page }) => {
  await page.addInitScript(motionPermissionInitScript("denied"));

  await page.goto("/");
  const pot = page.getByLabel(/generate a new meal/i);
  await expect(pot).toBeVisible();

  const before = await page.locator("p.font-medium").allTextContents();
  const notice = page.getByText(/motion blocked.*tap the pot to roll/i);
  await pot.click();
  await expect(notice).toBeVisible();
  await expect.poll(async () => page.locator("p.font-medium").allTextContents()).not.toEqual(before);

  await expect(notice).toBeHidden({ timeout: 3000 });
  await pot.click();
  expect(
    await page.evaluate(() => (window as unknown as { __permissionCalls: number }).__permissionCalls),
  ).toBe(1);
});

test.describe("short viewport", () => {
  test.use({ viewport: { width: 390, height: 700 } });

  test("pot, like/save and share fit without scrolling", async ({ page }) => {
    await page.goto("/");
    const pot = page.getByLabel(/generate a new meal/i);
    await expect(pot).toBeVisible();
    await expect(pot).toBeInViewport();
    await expect(page.getByRole("button", { name: /like & save/i })).toBeInViewport();
    await expect(page.getByRole("button", { name: /share/i })).toBeInViewport();
  });
});
