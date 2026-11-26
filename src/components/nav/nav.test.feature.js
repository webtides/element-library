import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
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
import { activeElement } from '../../utils/focus.js';
import { define } from './nav.js';
import { define as defineNavItem } from '../nav-item/nav-item.js';
import { define as defineAppFrame } from '../app-frame/app-frame.js';
import { define as defineBadge } from '../badge/badge.js';
define();
defineNavItem();
defineAppFrame();
defineBadge();

const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

// A theme: a control height of 40px, borders of 1px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px; --el-touch-target: 44px;
    --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px;
    --el-font-size-xs: 12px; --el-font-size-sm: 14px; --el-font-size-md: 16px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(90, 90, 90);
    --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(0, 0, 200);
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;

const icon = `<svg slot="icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>`;
const destination = (name, attributes = '', extra = '') =>
    `<el-nav-item id="${name.toLowerCase()}" href="#${name.toLowerCase()}" ${attributes}>${icon}${name}${extra}</el-nav-item>`;
const four = `
    ${destination('Inbox', 'current="true"')}
    ${destination('Today')}
    ${destination('Upcoming')}
    ${destination('Done')}
`;

const nav = async (content, { attributes = 'label="Main"', width = 400, style = theme, dir = 'ltr' } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <button class="before" type="button">Before</button>
            <el-nav ${attributes}>${content}</el-nav>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-nav');
};

/** A bar in the footer of a frame that is a box of 600px. */
const framed = async (content, { width = 400, style = theme, dir = 'ltr', attributes = '' } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <el-app-frame style="position: relative; height: 600px" ${attributes}>
                <main id="nav-main"><p>Content</p></main>
                <el-nav slot="footer" label="Main">${content}</el-nav>
            </el-app-frame>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-nav');
};

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const box = (origin, node) => {
    const from = origin.getBoundingClientRect();
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left - from.left, top - from.top, width, height].map((value) => Math.round(value * 10) / 10);
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

