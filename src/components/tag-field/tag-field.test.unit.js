import { describe, it, expect } from 'vite-plus/test';
import TagField, { define } from './tag-field.js';
define();

// The properties of an element that is not connected are plain fields.
const field = (state = {}) => Object.assign(new TagField(), { value: [], required: false, ...state });

describe('Unit | TagField', () => {
    it('can be created without errors', async () => {
        const el = new TagField();
        expect(el).toBeInstanceOf(TagField);
    });

    it('has no entries by default, and English words for a screen reader', () => {
        const { value, size, placeholder, removeLabel, addedLabel, removedLabel, status } = new TagField().properties();
        expect([value, size, placeholder, removeLabel, addedLabel, removedLabel, status]).toEqual([
            [],
            'medium',
            '',
            'Remove',
            'Added',
            'Removed',
            '',
        ]);
    });

    it('reads its value as a list of texts', () => {
        expect(field({ value: ['a', 'b'] })._values()).toEqual(['a', 'b']);
        expect(field({ value: null })._values()).toEqual([]);
        expect(field({ value: '' })._values()).toEqual([]);
        // An attribute that is no JSON list, and one that reads as a number.
        expect(field({ value: 'a' })._values()).toEqual(['a']);
        expect(field({ value: [1, 2] })._values()).toEqual(['1', '2']);
    });

    it('is valid without an entry unless it is required', () => {
        expect(field()._computeValid()).toBe(true);
        expect(field({ required: true })._computeValid()).toBe(false);
        expect(field({ required: true, value: ['a'] })._computeValid()).toBe(true);
    });

    it('adds entries trimmed, and neither an empty one nor one twice', () => {
        const el = field({ value: ['a'], addedLabel: 'Added' });

        el._add([' b ', '', 'a', 'b', '  ', 'c']);

        expect(el.value).toEqual(['a', 'b', 'c']);
        expect(el.status).toBe('Added b, c');
    });

    it('changes nothing when there is nothing to add', () => {
        const value = ['a'];
        const el = field({ value, status: 'before' });

        el._add(['a', ' ']);

        expect(el.value).toBe(value);
        expect(el.status).toBe('before');
    });
});
