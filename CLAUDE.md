# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build locally
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
npm run lint         # Prettier + ESLint check
npm run format       # Auto-format with Prettier
```

There is no test suite.

## Pages

| Route | Purpose |
|---|---|
| `/` | Home — project cards linking to the feature pages |
| `/about` | About me with photo gallery (Japan trip photos) |
| `/rent-a-mon` | Pokémon lookup — search by name/ID, random, or list up to 25; shiny odds logic; hover swaps front/back sprite |
| `/dock-ship` | NASA hub — APOD daily image/video + EPIC Earth imagery carousel + EONET natural events feed |
| `/chat` | AI chatbot (space/science focus) streaming via OpenAI; renders markdown with syntax highlighting — **not linked from nav/home** (OpenAI key inactive) |
| `/character-creator` | D&D character sheet — create/load/edit via MongoDB form actions; printable via `CharacterSheetPrint.svelte` |

## Environment Variables

Required in `.env`:

| Variable | Purpose |
|---|---|
| `NASA_KEY` | NASA API key (APOD, EPIC, EONET endpoints) |
| `ATLAS_DB_URI` | MongoDB Atlas connection string |
| `ATLAS_DB_CHARACTERS` | MongoDB database name for characters |
| `OPENAI_API_KEY` | OpenAI key for the chat endpoint |
| `SHINY_ODDS` | 1-in-N chance to show shiny Pokémon |
| `MAX_MOVES_TO_FETCH` | Max moves to include per Pokémon |

Optional:

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for `/api/chat` rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token for `/api/chat` rate limiting |

If the Upstash variables are not set, `/api/chat` skips rate limiting (logs a warning) rather than failing.

`ATLAS_DB_POKEMON` and `ASSETS_URL` are also in `.env` but currently unused at runtime.

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| TypeScript types & interfaces | PascalCase | `Character`, `ChatHistory`, `EonetEvent` |
| Svelte components | PascalCase | `ModernNav.svelte`, `PokemonCard.svelte` |
| Variables, functions, store factories | camelCase | `clientPromise`, `readableStreamStore`, `loadCharacters` |
| Constants (non-class) | camelCase | `pokeballImg`, `nasaImg` in `constants.ts` |
| Non-component `.ts` files | camelCase | `pokemonStore.svelte.ts`, `db.ts` |
| SvelteKit route files | SvelteKit convention | `+page.svelte`, `+page.server.ts`, `+server.ts` |

## Security & Data Access

**Server boundary** — `src/lib/server/` files (e.g., `db.ts`) may only be imported from server-side files (`+page.server.ts`, `+server.ts`). Never import them in `+page.svelte` or other client-visible files — SvelteKit will throw a build error if you do.

**API keys** — All secrets (`NASA_KEY`, `OPENAI_API_KEY`, `ATLAS_DB_URI`) live in `.env` and are accessed only via `process.env` in server-side code. Never reference `process.env` in client-side Svelte components or client-only utilities.

**Input handling** — User-supplied data entering the server (form actions, request bodies) must be treated as untrusted. Validate and sanitize before passing to external APIs or writing to MongoDB. `DOMPurify` is available for sanitizing HTML/markdown output rendered in the browser.

**MongoDB** — Only the `clientPromise` singleton from `src/lib/server/db.ts` should be used to obtain the database client. Do not create additional `MongoClient` instances. All writes use the `$set` operator or `insertOne` — avoid patterns that allow arbitrary field injection from raw form data.

**Security headers & CSP** — `src/hooks.server.ts` sets a Content-Security-Policy (configured via `csp` in `svelte.config.js`) plus `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` on every response. New external origins (images, fonts, frames, fetches) must be added to the relevant CSP directive in `svelte.config.js` or they will be blocked by the browser.

**Owner-scoped data** — `hooks.server.ts` assigns each visitor an anonymous `cc_owner` cookie (UUID, httpOnly) exposed as `event.locals.ownerId`. Characters store an `ownerId`; `/character-creator` only lets a visitor edit characters they created (pre-existing characters without an `ownerId` are shown read-only as demos).

## Architecture

**Stack:** SvelteKit 2 · Svelte 5 · TypeScript · Tailwind CSS v4 · Skeleton v4 · MongoDB Atlas · OpenAI · Vercel

### Svelte 5 Runes

The project is fully on Svelte 5. Use runes throughout — never the legacy API:
- `$state` / `$derived` / `$effect` instead of `writable` stores
- `$props()` instead of `export let`
- `{@render children()}` instead of `<slot>`

### Reactive Store Pattern

`src/lib/utils/*.svelte.ts` files export factory functions (not class instances). Call the factory in the component and hold the result as a local variable — they are not singletons.

- `readableStreamStore` and `pokemonStore` — backed by `$state`; changes are reactive.
- `apodHistoryStore`, `epicHistoryStore`, `eonetHistoryStore` — use plain `let` (one-shot fetches; reactivity not needed).

### API Layer

All external API calls go through SvelteKit server routes in `src/routes/api/` to keep secrets server-side. The frontend never calls NASA, OpenAI, or PokeAPI directly.

- `api/chat` — streams OpenAI `gpt-4.1-mini` responses using `ReadableStream` / `TextDecoderStream`; the `readableStreamStore` handles client-side consumption. The chat page renders assistant messages through `marked` + `marked-highlight` + `highlight.js`, then sanitizes with `DOMPurify` before inserting into the DOM.
- `api/nasa/apod`, `api/nasa/epic`, `api/nasa/eonet` — proxy NASA APIs
- `api/pokemon`, `api/pokemons` — proxy PokéAPI and apply shiny/move logic

### Database

`src/lib/server/db.ts` exports a singleton `clientPromise: Promise<MongoClient>`. Import it only in server-side files (`+page.server.ts`, `+server.ts`). The character-creator page is the only feature that reads/writes MongoDB; it uses SvelteKit form actions (`create`, `update`) defined in `+page.server.ts`.

### Static Assets

Images are hosted on Cloudinary. URLs are centralized in `src/lib/assets/constants.ts` — add new image constants there rather than inlining URLs.

### Per-route File Colocation

Routes may include local `types.ts`, `constants.ts`, and `+page.css` files alongside `+page.svelte`. Use this pattern for route-specific types or constants rather than putting everything in `src/lib/`.

### UI / Theming

Skeleton v4 (`@skeletonlabs/skeleton-svelte`) provides components. Tailwind v4 is configured via the `@tailwindcss/vite` plugin (no `tailwind.config.*` file). Global styles live in `src/app.css`. The layout (`src/routes/+layout.svelte`) wraps every page with `ModernNav` and a footer.

## Accessibility

Treat accessibility as a requirement, not a follow-up. When adding or changing UI, check these before considering the change done:

- **Accessible names** — every interactive or media element needs a name a screen reader can announce. Give `<img>` a meaningful `alt` (empty `alt=""` only for decorative images); give `<iframe>`, `<video>`, `<audio>`, and icon-only buttons/links a `title` or `aria-label`. When swapping element types (e.g. `<iframe>` → `<video>`), carry the accessible name over — don't drop it.
- **Don't silence the linter blindly** — `svelte-check` surfaces a11y warnings (e.g. `a11y_media_has_caption`, `a11y_missing_attribute`). Fix the underlying issue; only use a `<!-- svelte-ignore -->` when the warning genuinely doesn't apply (e.g. a caption track that doesn't exist for third-party media), and keep the suppression scoped to that one element.
- **Keyboard & focus** — interactive elements must be reachable and operable by keyboard. Use real `<button>`/`<a>` elements rather than click-handlers on `<div>`/`<span>`; preserve visible focus styles.
- **Semantics & contrast** — use semantic headings/landmarks in order, associate `<label>`s with form controls, and keep text/background contrast adequate in both light and dark themes (see UI / Theming).
- **Run `npm run check`** after UI changes and resolve new a11y warnings before committing.
