import { describe, it, expect } from 'vite-plus/test';
import RatingField, { define } from './rating-field.js';
define();

describe('Unit | RatingField', () => {
    // The properties of an element that is not connected are plain fields.
    const field = (state) => Object.assign(new RatingField(), { max: 5, value: null, required: false }, state);

    it('can be created without errors', async () => {
        const el = new RatingField();
        expect(el).toBeInstanceOf(RatingField);
    });

    it('has five stars and nothing chosen by default', () => {
        const { max, value, required } = new RatingField().properties();
        expect([max, value, required]).toEqual([5, null, false]);
    });

    it('has one step per star, and five for a max that is no number of stars', () => {
        expect(field({ max: 3 })._steps()).toEqual([1, 2, 3]);
        expect(field({ max: '10' })._steps()).toHaveLength(10);
        expect(field({ max: 4.9 })._steps()).toEqual([1, 2, 3, 4]);
        for (const max of [0, -2, 'many', null]) expect(field({ max })._steps()).toEqual([1, 2, 3, 4, 5]);
    });

    it('takes a value as chosen only where the scale has that step', () => {
        expect(field({ value: '3' })._chosen()).toBe(3);
        expect(field({ value: 3 })._chosen()).toBe(3);
        for (const value of [null, '', '0', '6', '2.5', 'good']) expect(field({ value })._chosen()).toBe(0);
    });

    it('is valid without a rating unless it is required', () => {
        expect(field({ required: false })._computeValid()).toBe(true);
        expect(field({ required: true })._computeValid()).toBe(false);
        expect(field({ required: true, value: '2' })._computeValid()).toBe(true);
    });
});
