import { describe, it, expect, beforeAll, afterAll } from 'vite-plus/test';
import { fixture, sizeOf } from '../test-helpers.js';
import utilities from './utilities.css?raw';

describe('Feature | Styles | utilities.css', () => {
    let style;
    beforeAll(() => {
        style = document.createElement('style');
        style.textContent = utilities;
        document.head.append(style);
    });
    afterAll(() => style.remove());

    it('takes an element with el-visually-hidden off the screen and keeps it in the accessibility tree', async () => {
        // The inline styles stand for the styles of the element the class is put on.
        const label = await fixture(`
            <label class="el-visually-hidden" style="display: block; width: 200px; padding: 8px">Search</label>
        `);
        expect(sizeOf(label)).toEqual({ width: 1, height: 1 });
        expect(getComputedStyle(label).position).toBe('absolute');
        expect(getComputedStyle(label).display).not.toBe('none');
        expect(getComputedStyle(label).visibility).toBe('visible');
    });

    it('shows the element again while the focus is inside', async () => {
        const link = await fixture(`<a class="el-visually-hidden" href="#main">Skip to the content</a>`);
        expect(sizeOf(link).width).toBe(1);

        link.focus();
        expect(sizeOf(link).width).toBeGreaterThan(1);
        expect(getComputedStyle(link).position).toBe('static');
    });
});
