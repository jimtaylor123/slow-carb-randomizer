# Architecture

## Overview

Slow Carb Randomizer is a **fully client-side Next.js app** that ships as:

1. a static website (PWA), and
2. native iOS/Android apps, via a Capacitor wrap of the same static export.

There is no server, no API, no database. Every feature runs in the browser/WebView.

```
                    ┌─────────────────────────────────────────────┐
                    │  Next.js 16 (App Router, TS, Tailwind 4)   │
                    │  output: "export"  →  out/ (static site)   │
                    └───────────────┬─────────────────────────────┘
                          ┌─────────┴──────────┐
                          ▼                    ▼
                 ┌───────────────┐    ┌────────────────────────┐
                 │   Web / PWA  │    │  Capacitor 8 wrapper   │
                 │  (any host)  │    │  ios/  +  android/     │
                 └───────────────┘    └────────────────────────┘
```

## Why static export + Capacitor

- **No server features needed** — generation, likes and settings are all local. Static export
  drops every server capability (API routes, SSR), which is exactly what we want.
- **One codebase, three targets.** The same React components run on the web and in the native
  WebViews. Capacitor adds native bridges for motion and haptics.
- **No rewrite** compared to React Native. See `docs/deployment.md` for the store pipeline.

## Key Decisions

### 1. Static export (`next.config.ts`)

```ts
export default {
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"], // Next 16 dev-server safety default
};
```

`next build` writes the site to `out/`, which is what Capacitor's `webDir` points at.

### 2. Storage: `localStorage` only

- Saved meals, history and settings live in `localStorage` (keys `scr:saved`, `scr:history`,
  `scr:settings`).
- On native, the WebView's `localStorage` persists across app launches, so saves survive restarts.
- Trade-off (by design): no cross-device sync. A future issue could add Capacitor Preferences or
  a sync provider.

### 3. SSR-safe reads (`useHydrated`)

Static export pre-renders HTML on the server, then React hydrates in the browser. `localStorage`
doesn't exist during server render, so pages must not render stored values until hydration is done.

`src/hooks/useHydrated.ts` centralises this:

- Server render: returns the `fallback` (identical HTML on client and server → no mismatch).
- After mount: loads the real value from `localStorage` and flips a `mounted` flag.
- Pages then render either a skeleton or the real UI, and copy hydrated values into mutable local
  state once (`if (mounted && state === null) setState(...)`) — a render-phase update, which is
  the React-recommended pattern and avoids `useEffect` update loops.

### 4. Shake detection (`useShake`)

- **Native (Capacitor):** listens to the accelerometer via `@capacitor/motion`
  (`addListener("accel", …)`) and fires when acceleration magnitude exceeds a threshold.
- **Web:** falls back to the `devicemotion` browser API (`accelerationIncludingGravity`).
- **Fallback control:** every screen also exposes `trigger()` so a button tap produces the same
  action on desktop, simulators and devices without motion sensors.
- **Haptics:** `@capacitor/haptics` gives tactile feedback on native; safe no-op on web.

### 5. Randomizer is pure and testable

`src/lib/randomizer.ts` has no DOM or storage dependencies and accepts an injectable `random()`,
making behaviour fully deterministic in tests.

## Data Flow

```
Generator page (client)
  │  useHydrated → settings, history, saved
  │  render-phase init → local state, first meal
  ▼
shuffle + pick → Meal   (randomizer.ts)
  │
  ├─ like/save → toggleSavedMeal → localStorage (storage.ts)
  ├─ reroll    → generateMeal(history) → no-repeat guard
  └─ share     → mealToText() (future issue)
```

## Testing

| Layer | Tool | What it covers |
|-------|------|----------------|
| Unit | Vitest + RTL | data sanity, randomizer determinism/no-repeat, storage round-trips, `MealCard` rendering |
| E2E | Playwright (mobile viewport) | generator, like→save→remove, settings persistence, diet screen |

`npm run qa` = lint + typecheck + unit tests + build. `npm run test:e2e` runs Playwright against
a dev server. See `.agents/AGENTS.md` for the full checklist agents must pass.

## Project Structure

```
src/
  app/
    page.tsx           # Generator (shake, meal card, save)
    saved/page.tsx     # My Meals
    settings/page.tsx  # toggles + reset
    diet/page.tsx      # the 5 rules
  components/
    MealCard.tsx       # ingredient rows + per-item kcal
    BottomNav.tsx      # tab bar
  hooks/
    useShake.ts        # native + web motion, haptics, manual trigger
    useHydrated.ts     # SSR-safe localStorage reads
  lib/
    foods.ts           # types + seed ingredient pools
    randomizer.ts      # shuffle, generateMeal, buildMealId, mealToText
    storage.ts         # localStorage persistence
tests/e2e/app.spec.ts  # Playwright
ios/  android/         # Capacitor native projects
```
