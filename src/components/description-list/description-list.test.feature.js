import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, accessibleRole, fixture, nextFrame, sizeOf, useForcedColors } from '../../test-helpers.js';
import { define } from './description-list.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const box = (node) => {
    const { left, top, right, bottom, width, height } = node.getBoundingClientRect();
    const round = (value) => Math.round(value * 10) / 10;
    return {
        left: round(left),
        top: round(top),
        right: round(right),
        bottom: round(bottom),
        width: round(width),
        height: round(height),
    };
};

// The tokens of a theme, in values that are easy to tell apart.
const tokens = `
    --el-space-3: 12px; --el-space-4: 16px;
    --el-border-width: 1px; --el-color-border: rgb(200, 200, 200);
    --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(100, 100, 100); --el-font-size-sm: 14px;
`;
// A place with text of 16px on lines of 24px, on white.
const place = `font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255);`;
const placed = async (markup, width, style = tokens) => {
    const wrapper = await fixture(`<div style="${place} width: ${width}px; ${style}">${markup}</div>`);
    await nextFrame();
    return wrapper.firstElementChild;
};

const rows = `
    <dt>Plan</dt>
    <dd>Team, 12 seats</dd>
    <dd data-action><a href="#plan" aria-label="Change the plan">Change</a></dd>
    <dt>Address of the invoice</dt>
    <dd>12 Garden Road<br />1017 Amsterdam</dd>
    <dt>Created</dt>
    <dd>12 March 2026</dd>
`;
const list = (content = rows, attributes = '') => `<el-description-list ${attributes}>${content}</el-description-list>`;
const names = (el) => [...el.querySelectorAll('dt')];
const values = (el) => [...el.querySelectorAll('dd:not([data-action])')];

