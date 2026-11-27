import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    sizeOf,
    useForcedColors,
    withAndWithoutPageReset,
} from '../../test-helpers.js';
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
const round = (value) => Math.round(value * 10) / 10;
// The box of a name or a value, counted from the corner of the list.
const inList = (node, el) => {
    const { left, top, width, height } = box(node);
    return [round(left - box(el).left), round(top - box(el).top), width, height];
};
// The line above the row of a name, counted from the corner of the list. It is a box the name
// generates, placed in the list and moved with translate.
const lineOf = (name) => {
    const style = getComputedStyle(name, '::before');
    if (style.content === 'none') return null;
    const moved = style.translate === 'none' ? 0 : parseFloat(style.translate.split(' ')[1] ?? '0');
    return {
        left: round(parseFloat(style.left)),
        top: round(parseFloat(style.top) + moved),
        width: round(parseFloat(style.width)),
        height: round(parseFloat(style.height)),
    };
};
// All of a list that the eye sees: its size, its names, values and actions, and its lines.
const lookOf = (el) => ({
    list: sizeOf(el),
    names: names(el).map((node) => inList(node, el)),
    cells: [...el.querySelectorAll('dt, dd')].map((node) => inList(node, el)),
    inActions: [...el.querySelectorAll('[data-action] > *')].map((node) => inList(node, el)),
    lines: names(el).map(lineOf),
});

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

            // The text of the longest name. The values begin after the gap, --el-space-4.
            expect(Math.abs(box(longest).width - textWidth)).toBeLessThanOrEqual(1);
            expect(round(box(values(el)[1]).left - box(longest).right)).toBe(16);

            // The names and the gap after them take 40% of the list at most.
            const long = await placed(list(`<dt>${'A very long name of a value '.repeat(6)}</dt><dd>Value</dd>`), 600);
            expect(box(names(long)[0]).width).toBe(240 - 16);
            expect(box(values(long)[0]).left - box(long).left).toBe(240);
        });

        it('takes the width of the names from --el-description-list-term-width', async () => {
            const el = await placed(list(rows, 'style="--el-description-list-term-width: 200px"'), 600);

            expect(names(el).map((name) => box(name).width)).toEqual([200, 200, 200]);
            // The gap to the values comes after the column of the names.
            expect(values(el).map((value) => box(value).left - box(el).left)).toEqual([216, 216, 216]);
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
            // The row with the action is as high as the row without one: 12 + 24 + 12 each.
            expect(box(first).height).toBe(box(second).height);
            expect(box(second).top - box(first).top).toBe(48);
            expect(sizeOf(el).height).toBe(96);
            // The action is as high as a line of the value, and on that line.
            expect(box(action).height).toBe(24);
            expect(box(action).top).toBe(box(first).top);
            // The button is higher than a line, and stands in the middle of the line of the value.
            expect(box(button).height).toBeGreaterThan(24);
            const middleOfTheLine = box(first).top + 12;
            expect(Math.abs(box(button).top + box(button).height / 2 - middleOfTheLine)).toBeLessThanOrEqual(0.5);
            // The gap to the value, --el-space-4, is in front of the button.
            expect(round(box(button).left - box(first).right)).toBe(16);
        });

        it('gives every value of a name a row of its own', async () => {
            const el = await placed(list(`<dt>Owners</dt><dd>Ada Lovelace</dd><dd>Grace Hopper</dd>`), 600);
            const [ada, grace] = values(el);

            expect(box(grace).left).toBe(box(ada).left);
            // The room below one row and above the next.
            expect(box(grace).top - box(ada).bottom).toBe(24);
            expect(lineOf(names(el)[0])).toBeNull();
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

            // Side by side: 12 above the first line of a row, and 12 below its last one.
            expect(inList(names(wide)[0], wide)[1]).toBe(12);
            expect(inList(values(wide)[0], wide)[1]).toBe(12);
            expect(box(names(wide)[1]).top - box(values(wide)[0]).bottom).toBe(24);
            // The second row has a value of two lines.
            expect(box(names(wide)[2]).top - box(values(wide)[1]).bottom).toBe(24);
            expect(box(wide).bottom - box(values(wide)[2]).bottom).toBe(12);
            expect(sizeOf(wide).height).toBe(48 + 72 + 48);

            // A name above its value shares the room of the row with it.
            expect(inList(names(narrow)[0], narrow)[1]).toBe(12);
            expect(box(values(narrow)[0]).top).toBe(box(names(narrow)[0]).bottom);
            expect(box(names(narrow)[1]).top - box(values(narrow)[0]).bottom).toBe(24);
            expect(box(narrow).bottom - box(values(narrow)[2]).bottom).toBe(12);
            expect(sizeOf(narrow).height).toBe(72 + 96 + 72);
        });

        it('takes that room from the list, not from the padding or the margin of a name or a value', async () => {
            for (const width of [300, 600]) {
                const el = await placed(list(), width);

                for (const node of el.querySelectorAll('dt, dd')) {
                    const { padding, margin, borderTopWidth } = getComputedStyle(node);
                    expect([padding, margin, borderTopWidth], width).toEqual(['0px', '0px', '0px']);
                }
                // A name and a value are as high as their text.
                expect(box(names(el)[0]).height, width).toBe(24);
                expect(box(values(el)[1]).height, width).toBe(48);
            }
        });

        it('draws a line above every row but the first, over the whole width of the list', async () => {
            for (const width of [300, 600]) {
                const el = await placed(list(), width);
                const [first, second, third] = names(el);

                expect(lineOf(first), width).toBeNull();
                for (const name of [second, third]) {
                    expect(line(name).backgroundColor, width).toBe('rgb(200, 200, 200)');
                    expect(line(name).position, width).toBe('absolute');
                    // At the upper edge of the row: the room of the row above the text of the name.
                    expect(lineOf(name), width).toEqual({
                        left: 0,
                        top: inList(name, el)[1] - 12,
                        width,
                        height: 1,
                    });
                    // Placed without a margin, which a reset of the page would take.
                    expect(line(name).marginTop, width).toBe('0px');
                }
            }
        });

        it('draws no line without a theme, and keeps its spacing', async () => {
            const el = await placed(list(), 600, '');

            expect(line(names(el)[1]).height).toBe('0px');
            expect(inList(names(el)[0], el)[1]).toBe(12);
            expect(box(names(el)[1]).top - box(values(el)[0]).bottom).toBe(24);
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

        it('takes the room of a row from --el-description-list-padding-block', async () => {
            for (const width of [300, 600]) {
                const el = await placed(list(rows, 'style="--el-description-list-padding-block: 4px"'), width);

                expect(inList(names(el)[0], el)[1], width).toBe(4);
                expect(box(names(el)[1]).top - box(values(el)[0]).bottom, width).toBe(8);
                expect(box(el).bottom - box(values(el)[2]).bottom, width).toBe(4);
                expect(lineOf(names(el)[1]).top, width).toBe(inList(names(el)[1], el)[1] - 4);
            }
        });

        it('takes the gap between a name and its value, and in front of an action, from --el-description-list-gap', async () => {
            const wide = await placed(list(rows, 'style="--el-description-list-gap: 40px"'), 600);
            const narrow = await placed(list(rows, 'style="--el-description-list-gap: 40px"'), 300);

            expect(round(box(values(wide)[1]).left - box(names(wide)[1]).right)).toBe(40);
            for (const el of [wide, narrow]) {
                const action = el.querySelector('[data-action]');
                expect(round(box(action.firstElementChild).left - box(values(el)[0]).right)).toBe(40);
            }
        });

        it('has no height while nothing is in it', async () => {
            for (const width of [300, 600]) {
                const el = await placed(`<el-description-list></el-description-list>`, width);
                expect(sizeOf(el).height, width).toBe(0);
            }
        });
    });

    describe('on a page with a reset', () => {
        // The reset takes the margin, the padding and the border off every element and off what
        // an element generates: of a name, of a value, and of the line a name draws.
        const withoutAction = `
            <dt>Plan</dt>
            <dd>Team, 12 seats</dd>
            <dt>Address of the invoice</dt>
            <dd>12 Garden Road<br />1017 Amsterdam</dd>
            <dt>Owners</dt>
            <dd>Ada Lovelace</dd>
            <dd>Grace Hopper</dd>
        `;
        const cases = [
            ['narrow, with an action', rows, 300],
            ['narrow, without an action', withoutAction, 300],
            ['wide, with an action', rows, 600],
            ['wide, without an action', withoutAction, 600],
        ];

        for (const [name, content, width] of cases) {
            it(`has the same rows, gaps and lines as on a page without one: ${name}`, async () => {
                const { plain, reset } = await withAndWithoutPageReset(async () =>
                    lookOf(await placed(list(content), width)),
                );

                // The room of the rows and the lines are there, and they are the same.
                expect(plain.names[0][1]).toBe(12);
                expect(plain.lines[0]).toBeNull();
                expect(plain.lines[1]).toEqual({ left: 0, top: plain.names[1][1] - 12, width, height: 1 });
                expect(reset).toEqual(plain);
            });
        }

        it('has the same action with a button in it', async () => {
            for (const width of [300, 600]) {
                const { plain, reset } = await withAndWithoutPageReset(async () =>
                    lookOf(
                        await placed(
                            list(`
                                <dt>Plan</dt>
                                <dd>Team, 12 seats</dd>
                                <dd data-action><el-button size="small" appearance="plain">Change</el-button></dd>
                                <dt>Created</dt>
                                <dd>12 March 2026</dd>
                            `),
                            width,
                        ),
                    ),
                );

                expect(reset, width).toEqual(plain);
            }
        });

        it('lets a rule of the page for the look of a name or a value win', async () => {
            const look = new CSSStyleSheet();
            look.replaceSync(`
                el-description-list.styled > dt { color: rgb(1, 2, 3); font-size: 20px; }
                el-description-list.styled > dd { color: rgb(4, 5, 6); font-weight: 700; }
            `);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, look];
            try {
                const { plain, reset } = await withAndWithoutPageReset(async () => {
                    const el = await placed(list(rows, 'class="styled"'), 600);
                    const name = getComputedStyle(names(el)[0]);
                    const value = getComputedStyle(values(el)[0]);
                    return [name.color, name.fontSize, value.color, value.fontWeight];
                });

                expect(plain).toEqual(['rgb(1, 2, 3)', '20px', 'rgb(4, 5, 6)', '700']);
                expect(reset).toEqual(plain);
            } finally {
                document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== look);
            }
        });

        it('keeps the room of a row where the page lays a value out itself, and adds a padding of the page to it', async () => {
            for (const width of [300, 600]) {
                const el = await placed(
                    list(`
                        <dt>Tags</dt>
                        <dd style="display: flex; gap: 8px"><span>One</span><span>Two</span></dd>
                        <dt>Created</dt>
                        <dd style="padding-block: 6px">12 March 2026</dd>
                    `),
                    width,
                );
                const [tags, created] = values(el);

                expect(box(tags).height, width).toBe(24);
                expect(box(names(el)[1]).top - box(tags).bottom, width).toBe(24);
                // 12 of the list and 6 of the page, below the text of the last value.
                expect(box(created).height, width).toBe(36);
                expect(box(el).bottom - box(created).bottom, width).toBe(12);
            }
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
