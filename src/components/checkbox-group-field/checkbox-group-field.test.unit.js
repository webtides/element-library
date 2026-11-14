import { describe, it, expect } from 'vite-plus/test';
import CheckboxGroupField, { define } from './checkbox-group-field.js';
define();

describe('Unit | CheckboxGroupField', () => {
    it('can be created without errors', async () => {
        const el = new CheckboxGroupField();
        expect(el).toBeInstanceOf(CheckboxGroupField);
    });

    it('has no options and nothing checked by default', () => {
        const { value, options, required } = new CheckboxGroupField().properties();
        expect([value, options, required]).toEqual([[], [], false]);
    });

    it('reads its value as a list of texts', () => {
        // The properties of an element that is not connected are plain fields.
        const values = (value) => Object.assign(new CheckboxGroupField(), { value })._values();

        expect(values(['news', 'offers'])).toEqual(['news', 'offers']);
        expect(values([1, 2])).toEqual(['1', '2']);
        // An attribute that is no JSON list arrives as a single value.
        expect(values('news')).toEqual(['news']);
        expect(values(null)).toEqual([]);
        expect(values('')).toEqual([]);
    });

    it('is valid without a checked option unless it is required', () => {
        const valid = (state) => Object.assign(new CheckboxGroupField(), state)._computeValid();

        expect(valid({ value: [], required: false })).toBe(true);
        expect(valid({ value: [], required: true })).toBe(false);
        expect(valid({ value: ['news'], required: true })).toBe(true);
    });
});