describe('Feature | DescriptionList', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-description-list></el-description-list>`);
        await nextFrame();
    });

    describe('native semantics', () => {
        it('is a dl, with the names and the values of the page as its children', async () => {
            const el = await placed(list(), 600);

            expect(part(el, 'base').tagName).toBe('DL');
            expect(names(el).every((name) => name.assignedSlot.parentElement === part(el, 'base'))).toBe(true);
            expect(values(el).every((value) => value.assignedSlot.parentElement === part(el, 'base'))).toBe(true);
        });

        it('is a description list of terms and their definitions for assistive technology', async () => {
            const el = await placed(list(), 600);

            expect(await accessibleRole(part(el, 'base'))).toBe('DescriptionList');
            expect(await accessibleRole(names(el)[0])).toBe('term');
            expect(await accessibleRole(values(el)[0])).toBe('definition');
        });

        it('has no detectable a11y violations, and the rules for a dl have looked at it', async () => {
            for (const width of [300, 600]) {
                const el = await placed(list(), width);

                const results = await axe.run(el.parentElement);
                expect(
                    results.violations.map((violation) => violation.id),
                    width,
                ).toEqual([]);
                const passed = results.passes.map((pass) => pass.id);
                expect(passed, width).toContain('definition-list');
                expect(passed, width).toContain('dlitem');
            }
        });
    });

    describe('in a narrow place', () => {
        it('puts a name above its value', async () => {
            const el = await placed(list(), 300);

            names(el).forEach((name, index) => {
                const value = values(el)[index];
                expect(box(value).top, name.textContent).toBe(box(name).bottom);
                expect(box(value).left, name.textContent).toBe(box(name).left);
            });
            expect(box(names(el)[0]).width).toBe(300);
        });

        it('keeps an action at the end of the row, on the line of the value', async () => {
            const el = await placed(list(), 300);
            const action = el.querySelector('[data-action]');
            const value = values(el)[0];

            expect(box(action).right).toBe(300 + box(el).left);
            expect(box(action).top).toBe(box(value).top);
            expect(box(action).height).toBe(24);
            expect(box(value).right).toBeLessThanOrEqual(box(action).left);
        });

        it('measures itself, not the viewport', async () => {
            // One width below 30rem and one from it: the viewport is on one side of that line, so
            // one of the two layouts is not the one a media query would give.
            const el = await placed(list(), 479);
            expect(box(values(el)[0]).top).toBe(box(names(el)[0]).bottom);

            el.parentElement.style.width = '480px';
            await nextFrame();
            expect(box(values(el)[0]).top).toBe(box(names(el)[0]).top);

            el.parentElement.style.width = '479px';
            await nextFrame();
            expect(box(values(el)[0]).top).toBe(box(names(el)[0]).bottom);
        });
    });

    describe('from a width of 30rem', () => {
        it('puts name and value side by side, and the values of all rows on one line', async () => {
            const el = await placed(list(), 600);

            names(el).forEach((name, index) => {
                expect(box(values(el)[index]).top, name.textContent).toBe(box(name).top);
            });
            expect(new Set(values(el).map((value) => box(value).left)).size).toBe(1);
            expect(new Set(names(el).map((name) => box(name).left)).size).toBe(1);
            expect(box(values(el)[0]).left).toBeGreaterThan(box(names(el)[1]).left + 100);
        });

        it('makes the column of the names as wide as the longest name, and 40% of the list at most', async () => {
            const el = await placed(list(), 600);
            const longest = names(el)[1];
            const probe = document.createElement('span');
            probe.style.cssText = 'font: 14px sans-serif; white-space: nowrap; position: absolute;';
            probe.textContent = longest.textContent;
            el.parentElement.append(probe);
            const textWidth = Math.ceil(probe.getBoundingClientRect().width);
            probe.remove();

            // The text of the longest name, and the gap to the values.
            expect(Math.abs(box(longest).width - (textWidth + 16))).toBeLessThanOrEqual(1);

            const long = await placed(list(`<dt>${'A very long name of a value '.repeat(6)}</dt><dd>Value</dd>`), 600);
            expect(box(names(long)[0]).width).toBe(240);
        });

        it('takes the width of the names from --el-description-list-term-width', async () => {
            const el = await placed(list(rows, 'style="--el-description-list-term-width: 200px"'), 600);

            expect(names(el).map((name) => box(name).width)).toEqual([200, 200, 200]);
            expect(values(el).map((value) => box(value).left - box(el).left)).toEqual([200, 200, 200]);
        });

        it('puts an action at the end of the row, in the middle of the first line of the value', async () => {
            const el = await placed(
                list(`
                    <dt>Plan</dt>
                    <dd>Team, 12 seats</dd>
                    <dd data-action><el-button size="small" appearance="plain" aria-label="Change the plan">Change</el-button></dd>
                    <dt>Created</dt>
                    <dd>12 March 2026</dd>
                `),
                600,
            );
            const action = el.querySelector('[data-action]');
            const button = action.querySelector('el-button');
            const [first, second] = values(el);

            expect(box(action).right).toBe(600 + box(el).left);
            // The row with the action is as high as the row without one.
            expect(box(first).height).toBe(box(second).height);
            expect(box(action).height).toBe(box(first).height);
            // The button is higher than a line, and stands in the middle of the line of the value.
            expect(box(button).height).toBeGreaterThan(24);
            const middleOfTheLine = box(first).top + 12 + 12;
            expect(Math.abs(box(button).top + box(button).height / 2 - middleOfTheLine)).toBeLessThanOrEqual(0.5);
        });

        it('gives every value of a name a row of its own', async () => {
            const el = await placed(list(`<dt>Owners</dt><dd>Ada Lovelace</dd><dd>Grace Hopper</dd>`), 600);
            const [ada, grace] = values(el);

            expect(box(grace).left).toBe(box(ada).left);
            expect(box(grace).top).toBe(box(ada).bottom);
        });
    });

    describe('an action', () => {
        it('says what it changes, by the name the page gives it', async () => {
            const el = await placed(list(), 600);
            const link = el.querySelector('[data-action] a');

            expect(await accessibleRole(link)).toBe('link');
            expect(await accessibleName(link)).toBe('Change the plan');
            // And it is a definition of its name: a screen reader reads it with the row.
            expect(await accessibleRole(link.parentElement)).toBe('definition');
        });
    });

    describe('lines and spacing', () => {
        const line = (name) => getComputedStyle(name, '::before');

        it('gives a row --el-space-3 above and below', async () => {
            const wide = await placed(list(), 600);
            const narrow = await placed(list(), 300);
            const padding = (node) => {
                const { paddingTop, paddingBottom } = getComputedStyle(node);
                return [paddingTop, paddingBottom];
            };

            expect(padding(names(wide)[0])).toEqual(['12px', '12px']);
            expect(padding(values(wide)[0])).toEqual(['12px', '12px']);
            expect(box(names(wide)[0]).height).toBe(48);
            // A name above its value shares the room of the row with it.
            expect(padding(names(narrow)[0])).toEqual(['12px', '0px']);
            expect(padding(values(narrow)[0])).toEqual(['0px', '12px']);
            expect(box(values(narrow)[0]).bottom - box(names(narrow)[0]).top).toBe(72);
        });

        it('draws a line above every row but the first, over the whole width of the list', async () => {
            for (const width of [300, 600]) {
                const el = await placed(list(), width);
                const [first, second, third] = names(el);

                expect(line(first).content, width).toBe('none');
                for (const name of [second, third]) {
                    expect(line(name).height, width).toBe('1px');
                    expect(line(name).backgroundColor, width).toBe('rgb(200, 200, 200)');
                    expect(line(name).width, width).toBe(`${width}px`);
                    // At the upper edge of the row: the padding of the name above its text.
                    expect(line(name).marginTop, width).toBe('-12px');
                    expect(line(name).position, width).toBe('absolute');
                }
            }
        });

        it('draws no line without a theme, and keeps its spacing', async () => {
            const el = await placed(list(), 600, '');

            expect(line(names(el)[1]).height).toBe('0px');
            expect(getComputedStyle(names(el)[0]).paddingTop).toBe('12px');
            expect(getComputedStyle(names(el)[0]).fontSize).toBe('14px');
        });

        it('has the quieter colour and the smaller size of the theme for a name', async () => {
            const el = await placed(list(), 600);

            expect(getComputedStyle(names(el)[0]).color).toBe('rgb(100, 100, 100)');
            expect(getComputedStyle(names(el)[0]).fontSize).toBe('14px');
            expect(getComputedStyle(values(el)[0]).color).toBe('rgb(10, 10, 10)');
            // A line of a name is as high as a line of a value, so the two are not moved against each other.
            expect(getComputedStyle(names(el)[0]).lineHeight).toBe('24px');
        });

        it('looks the same on a page with a reset', async () => {
            const look = (el) => ({
                names: names(el).map((name) => [box(name), line(name).height, line(name).backgroundColor]),
                values: [...el.querySelectorAll('dd')].map(box),
            });
            const before = {};
            for (const width of [300, 600]) before[width] = look(await placed(list(), width));

            // What Tailwind CSS takes off every element, in no layer.
            const reset = new CSSStyleSheet();
            reset.replaceSync(`
                *, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; }
                dl, dd { margin: 0; }
            `);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, reset];
            const after = {};
            for (const width of [300, 600]) after[width] = look(await placed(list(), width));
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== reset);

            const relative = (state) =>
                JSON.parse(JSON.stringify(state), (key, value) =>
                    key === 'top' || key === 'bottom' ? undefined : value,
                );
            expect(relative(after)).toEqual(relative(before));
        });
    });

    describe('long texts', () => {
        const long = 'averyveryverylongvaluewithoutanyspaceatallthatauserhastypedintoafieldandthatgoesonandonandon';

        it('breaks a long value and a long name anywhere, and stays as wide as its place', async () => {
            for (const width of [300, 600]) {
                const el = await placed(
                    list(`<dt>${long}</dt><dd>${long}${long}</dd><dd data-action><a href="#x">Change</a></dd>`),
                    width,
                );

                expect(sizeOf(el).width, width).toBe(width);
                expect(el.parentElement.scrollWidth, width).toBe(width);
                expect(part(el, 'base').scrollWidth, width).toBe(width);
                expect(box(values(el)[0]).height, width).toBeGreaterThan(48);
            }
        });
    });

    describe('with forced colours', () => {
        useForcedColors();

        it('keeps the line between two rows', async () => {
            const el = await placed(list(), 600);
            const line = getComputedStyle(names(el)[1], '::before');

            expect(matchMedia('(forced-colors: active)').matches).toBe(true);
            expect(line.height).toBe('1px');
            // The text colour of the system, not the colour of the theme and not nothing.
            expect(line.backgroundColor).toBe(getComputedStyle(document.documentElement).color);
        });
    });
});
