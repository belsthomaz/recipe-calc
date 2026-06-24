import { describe, it, expect } from 'vitest';
import { convert, canConvert, compatibleUnits } from './units';

describe('convert', () => {
	it('converts within volume', () => {
		expect(convert(1, 'cup', 'tbsp')).toBeCloseTo(16, 1);
		expect(convert(1, 'l', 'ml')).toBeCloseTo(1000, 5);
		expect(convert(3, 'tsp', 'tbsp')).toBeCloseTo(1, 2);
	});

	it('converts within weight', () => {
		expect(convert(1, 'kg', 'g')).toBeCloseTo(1000, 5);
		expect(convert(1, 'lb', 'oz')).toBeCloseTo(16, 1);
	});

	it('throws across dimensions', () => {
		expect(() => convert(1, 'cup', 'g')).toThrow();
	});
});

describe('canConvert', () => {
	it('allows same dimension', () => {
		expect(canConvert('cup', 'ml')).toBe(true);
	});
	it('rejects different dimensions', () => {
		expect(canConvert('cup', 'g')).toBe(false);
	});
	it('rejects count units', () => {
		expect(canConvert('piece', 'piece')).toBe(false);
	});
});

describe('compatibleUnits', () => {
	it('returns only same-dimension units', () => {
		const ids = compatibleUnits('cup').map((u) => u.dimension);
		expect(new Set(ids)).toEqual(new Set(['volume']));
	});
});
