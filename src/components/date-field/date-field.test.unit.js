import { describe, it, expect } from 'vite-plus/test';
import DateField, { define } from './date-field.js';
define();

// The properties of an element that is not connected are plain fields.
const field = (state = {}) => Object.assign(new DateField(), { min: null, max: null, step: null, ...state });

describe('Unit | DateField', () => {
    it('can be created without errors', async () => {
        const el = new DateField();
        expect(el).toBeInstanceOf(DateField);
    });

    it('takes a date by default, with no limits and the step of the browser', () => {
        const { type, value, min, max, step } = new DateField().properties();
        expect([type, value, min, max, step]).toEqual(['date', null, null, null, null]);
    });

    it('gives the limits and the step to the control', () => {
        expect(field({ min: '2026-01-01', max: '2026-12-31', step: 7 })._controlAttributes()).toEqual({
            min: '2026-01-01',
            max: '2026-12-31',
            step: 7,
        });
        expect(field({ step: 'any' })._controlAttributes().step).toBe('any');
    });

    it('leaves out a limit and a step that are not set, or empty', () => {
        expect(field()._controlAttributes()).toEqual({ min: null, max: null, step: null });
        expect(field({ min: '', max: '', step: '' })._controlAttributes()).toEqual({
            min: null,
            max: null,
            step: null,
        });
    });
});
