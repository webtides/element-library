import { describe, it, expect } from 'vite-plus/test';
import OtpField, { define, Events } from './otp-field.js';
define();

// The properties of an element that is not connected are plain fields.
const field = (state = {}) => Object.assign(new OtpField(), { length: 6, pattern: false, ...state });

describe('Unit | OtpField', () => {
    it('can be created without errors', async () => {
        const el = new OtpField();
        expect(el).toBeInstanceOf(OtpField);
    });

    it('is a code of six digits by default, which a phone can fill in', () => {
        const { length, pattern, autocomplete, inputmode, type } = new OtpField().properties();
        expect([length, pattern, autocomplete, inputmode, type]).toEqual([
            6,
            false,
            'one-time-code',
            'numeric',
            'text',
        ]);
    });

    it('names its event', () => {
        expect(Events.COMPLETE).toBe('input-complete');
    });

    it('has a pattern of as many digits as the code is long, or the one of the page', () => {
        expect(field()._pattern()).toBe('[0-9]{6}');
        expect(field({ length: 4 })._pattern()).toBe('[0-9]{4}');
        expect(field({ length: 8, pattern: '[A-Z0-9]{8}' })._pattern()).toBe('[A-Z0-9]{8}');
    });

    it('takes a length that is no number of characters as six', () => {
        for (const length of [0, -2, 'many', null, undefined, NaN]) {
            expect([length, field({ length })._length()]).toEqual([length, 6]);
        }
        expect(field({ length: '8' })._length()).toBe(8);
        expect(field({ length: 4.9 })._length()).toBe(4);
    });

    it('takes spaces and hyphens out of a code and cuts it at its length', () => {
        const clean = (text, state) => field(state)._clean(text);

        expect(clean('123 456')).toBe('123456');
        expect(clean('123-456')).toBe('123456');
        expect(clean(' 12 34 56\n')).toBe('123456');
        expect(clean('1234567890')).toBe('123456');
        expect(clean('12 34 56 78', { length: 4 })).toBe('1234');
        // Nothing else is taken out.
        expect(clean('12a.56')).toBe('12a.56');
        expect(clean(null)).toBe('');
    });

    it('has no complete code before it has a control', () => {
        expect(new OtpField()._completeCode()).toBe(null);
    });
});
