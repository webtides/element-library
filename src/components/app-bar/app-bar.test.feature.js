import { describe, it, expect, afterEach } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    useForcedColors,
    useSafeAreaInsets,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './app-bar.js';
import { define as defineAppFrame } from '../app-frame/app-frame.js';
import { define as defineButton } from '../button/button.js';
define();
defineAppFrame();
defineButton();

const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

// A theme: a control height of 40px, borders of 1px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px; --el-touch-target: 44px;
    --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px;
    --el-font-size-sm: 14px; --el-font-size-md: 16px; --el-font-size-lg: 18px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10);
    --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(0, 0, 200);
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;

const bar = async (content, { attributes = '', width = 400, style = theme, dir = 'ltr' } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <el-app-bar ${attributes}>${content}</el-app-bar>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-app-bar');
};

/** A bar in the header of a frame that is a box of 600px. */
const framed = async (content, { width = 400, style = theme, dir = 'ltr', header = true } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <el-app-frame style="position: relative; height: 600px">
                ${header ? `<header slot="header">${content}</header>` : content.replace('<el-app-bar', '<el-app-bar slot="header"')}
                <main id="framed-main"><p>Content</p></main>
            </el-app-frame>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-app-bar');
};

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const control = (button) => button.shadowRoot.querySelector('[part="base"]');
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const box = (el, node) => {
    const origin = el.getBoundingClientRect();
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left - origin.left, top - origin.top, width, height].map((value) => Math.round(value * 10) / 10);
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const backAndActions = `
    <el-button slot="start" id="back" circle="true" aria-label="Back">←</el-button>
    Inbox
    <el-button slot="end" id="search" circle="true" aria-label="Search">s</el-button>
    <el-button slot="end" id="more" circle="true" aria-label="More">m</el-button>
`;

