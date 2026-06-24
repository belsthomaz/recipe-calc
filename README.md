# 🍳 RecipeCalc

A simple web app to **scale recipes**, **convert measurements**, and **substitute ingredients** when you're missing something.

## Features

- **Recipe builder & scaler** — Enter ingredients with quantity, unit, and name, then scale to any number of servings (or use ½× / 2× / 3× shortcuts). Quantities render as kitchen-friendly fractions (e.g. `1 ½ cup`). Your recipe is saved in the browser automatically.
- **Measurement converter** — Convert between volume units (tsp, tbsp, cup, ml, l…) and weight units (g, kg, oz, lb…).
- **Substitution finder** — Search an ingredient (butter, egg, buttermilk, flour, sugar…) to see common swaps, the amount to use, and prep notes.

## Project structure

- `src/lib/units.ts` — units and conversion logic
- `src/lib/recipe.ts` — recipe model, scaling, and quantity formatting
- `src/lib/substitutions.ts` — substitution database and search
- `src/routes/+page.svelte` — the single-page UI

Built with SvelteKit (Svelte 5), Tailwind CSS, and Skeleton UI.

## Developing

```sh
npm run dev        # start the dev server
npm run test       # run unit tests
npm run check      # type-check
npm run build      # production build
```

> Conversions are approximate. Recipes are stored locally in your browser only.