describe('Feature | Nav', () => {
    describe('the landmark', () => {
        it('is a navigation with the name of the page, and a list of links', async () => {
            const el = await nav(four);
            const base = part(el, 'base');

            expect(await accessibleRole(base)).toBe('navigation');
            expect(await accessibleName(base)).toBe('Main');
            expect(await accessibleRole(part(el, 'list'))).toBe('list');
            for (const item of el.querySelectorAll('el-nav-item')) {
                expect(await accessibleRole(part(item, 'base'))).toBe('listitem');
                expect(await accessibleRole(part(item, 'link'))).toBe('link');
            }
            expect(await accessibleName(part(el.querySelector('#today'), 'link'))).toBe('Today');
        });

        it('has no name while the page gives none', async () => {
            const el = await nav(four, { attributes: '' });
            expect(part(el, 'base').hasAttribute('aria-label')).toBe(false);

            el.label = 'Hauptnavigation';
            await rendered();
            expect(await accessibleName(part(el, 'base'))).toBe('Hauptnavigation');
        });

        it('marks the destination of the current view for assistive technology', async () => {
            const el = await nav(four);
            const link = (id) => part(el.querySelector(id), 'link');

            expect(link('#inbox').getAttribute('aria-current')).toBe('page');
            expect(link('#today').hasAttribute('aria-current')).toBe(false);

            el.querySelector('#inbox').current = false;
            el.querySelector('#today').setAttribute('current', 'true');
            await rendered();

            expect(link('#inbox').hasAttribute('aria-current')).toBe(false);
            expect(link('#today').getAttribute('aria-current')).toBe('page');
        });

        it('stops the Tab key at every destination: it is a navigation, not a menu', async () => {
            const el = await nav(four);
            el.parentElement.querySelector('.before').focus();

            const stops = [];
            for (let i = 0; i < 4; i++) {
                await userEvent.keyboard('{Tab}');
                stops.push(activeElement().getRootNode().host.id);
            }

            expect(stops).toEqual(['inbox', 'today', 'upcoming', 'done']);
        });
    });

    describe('a destination', () => {
        it('is a link with an address, and with a target the page names', async () => {
            const el = await nav(`
                ${destination('Inbox')}
                <el-nav-item id="docs" href="https://example.com/docs" target="_blank">${icon}Docs</el-nav-item>
            `);
            const inbox = part(el.querySelector('#inbox'), 'link');
            const docs = part(el.querySelector('#docs'), 'link');

            expect(inbox.getAttribute('href')).toBe('#inbox');
            expect(inbox.hasAttribute('target')).toBe(false);
            expect(inbox.hasAttribute('rel')).toBe(false);
            expect(docs.getAttribute('target')).toBe('_blank');
            expect(docs.getAttribute('rel')).toBe('noreferrer noopener');
        });

        it('has its icon over its text, in the middle', async () => {
            const el = await nav(four);
            const item = el.querySelector('#today');
            const [iconLeft, iconTop, iconWidth, iconHeight] = box(item, item.querySelector('svg'));
            const [labelLeft, labelTop, labelWidth] = box(item, part(item, 'label'));

            expect(labelTop).toBeGreaterThanOrEqual(iconTop + iconHeight);
            expect(iconLeft + iconWidth / 2).toBe(50);
            expect(Math.round(labelLeft + labelWidth / 2)).toBe(50);
        });

        it('reads a count with the name of the destination', async () => {
            const el = await nav(`
                ${destination('Inbox', '', '<el-badge slot="badge" pill="true" variant="danger">12</el-badge>')}
                ${destination('Today')}
                ${destination('Done')}
            `);
            const item = el.querySelector('#inbox');

            expect(await accessibleName(part(item, 'link'))).toBe('Inbox 12');
            // The badge is on the corner of the icon, and takes no room: the bar is as high as
            // without it.
            const badge = item.querySelector('el-badge').getBoundingClientRect();
            const drawing = item.querySelector('svg').getBoundingClientRect();
            expect(badge.left).toBeGreaterThan(drawing.left + drawing.width / 2);
            expect(badge.top).toBeLessThan(drawing.top + drawing.height / 2);
            expect(box(el, part(el, 'base'))[3]).toBe(57);
        });
    });

    describe('the bar', () => {
        it('gives three to five destinations the width in equal parts', async () => {
            for (const count of [3, 4, 5]) {
                const names = ['Inbox', 'Today', 'A much longer name', 'Done', 'More'].slice(0, count);
                const el = await nav(names.map((name, index) => destination(index === 2 ? 'Long' : name)).join(''));
                el.querySelector('#long').lastChild.textContent = 'A much longer name of a destination';
                await rendered();

                const widths = [...el.querySelectorAll('el-nav-item')].map((item) => box(el, item)[2]);
                expect(widths).toEqual(Array.from({ length: count }, () => Math.round(4000 / count) / 10));
            }
        });

        it('cuts a text that does not fit, and keeps its height', async () => {
            const el = await nav(`
                ${destination('Inbox')}
                <el-nav-item id="long" href="#long">${icon}A much longer name of a destination</el-nav-item>
                ${destination('Today')}
                ${destination('Upcoming')}
                ${destination('Done')}
            `);
            const label = part(el.querySelector('#long'), 'label');

            expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
            expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
            expect(label.getBoundingClientRect().height).toBeLessThan(20);
            // A control of 40px and 8px above and below it, and the line of 1px: as an app bar.
            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57]);
            // The whole text is there for assistive technology.
            expect(await accessibleName(part(el.querySelector('#long'), 'link'))).toBe(
                'A much longer name of a destination',
            );
        });

        it('has the first destination at the right in a right-to-left page', async () => {
            const el = await nav(four, { dir: 'rtl' });

            expect(box(el, el.querySelector('#inbox'))[0]).toBe(300);
            expect(box(el, el.querySelector('#done'))[0]).toBe(0);
        });

        it('has a surface and a line to the content from the tokens', async () => {
            const el = await nav(four);
            const { backgroundColor, borderTopWidth, borderTopColor } = getComputedStyle(part(el, 'base'));

            expect(backgroundColor).toBe('rgb(255, 255, 255)');
            expect([borderTopWidth, borderTopColor]).toEqual(['1px', 'rgb(150, 150, 150)']);
        });
    });

    describe('the current destination', () => {
        it('is told apart by its weight and by a shape behind its icon, not by its colour alone', async () => {
            const el = await nav(four);
            const look = (id) => {
                const item = el.querySelector(id);
                const link = getComputedStyle(part(item, 'link'));
                const shape = getComputedStyle(part(item, 'icon'));
                return [link.fontWeight, link.color, shape.backgroundColor, shape.borderTopWidth];
            };

            expect(look('#inbox')).toEqual(['600', 'rgb(10, 10, 10)', 'rgb(230, 230, 230)', '1px']);
            expect(look('#today')).toEqual(['400', 'rgb(90, 90, 90)', TRANSPARENT, '0px']);
            // The shape is the same size with and without its border.
            const size = (id) => box(el, part(el.querySelector(id), 'icon')).slice(2);
            expect(size('#inbox')).toEqual(size('#today'));
        });

        it('is told apart by its weight without a theme', async () => {
            const el = await nav(four, { style: 'font: 16px/24px sans-serif;' });

            expect(getComputedStyle(part(el.querySelector('#inbox'), 'link')).fontWeight).toBe('600');
            expect(getComputedStyle(part(el.querySelector('#today'), 'link')).fontWeight).toBe('400');
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        it('keeps the shape of the current destination as a border, and the line of the bar', async () => {
            const el = await nav(four);
            const shape = (id) => getComputedStyle(part(el.querySelector(id), 'icon'));

            expect(shape('#inbox').borderTopWidth).toBe('1px');
            expect(shape('#inbox').borderTopColor).not.toBe(TRANSPARENT);
            expect(shape('#today').borderTopWidth).toBe('0px');
            expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('1px');
        });

        it('has the line of the bar without a theme as well', async () => {
            const el = await nav(four, { style: 'font: 16px/24px sans-serif;' });
            expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('1px');
        });
    });

    describe('without a theme', () => {
        it('paints nothing of its own, and reads in a light and in a dark scheme', async () => {
            for (const scheme of ['light', 'dark']) {
                const el = await nav(four, {
                    style: `color-scheme: ${scheme}; background: Canvas; color: CanvasText; font: 16px/24px sans-serif;`,
                });

                expect(getComputedStyle(part(el, 'base')).backgroundColor).toBe(TRANSPARENT);
                const results = await axe.run(el.parentElement, { runOnly: ['color-contrast'] });
                expect(results.violations).toEqual([]);
            }
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes every destination at least as large as a finger needs', async () => {
            // A theme with small controls, and five destinations in a narrow bar.
            const el = await nav(
                ['Inbox', 'Today', 'Upcoming', 'Done', 'More'].map((name) => destination(name)).join(''),
                { style: `${theme} --el-control-height: 20px;`, width: 320 },
            );

            for (const item of el.querySelectorAll('el-nav-item')) {
                const { width, height } = part(item, 'link').getBoundingClientRect();
                expect(width).toBeGreaterThanOrEqual(44);
                expect(height).toBeGreaterThanOrEqual(44);
            }
        });
    });

    describe('in the footer of a frame', () => {
        it('leaves the line to the region, which draws it', async () => {
            const el = await framed(four);
            const frame = el.closest('el-app-frame');
            const footer = frame.shadowRoot.querySelector('[part~="footer"]');

            expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('0px');
            expect(getComputedStyle(footer).borderTopWidth).toBe('1px');
            expect(box(frame, footer)).toEqual([0, 600 - 57, 400, 57]);
        });

        it('is left out where the frame is wide, when the page says so, without a script', async () => {
            const narrow = await framed(four, { attributes: 'narrow-only="footer"' });
            const wide = await framed(four, { attributes: 'narrow-only="footer"', width: 1000 });

            expect(box(narrow.closest('el-app-frame'), narrow)[3]).toBe(56);
            expect(wide.getBoundingClientRect().height).toBe(0);
            expect(await accessibleRole(part(wide, 'base'))).not.toBe('navigation');
        });
    });

    describe('on a phone with a home indicator', () => {
        useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

        it('reaches the lower edge of the screen with its surface in the footer of a frame, and its destinations do not', async () => {
            const el = await framed(four);
            const frame = el.closest('el-app-frame');

            // The surface: to the lower edge and to both sides, 34px higher than its row.
            expect(box(frame, part(el, 'base'))).toEqual([0, 600 - 34 - 56, 400, 56 + 34]);
            // The destinations: above the home indicator, clear of the sides.
            expect(box(frame, part(el, 'list'))).toEqual([10, 600 - 34 - 56, 370, 56]);
            // The region of the frame is as high as the bar and its line: the room is there once.
            expect(box(frame, frame.shadowRoot.querySelector('[part~="footer"]'))).toEqual([0, 600 - 91, 400, 91]);
        });

        it('keeps its destinations above the home indicator alone as well', async () => {
            const el = await nav(four);

            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 57 + 34]);
            expect(box(el, part(el, 'list'))).toEqual([10, 1, 370, 56]);
            // Alone it is not moved: the surface is the element.
            expect(el.getBoundingClientRect().height).toBe(57 + 34);
        });

        it('swaps the sides alone in a right-to-left page', async () => {
            const el = await nav(four, { dir: 'rtl' });
            expect(box(el, part(el, 'list'))).toEqual([10, 1, 370, 56]);
            const { paddingLeft, paddingRight } = getComputedStyle(part(el, 'base'));
            expect([paddingLeft, paddingRight]).toEqual(['10px', '20px']);
        });

        it('keeps the room once in a page that resets every margin and padding', async () => {
            const reset = new CSSStyleSheet();
            reset.replaceSync(
                '*, ::before, ::after { margin: 0; padding: 0; box-sizing: border-box; border-width: 0; }',
            );
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, reset];
            try {
                const el = await framed(four);
                const frame = el.closest('el-app-frame');

                expect(box(frame, part(el, 'base'))).toEqual([0, 600 - 34 - 56, 400, 56 + 34]);
                expect(box(frame, part(el, 'list'))).toEqual([10, 600 - 34 - 56, 370, 56]);
            } finally {
                document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== reset);
            }
        });
    });

    describe('accessibility', () => {
        it('passes axe', async () => {
            const el = await nav(`
                ${destination('Inbox', 'current="true"', '<el-badge slot="badge" pill="true">12</el-badge>')}
                ${destination('Today')}
                ${destination('Done')}
            `);
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe in the footer of a frame', async () => {
            const el = await framed(four);
            const results = await axe.run(el.closest('el-app-frame').parentElement);
            expect(results.violations).toEqual([]);
        });
    });
});
