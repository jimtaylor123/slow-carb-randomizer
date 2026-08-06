# AGENTS.md — Slow Carb Randomizer

## Overview
A mobile-first, fully offline app that generates random slow-carb meals with a shake of the phone.
Users pick from curated ingredient pools (protein + legume + vegetable, plus optional fermented,
herbs/spices and fats), like and save meals locally, and get rough calorie estimates. No backend.

## Tech Stack
- **Framework:** Next.js 16 (App Router), **TypeScript**
- **Styling:** Tailwind CSS 4
- **Mobile:** Capacitor 8 (`ios/`, `android/`) wrapping a static export (`output: "export"` → `out/`)
- **Storage:** `localStorage` only (saved meals, history, settings)
- **Motion:** `@capacitor/motion` (native) / DeviceMotion API (web), with tap fallback
- **Haptics:** `@capacitor/haptics`
- **Unit tests:** Vitest + React Testing Library (jsdom)
- **E2E tests:** Playwright (mobile viewport)

## Pre-review / CI Checklist

Before submitting any PR or requesting review, ALL of the following must pass:

### 1. Lint
```bash
npm run lint
```
ESLint on `src/`. 0 warnings and 0 errors. (The `react-hooks/set-state-in-effect` rule is
intentionally off for `src/hooks/useHydrated.ts` — see the override in `eslint.config.mjs`.)

### 2. Type check
```bash
npm run typecheck
```
`tsc --noEmit` on the whole project. Must be clean.

### 3. Unit tests
```bash
npm run test
```
Vitest on `src/**/*.test.{ts,tsx}`. Must all pass.

### 4. Production build
```bash
npm run build
```
Next.js static export. Must succeed and produce `out/`.

### 5. E2E tests
```bash
npm run test:e2e
```
Playwright from `tests/e2e/` (mobile viewport). For features, add new e2e specs as appropriate.
Bugfixes must keep existing specs green. Note: `next dev` must allow the `127.0.0.1` origin
(already configured in `next.config.ts` via `allowedDevOrigins`).

### Quick all-in-one
```bash
npm run qa
```
Runs lint + typecheck + test + build in sequence.

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (default port 3000) |
| `npm run build` | Static export to `out/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e |
| `npm run qa` | lint + typecheck + test + build |
| `npm run mobile` | Build + `cap sync` into ios/android |
| `npm run mobile:ios` | Open iOS project in Xcode |
| `npm run mobile:android` | Open Android project in Android Studio |

## Coding Conventions

- **TypeScript** everywhere; `"use client"` on every interactive component (the whole app is
  client-side and statically exported).
- **Server/client split:** with `output: "export"` there are no server features — no API routes,
  no server actions, no SSR data fetching. Keep it that way unless an issue says otherwise.
- **Hydration safety:** never read `localStorage` during render. Use `useHydrated(reader, fallback)`
  from `src/hooks/useHydrated.ts`, then copy hydrated values into mutable local state once:
  ```ts
  if (mounted && state === null) setState(hydratedValue);
  ```
  Do not set state directly inside `useEffect` (the react-hooks rule flags it).
- **Data model:** all ingredient types and pools live in `src/lib/foods.ts`. Keep new foods
  strictly slow-carb compliant. See `docs/food-data.md`.
- **Pure logic:** keep DOM-free logic (randomizer, meal ids, text) in `src/lib/` so it stays unit
  testable with an injectable `random()`.
- **Storage:** all persistence goes through `src/lib/storage.ts` (never touch `localStorage`
  directly in components).
- **Components:** PascalCase filenames in `src/components/`, Tailwind utility classes only,
  dark theme (zinc + emerald) as the default.
- **Types:** explicit interfaces for public data shapes (`FoodItem`, `Meal`, `MealOptions`).

## Testing
- **Unit:** Vitest, jsdom, `globals: true`, setup in `vitest.setup.ts` (jest-dom matchers).
  Tests co-located as `*.test.ts(x)` next to sources.
- **E2E:** Playwright, specs in `tests/e2e/`. Runs against `next dev` on port 3100.
- Keep the randomizer/storage/foods tests deterministic (inject `random`, clear localStorage in
  `beforeEach`).

## Important Notes
- Tasks and bugs are tracked in **GitHub Issues**.
- Unless otherwise stated, GitHub issues should be processed using the workflow in
  `.agents/workflow.yml`.
- The app ships to web (static/PWA) and native iOS/Android via Capacitor. Store-ready steps are
  in `docs/deployment.md`.
- No backend is a deliberate product decision — do not introduce servers/DBs without an explicit
  issue approving it.
