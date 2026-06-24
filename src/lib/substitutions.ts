// Ingredient substitution data for RecipeCalc.
//
// Each entry maps an ingredient to one or more substitutes. `ratio` is how much
// of the substitute replaces one unit of the original (1 = same amount), and
// `note` carries any preparation caveats.

export interface Substitute {
	name: string;
	ratio: number;
	note?: string;
}

export interface Substitution {
	/** Canonical ingredient name. */
	ingredient: string;
	/** Extra search terms that should match this entry. */
	aliases?: string[];
	substitutes: Substitute[];
}

export const SUBSTITUTIONS: Substitution[] = [
	{
		ingredient: 'butter',
		substitutes: [
			{ name: 'margarine', ratio: 1 },
			{ name: 'coconut oil', ratio: 1, note: 'Best for baking; adds mild coconut flavor.' },
			{ name: 'olive oil', ratio: 0.75, note: 'Use 3/4 the amount; not ideal for flaky pastry.' },
			{ name: 'unsweetened applesauce', ratio: 0.5, note: 'Halves fat; makes baked goods denser.' }
		]
	},
	{
		ingredient: 'egg',
		aliases: ['eggs'],
		substitutes: [
			{ name: 'flax egg (1 tbsp ground flax + 3 tbsp water)', ratio: 1, note: 'Rest 5 min to gel. Per egg.' },
			{ name: 'unsweetened applesauce', ratio: 1, note: '¼ cup per egg. Best in cakes/muffins.' },
			{ name: 'mashed banana', ratio: 1, note: '¼ cup per egg. Adds banana flavor.' },
			{ name: 'commercial egg replacer', ratio: 1, note: 'Follow package ratio.' }
		]
	},
	{
		ingredient: 'buttermilk',
		substitutes: [
			{ name: 'milk + 1 tbsp lemon juice or vinegar per cup', ratio: 1, note: 'Let stand 5–10 min to curdle.' },
			{ name: 'plain yogurt thinned with milk', ratio: 1 }
		]
	},
	{
		ingredient: 'milk',
		substitutes: [
			{ name: 'almond milk', ratio: 1 },
			{ name: 'oat milk', ratio: 1 },
			{ name: 'soy milk', ratio: 1 },
			{ name: 'water + 1.5 tsp butter per cup', ratio: 1, note: 'In a pinch for baking.' }
		]
	},
	{
		ingredient: 'heavy cream',
		aliases: ['heavy whipping cream'],
		substitutes: [
			{ name: 'whole milk + melted butter (¾ cup milk + ¼ cup butter per cup)', ratio: 1, note: "Won't whip." },
			{ name: 'evaporated milk', ratio: 1, note: 'For cooking, not whipping.' },
			{ name: 'full-fat coconut cream', ratio: 1, note: 'Dairy-free; adds coconut flavor.' }
		]
	},
	{
		ingredient: 'sour cream',
		substitutes: [
			{ name: 'plain Greek yogurt', ratio: 1, note: 'Closest 1:1 swap.' },
			{ name: 'crème fraîche', ratio: 1 }
		]
	},
	{
		ingredient: 'sugar',
		aliases: ['white sugar', 'granulated sugar'],
		substitutes: [
			{ name: 'honey', ratio: 0.75, note: 'Reduce other liquids by ~¼ cup per cup; lower oven temp 25°F.' },
			{ name: 'maple syrup', ratio: 0.75, note: 'Reduce other liquids slightly.' },
			{ name: 'coconut sugar', ratio: 1 }
		]
	},
	{
		ingredient: 'brown sugar',
		substitutes: [
			{ name: 'white sugar + 1 tbsp molasses per cup', ratio: 1 },
			{ name: 'coconut sugar', ratio: 1 }
		]
	},
	{
		ingredient: 'all-purpose flour',
		aliases: ['flour', 'plain flour'],
		substitutes: [
			{ name: 'whole wheat flour', ratio: 1, note: 'Denser; try replacing half to start.' },
			{ name: 'cake flour (1 cup + 2 tbsp per cup)', ratio: 1, note: 'Lighter crumb.' },
			{ name: '1-to-1 gluten-free flour blend', ratio: 1 }
		]
	},
	{
		ingredient: 'baking powder',
		substitutes: [
			{ name: '¼ tsp baking soda + ½ tsp cream of tartar (per 1 tsp)', ratio: 1, note: 'Use immediately.' }
		]
	},
	{
		ingredient: 'breadcrumbs',
		substitutes: [
			{ name: 'crushed crackers', ratio: 1 },
			{ name: 'rolled oats', ratio: 1 },
			{ name: 'crushed cornflakes', ratio: 1 }
		]
	},
	{
		ingredient: 'cornstarch',
		aliases: ['corn starch', 'cornflour'],
		substitutes: [
			{ name: 'all-purpose flour', ratio: 2, note: 'Use twice as much to thicken.' },
			{ name: 'arrowroot powder', ratio: 1 }
		]
	},
	{
		ingredient: 'lemon juice',
		substitutes: [
			{ name: 'lime juice', ratio: 1 },
			{ name: 'white vinegar', ratio: 0.5, note: 'Use half; sharper. For acidity, not flavor.' }
		]
	},
	{
		ingredient: 'vegetable oil',
		aliases: ['canola oil'],
		substitutes: [
			{ name: 'melted butter', ratio: 1 },
			{ name: 'applesauce', ratio: 1, note: 'For baking; reduces fat.' },
			{ name: 'olive oil', ratio: 1, note: 'For non-sweet recipes.' }
		]
	},
	{
		ingredient: 'garlic clove',
		aliases: ['garlic'],
		substitutes: [{ name: 'garlic powder (⅛ tsp per clove)', ratio: 1 }]
	},
	{
		ingredient: 'fresh herbs',
		substitutes: [{ name: 'dried herbs (⅓ the amount)', ratio: 0.333, note: 'Dried are more potent.' }]
	}
];

/** Find substitution entries whose name or aliases match the query. */
export function findSubstitutions(query: string): Substitution[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	return SUBSTITUTIONS.filter((s) => {
		const terms = [s.ingredient, ...(s.aliases ?? [])];
		return terms.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()));
	});
}
