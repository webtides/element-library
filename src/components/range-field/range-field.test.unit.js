import { describe, it, expect } from 'vite-plus/test';
import RangeField, { define } from './range-field.js';
define();

describe('Unit | RangeField', () => {
    it('can be created without errors', async () => {
        const el = new RangeField();
        expect(el).toBeInstanceOf(RangeField);
    });

    it('has the span of a native range by default, and no value', () => {
        const { min, max, step, value, showValue } = new RangeField().properties();
        expect([min, max, step, value, showValue]).toEqual([0, 100, 1, null, false]);
    });

    it('keeps room for the longest value of the span', () => {
        // The properties of an element that is not connected are plain fields.
        const longest = (span) => Object.assign(new RangeField(), span)._longestValue();

        expect(longest({ min: 0, max: 100, step: 1 })).toBe('100');
        expect(longest({ min: -20, max: 5, step: 1 })).toBe('-20');
        // A value between the ends has the decimals of the step.
        expect(longest({ min: 0, max: 1, step: 0.05 })).toBe('0.00');
        expect(longest({ min: 0.5, max: 10, step: 1 })).toBe('10.0');
        expect(longest({ min: 0, max: 10, step: 'any' })).toBe('10');
    });
});
