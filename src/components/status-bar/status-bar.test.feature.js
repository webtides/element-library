import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleRole,
    fixture,
    nextFrame,
    useForcedColors,
    useSafeAreaInsets,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './status-bar.js';
import { define as defineAppFrame } from '../app-frame/app-frame.js';
import { define as defineButton } from '../button/button.js';
import { define as defineSpinner } from '../spinner/spinner.js';
import { define as defineProgressBar } from '../progress-bar/progress-bar.js';
define();
defineAppFrame();
defineButton();
defineSpinner();
defineProgressBar();

const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

// A theme: a control height of 40px, borders of 1px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px; --el-touch-target: 44px;
    --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px;
    --el-font-size-sm: 14px; --el-font-size-md: 16px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(90, 90, 90);
    --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(0, 0, 200);
    --el-focus-ring-width: 2px; --el-focus-ring-offset: 2px;
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;

const bar = async (content, { width = 400, style = theme, dir = 'ltr', after = '' } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <el-status-bar>${content}</el-status-bar>
            ${after}
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-status-bar');
};

/** A bar in the footer of a frame that is a box of 600px. */
const framed = async (content, { width = 400, style = theme, dir = 'ltr' } = {}) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} width: ${width}px;">
            <el-app-frame style="position: relative; height: 600px">
                <main id="framed-main"><p>Content</p></main>
                <footer slot="footer"><el-status-bar>${content}</el-status-bar></footer>
            </el-app-frame>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-status-bar');
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
const middle = (el, node) => {
    const [, top, , height] = box(el, node);
    return Math.round(top + height / 2);
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const entries = `
    <span id="connection">Connected</span>
    <span id="count">128 entries</span>
    <span slot="end" id="branch">main</span>
    <span slot="end" id="version">v1.4.2</span>
`;

const long = `
    <span id="connection">Connected to the server in Frankfurt</span>
    <span id="count">128 entries, 3 of them selected</span>
    <span slot="end" id="version">v1.4.2</span>
`;

describe('Feature | StatusBar', () => {
    describe('the row', () => {
        it('has entries at its start and at its end', async () => {
            const el = await bar(entries);

            // Seven tenths of a control of 40px, and the line of 1px.
            expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 29]);
            expect(box(el, part(el, 'row'))).toEqual([0, 1, 400, 28]);
            // The start: 12px from the edge, with a gap of 12px between two entries.
            const [left, , width] = box(el, el.querySelector('#connection'));
            expect(left).toBe(12);
            expect(box(el, el.querySelector('#count'))[0]).toBe(Math.round((left + width + 12) * 10) / 10);
            // The end: 12px from the other edge.
            const version = box(el, el.querySelector('#version'));
            expect(Math.round(version[0] + version[2])).toBe(400 - 12);
            const branch = box(el, el.querySelector('#branch'));
            expect(Math.round(branch[0] + branch[2])).toBe(Math.round(version[0] - 12));
            // Every entry is in the middle of the row.
            for (const entry of el.querySelectorAll('span')) expect(middle(el, entry)).toBe(15);
        });

        it('has the start at the right in a right-to-left page', async () => {
            const el = await bar(entries, { dir: 'rtl' });

            const connection = box(el, el.querySelector('#connection'));
            expect(Math.round(connection[0] + connection[2])).toBe(400 - 12);
            expect(box(el, el.querySelector('#version'))[0]).toBe(12);
        });

        it('has the small text of the tokens', async () => {
            const el = await bar(entries);

            expect(getComputedStyle(el.querySelector('#connection')).fontSize).toBe('14px');
            expect(getComputedStyle(el.querySelector('#version')).fontSize).toBe('14px');
        });

        it('is lower than a control', async () => {
            const el = await bar(`<el-button id="sync">Sync</el-button>`);
            const [, , , height] = box(el, part(el, 'row'));

            expect(height).toBe(28);
            expect(height).toBeLessThan(40);
        });

        it('gives the end no room while the page leaves it empty, and makes room for an entry that comes later', async () => {
            const el = await bar(`<span id="connection">Connected</span>`);

            expect(part(el, 'end').hidden).toBe(true);
            expect(box(el, part(el, 'start'))).toEqual([0, 1, 400, 28]);

            el.insertAdjacentHTML('beforeend', `<span slot="end" id="late">v2</span>`);
            await rendered();

            expect(part(el, 'end').hidden).toBe(false);
            const late = box(el, el.querySelector('#late'));
            expect(Math.round(late[0] + late[2])).toBe(400 - 12);
        });
    });

    describe('the height', () => {
        const contents = {
            nothing: '',
            'a text': '<span>Connected</span>',
            'a button': '<el-button>Sync now</el-button>',
            'a button with an icon alone':
                '<el-button circle="true" aria-label="Sync"><svg width="16" height="16" aria-hidden="true"></svg></el-button>',
            'a spinner and a text': '<span><el-spinner label="Syncing"></el-spinner> Syncing</span>',
            'a progress bar': '<el-progress-bar value="40" label="Import"></el-progress-bar>',
            'an entry that is higher than the bar': '<span style="display: block; height: 60px">Tall</span>',
            'a text in two lines': '<span>One line<br />and another</span>',
        };

        for (const [what, content] of Object.entries(contents)) {
            it(`is the same with ${what} in the bar`, async () => {
                const el = await bar(`${content}<span slot="end">v1.4.2</span>`);

                expect(box(el, part(el, 'base'))).toEqual([0, 0, 400, 29]);
                expect(el.getBoundingClientRect().height).toBe(29);
            });
        }

        it('gives a progress bar a width', async () => {
            const el = await bar('<el-progress-bar value="40" label="Import"></el-progress-bar>');
            const [left, , width] = box(el, el.querySelector('el-progress-bar'));

            expect([left, width]).toEqual([12, 96]);
            expect(middle(el, el.querySelector('el-progress-bar'))).toBe(15);
        });
    });

    describe('a button', () => {
        const withButton = `
            <span id="connection">Connected</span>
            <el-button id="sync">Sync now</el-button>
            <span slot="end" id="version">v1.4.2</span>
        `;

        it('is as high as the bar, with its small text, and plain', async () => {
            const el = await bar(withButton);
            const button = el.querySelector('#sync');
            const { backgroundColor, borderTopColor, fontSize } = getComputedStyle(control(button));

            expect(box(el, button)[1]).toBe(1);
            expect(box(el, button)[3]).toBe(28);
            expect(fontSize).toBe('14px');
            expect([backgroundColor, borderTopColor]).toEqual([TRANSPARENT, TRANSPARENT]);
        });

        it('keeps a size and an appearance of its own', async () => {
            const el = await bar(`<el-button id="own" variant="brand" appearance="filled">New</el-button>`);

            expect(getComputedStyle(control(el.querySelector('#own'))).backgroundColor).toBe('rgb(0, 0, 200)');
        });

        it('is reached by the keyboard and shows its focus inside of the bar', async () => {
            const el = await bar(withButton, { after: '<button id="after" type="button">After</button>' });
            const button = el.querySelector('#sync');

            await userEvent.tab();

            expect(document.activeElement).toBe(button);
            const base = control(button);
            expect(base.matches(':focus-visible')).toBe(true);
            const { outlineStyle, outlineWidth, outlineOffset, outlineColor } = getComputedStyle(base);
            expect([outlineStyle, outlineWidth, outlineColor]).toEqual(['solid', '2px', 'rgb(0, 0, 200)']);
            // Inside of the button: around it there is the edge of the bar.
            expect(outlineOffset).toBe('-2px');

            await userEvent.tab();
            expect(document.activeElement.id).toBe('after');
        });

        it('has its ring around it outside of a bar, as before', async () => {
            const wrapper = await fixture(`<div style="${theme}"><el-button id="alone">Alone</el-button></div>`);
            wrappers.push(wrapper);
            await rendered();

            await userEvent.tab();

            expect(getComputedStyle(control(wrapper.querySelector('#alone'))).outlineOffset).toBe('2px');
        });
    });

    describe('entries that do not fit', () => {
        it('do not wrap, and give way at the start: the end keeps its entries', async () => {
            const el = await bar(long, { width: 240 });
            const start = part(el, 'start');
            const end = part(el, 'end');

            // One row still.
            expect(box(el, part(el, 'base'))).toEqual([0, 0, 240, 29]);
            for (const entry of el.querySelectorAll('span')) {
                expect(box(el, entry)[3]).toBeLessThan(20);
            }
            // The start is cut, the end is whole and at the edge.
            expect(start.scrollWidth).toBeGreaterThan(start.clientWidth);
            expect(end.scrollWidth).toBe(end.clientWidth);
            const version = box(el, el.querySelector('#version'));
            expect(Math.round(version[0] + version[2])).toBe(240 - 12);
        });

        it('do not lie on each other: the start ends where the end begins', async () => {
            const el = await bar(long, { width: 240 });
            const start = box(el, part(el, 'start'));
            const end = box(el, part(el, 'end'));

            expect(Math.round(start[0] + start[2])).toBe(Math.round(end[0]));
            expect(getComputedStyle(part(el, 'start')).overflowX).toBe('hidden');
            // A point in the end is the entry of the end, not one of the start under it.
            const { left, top } = el.querySelector('#version').getBoundingClientRect();
            expect(document.elementFromPoint(left + 2, top + 2).id).toBe('version');
        });

        it('cut the end as well in a bar that is narrower than the end', async () => {
            const el = await bar(long.replace('v1.4.2', 'Version 1.4.2 of the fourth of March'), { width: 120 });

            expect(box(el, part(el, 'base'))).toEqual([0, 0, 120, 29]);
            const row = part(el, 'row');
            expect(row.scrollWidth).toBe(row.clientWidth);
            expect(part(el, 'end').scrollWidth).toBeGreaterThan(part(el, 'end').clientWidth);
        });

        it('show a button in the part that is cut while it has the focus, and the first entries again after it', async () => {
            const el = await bar(`${long}<el-button id="retry">Retry</el-button>`, {
                width: 240,
                after: '<button id="after" type="button">After</button>',
            });
            const start = part(el, 'start');
            const button = el.querySelector('#retry');
            const inside = () => {
                const group = start.getBoundingClientRect();
                const { left, right } = button.getBoundingClientRect();
                return left >= group.left - 0.5 && right <= group.right + 0.5;
            };

            expect(inside()).toBe(false);

            await userEvent.tab();
            expect(document.activeElement).toBe(button);
            await rendered();
            expect(inside()).toBe(true);

            await userEvent.tab();
            await rendered();
            expect(document.activeElement.id).toBe('after');
            expect(start.scrollLeft).toBe(0);
            expect(box(el, el.querySelector('#connection'))[0]).toBe(12);
        });
    });

    describe('the surface and the line', () => {
        it('come from the tokens', async () => {
            const el = await bar(entries);
            const { backgroundColor, color, borderTopWidth, borderTopColor } = getComputedStyle(part(el, 'base'));

            expect([backgroundColor, color]).toEqual(['rgb(255, 255, 255)', 'rgb(90, 90, 90)']);
            expect([borderTopWidth, borderTopColor]).toEqual(['1px', 'rgb(150, 150, 150)']);
        });

        it('paint nothing without a theme, so the bar reads as the page does', async () => {
            for (const scheme of ['light', 'dark']) {
                const el = await bar(`${entries}<el-button>Sync now</el-button>`, {
                    style: `color-scheme: ${scheme}; background: Canvas; color: CanvasText; font: 16px/24px sans-serif;`,
                });
                const { backgroundColor, color, borderTopWidth } = getComputedStyle(part(el, 'base'));

                expect(backgroundColor).toBe(TRANSPARENT);
                expect(color).toBe(getComputedStyle(el.parentElement).color);
                expect(borderTopWidth).toBe('0px');
                // Seven tenths of 2.5rem.
                expect(box(el, part(el, 'row'))[3]).toBe(28);

                const results = await axe.run(el.parentElement, { runOnly: ['color-contrast'] });
                expect(results.violations).toEqual([]);
            }
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        it('keeps the line to the content, and has it without a theme as well', async () => {
            const themed = await bar(entries);
            const bare = await bar(entries, { style: 'font: 16px/24px sans-serif;' });

            expect(getComputedStyle(part(themed, 'base')).borderTopWidth).toBe('1px');
            expect(getComputedStyle(part(themed, 'base')).borderTopColor).not.toBe('rgb(150, 150, 150)');
            expect(getComputedStyle(part(bare, 'base')).borderTopWidth).toBe('1px');
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('is at least as high as a finger needs, and so is a button in it', async () => {
            const el = await bar(`<el-button id="sync">Go</el-button><span slot="end">v1.4.2</span>`);
            const button = control(el.querySelector('#sync'));

            expect(box(el, part(el, 'row'))[3]).toBe(44);
            expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
            expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
            // The button is not higher than the bar.
            expect(el.getBoundingClientRect().height).toBe(45);
        });

        it('stays as it is without the token', async () => {
            const el = await bar(entries, { style: theme.replace('--el-touch-target: 44px;', '') });

            expect(box(el, part(el, 'row'))[3]).toBe(28);
        });
    });

    describe('a live region', () => {
        it('is not what the bar is', async () => {
            const el = await bar(entries);

            for (const node of [el, ...['base', 'row', 'start', 'end'].map((name) => part(el, name))]) {
                expect(node.hasAttribute('role')).toBe(false);
                expect(node.hasAttribute('aria-live')).toBe(false);
                expect(await accessibleRole(node)).not.toMatch(/status|alert|log|marquee|timer/);
            }
        });

        it('is an entry the page marks', async () => {
            const el = await bar(`<span id="saved" role="status">Saved</span>${entries}`);
            const saved = el.querySelector('#saved');

            expect(await accessibleRole(saved)).toBe('status');
            // The others are not.
            expect(await accessibleRole(el.querySelector('#connection'))).not.toBe('status');
        });
    });

    describe('in the footer of a frame', () => {
        it('adds no landmark, and leaves the line to the region, which draws it', async () => {
            const el = await framed(entries);
            const frame = el.closest('el-app-frame');
            const footer = frame.shadowRoot.querySelector('[part~="footer"]');

            expect(await accessibleRole(el.closest('footer'))).toBe('contentinfo');
            expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('0px');
            expect(getComputedStyle(footer).borderTopWidth).toBe('1px');
            // 28px of bar and one line, at the lower edge of the frame.
            expect(box(frame, footer)).toEqual([0, 600 - 29, 400, 29]);
        });
    });

    describe('in the footer of a frame, on a screen with room for the system', () => {
        useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

        it('reaches the lower edge and the sides with its surface, and its entries do not', async () => {
            const el = await framed(entries);
            const frame = el.closest('el-app-frame');

            // The surface: below the line of the region, as wide as the frame, down to its edge.
            expect(box(frame, part(el, 'base'))).toEqual([0, 600 - 34 - 28, 400, 28 + 34]);
            // The row: above the home indicator, clear of the sides.
            expect(box(frame, part(el, 'row'))).toEqual([10, 600 - 34 - 28, 370, 28]);
            expect(box(frame, el.querySelector('#connection'))[0]).toBe(10 + 12);
            const version = box(frame, el.querySelector('#version'));
            expect(Math.round(version[0] + version[2])).toBe(400 - 20 - 12);
        });

        it('keeps the room once in a page that resets every margin and padding', async () => {
            const reset = new CSSStyleSheet();
            reset.replaceSync(
                '*, ::before, ::after { margin: 0; padding: 0; box-sizing: border-box; border-width: 0; }',
            );
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, reset];
            try {
                const el = await framed(entries);
                const frame = el.closest('el-app-frame');

                expect(box(frame, part(el, 'base'))).toEqual([0, 600 - 34 - 28, 400, 28 + 34]);
                expect(box(frame, part(el, 'row'))).toEqual([10, 600 - 34 - 28, 370, 28]);
            } finally {
                document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== reset);
            }
        });
    });

    describe('accessibility', () => {
        const all = `
            <span role="status">Saved</span>
            <span><svg width="14" height="14" role="img" aria-label="Online"><circle cx="7" cy="7" r="5" /></svg></span>
            <el-button>Sync now</el-button>
            <span><el-spinner label="Syncing"></el-spinner> Syncing</span>
            <el-progress-bar value="40" label="Import"></el-progress-bar>
            <span slot="end">v1.4.2</span>
        `;

        it('passes axe', async () => {
            const el = await bar(all, { width: 700 });
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe in the footer of a frame', async () => {
            const el = await framed(all, { width: 700 });
            const results = await axe.run(el.closest('el-app-frame').parentElement);
            expect(results.violations).toEqual([]);
        });
    });
});
