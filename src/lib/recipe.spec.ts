import { describe, it, expect } from 'vitest';
import { scaleQuantity, servingsFactor, formatQuantity } from './recipe';

describe('scaleQuantity', () => {
	it('multiplies by a factor', () => {
		expect(scaleQuantity(2, 2)).toBe(4);
		expect(scaleQuantity(1.5, 0.5)).toBe(0.75);
	});
});

describe('servingsFactor', () => {
	it('computes target/current', () => {
		expect(servingsFactor(4, 8)).toBe(2);
		expect(servingsFactor(4, 2)).toBe(0.5);
	});
	it('guards against zero base servings', () => {
		expect(servingsFactor(0, 4)).toBe(1);
	});
});

describe('formatQuantity', () => {
	it('snaps to common fractions', () => {
		expect(formatQuantity(0.5)).toBe('½');
		expect(formatQuantity(0.25)).toBe('¼');
		expect(formatQuantity(1.5)).toBe('1 ½');
	});
	it('keeps whole numbers clean', () => {
		expect(formatQuantity(3)).toBe('3');
		expect(formatQuantity(0)).toBe('0');
	});
	it('falls back to decimals', () => {
		expect(formatQuantity(2.2)).toBe('2.2');
	});
});

describe('findSubstitutions', () => {
	it('matches by alias', async () => {
		const { findSubstitutions } = await import('./substitutions');
		expect(findSubstitutions('eggs').length).toBeGreaterThan(0);
		expect(findSubstitutions('flour')[0].ingredient).toContain('flour');
	});
});
