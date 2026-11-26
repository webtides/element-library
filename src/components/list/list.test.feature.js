import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    sizeOf,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './list.js';
import { define as defineItem } from '../list-item/list-item.js';
define();
defineItem();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const left = (node) => Math.round(node.getBoundingClientRect().left * 10) / 10;

// The tokens of a theme, in values that are easy to tell apart.
const tokens = `
    --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px;
    --el-border-width: 1px; --el-color-border: rgb(200, 200, 200);
    --el-color-bg: rgb(255, 255, 255); --el-color-bg-muted: rgb(240, 240, 240);
    --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(100, 100, 100);
    --el-color-accent: rgb(0, 0, 200); --el-radius-lg: 12px; --el-touch-target: 44px;
`;
// A place with text of 16px on lines of 24px, on white, 400px wide.
const place = `font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255); width: 400px;`;
const placed = async (markup, style = tokens) => {
    const wrapper = await fixture(`<div style="${place} ${style}">${markup}</div>`);
    await nextFrame();
    return wrapper.firstElementChild;
};

const rows = `
    <el-list-item href="#one">One<span slot="description">The first row</span></el-list-item>
    <el-list-item href="#two">Two<span slot="description">The second row</span></el-list-item>
    <el-list-item>Three<span slot="end">3</span></el-list-item>
`;

