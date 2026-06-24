<script lang="ts">
	import { UNITS_BY_DIMENSION, compatibleUnits, canConvert, convert, getUnit } from '$lib/units';
	import {
		createIngredient,
		formatQuantity,
		servingsFactor,
		type Recipe
	} from '$lib/recipe';
	import { findSubstitutions } from '$lib/substitutions';
	import { Scale, Beaker, Replace, Plus, Trash2, RotateCcw, Sun, Moon } from '@lucide/svelte';

	type Tab = 'scale' | 'convert' | 'substitute';
	let tab = $state<Tab>('scale');

	// --- Color mode (light/dark) ---
	const THEME_KEY = 'recipecalc.theme';
	let dark = $state(false);

	// Sync the toggle's state with the class the pre-paint script already applied.
	$effect(() => {
		dark = document.documentElement.classList.contains('dark');
	});

	function toggleTheme() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
	}

	const STORAGE_KEY = 'recipecalc.recipe';

	function defaultRecipe(): Recipe {
		return {
			title: 'My Recipe',
			servings: 4,
			ingredients: [
				createIngredient({ quantity: 2, unitId: 'cup', name: 'All-purpose flour' }),
				createIngredient({ quantity: 115, unitId: 'g', name: 'Unsalted butter' }),
				createIngredient({ quantity: 1, unitId: 'cup', name: 'Whole milk' }),
				createIngredient({ quantity: 1, unitId: 'tsp', name: 'Salt' }),
				createIngredient({ quantity: 3, unitId: 'tbsp', name: 'Granulated sugar' })
			]
		};
	}

	let recipe = $state<Recipe>(defaultRecipe());
	let targetServings = $state(8);

	// Load any saved recipe on mount (client only).
	$effect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as Recipe;
				if (parsed?.ingredients?.length) recipe = parsed;
			} catch {
				// ignore malformed storage
			}
		}
	});

	// Persist on every change.
	$effect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(recipe));
	});

	const factor = $derived(servingsFactor(recipe.servings, targetServings));

	const scaled = $derived(
		recipe.ingredients.map((ing) => ({
			...ing,
			scaledQuantity: ing.quantity * factor
		}))
	);

	function addIngredient() {
		recipe.ingredients.push(createIngredient({ quantity: 1, unitId: 'cup', name: '' }));
	}

	function removeIngredient(id: string) {
		recipe.ingredients = recipe.ingredients.filter((i) => i.id !== id);
	}

	function resetRecipe() {
		recipe = defaultRecipe();
		targetServings = 8;
	}

	function unitLabel(unitId: string): string {
		const u = getUnit(unitId);
		return u?.label ? ` ${u.label}` : '';
	}

	// --- Unit converter ---
	let convAmount = $state(1);
	let convFrom = $state('cup');
	let convTo = $state('ml');

	const convToOptions = $derived(compatibleUnits(convFrom));

	$effect(() => {
		// Keep the target unit within the same dimension as the source.
		if (!canConvert(convFrom, convTo)) {
			const opts = compatibleUnits(convFrom).filter((u) => u.id !== convFrom);
			if (opts.length) convTo = opts[0].id;
		}
	});

	const convResult = $derived(
		canConvert(convFrom, convTo) ? convert(convAmount, convFrom, convTo) : null
	);

	// --- Substitution finder ---
	let subQuery = $state('');
	const subResults = $derived(findSubstitutions(subQuery));

	const tabs: { id: Tab; label: string; icon: typeof Scale }[] = [
		{ id: 'scale', label: 'Scale Recipe', icon: Scale },
		{ id: 'convert', label: 'Convert Units', icon: Beaker },
		{ id: 'substitute', label: 'Substitute', icon: Replace }
	];
</script>

