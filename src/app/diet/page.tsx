"use client";

import BottomNav from "@/components/BottomNav";

const RULES = [
  {
    title: "Avoid “white” carbohydrates",
    body: "No bread, rice, cereal, potatoes, pasta, tortillas or anything that could be white. Save it for cheat day.",
  },
  {
    title: "Repeat a few meals",
    body: "Build every meal from one protein, one legume and plenty of vegetables. That’s what this app randomizes.",
  },
  {
    title: "Don’t drink calories",
    body: "Water, unsweetened tea and coffee. Up to 1–2 glasses of dry red wine a night is allowed.",
  },
  {
    title: "No fruit",
    body: "Fruit is off the menu six days a week. Tomatoes and avocado are the exceptions, avocado in moderation.",
  },
  {
    title: "One cheat day a week",
    body: "Pick a day (many choose Saturday) and go wild — it can actually help keep your metabolism from downshifting.",
  },
];

const GROUPS: { title: string; items: string }[] = [
  {
    title: "Proteins",
    items: "Egg whites + whole eggs, chicken breast/thigh, grass-fed beef, pork, lamb, fish, turkey, tofu",
  },
  {
    title: "Legumes",
    items: "Lentils, black beans, pinto beans, red beans, chickpeas, soybeans/edamame",
  },
  {
    title: "Vegetables",
    items: "Spinach, broccoli, cauliflower, asparagus, peas, green beans, kale, Brussels sprouts, cabbage, salad greens, cucumber, peppers, zucchini, mushrooms, tomatoes",
  },
  {
    title: "Fermented (optional)",
    items: "Kimchi, sauerkraut, unsweetened dill pickles",
  },
  {
    title: "Herbs & spices (optional)",
    items: "Garlic, ginger, chili, cumin, coriander, paprika, turmeric, rosemary, thyme, oregano, basil, cinnamon, pepper",
  },
  {
    title: "Healthy fats (optional)",
    items: "Olive oil, ghee, guacamole, a small handful of nuts",
  },
];

export default function Diet() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-8 pt-6">
        <header>
          <h1 className="text-xl font-bold tracking-tight">The Slow-Carb Diet</h1>
          <p className="text-sm text-zinc-500">
            The 5 rules, from Tim Ferriss&rsquo;s <em>The 4-Hour Body</em>.
          </p>
        </header>

        <section className="space-y-3">
          {RULES.map((rule, index) => (
            <div
              key={rule.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <p className="text-sm font-semibold text-emerald-400">
                Rule {index + 1}
              </p>
              <h2 className="mt-0.5 text-sm font-bold">{rule.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{rule.body}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            What&rsquo;s in the pool
          </h2>
          {GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-200">{group.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{group.items}</p>
            </div>
          ))}
        </section>

        <p className="text-xs leading-relaxed text-zinc-600">
          The slow-carb diet is a general eating plan, not medical advice. Consult a
          professional before making significant diet changes.
        </p>
      </main>

      <BottomNav savedCount={0} />
    </div>
  );
}
