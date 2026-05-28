import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './select-field.js';
define();

describe('Feature | SelectField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-select-field></el-select-field>`);
        await nextFrame();
    });

    it('renders the placeholder and options as <option> elements', async () => {
        const el = await fixture(`
            <el-select-field
                name="size"
                label="Size"
                placeholder="Pick one"
                options='["sm", "md", "lg"]'
            ></el-select-field>
        `);
        await nextFrame();

        const options = el.querySelectorAll('select > option');
        expect(options).toHaveLength(4);
        expect(options[0].textContent.trim()).toBe('Pick one');
        expect(options[0].disabled).toBe(true);
        expect([...options].slice(1).map((o) => o.value)).toEqual(['sm', 'md', 'lg']);
    });

    it('has no detectable a11y violations when rendered with a label', async () => {
        const el = await fixture(`
            <el-select-field
                name="country"
                label="Country"
                placeholder="Select a country"
                options='["USA", "Canada", "Mexico"]'
            ></el-select-field>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });
});