<svelte:head>
	<title>RecipeCalc</title>
	<meta name="description" content="Scale recipes, convert measurements, and substitute ingredients." />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- Top nav -->
	<nav
		class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-500/30 px-4 py-3 sm:px-6"
	>
		<div class="flex items-center gap-3">
			<div class="grid size-11 place-items-center rounded-md preset-filled-primary-500">
				<Scale size={24} />
			</div>
			<div class="leading-tight">
				<div class="text-xl font-bold">RecipeCalc</div>
				<div class="font-mono text-xs tracking-wide opacity-60">Precision kitchen conversions</div>
			</div>
		</div>
		<div class="flex items-center gap-1">
			{#each tabs as t (t.id)}
				<button
					class="btn {tab === t.id ? 'preset-filled-primary-500' : 'hover:preset-tonal'}"
					onclick={() => (tab = t.id)}
				>
					<t.icon size={18} />
					<span class="font-semibold {tab === t.id ? 'inline' : 'hidden sm:inline'}">{t.label}</span>
				</button>
			{/each}
			<button
				class="btn-icon ml-1 hover:preset-tonal"
				onclick={toggleTheme}
				aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
				title={dark ? 'Light mode' : 'Dark mode'}
			>
				{#if dark}<Sun size={18} />{:else}<Moon size={18} />{/if}
			</button>
		</div>
	</nav>

	<main class="flex-1">
		{#if tab === 'scale'}
			<div class="grid lg:grid-cols-2">
				<!-- 01 — Input -->
				<section class="space-y-6 p-5 sm:p-8">
					<div class="flex items-start justify-between gap-4">
						<div>
							<div class="font-mono text-xs uppercase tracking-widest opacity-50">01 — Input</div>
							<h2 class="text-3xl font-bold">Original Recipe</h2>
						</div>
						<label class="flex flex-col items-end gap-1">
							<span class="font-mono text-xs uppercase tracking-wide opacity-60">Serves</span>
							<input
								class="input w-28 text-center"
								type="number"
								min="1"
								bind:value={recipe.servings}
							/>
						</label>
					</div>

					<div class="space-y-2">
						<div
							class="hidden gap-2 font-mono text-xs uppercase tracking-wide opacity-50 sm:grid sm:grid-cols-[1fr_5rem_7rem_auto]"
						>
							<span>Ingredient</span>
							<span>Amount</span>
							<span>Unit</span>
							<span></span>
						</div>

						{#each recipe.ingredients as ingredient (ingredient.id)}
							<div
								class="flex flex-wrap items-center gap-2 sm:grid sm:grid-cols-[1fr_5rem_7rem_auto]"
							>
								<input
									class="input w-full min-w-0 sm:w-auto"
									type="text"
									bind:value={ingredient.name}
									placeholder="ingredient name"
									aria-label="ingredient name"
								/>
								<input
									class="input min-w-0 flex-1 text-center sm:w-auto sm:flex-none"
									type="number"
									step="any"
									min="0"
									bind:value={ingredient.quantity}
									aria-label="amount"
								/>
								<select
									class="select min-w-0 flex-1 sm:flex-none"
									bind:value={ingredient.unitId}
									aria-label="unit"
								>
									<optgroup label="Volume">
										{#each UNITS_BY_DIMENSION.volume as u (u.id)}
											<option value={u.id}>{u.label || u.name}</option>
										{/each}
									</optgroup>
									<optgroup label="Weight">
										{#each UNITS_BY_DIMENSION.weight as u (u.id)}
											<option value={u.id}>{u.label}</option>
										{/each}
									</optgroup>
									<optgroup label="Count">
										{#each UNITS_BY_DIMENSION.count as u (u.id)}
											<option value={u.id}>{u.name}</option>
										{/each}
									</optgroup>
								</select>
								<button
									class="btn-icon hover:preset-tonal-error"
									onclick={() => removeIngredient(ingredient.id)}
									aria-label="remove ingredient"
									title="Remove"
								>
									<Trash2 size={18} />
								</button>
							</div>
						{/each}

						<button
							class="flex items-center gap-1 pt-1 font-semibold text-primary-600-400"
							onclick={addIngredient}
						>
							<Plus size={18} /> Add ingredient
						</button>
					</div>

					<button class="btn btn-sm hover:preset-tonal" onclick={resetRecipe}>
						<RotateCcw size={15} /> Reset to sample
					</button>
				</section>

				<!-- 02 — Output -->
				<section
					class="space-y-6 border-t border-surface-500/30 bg-surface-100-900 p-5 sm:p-8 lg:border-l lg:border-t-0"
				>
					<div class="flex items-start justify-between gap-4">
						<div>
							<div class="font-mono text-xs uppercase tracking-widest opacity-50">02 — Output</div>
							<h2 class="text-3xl font-bold">Scaled Recipe</h2>
						</div>
						<label class="flex flex-col items-end gap-1">
							<span class="font-mono text-xs uppercase tracking-wide opacity-60">Serves</span>
							<input class="input w-28 text-center" type="number" min="1" bind:value={targetServings} />
						</label>
					</div>

					<div class="flex items-center gap-2 font-mono text-sm">
						<span class="opacity-60">Scale factor</span>
						<span class="badge preset-tonal-primary font-bold">×{formatQuantity(factor)}</span>
					</div>

					<div class="overflow-hidden rounded-lg border border-surface-500/30">
						<table class="w-full text-left">
							<thead class="bg-surface-200-800">
								<tr class="font-mono text-xs uppercase tracking-wide opacity-60">
									<th class="px-4 py-2 font-medium">Ingredient</th>
									<th class="px-4 py-2 text-right font-medium">Original</th>
									<th class="px-4 py-2 text-right font-medium">Scaled</th>
								</tr>
							</thead>
							<tbody>
								{#each scaled as ing (ing.id)}
									<tr class="border-t border-surface-500/20">
										<td class="px-4 py-3">{ing.name || '—'}</td>
										<td class="px-4 py-3 text-right font-mono opacity-60">
											{formatQuantity(ing.quantity)}{unitLabel(ing.unitId)}
										</td>
										<td class="px-4 py-3 text-right font-mono font-bold">
											{formatQuantity(ing.scaledQuantity)}{unitLabel(ing.unitId)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		{:else if tab === 'convert'}
			<div class="mx-auto max-w-xl space-y-6 p-5 sm:p-8">
				<div>
					<div class="font-mono text-xs uppercase tracking-widest opacity-50">Tool</div>
					<h2 class="text-3xl font-bold">Convert Units</h2>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<label class="flex flex-col gap-1">
						<span class="font-mono text-xs uppercase tracking-wide opacity-60">Amount</span>
						<input class="input" type="number" step="any" bind:value={convAmount} />
					</label>
					<label class="flex flex-col gap-1">
						<span class="font-mono text-xs uppercase tracking-wide opacity-60">From</span>
						<select class="select" bind:value={convFrom}>
							<optgroup label="Volume">
								{#each UNITS_BY_DIMENSION.volume as u (u.id)}
									<option value={u.id}>{u.name}</option>
								{/each}
							</optgroup>
							<optgroup label="Weight">
								{#each UNITS_BY_DIMENSION.weight as u (u.id)}
									<option value={u.id}>{u.name}</option>
								{/each}
							</optgroup>
						</select>
					</label>
					<label class="flex flex-col gap-1">
						<span class="font-mono text-xs uppercase tracking-wide opacity-60">To</span>
						<select class="select" bind:value={convTo}>
							{#each convToOptions as u (u.id)}
								<option value={u.id}>{u.name}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="rounded-lg border border-surface-500/30 bg-surface-100-900 p-6 text-center">
					{#if convResult !== null}
						<div class="font-mono text-sm opacity-60">
							{formatQuantity(convAmount)}
							{getUnit(convFrom)?.name}{convAmount === 1 ? '' : 's'} =
						</div>
						<div class="text-4xl font-bold">
							{Math.round(convResult * 1000) / 1000}
							<span class="text-2xl opacity-70">{getUnit(convTo)?.name}{convResult === 1 ? '' : 's'}</span>
						</div>
					{:else}
						<span class="opacity-60">Pick two units of the same type.</span>
					{/if}
				</div>
			</div>
		{:else}
			<div class="mx-auto max-w-xl space-y-6 p-5 sm:p-8">
				<div>
					<div class="font-mono text-xs uppercase tracking-widest opacity-50">Tool</div>
					<h2 class="text-3xl font-bold">Find a Substitute</h2>
				</div>

				<label class="flex flex-col gap-1">
					<span class="font-mono text-xs uppercase tracking-wide opacity-60">
						Out of an ingredient? Search for swaps.
					</span>
					<input
						class="input"
						type="text"
						bind:value={subQuery}
						placeholder="e.g. butter, egg, buttermilk"
					/>
				</label>

				{#if subQuery.trim() && subResults.length === 0}
					<p class="opacity-60">No substitutions found for “{subQuery}”.</p>
				{/if}

				<div class="space-y-3">
					{#each subResults as result (result.ingredient)}
						<div class="rounded-lg border border-surface-500/30 bg-surface-100-900 p-4">
							<div class="font-bold capitalize">{result.ingredient}</div>
							<ul class="mt-2 space-y-2">
								{#each result.substitutes as sub (sub.name)}
									<li class="text-sm">
										<span class="font-medium">{sub.name}</span>
										{#if sub.ratio !== 1}
											<span class="badge preset-tonal-primary ml-1 font-mono">×{sub.ratio}</span>
										{/if}
										{#if sub.note}
											<span class="block opacity-60">{sub.note}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</main>

	<footer class="border-t border-surface-500/30 px-4 py-4 font-mono text-sm opacity-50 sm:px-6">
		All measurements approximate — especially in baking.
	</footer>
</div>
