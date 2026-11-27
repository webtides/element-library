import { describe, it, expect } from 'vite-plus/test';
import FileField, { accepts, define } from './file-field.js';
define();

describe('Unit | FileField', () => {
    it('can be created without errors', async () => {
        const el = new FileField();
        expect(el).toBeInstanceOf(FileField);
    });

    it('takes one file of every kind by default, and has none', () => {
        const { value, accept, multiple, capture, size, dropMessage } = new FileField().properties();
        expect([value, accept, multiple, capture, size, dropMessage]).toEqual([[], '', false, null, 'medium', '']);
    });

    it('knows which files an accept attribute names: endings, types and groups of types', () => {
        const pdf = new File(['x'], 'Report.PDF', { type: 'application/pdf' });
        const png = new File(['x'], 'photo.png', { type: 'image/png' });
        const plain = new File(['x'], 'notes', { type: '' });

        // Without one every file is taken.
        expect([pdf, png, plain].map((file) => accepts('', file))).toEqual([true, true, true]);
        // An ending, whatever its case.
        expect([pdf, png, plain].map((file) => accepts('.pdf', file))).toEqual([true, false, false]);
        expect(accepts('.PDF', pdf)).toBe(true);
        // A type, and a group of types.
        expect([pdf, png].map((file) => accepts('application/pdf', file))).toEqual([true, false]);
        expect([pdf, png].map((file) => accepts('image/*', file))).toEqual([false, true]);
        // Several, with spaces between them.
        expect([pdf, png, plain].map((file) => accepts(' .docx , image/* ,application/pdf', file))).toEqual([
            true,
            true,
            false,
        ]);
        // An ending is not found in the middle of a name.
        expect(accepts('.pdf', new File(['x'], 'a.pdf.exe'))).toBe(false);
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