describe('Feature | AppBar', () => {
    describe('the row', () => {
        it('has the start, the title and the end in one row', async () => {
            const el = await bar(backAndActions);

            // A control of 40px and 8px above and below it, and the line of 1px.
            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57]);
            expect(box(el, el.querySelector('#back'))).toEqual([12, 8, 40, 40]);
            expect(box(el, part(el, 'title'))[0]).toBe(12 + 40 + 8);
            // The actions at the end, with a gap of 4px between them and 12px to the edge.
            expect(box(el, el.querySelector('#more'))).toEqual([400 - 12 - 40, 8, 40, 40]);
            expect(box(el, el.querySelector('#search'))).toEqual([400 - 12 - 40 - 4 - 40, 8, 40, 40]);
        });

        it('has the start at the right in a right-to-left page', async () => {
            const el = await bar(backAndActions, { dir: 'rtl' });

            expect(box(el, el.querySelector('#back'))).toEqual([400 - 12 - 40, 8, 40, 40]);
            expect(box(el, el.querySelector('#more'))).toEqual([12, 8, 40, 40]);
        });

        it('is as high without a button as with one', async () => {
            const el = await bar('Inbox');

            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57]);
            // The text is in the middle of the row.
            const [, top, , height] = box(el, part(el, 'title'));
            expect(top + height / 2).toBe(28);
        });

        it('gives a region the page leaves empty no room', async () => {
            const el = await bar('Inbox');

            expect(part(el, 'start').hidden).toBe(true);
            expect(part(el, 'end').hidden).toBe(true);
            // The title starts where the text of the content does: 12px and 4px.
            expect(box(el, part(el, 'title'))[0]).toBe(12);
            expect(getComputedStyle(part(el, 'title')).paddingLeft).toBe('4px');
        });

        it('makes room for a button that comes later', async () => {
            const el = await bar('Inbox');

            el.insertAdjacentHTML('beforeend', `<el-button slot="end" id="late">Save</el-button>`);
            await rendered();

            expect(part(el, 'end').hidden).toBe(false);
            expect(Math.round(el.querySelector('#late').getBoundingClientRect().right)).toBe(
                Math.round(el.getBoundingClientRect().right) - 12,
            );
        });
    });

    describe('the title', () => {
        const long = 'The title of a view that is much longer than the bar of a phone is wide';

        it('is cut with an ellipsis, and never pushes the actions out', async () => {
            const el = await bar(backAndActions.replace('Inbox', long));
            const title = part(el, 'title');

            expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
            expect(getComputedStyle(title).textOverflow).toBe('ellipsis');
            // One row still, and the actions where they are with a short title.
            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57]);
            expect(box(el, el.querySelector('#more'))).toEqual([400 - 12 - 40, 8, 40, 40]);
            // The title ends where the actions start, with the gap.
            const [left, , width] = box(el, title);
            expect(left + width).toBe(400 - 12 - 40 - 4 - 40 - 8);
        });

        it('gives the whole title to assistive technology', async () => {
            const el = await bar(backAndActions.replace('Inbox', long), { attributes: 'heading-level="1"' });

            expect(await accessibleName(part(el, 'title'))).toBe(long);
        });

        it('is text by default', async () => {
            const el = await bar('Inbox');

            expect(part(el, 'title').hasAttribute('role')).toBe(false);
            expect(await accessibleRole(part(el, 'title'))).not.toBe('heading');
        });

        it('is the heading of the view at the level the page sets', async () => {
            const el = await bar('Inbox', { attributes: 'heading-level="1"' });
            const title = part(el, 'title');

            expect(await accessibleRole(title)).toBe('heading');
            expect(title.getAttribute('aria-level')).toBe('1');
            expect(await accessibleName(title)).toBe('Inbox');

            el.headingLevel = 2;
            await rendered();
            expect(title.getAttribute('aria-level')).toBe('2');

            el.setAttribute('heading-level', '0');
            await rendered();
            expect(title.hasAttribute('role')).toBe(false);
            expect(title.hasAttribute('aria-level')).toBe(false);
        });

        it('is no heading at a level that is none', async () => {
            const el = await bar('Inbox', { attributes: 'heading-level="7"' });
            expect(part(el, 'title').hasAttribute('role')).toBe(false);
        });

        it('cuts a heading the page writes itself the same way, without its margin and its size', async () => {
            const el = await bar(
                `<h1>${long}</h1><el-button slot="end" id="more" circle="true" aria-label="More">m</el-button>`,
            );
            const heading = el.querySelector('h1');

            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57]);
            expect(getComputedStyle(heading).marginTop).toBe('0px');
            expect(getComputedStyle(heading).fontSize).toBe('18px');
            expect(getComputedStyle(heading).textOverflow).toBe('ellipsis');
            expect(heading.scrollWidth).toBeGreaterThan(heading.clientWidth);
            expect(Math.round(el.querySelector('#more').getBoundingClientRect().right)).toBe(
                Math.round(el.getBoundingClientRect().right) - 12,
            );
        });
    });

    describe('the buttons', () => {
        it('are plain while they have no appearance of their own', async () => {
            const el = await bar(`
                Inbox
                <el-button slot="end" id="plain">Edit</el-button>
                <el-button slot="end" id="own" variant="brand" appearance="filled">New</el-button>
            `);
            const paint = (id) => {
                const { backgroundColor, borderTopColor } = getComputedStyle(control(el.querySelector(id)));
                return [backgroundColor, borderTopColor];
            };

            expect(paint('#plain')).toEqual([TRANSPARENT, TRANSPARENT]);
            expect(paint('#own')).toEqual(['rgb(0, 0, 200)', 'rgb(0, 0, 200)']);
        });

        it('take the appearance the bar names', async () => {
            const el = await bar(`Inbox <el-button slot="end" id="edit">Edit</el-button>`, {
                attributes: 'appearance="outlined"',
            });
            const { backgroundColor, borderTopColor } = getComputedStyle(control(el.querySelector('#edit')));

            expect([backgroundColor, borderTopColor]).toEqual([TRANSPARENT, 'rgb(150, 150, 150)']);
        });
    });

    describe('the surface and the line', () => {
        it('come from the tokens', async () => {
            const el = await bar('Inbox');
            const { backgroundColor, color, borderBottomWidth, borderBottomColor } = getComputedStyle(part(el, 'base'));

            expect([backgroundColor, color]).toEqual(['rgb(255, 255, 255)', 'rgb(10, 10, 10)']);
            expect([borderBottomWidth, borderBottomColor]).toEqual(['1px', 'rgb(150, 150, 150)']);
        });

        it('paint nothing without a theme, so the bar reads as the page does', async () => {
            for (const scheme of ['light', 'dark']) {
                const el = await bar(`Inbox <el-button slot="end">Edit</el-button>`, {
                    style: `color-scheme: ${scheme}; background: Canvas; color: CanvasText; font: 16px/24px sans-serif;`,
                    attributes: 'heading-level="1"',
                });
                const { backgroundColor, color, borderBottomWidth } = getComputedStyle(part(el, 'base'));

                expect(backgroundColor).toBe(TRANSPARENT);
                expect(color).toBe(getComputedStyle(el.parentElement).color);
                expect(borderBottomWidth).toBe('0px');

                const results = await axe.run(el.parentElement, { runOnly: ['color-contrast'] });
                expect(results.violations).toEqual([]);
            }
        });

        it('is not moved outside of a frame: the surface is the element', async () => {
            const el = await bar('Inbox');
            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57]);
            expect(el.getBoundingClientRect().height).toBe(57);
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        it('keeps the line to the content, and has it without a theme as well', async () => {
            const themed = await bar('Inbox');
            const bare = await bar('Inbox', { style: 'font: 16px/24px sans-serif;' });

            expect(getComputedStyle(part(themed, 'base')).borderBottomWidth).toBe('1px');
            expect(getComputedStyle(part(themed, 'base')).borderBottomColor).not.toBe('rgb(150, 150, 150)');
            expect(getComputedStyle(part(bare, 'base')).borderBottomWidth).toBe('1px');
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('is at least as high as a finger needs, and so is a button in it', async () => {
            // A theme with small controls: 24px.
            const el = await bar(backAndActions, { style: `${theme} --el-control-height: 24px;` });
            const row = part(el, 'row');
            const back = control(el.querySelector('#back'));

            expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
            expect(back.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
            expect(back.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
        });

        it('stays as it is without the token', async () => {
            const el = await bar('Inbox', {
                style: theme.replace('--el-touch-target: 44px;', '').replace('40px', '24px'),
            });

            // A control of 24px and 8px above and below it.
            expect(part(el, 'row').getBoundingClientRect().height).toBe(40);
        });
    });

    describe('in the header of a frame', () => {
        it('adds no landmark: the header of the page is the banner', async () => {
            const el = await framed(`<el-app-bar heading-level="1">${backAndActions}</el-app-bar>`);

            expect(await accessibleRole(el.closest('header'))).toBe('banner');
            for (const name of ['base', 'row', 'start', 'end']) {
                expect(await accessibleRole(part(el, name))).not.toMatch(
                    /banner|navigation|main|complementary|contentinfo|region|toolbar/,
                );
            }
            expect(await accessibleRole(el)).not.toMatch(/banner|navigation|main|complementary|contentinfo|region/);
        });

        it('leaves the line to the region, which draws it', async () => {
            const el = await framed(`<el-app-bar>${backAndActions}</el-app-bar>`);
            const frame = el.closest('el-app-frame');
            const header = frame.shadowRoot.querySelector('[part~="header"]');

            expect(getComputedStyle(part(el, 'base')).borderBottomWidth).toBe('0px');
            expect(getComputedStyle(header).borderBottomWidth).toBe('1px');
            // 56px of bar and one line.
            expect(header.getBoundingClientRect().height).toBe(57);
        });
    });

    describe('in the header of a frame, on a phone with a notch', () => {
        useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

        for (const header of [true, false]) {
            const how = header ? 'in the header of the page' : 'as the element of the slot itself';

            it(`reaches up under the status bar with its surface, and its content does not (${how})`, async () => {
                const el = await framed(`<el-app-bar>${backAndActions}</el-app-bar>`, { header });
                const frame = el.closest('el-app-frame');

                // The surface: from the corner of the frame, as wide as the frame, 47px higher.
                expect(box(frame, part(el, 'base'))).toEqual([0, 0, 400, 47 + 56]);
                // The row: below the status bar, clear of the sides.
                expect(box(frame, part(el, 'row'))).toEqual([10, 47, 370, 56]);
                expect(box(frame, el.querySelector('#back'))).toEqual([10 + 12, 47 + 8, 40, 40]);
                expect(box(frame, el.querySelector('#more'))).toEqual([400 - 20 - 12 - 40, 47 + 8, 40, 40]);
                // The region of the frame is as high as the bar and its line: the room is there once.
                expect(box(frame, frame.shadowRoot.querySelector('[part~="header"]'))).toEqual([0, 0, 400, 104]);
            });
        }

        it('paints the room of the system in its own colour', async () => {
            const el = await framed(`<el-app-bar>${backAndActions}</el-app-bar>`, {
                style: `${theme} --el-color-bg: rgb(0, 0, 100);`,
            });
            const frame = el.closest('el-app-frame');
            const { left, top } = frame.getBoundingClientRect();

            // A point under the status bar, in the corner at the left.
            const hit = document.elementFromPoint(left + 3, top + 3);
            expect(hit).toBe(el);
            expect(getComputedStyle(part(el, 'base')).backgroundColor).toBe('rgb(0, 0, 100)');
        });

        it('keeps the room once in a page that resets every margin and padding', async () => {
            const reset = new CSSStyleSheet();
            reset.replaceSync(
                '*, ::before, ::after { margin: 0; padding: 0; box-sizing: border-box; border-width: 0; }',
            );
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, reset];
            try {
                const el = await framed(`<el-app-bar>${backAndActions}</el-app-bar>`);
                const frame = el.closest('el-app-frame');

                expect(box(frame, part(el, 'base'))).toEqual([0, 0, 400, 47 + 56]);
                expect(box(frame, part(el, 'row'))).toEqual([10, 47, 370, 56]);
                expect(box(frame, frame.shadowRoot.querySelector('[part~="header"]'))).toEqual([0, 0, 400, 104]);
            } finally {
                document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== reset);
            }
        });

        it('swaps the sides in a right-to-left page', async () => {
            const el = await framed(`<el-app-bar>${backAndActions}</el-app-bar>`, { dir: 'rtl' });
            const frame = el.closest('el-app-frame');

            // The start is at the right, where the room of the system is 20px.
            expect(box(frame, part(el, 'row'))).toEqual([10, 47, 370, 56]);
            expect(box(frame, el.querySelector('#back'))).toEqual([400 - 20 - 12 - 40, 47 + 8, 40, 40]);
        });
    });

    describe('accessibility', () => {
        it('passes axe', async () => {
            const el = await bar(backAndActions, { attributes: 'heading-level="1"' });
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe in the header of a frame', async () => {
            const el = await framed(`<el-app-bar heading-level="1">${backAndActions}</el-app-bar>`);
            const results = await axe.run(el.closest('el-app-frame').parentElement);
            expect(results.violations).toEqual([]);
        });
    });
});
