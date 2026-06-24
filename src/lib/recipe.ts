// Recipe data model, scaling and quantity formatting for RecipeCalc.

import { getUnit } from './units';

export interface Ingredient {
	id: string;
	quantity: number;
	unitId: string;
	name: string;
}

export interface Recipe {
	title: string;
	servings: number;
	ingredients: Ingredient[];
}

export function createIngredient(partial: Partial<Ingredient> = {}): Ingredient {
	return {
		id: crypto.randomUUID(),
		quantity: partial.quantity ?? 1,
		unitId: partial.unitId ?? 'cup',
		name: partial.name ?? ''
	};
}

/** Scale a single quantity by a factor, e.g. doubling a recipe. */
export function scaleQuantity(quantity: number, factor: number): number {
	return quantity * factor;
}

/** Factor needed to go from a recipe's current servings to a target. */
export function servingsFactor(currentServings: number, targetServings: number): number {
	if (currentServings <= 0) return 1;
	return targetServings / currentServings;
}

// Common cooking fractions, used to render decimals as kitchen-friendly values.
const FRACTIONS: [number, string][] = [
	[1 / 8, '⅛'],
	[1 / 4, '¼'],
	[1 / 3, '⅓'],
	[3 / 8, '⅜'],
	[1 / 2, '½'],
	[5 / 8, '⅝'],
	[2 / 3, '⅔'],
	[3 / 4, '¾'],
	[7 / 8, '⅞']
];

/**
 * Format a quantity for display. Volume/weight amounts round to a sensible
 * precision; small amounts snap to common cooking fractions (e.g. 0.5 → "½").
 */
export function formatQuantity(quantity: number): string {
	if (!isFinite(quantity)) return '0';
	if (quantity === 0) return '0';

	const whole = Math.floor(quantity);
	const remainder = quantity - whole;

	// Try to snap the fractional part to a familiar cooking fraction.
	const tolerance = 0.04;
	for (const [value, glyph] of FRACTIONS) {
		if (Math.abs(remainder - value) < tolerance) {
			return whole > 0 ? `${whole} ${glyph}` : glyph;
		}
	}
	if (remainder < tolerance) return String(whole);

	// Otherwise fall back to a trimmed decimal with up to two places.
	const rounded = Math.round(quantity * 100) / 100;
	return String(rounded);
}

/** Full "1 ½ cup flour" style line for an ingredient. */
export function formatIngredient(ingredient: Ingredient): string {
	const unit = getUnit(ingredient.unitId);
	const qty = formatQuantity(ingredient.quantity);
	const label = unit?.label ? ` ${unit.label}` : '';
	return `${qty}${label} ${ingredient.name}`.trim();
}
