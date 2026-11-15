import { describe, it, expect } from 'vite-plus/test';
import ComboboxField, { define } from './combobox-field.js';
define();

// The properties of an element that is not connected are plain fields.
const field = (state = {}) => Object.assign(new ComboboxField(), { options: [], ...state });

describe('Unit | ComboboxField', () => {
    it('can be created without errors', async () => {
        const el = new ComboboxField();
        expect(el).toBeInstanceOf(ComboboxField);
    });

    it('is a text input without suggestions by default', () => {
        const { options, type, value, pattern } = new ComboboxField().properties();
        expect([options, type, value, pattern]).toEqual([[], 'text', null, false]);
    });

    it('takes the suggestions as texts and as option objects', () => {
        expect(
            field({ options: ['Berlin', { value: 'Bern' }, { value: 'ZRH', label: 'Zurich' }, 7] })._suggestions(),
        ).toEqual([
            { value: 'Berlin', label: null },
            { value: 'Bern', label: null },
            { value: 'ZRH', label: 'Zurich' },
            { value: '7', label: null },
        ]);
    });

    it('suggests nothing for options that are no list', () => {
        for (const options of [null, undefined, '', 'Berlin', 3, {}]) {
            expect([options, field({ options })._suggestions()]).toEqual([options, []]);
        }
    });

    it('names a list on the control only when it has suggestions', () => {
        const el = field({ options: ['Berlin'] });
        expect(el._controlAttributes()).toEqual({ list: `list-${el.uuid}` });
        expect(field()._controlAttributes()).toEqual({ list: null });
    });
});
