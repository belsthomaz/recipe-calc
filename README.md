# 🍳 RecipeCalc

[![CI](https://github.com/belsthomaz/recipe-calc/actions/workflows/ci.yml/badge.svg)](https://github.com/belsthomaz/recipe-calc/actions/workflows/ci.yml)

A simple web app to **scale recipes**, **convert measurements**, and **substitute ingredients** when you're missing something. Everything runs in the browser — no account, no backend.

## Features

- **Scale Recipe** — Build a recipe (ingredient, amount, unit), set its base servings, then pick a target number of servings. A side-by-side view shows the live **scale factor** and each ingredient's original vs. scaled amount. Quantities render as kitchen-friendly fractions (e.g. `1 ½ cup`).
- **Convert Units** — Convert between volume units (tsp, tbsp, cup, ml, l…) and weight units (g, kg, oz, lb…). Incompatible pairings (e.g. volume ↔ weight) are prevented automatically.
- **Substitute** — Search an ingredient (butter, egg, buttermilk, flour, sugar…) to see common swaps, the amount to use, and prep notes.
- **Light / dark mode** — Toggle in the nav; defaults to your system preference and is remembered across visits.
- **Local persistence** — Your working recipe is saved to `localStorage`, so it survives a refresh.

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5, runes)
- [Tailwind CSS 4](https://tailwindcss.com/) + [Skeleton UI](https://skeleton.dev/) (`pine` theme)
- [Lucide](https://lucide.dev/) icons
- [Vitest](https://vitest.dev/) for unit tests

## Project structure

| Path | Purpose |
| --- | --- |
| `src/lib/units.ts` | Units and conversion logic |
| `src/lib/recipe.ts` | Recipe model, scaling, and quantity formatting |
| `src/lib/substitutions.ts` | Substitution database and search |
| `src/lib/*.spec.ts` | Unit tests for the logic above |
| `src/routes/+page.svelte` | The single-page UI (nav, tabs, and all three tools) |

## Getting started

```sh
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

### Scripts

```sh
npm run dev        # start the dev server
npm run build      # production build
npm run preview    # preview the production build
npm run check      # type-check (svelte-check)
npm test           # run unit tests once
npm run test:unit  # run tests in watch mode
```

## CI

Every push to `main` and every pull request runs `npm run check` and `npm test` via
[GitHub Actions](.github/workflows/ci.yml).

---

> Conversions are approximate — especially in baking. Recipes are stored locally in your browser only.