describe('Feature | List', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-list></el-list>`);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a list, and every row is an item of it', async () => {
            const el = await placed(`<el-list>${rows}</el-list>`);

            expect(await accessibleRole(part(el, 'base'))).toBe('list');
            for (const item of el.children) {
                expect(await accessibleRole(part(item, 'base'))).toBe('listitem');
            }
        });

        it('has no name of its own, and takes one from the label', async () => {
            const el = await placed(`<el-list>${rows}</el-list>`);
            expect(part(el, 'base').hasAttribute('aria-label')).toBe(false);

            el.label = 'Messages';
            await nextFrame();
            await nextFrame();
            expect(await accessibleName(part(el, 'base'))).toBe('Messages');
        });

        it('has no detectable a11y violations, and the list and its rows are seen as such', async () => {
            const el = await placed(`<el-list label="Rows" appearance="outlined">${rows}</el-list>`);

            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            // The rules that look at a list have found one: its rows are in the shadow roots of
            // other elements.
            const passed = results.passes.map((pass) => pass.id);
            expect(passed).toContain('aria-required-children');
            expect(passed).toContain('aria-required-parent');
        });
    });

    describe('the place where the texts begin', () => {
        const withStarts = `
            <el-list>
                <el-list-item>
                    <span slot="start" style="display:block;width:40px;height:40px"></span>
                    A wide start
                </el-list-item>
                <el-list-item>
                    <span slot="start" style="display:block;width:16px;height:16px"></span>
                    A narrow start
                </el-list-item>
                <el-list-item>No start</el-list-item>
                <el-list-item mark="Unread">No start, and a mark</el-list-item>
            </el-list>
        `;

        it('is one line for all rows, after the widest start', async () => {
            const el = await placed(withStarts);
            const starts = [...el.children].map((item) => left(part(item, 'title')));

            // The padding of the row, the widest start and the gap.
            expect(starts).toEqual([68, 68, 68, 68].map((x) => x + left(el)));
        });

        it('is the padding of the row in a list without a start', async () => {
            const el = await placed(`<el-list>${rows}</el-list>`);
            const starts = [...el.children].map((item) => left(part(item, 'title')) - left(el));

            expect(starts).toEqual([16, 16, 16]);
        });

        it('is not moved by a mark, which is a dot in the padding of the row', async () => {
            const el = await placed(`
                <el-list>
                    <el-list-item>First</el-list-item>
                    <el-list-item>Read</el-list-item>
                    <el-list-item mark="Unread">Not read</el-list-item>
                </el-list>
            `);
            const [, read, unread] = el.children;
            const mark = part(unread, 'mark').getBoundingClientRect();
            const row = part(unread, 'base').getBoundingClientRect();

            expect(left(part(unread, 'title'))).toBe(left(part(read, 'title')));
            expect(sizeOf(part(unread, 'base')).height).toBe(sizeOf(part(read, 'base')).height);
            expect(part(read, 'mark')).toBeNull();
            // In the middle of the padding, and of the height.
            expect(Math.round(mark.left + mark.width / 2 - row.left)).toBe(8);
            expect(Math.round(mark.top + mark.height / 2 - row.top)).toBe(Math.round(row.height / 2));
            expect(getComputedStyle(part(unread, 'mark')).borderTopColor).toBe('rgb(0, 0, 200)');
        });

        it('follows the reading direction', async () => {
            const el = await placed(`
                <el-list dir="rtl">
                    <el-list-item mark="Unread" current="true">
                        <span slot="start" style="display:block;width:40px;height:40px"></span>
                        Title
                        <span slot="end">End</span>
                    </el-list-item>
                </el-list>
            `);
            const item = el.firstElementChild;
            const row = part(item, 'base').getBoundingClientRect();
            const mark = part(item, 'mark').getBoundingClientRect();
            const start = item.querySelector('[slot="start"]').getBoundingClientRect();
            const end = item.querySelector('[slot="end"]').getBoundingClientRect();

            expect(Math.round(row.right - start.right)).toBe(16);
            expect(Math.round(row.right - (mark.left + mark.width / 2))).toBe(8);
            expect(Math.round(end.left - row.left)).toBe(16);
            expect(part(item, 'title').getBoundingClientRect().right).toBeLessThan(start.left);
        });
    });

    describe('density', () => {
        it('gives a row --el-space-3 above and below its texts, and --el-space-2 when compact', async () => {
            const el = await placed(`<el-list>${rows}</el-list>`);
            const padding = () => {
                const { paddingTop, paddingBottom } = getComputedStyle(part(el.children[0], 'base'));
                return [paddingTop, paddingBottom];
            };
            expect(padding()).toEqual(['12px', '12px']);

            el.density = 'compact';
            await nextFrame();
            await nextFrame();
            expect(el.getAttribute('density')).toBe('compact');
            expect(padding()).toEqual(['8px', '8px']);
        });

        it('keeps its proportions without a theme', async () => {
            const el = await placed(
                `<el-list><el-list-item>One</el-list-item></el-list>
                 <el-list density="compact"><el-list-item>One</el-list-item></el-list>`,
                '',
            );
            const compact = el.nextElementSibling;

            expect(getComputedStyle(part(el.children[0], 'base')).paddingTop).toBe('12px');
            expect(getComputedStyle(part(compact.children[0], 'base')).paddingTop).toBe('8px');
            expect(getComputedStyle(part(el.children[0], 'base')).paddingLeft).toBe('16px');
        });
    });

    describe('lines and surface', () => {
        it('draws a line between two rows, and none above the first', async () => {
            const el = await placed(`<el-list>${rows}</el-list>`);
            const lines = [...el.children].map((item) => {
                const { borderTopWidth, borderTopColor } = getComputedStyle(part(item, 'base'));
                return `${borderTopWidth} ${borderTopColor}`;
            });

            expect(lines).toEqual(['0px rgb(10, 10, 10)', '1px rgb(200, 200, 200)', '1px rgb(200, 200, 200)']);
        });

        it('draws no line and no surface without a theme', async () => {
            const el = await placed(`<el-list appearance="outlined">${rows}</el-list>`, '');
            const base = getComputedStyle(part(el, 'base'));

            expect([...el.children].map((item) => getComputedStyle(part(item, 'base')).borderTopWidth)).toEqual([
                '0px',
                '0px',
                '0px',
            ]);
            expect(base.borderTopWidth).toBe('0px');
            expect(base.backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(base.borderTopLeftRadius).toBe('0px');
        });

        it('reaches from edge to edge of its place when plain', async () => {
            const el = await placed(`<el-list>${rows}</el-list>`);
            const base = getComputedStyle(part(el, 'base'));

            expect(sizeOf(el).width).toBe(400);
            expect([...el.children].map((item) => sizeOf(part(item, 'base')).width)).toEqual([400, 400, 400]);
            expect(base.borderTopWidth).toBe('0px');
            expect(base.backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(base.borderTopLeftRadius).toBe('0px');
        });

        it('lies as a card when outlined, and on a muted fill when filled', async () => {
            const el = await placed(`<el-list appearance="outlined">${rows}</el-list>`);
            const base = () => getComputedStyle(part(el, 'base'));

            expect(base().backgroundColor).toBe('rgb(255, 255, 255)');
            expect(base().borderTopWidth).toBe('1px');
            expect(base().borderTopColor).toBe('rgb(200, 200, 200)');
            expect(base().borderTopLeftRadius).toBe('12px');
            // The corners clip the fill of a row.
            expect(base().overflow).toBe('hidden');

            el.appearance = 'filled';
            await nextFrame();
            await nextFrame();
            expect(el.getAttribute('appearance')).toBe('filled');
            expect(base().backgroundColor).toBe('rgb(240, 240, 240)');
            expect(base().borderTopWidth).toBe('1px');
        });

        it('takes the padding at the start and the end of a row from --el-list-padding-inline', async () => {
            const el = await placed(`<el-list style="--el-list-padding-inline: 0px">${rows}</el-list>`);
            const base = getComputedStyle(part(el.children[0], 'base'));

            expect([base.paddingLeft, base.paddingRight]).toEqual(['0px', '0px']);
            expect(left(part(el.children[0], 'title'))).toBe(left(el));
        });

        it('keeps the line of a row on a page that takes the border off every element', async () => {
            // A reset as Tailwind CSS has one. It is in no layer, and it reaches the hosts.
            const reset = new CSSStyleSheet();
            reset.replaceSync('*, ::before, ::after { border-width: 0; border-style: solid; }');
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, reset];

            const el = await placed(`<el-list appearance="outlined">${rows}</el-list>`);
            const widths = [
                getComputedStyle(part(el, 'base')).borderTopWidth,
                getComputedStyle(part(el.children[1], 'base')).borderTopWidth,
            ];
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== reset);

            expect(widths).toEqual(['1px', '1px']);
        });
    });

    describe('a list in a row of another list', () => {
        it('has columns of its own', async () => {
            const el = await placed(`
                <el-list>
                    <el-list-item>
                        <span slot="start" style="display:block;width:40px;height:40px"></span>
                        Outer
                        <el-list slot="description" style="--el-list-padding-inline: 0px">
                            <el-list-item>
                                <span slot="start" style="display:block;width:10px;height:10px"></span>
                                Inner
                            </el-list-item>
                        </el-list>
                    </el-list-item>
                </el-list>
            `);
            const outer = el.firstElementChild;
            const inner = outer.querySelector('el-list-item');

            // After its own start and the gap, not after the start of the row around it.
            expect(left(part(inner, 'title')) - left(part(inner, 'base'))).toBe(22);
            expect(sizeOf(part(inner, 'title')).height).toBe(24);
        });
    });

    describe('with forced colours', () => {
        useForcedColors();

        it('keeps the bar of the current row and the dot of a mark', async () => {
            const el = await placed(`
                <el-list>
                    <el-list-item href="#one" current="true" mark="Unread">One</el-list-item>
                    <el-list-item href="#two">Two</el-list-item>
                </el-list>
            `);
            const current = el.children[0];
            const bar = getComputedStyle(part(current, 'base'), '::before');
            const other = getComputedStyle(part(el.children[1], 'base'), '::before');

            expect(matchMedia('(forced-colors: active)').matches).toBe(true);
            expect(bar.borderInlineStartWidth).toBe('3px');
            expect(bar.borderInlineStartStyle).toBe('solid');
            expect(other.content).toBe('none');
            expect(getComputedStyle(part(current, 'mark')).borderTopWidth).toBe('4px');
            // And the weight, which no colour is needed for.
            expect(getComputedStyle(part(current, 'title')).fontWeight).toBe('600');
            expect(getComputedStyle(part(el.children[1], 'title')).fontWeight).toBe('400');
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes a compact row that is a link at least --el-touch-target high', async () => {
            const el = await placed(`
                <el-list density="compact">
                    <el-list-item href="#one">One</el-list-item>
                    <el-list-item>Two</el-list-item>
                </el-list>
            `);

            expect(sizeOf(part(el.children[0], 'base')).height).toBe(44);
            // A row that is no target stays as compact as it is: 8 + 24 + 8, and the line above it.
            expect(sizeOf(part(el.children[1], 'base')).height).toBe(41);
        });
    });
});
