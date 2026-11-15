import { describe, it, expect } from 'vite-plus/test';
import FileField, { define } from './file-field.js';
define();

describe('Unit | FileField', () => {
    it('can be created without errors', async () => {
        const el = new FileField();
        expect(el).toBeInstanceOf(FileField);
    });

    it('takes one file of every kind by default, and has none', () => {
        const { value, accept, multiple, capture, size } = new FileField().properties();
        expect([value, accept, multiple, capture, size]).toEqual([[], '', false, null, 'medium']);
    });

    it('has no files before it has a control', () => {
        expect(new FileField().files).toEqual([]);
    });

    it('reads its value as a list of names', () => {
        // The properties of an element that is not connected are plain fields.
        const names = (value) => Object.assign(new FileField(), { value })._names();

        expect(names(['a.pdf', 'b.pdf'])).toEqual(['a.pdf', 'b.pdf']);
        expect(names(null)).toEqual([]);
        expect(names('')).toEqual([]);
        // An attribute that is no JSON list.
        expect(names('a.pdf')).toEqual(['a.pdf']);
    });
});
