import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, accessibleRole, fixture, nextFrame, sizeOf } from '../../test-helpers.js';
import { define } from './breadcrumb.js';
import { define as defineItem } from '../breadcrumb-item/breadcrumb-item.js';
define();
defineItem();

const part = (el, name) => el.shadowRoot.querySelector(`[part="${name}"]`);
const trail = `
    <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
    <el-breadcrumb-item href="/shoes">Shoes</el-breadcrumb-item>
    <el-breadcrumb-item href="/shoes/running">Running</el-breadcrumb-item>
    <el-breadcrumb-item current="true">Trail runner 4</el-breadcrumb-item>
`;
// A place with text of 20px on lines of 30px, on white.
const place = `font: 20px/30px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255);`;
const placed = async (markup, style = '') => {
    const wrapper = await fixture(`<div style="${place} ${style}">${markup}</div>`);
    return wrapper.firstElementChild;
};

describe('Feature | Breadcrumb', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-breadcrumb></el-breadcrumb>`);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a navigation landmark named "Breadcrumb"', async () => {
            const el = await fixture(`<el-breadcrumb>${trail}</el-breadcrumb>`);

            expect(part(el, 'base').tagName).toBe('NAV');
            expect(await accessibleRole(part(el, 'base'))).toBe('navigation');
            expect(await accessibleName(part(el, 'base'))).toBe('Breadcrumb');
        });

        it('takes its name from the label, also when it is set from a script', async () => {
            const el = await fixture(`<el-breadcrumb label="Brotkrumen">${trail}</el-breadcrumb>`);
            expect(await accessibleName(part(el, 'base'))).toBe('Brotkrumen');

            el.label = "Fil d'Ariane";
            await nextFrame();
            expect(await accessibleName(part(el, 'base'))).toBe("Fil d'Ariane");
        });

        it('holds a list, and every item is an entry of it', async () => {
            const el = await fixture(`<el-breadcrumb>${trail}</el-breadcrumb>`);

            expect(await accessibleRole(part(el, 'list'))).toBe('list');
            for (const item of el.children) {
                expect(await accessibleRole(item.shadowRoot.querySelector('[part="base"]'))).toBe('listitem');
            }
        });

        it('has no detectable a11y violations, and the list and its entries are seen as such', async () => {
            const el = await placed(`<el-breadcrumb>${trail}</el-breadcrumb>`);

            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            // The entries are in the shadow roots of the items, with the element of the item between
            // them and the list: the rules for a list and its entries have looked through it.
            const passes = results.passes.map((pass) => pass.id);
            expect(passes).toContain('aria-required-children');
            expect(passes).toContain('aria-required-parent');
        });
    });

    describe('the row', () => {
        it('puts the entries in one row, in the middle of its height', async () => {
            const el = await placed(`<el-breadcrumb>${trail}</el-breadcrumb>`, 'width: 600px;');

            expect(sizeOf(el)).toEqual({ width: 600, height: 30 });
            const tops = [...el.children].map((item) => item.getBoundingClientRect().top);
            expect(new Set(tops).size).toBe(1);
        });

        it('leaves the same space on both sides of a separator', async () => {
            const el = await placed(`<el-breadcrumb>${trail}</el-breadcrumb>`, 'width: 600px; --el-space-2: 10px;');
            const [home, shoes] = el.children;
            const separator = shoes.shadowRoot.querySelector('[part="separator"]').getBoundingClientRect();
            const name = shoes.shadowRoot.querySelector('[part="label"]').getBoundingClientRect();

            expect(Math.round(separator.left - home.getBoundingClientRect().right)).toBe(10);
            expect(Math.round(name.left - separator.right)).toBe(10);
        });

        it('breaks into a second line where it does not fit, and starts that line with a separator', async () => {
            const el = await placed(`<el-breadcrumb>${trail}</el-breadcrumb>`, 'width: 220px; --el-space-1: 4px;');
            const tops = [...el.children].map((item) => Math.round(item.getBoundingClientRect().top));
            const lines = [...new Set(tops)];

            expect(lines.length).toBeGreaterThan(1);
            // Lines of 30px with 4px between them.
            expect(sizeOf(el).height).toBe(lines.length * 30 + (lines.length - 1) * 4);
            expect(el.scrollWidth).toBeLessThanOrEqual(220);

            const firstOfSecondLine = el.children[tops.indexOf(lines[1])];
            const separator = firstOfSecondLine.shadowRoot.querySelector('[part="separator"]');
            expect(Math.round(separator.getBoundingClientRect().left)).toBe(
                Math.round(el.getBoundingClientRect().left),
            );
        });

        it('breaks a name that is longer than the row inside of its entry', async () => {
            const el = await placed(
                `<el-breadcrumb>
                    <el-breadcrumb-item href="/">Home</el-breadcrumb-item>
                    <el-breadcrumb-item current="true">A trail runner with a name that is far too long for one line</el-breadcrumb-item>
                </el-breadcrumb>`,
                'width: 220px;',
            );

            expect(el.scrollWidth).toBeLessThanOrEqual(220);
            expect(el.lastElementChild.getBoundingClientRect().right).toBeLessThanOrEqual(
                el.getBoundingClientRect().right,
            );
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-breadcrumb hidden>${trail}</el-breadcrumb>`);
            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('separator', () => {
        const separatorOf = (item) =>
            getComputedStyle(item.shadowRoot.querySelector('[part="separator"]'), '::before').content;

        it('lets a page set the separator of every entry at once', async () => {
            const el = await placed(`<el-breadcrumb style="--el-breadcrumb-separator: '›'">${trail}</el-breadcrumb>`);
            expect([...el.children].map(separatorOf)).toEqual(['"›"', '"›"', '"›"', '"›"']);
        });

        it('takes a separator that is set for the whole page', async () => {
            const el = await placed(`<el-breadcrumb>${trail}</el-breadcrumb>`, "--el-breadcrumb-separator: '·';");
            expect(separatorOf(el.lastElementChild)).toBe('"·"');
        });
    });

    it('has the landmark, its name and the list in the server-rendered markup', async () => {
        const el = await fixture(`<el-breadcrumb label="Brotkrumen">${trail}</el-breadcrumb>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<nav part="base" class="breadcrumb"/);
        expect(markup).toMatch(/\saria-label=['"]Brotkrumen['"]/);
        expect(markup).toMatch(/\srole=['"]list['"]/);
    });
});
