import { describe, it, expect } from 'vite-plus/test';
import ColorField, { define } from './color-field.js';
define();

// The properties of an element that is not connected are plain fields.
const colorsOf = (options) => Object.assign(new ColorField(), { options })._colors();

describe('Unit | ColorField', () => {
    it('can be created without errors', async () => {
        const el = new ColorField();
        expect(el).toBeInstanceOf(ColorField);
    });

    it('has no value, the medium size and no colours to offer by default', () => {
        const { value, size, showValue, options } = new ColorField().properties();
        expect([value, size, showValue, options]).toEqual([null, 'medium', false, []]);
    });

    it('takes the colours to offer as texts and as option objects', () => {
        expect(colorsOf(['#2563eb', { value: '#16a34a' }, { value: '#dc2626', label: 'Danger' }])).toEqual([
            { value: '#2563eb', label: null },
            { value: '#16a34a', label: null },
            { value: '#dc2626', label: 'Danger' },
        ]);
    });

    it('offers nothing for options that are no list', () => {
        for (const options of [null, undefined, '', '#2563eb', 3, {}]) {
            expect([options, colorsOf(options)]).toEqual([options, []]);
        }
    });
});
