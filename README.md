# Slow Carb Randomizer

A mobile-first, fully offline app that generates random slow-carb meals by shaking your phone.

Built on the **Slow-Carb Diet** (Tim Ferriss, *The 4-Hour Body*): every meal is one **protein** + one **legume** + one **vegetable**, with optional **fermented foods**, **herbs & spices** and **healthy fats** mixed in. Shake the device (or tap the pot) to roll a new combo, like and save the ones you love, and get a rough calorie estimate per meal.

**No backend. No database. No accounts.** All data lives on your device.

## Live App & Offline

Try it live at **https://slowcarbrandomizer.vercel.app**.

The app is a PWA: after your first visit it installs a service worker, so once loaded it works
fully offline — no connection needed for new shakes or your saved meals.

### Install on iOS (Safari)

1. Open https://slowcarbrandomizer.vercel.app in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**, then **Add**.
4. Launch from the home screen like any app — it works offline.

### Install on Android (Chrome)

1. Open https://slowcarbrandomizer.vercel.app in Chrome.
2. Tap the menu (⋮) and choose **Add to Home screen** (or follow the install prompt).
3. Confirm, then launch from the home screen like any app — it works offline.

## Features

- **Shake to reroll** — device motion via Capacitor on native, `DeviceMotion` on the web, with a tap-to-roll fallback (works on desktop/simulators)
- **Curated ingredient pools** — proteins, legumes, vegetables + optional fermented, herbs/spices, fats (all slow-carb compliant)
- **Smart randomization** — Fisher–Yates picks with no immediate repeats against recent history
- **Like & save** — favorite meals persist locally; browse, remove or clear them in *My Meals*
- **Calorie estimates** — rough per-serving approximations, summed per meal (toggleable)
- **Settings** — turn optional ingredient pools on/off, toggle calorie display, reset data
- **The Diet** — the five slow-carb rules and what's in the pool, built in
- **PWA** — installable and fully offline once visited; wrapped with **Capacitor** for iOS/Android stores

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| Mobile wrapper | Capacitor 8 (static export → native iOS/Android) |
| Local storage | `localStorage` (WebView-persistent on native) |
| Motion | `@capacitor/motion` (native) / DeviceMotion API (web) |
| Haptics | `@capacitor/haptics` |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright (mobile viewport) |

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

Open the URL on your phone (same network) or in a desktop browser — tap the pot to simulate a shake.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Static export to `out/` (ships the runtime service worker) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e (mobile viewport) |
| `npm run qa` | lint + typecheck + test + build |
| `npm run mobile` | Build static export + sync to native projects |
| `npm run mobile:ios` | Open the iOS project in Xcode |
| `npm run mobile:android` | Open the Android project in Android Studio |

## Project Layout

```
src/
  app/            # Pages: / (generator), /saved, /settings, /diet
  components/     # MealCard, BottomNav
  hooks/          # useShake, useHydrated (SSR-safe storage reads)
  lib/            # foods (data), randomizer, storage
tests/e2e/        # Playwright specs
ios/, android/    # Capacitor native projects (committed)
docs/             # IDEA, food-data, architecture, deployment
.agents/          # Agent workflow for GitHub-issue-driven development
```

## Documentation

- [`docs/IDEA.md`](docs/IDEA.md) — the fleshed-out concept, user stories and product decisions
- [`docs/food-data.md`](docs/food-data.md) — ingredient pools, calorie sourcing and the data model
- [`docs/architecture.md`](docs/architecture.md) — how it's built and why (static export, storage, shake)
- [`docs/deployment.md`](docs/deployment.md) — web, PWA, and App Store / Play Store shipping

## Development Workflow

Work is tracked in **GitHub Issues** and delivered through the agent pipeline in
[`.agents/workflow.yml`](.agents/workflow.yml) (mirrors the possiblewords setup): each issue gets an
isolated git worktree, plan → implementation → review → test → PR, using the
`implementer`, `reviewer` and `tester` agents.

See [`.agents/AGENTS.md`](.agents/AGENTS.md) for the full agent guide, conventions and QA checklist.

## Disclaimer

Slow Carb Randomizer is an idea/meal-planning tool, not medical advice. Calorie figures are rough
approximations and should not be treated as nutrition facts.
