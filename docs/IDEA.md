# Idea: Slow Carb Randomizer

> A mobile app that generates random slow-carb meals with a shake of the phone,
> helping people escape meal boredom while staying on the diet.

## 1. The Problem

The Slow-Carb Diet (from Tim Ferriss's *The 4-Hour Body*) is simple but repetitive:

1. Avoid "white" carbohydrates (bread, rice, pasta, potatoes, grains).
2. Eat the same few meals over and over — each built from **one protein + one legume + vegetables**.
3. Don't drink calories.
4. Don't eat fruit (tomatoes and avocado excepted).
5. One cheat day a week.

The diet's own advice is to repeat a handful of meals. That's great for compliance but boring.
People fall off the diet because they run out of ideas, not because the rules are hard.

**The insight:** the meal format is a formula. If we can randomly combine compliant ingredients
into *plausible, tasty-sounding* meals, users get novelty without leaving the diet.

## 2. The Idea

**Slow Carb Randomizer** generates a random slow-carb meal on demand. Shake the phone → a new
combo appears: one protein, one legume, one vegetable, plus optional fermented foods, herbs &
spices and a healthy fat. Like it, save it, cook it.

The app is a **pure client-side app**:

- No backend, no database, no accounts, no sign-up.
- All ingredient data ships with the app.
- Likes/saves/settings persist locally on the device.
- Works fully offline.

## 3. Core User Story

> "It's Tuesday night. I've had chicken-and-lentils three times this week and I'm bored.
> I pull out my phone, shake it, and get: *grass-fed beef + pinto beans + asparagus + kimchi
> + chili + guacamole — ≈ 700 kcal*. That actually sounds good. I save it and cook it."

## 4. How It Works

### Ingredient pools

Every ingredient belongs to exactly one category:

| Pool | Always/optional | Examples |
|------|-----------------|----------|
| Protein | **always** (pick 1) | eggs, chicken, beef, pork, lamb, fish, turkey, tofu |
| Legume | **always** (pick 1) | lentils, black/pinto/red beans, chickpeas, edamame |
| Vegetable | **always** (pick 1) | spinach, broccoli, asparagus, peas, green beans, salad greens… |
| Fermented | optional (pick 1) | kimchi, sauerkraut, unsweetened dill pickles |
| Herb & spice | optional (pick 1) | garlic, ginger, cumin, chili, paprika, turmeric… |
| Healthy fat | optional (pick 1) | olive oil, ghee, guacamole, a handful of nuts |

### Generation rules

- A meal always has exactly one protein, one legume and one vegetable.
- Optional pools can be switched off in Settings (e.g. "no fermented foods").
- Picks are random (Fisher–Yates) but never an exact repeat of a meal generated recently.
- Calories are summed from per-ingredient approximations.

## 5. Features

### v1 (scaffolded)

- [x] Generator screen with shake + tap-to-roll
- [x] Curated ingredient pools with calorie data
- [x] No-repeat randomization
- [x] Like & save meals (local persistence)
- [x] My Meals list (view/remove/clear)
- [x] Settings toggles (fermented, herbs/spices, fats, calorie display)
- [x] The Diet info screen (rules + pool contents)
- [x] PWA manifest + icons
- [x] Capacitor iOS + Android shells

### v2 / backlog (tracked as GitHub issues)

- Share a meal as text/image (native share sheet)
- Reroll a single ingredient instead of the whole meal
- Per-ingredient swap ("don't show broccoli again")
- Meal history with "go back"
- Ingredient notes: cooking tips, suggested pairings
- Dark/light theme toggle (currently dark-first)
- Haptics polish and shake sensitivity setting
- Export saved meals (CSV / text)
- More granular pool editing (favourite ingredients)

## 6. Calorie Estimates

- Every ingredient carries `calories` for a *typical serving* (e.g. 1 cup cooked legumes).
- Total = sum of the meal's ingredients.
- These are **rough approximations**, shown as "≈ N kcal", and clearly flagged as non-medical.
- No external API — data is bundled so the app works offline.

## 7. Product Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Backend | None | Save effort, privacy, no ops. A client-only app is enough. |
| Framework | Next.js + TS | Job-relevant stack the owner wants to grow into; static export is ideal for Capacitor. |
| App stores | Capacitor wrap of static export | Ship one React codebase to web + iOS + Android. |
| Saves | `localStorage` | Simple, survives app restarts on both platforms. Trade-off: no cross-device sync. |
| Shake | Native plugin on device, Web API in browser | Most reliable on real phones; still works on desktop for demos. |
| Calorie data | Static approximations | Offline, zero cost, no keys. Accuracy is "ballpark" by design. |
| Identity | No accounts | Zero sign-up friction; matches the "tiny utility" positioning. |

## 8. Non-Goals (for now)

- No user accounts or cloud sync.
- No meal planning / grocery lists / in-app shopping.
- No crowdsourced ingredient database (a future option via issues).
- No real-time nutrition accuracy — estimates only.
- Not an exercise/fitness tracker.

## 9. Open Questions

- Should saved meals be shareable as a canonical image card? (nice-to-have)
- Do we want a weekly "meal plan" generated from favourites? (probably v2)
- Is a web deployment (public URL) part of launch, or app-stores only?
- Monetisation: free with future premium pools? (parked)

## 10. Risks & Mitigations

- **App Store review (iOS):** a WebView-wrapped app can face scrutiny. Mitigate by having real
  native value (motion, haptics) and clear privacy (no data collected).
- **"White carb" errors:** ingredient data must stay compliant; add a review step when new
  ingredients are proposed (issue-driven).
- **Shake misfires:** threshold tuning + tap fallback covers most devices.
