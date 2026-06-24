// Measurement units and conversion logic for RecipeCalc.
//
// Units are grouped into dimensions (volume, weight). Conversion is only
// possible within the same dimension. Each unit stores its size relative to a
// base unit for that dimension (ml for volume, g for weight).

export type Dimension = 'volume' | 'weight' | 'count';

export interface Unit {
	id: string;
	/** Short label shown in the UI, e.g. "tbsp". */
	label: string;
	/** Singular long name, e.g. "tablespoon". */
	name: string;
	dimension: Dimension;
	/** Size of one of this unit expressed in the dimension's base unit. */
	toBase: number;
}

export const UNITS: Unit[] = [
	// Volume — base unit is the millilitre.
	{ id: 'tsp', label: 'tsp', name: 'teaspoon', dimension: 'volume', toBase: 4.92892 },
	{ id: 'tbsp', label: 'tbsp', name: 'tablespoon', dimension: 'volume', toBase: 14.7868 },
	{ id: 'floz', label: 'fl oz', name: 'fluid ounce', dimension: 'volume', toBase: 29.5735 },
	{ id: 'cup', label: 'cup', name: 'cup', dimension: 'volume', toBase: 236.588 },
	{ id: 'pint', label: 'pt', name: 'pint', dimension: 'volume', toBase: 473.176 },
	{ id: 'quart', label: 'qt', name: 'quart', dimension: 'volume', toBase: 946.353 },
	{ id: 'gallon', label: 'gal', name: 'gallon', dimension: 'volume', toBase: 3785.41 },
	{ id: 'ml', label: 'ml', name: 'millilitre', dimension: 'volume', toBase: 1 },
	{ id: 'l', label: 'l', name: 'litre', dimension: 'volume', toBase: 1000 },

	// Weight — base unit is the gram.
	{ id: 'g', label: 'g', name: 'gram', dimension: 'weight', toBase: 1 },
	{ id: 'kg', label: 'kg', name: 'kilogram', dimension: 'weight', toBase: 1000 },
	{ id: 'oz', label: 'oz', name: 'ounce', dimension: 'weight', toBase: 28.3495 },
	{ id: 'lb', label: 'lb', name: 'pound', dimension: 'weight', toBase: 453.592 },

	// Count — non-convertible, used for "2 eggs", "1 pinch", etc.
	{ id: 'none', label: '', name: '(none)', dimension: 'count', toBase: 1 },
	{ id: 'piece', label: 'pc', name: 'piece', dimension: 'count', toBase: 1 },
	{ id: 'pinch', label: 'pinch', name: 'pinch', dimension: 'count', toBase: 1 },
	{ id: 'clove', label: 'clove', name: 'clove', dimension: 'count', toBase: 1 }
];

const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));

export function getUnit(id: string): Unit | undefined {
	return UNIT_BY_ID.get(id);
}

/** Units that share a dimension with the given unit and can be converted to it. */
export function compatibleUnits(unitId: string): Unit[] {
	const unit = getUnit(unitId);
	if (!unit) return [];
	return UNITS.filter((u) => u.dimension === unit.dimension);
}

export function canConvert(fromId: string, toId: string): boolean {
	const from = getUnit(fromId);
	const to = getUnit(toId);
	return !!from && !!to && from.dimension === to.dimension && from.dimension !== 'count';
}

/**
 * Convert a quantity from one unit to another within the same dimension.
 * Throws if the units belong to different dimensions.
 */
export function convert(quantity: number, fromId: string, toId: string): number {
	const from = getUnit(fromId);
	const to = getUnit(toId);
	if (!from || !to) throw new Error(`Unknown unit: ${fromId} or ${toId}`);
	if (from.dimension !== to.dimension) {
		throw new Error(`Cannot convert ${from.name} (${from.dimension}) to ${to.name} (${to.dimension})`);
	}
	return (quantity * from.toBase) / to.toBase;
}

export const UNITS_BY_DIMENSION: Record<Dimension, Unit[]> = {
	volume: UNITS.filter((u) => u.dimension === 'volume'),
	weight: UNITS.filter((u) => u.dimension === 'weight'),
	count: UNITS.filter((u) => u.dimension === 'count')
};
