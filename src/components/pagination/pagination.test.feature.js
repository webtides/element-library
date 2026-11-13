import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    forcePseudoClasses,
    nextFrame,
    sizeOf,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './pagination.js';
define();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const parts = (el, name) => [...el.shadowRoot.querySelectorAll(`[part~="${name}"]`)];
const pageButton = (el, page) => el.shadowRoot.querySelector(`[part~="page"][data-page="${page}"]`);
const current = (el) => el.shadowRoot.querySelector("[aria-current='page']");
// The row between the two arrow buttons, as it reads: "1 … 4 5 6 … 10".
const row = (el) =>
    [...el.shadowRoot.querySelectorAll("[part~='list'] > li")]
        .slice(1, -1)
        .map((li) => (li.matches("[part~='ellipsis']") ? '…' : li.textContent.trim()))
        .join(' ');
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const changes = (el) => {
    const pages = [];
    el.addEventListener('pagination-change', (event) => pages.push(event.detail.page));
    return pages;
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
// What a theme provides.
const tokens = `
    --el-color-fg: rgb(10, 10, 10);
    --el-color-fg-muted: rgb(110, 110, 110);
    --el-color-bg: rgb(250, 250, 240);
    --el-color-accent: rgb(0, 80, 200);
    --el-color-focus-ring: rgb(200, 0, 100);
    --el-focus-ring-width: 3px;
    --el-focus-ring-offset: 1px;
    --el-control-height: 40px;
    --el-space-1: 4px;
    --el-radius-md: 6px;
    --el-font-size-sm: 14px;
    --el-font-size-md: 16px;
    --el-font-family: monospace;
    font: 16px/20px sans-serif;
    color: rgb(90, 90, 90);
`;
const themed = async (markup, style = '') => {
    const wrapper = await fixture(`<div style="${tokens}${style}">${markup}</div>`);
    return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
};

describe('Feature | Pagination', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-pagination total="100"></el-pagination>`);
        await nextFrame();
        el.remove();
    });

    describe('what it is', () => {
        it('is a navigation landmark with a name, around a list of buttons', async () => {
            const el = await fixture(`<el-pagination total="100"></el-pagination>`);

            expect(await accessibleRole(part(el, 'base'))).toBe('navigation');
            expect(await accessibleName(part(el, 'base'))).toBe('Pagination');
            expect(await accessibleRole(part(el, 'list'))).toBe('list');
            // Said in so many words: a list without markers is no list to VoiceOver in Safari.
            expect(part(el, 'list').getAttribute('role')).toBe('list');
            // The page before, seven places, the page after.
            expect(part(el, 'list').children.length).toBe(9);
            expect([...part(el, 'list').children].every((child) => child.localName === 'li')).toBe(true);
            expect(getComputedStyle(el).display).toBe('block');
            el.remove();
        });

        it('names every button, and marks the one of the current page', async () => {
            const el = await fixture(`<el-pagination total="100" page="5"></el-pagination>`);

            expect(await accessibleName(part(el, 'previous'))).toBe('Previous page');
            expect(await accessibleName(part(el, 'next'))).toBe('Next page');
            expect(await accessibleName(pageButton(el, 6))).toBe('Page 6');
            expect(await accessibleRole(pageButton(el, 6))).toBe('button');
            expect(el.shadowRoot.querySelectorAll('[aria-current]').length).toBe(1);
            expect(current(el)).toBe(pageButton(el, 5));
            expect(current(el).matches("[part~='current']")).toBe(true);
            expect(parts(el, 'current').length).toBe(1);
            expect(pageButton(el, 6).hasAttribute('aria-current')).toBe(false);
            expect(parts(el, 'button').every((button) => button.type === 'button')).toBe(true);
            el.remove();
        });

        it('takes the names from attributes, for another language', async () => {
            const el = await fixture(`
                <el-pagination
                    total="100"
                    label="Seiten der Suche"
                    page-label="Seite"
                    previous-label="Vorherige Seite"
                    next-label="Nächste Seite"
                ></el-pagination>
            `);

            expect(await accessibleName(part(el, 'base'))).toBe('Seiten der Suche');
            expect(await accessibleName(pageButton(el, 2))).toBe('Seite 2');
            expect(await accessibleName(part(el, 'previous'))).toBe('Vorherige Seite');
            expect(await accessibleName(part(el, 'next'))).toBe('Nächste Seite');
            el.remove();
        });

        it('hides the ellipsis from assistive technology, and the arrow heads too', async () => {
            const el = await fixture(`<el-pagination total="200" page="10"></el-pagination>`);
            const ellipses = parts(el, 'ellipsis');

            expect(ellipses.length).toBe(2);
            expect(ellipses.every((item) => item.getAttribute('aria-hidden') === 'true')).toBe(true);
            expect(ellipses.every((item) => item.textContent === '…' && !item.querySelector('button'))).toBe(true);
            expect([...el.shadowRoot.querySelectorAll('svg')].map((svg) => svg.getAttribute('aria-hidden'))).toEqual([
                'true',
                'true',
            ]);
            el.remove();
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-pagination total="100" hidden></el-pagination>`);
            expect(getComputedStyle(el).display).toBe('none');
            el.remove();
        });
    });

    describe('the current page', () => {
        it('reads page, total and per-page from attributes', async () => {
            const el = await fixture(`<el-pagination total="100" per-page="25" page="3"></el-pagination>`);

            expect(el.page).toBe(3);
            expect(el.perPage).toBe(25);
            expect(el.pages).toBe(4);
            expect(row(el)).toBe('1 2 3 4');
            expect(current(el).textContent.trim()).toBe('3');
            el.remove();
        });

        it('follows a page that is set from a script, without an event', async () => {
            const el = await fixture(`<el-pagination total="200"></el-pagination>`);
            const pages = changes(el);

            el.page = 10;
            await rendered();

            expect(row(el)).toBe('1 … 9 10 11 … 20');
            expect(current(el).textContent.trim()).toBe('10');
            expect(el.getAttribute('page')).toBe('10');
            expect(pages).toEqual([]);
            el.remove();
        });

        it('shows a page that does not exist as the nearest one that does, and leaves the property alone', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-pagination total="30" page="9"></el-pagination>
                    <el-pagination total="30" page="0"></el-pagination>
                    <el-pagination total="30" page="-2"></el-pagination>
                    <el-pagination total="30" page="two"></el-pagination>
                    <el-pagination total="30" page="2.7"></el-pagination>
                </div>
            `);
            const elements = [...wrapper.children];

            expect(elements.map((el) => current(el).textContent.trim())).toEqual(['3', '1', '1', '1', '2']);
            expect(elements[0].page).toBe(9);
            expect(elements[0].getAttribute('page')).toBe('9');
            // On the last page there is no page after it.
            expect(part(elements[0], 'next').disabled).toBe(true);
            wrapper.remove();
        });

        it('keeps to the pages that are left when the list gets shorter', async () => {
            const el = await fixture(`<el-pagination total="200" page="15"></el-pagination>`);
            const pages = changes(el);

            el.total = 50;
            await rendered();
            expect(row(el)).toBe('1 2 3 4 5');
            expect(current(el).textContent.trim()).toBe('5');

            // The page before the one that is shown, not before the one that was asked for.
            part(el, 'previous').click();
            await rendered();
            expect(el.page).toBe(4);
            expect(pages).toEqual([4]);
            el.remove();
        });
    });

    describe('with the pointer', () => {
        it('goes to the page of the button that is clicked, and says so once', async () => {
            const el = await fixture(`<el-pagination total="200"></el-pagination>`);
            const events = [];
            const pageAtTheEvent = [];
            document.body.addEventListener(
                'pagination-change',
                (event) => {
                    events.push(event);
                    pageAtTheEvent.push(el.page);
                },
                { once: true },
            );

            await userEvent.click(pageButton(el, 3));
            await rendered();

            expect(el.page).toBe(3);
            expect(el.getAttribute('page')).toBe('3');
            expect(current(el).textContent.trim()).toBe('3');
            expect(events.length).toBe(1);
            expect(events[0].detail).toEqual({ page: 3 });
            // The property is set by then.
            expect(pageAtTheEvent).toEqual([3]);
            // It reaches a listener outside of a shadow root the pagination is in.
            expect(events[0].bubbles).toBe(true);
            expect(events[0].composed).toBe(true);
            expect(events[0].target).toBe(el);
            el.remove();
        });

        it('fires one event per click, also after the row was rendered anew', async () => {
            const el = await fixture(`<el-pagination total="200"></el-pagination>`);
            const pages = changes(el);

            for (const page of [5, 6, 7]) {
                await userEvent.click(pageButton(el, page));
                await rendered();
            }

            expect(pages).toEqual([5, 6, 7]);
            expect(row(el)).toBe('1 … 6 7 8 … 20');
            el.remove();
        });

        it('does nothing for a click on the current page', async () => {
            const el = await fixture(`<el-pagination total="200" page="5"></el-pagination>`);
            const pages = changes(el);

            await userEvent.click(current(el));
            await rendered();

            expect(el.page).toBe(5);
            expect(pages).toEqual([]);
            el.remove();
        });

        it('goes one page back and one page on with the arrow buttons', async () => {
            const el = await fixture(`<el-pagination total="200" page="5"></el-pagination>`);
            const pages = changes(el);

            await userEvent.click(part(el, 'next'));
            await rendered();
            await userEvent.click(part(el, 'next'));
            await rendered();
            await userEvent.click(part(el, 'previous'));
            await rendered();

            expect(pages).toEqual([6, 7, 6]);
            expect(el.page).toBe(6);
            expect(current(el).textContent.trim()).toBe('6');
            el.remove();
        });

        it('has no page before the first and none after the last', async () => {
            const [first, last, only] = await themed(`
                <el-pagination total="200" page="1"></el-pagination>
                <el-pagination total="200" page="20"></el-pagination>
                <el-pagination total="5"></el-pagination>
            `);
            const pages = [...changes(first), ...changes(last)];

            expect([part(first, 'previous').disabled, part(first, 'next').disabled]).toEqual([true, false]);
            expect([part(last, 'previous').disabled, part(last, 'next').disabled]).toEqual([false, true]);
            expect([part(only, 'previous').disabled, part(only, 'next').disabled]).toEqual([true, true]);

            const disabled = getComputedStyle(part(first, 'previous'));
            expect(disabled.opacity).toBe('0.55');
            expect(disabled.cursor).toBe('not-allowed');
            expect(getComputedStyle(part(first, 'next')).opacity).toBe('1');

            part(first, 'previous').click();
            part(last, 'next').click();
            await rendered();
            expect(pages).toEqual([]);
            expect([first.page, last.page]).toEqual([1, 20]);
            first.parentElement.remove();
        });
    });

    describe('with the keyboard', () => {
        it('has every button that leads somewhere in the tab order, in the order of the row', async () => {
            const wrapper = await fixture(`
                <div>
                    <button id="before">Before</button>
                    <el-pagination total="50" page="1"></el-pagination>
                    <button id="after">After</button>
                </div>
            `);
            const el = wrapper.querySelector('el-pagination');
            wrapper.querySelector('#before').focus();

            const stops = [];
            for (let i = 0; i < 7; i++) {
                await userEvent.tab();
                stops.push(el.shadowRoot.activeElement?.getAttribute('aria-label') ?? document.activeElement.id);
            }

            // Not the page before: the first page has none.
            expect(stops).toEqual(['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5', 'Next page', 'after']);
            wrapper.remove();
        });

        it('goes to a page with Enter and with Space, and moves the focus to the button of that page', async () => {
            const el = await fixture(`<el-pagination total="200" page="5"></el-pagination>`);
            const pages = changes(el);

            // "1 … 4 5 6 … 20": the 6 is in the fifth place, where the 7 is afterwards.
            pageButton(el, 6).focus();
            await userEvent.keyboard('{Enter}');
            await rendered();

            expect(row(el)).toBe('1 … 5 6 7 … 20');
            expect(el.shadowRoot.activeElement).toBe(current(el));
            expect(current(el).textContent.trim()).toBe('6');

            // The focus is on the current page now: once more does nothing.
            await userEvent.keyboard('{Enter}');
            await rendered();
            expect(pages).toEqual([6]);

            pageButton(el, 7).focus();
            await userEvent.keyboard(' ');
            await rendered();
            expect(pages).toEqual([6, 7]);
            expect(el.shadowRoot.activeElement).toBe(current(el));
            expect(current(el).textContent.trim()).toBe('7');
            el.remove();
        });

        it('moves the focus to the current page when the button that was pressed makes way for an ellipsis', async () => {
            const el = await fixture(`<el-pagination total="200" page="1"></el-pagination>`);

            // "1 2 3 4 5 … 20" becomes "1 … 4 5 6 … 20": the second place is an ellipsis afterwards.
            pageButton(el, 5).focus();
            await userEvent.keyboard('{Enter}');
            await rendered();

            expect(row(el)).toBe('1 … 4 5 6 … 20');
            expect(el.shadowRoot.activeElement).toBe(current(el));
            expect(current(el).textContent.trim()).toBe('5');
            el.remove();
        });

        it('keeps the focus on an arrow button, to press it again', async () => {
            const el = await fixture(`<el-pagination total="200" page="5"></el-pagination>`);
            const pages = changes(el);

            part(el, 'next').focus();
            for (let i = 0; i < 3; i++) {
                await userEvent.keyboard('{Enter}');
                await rendered();
            }
            expect(pages).toEqual([6, 7, 8]);
            expect(el.shadowRoot.activeElement).toBe(part(el, 'next'));

            part(el, 'previous').focus();
            await userEvent.keyboard('{Enter}');
            await rendered();
            expect(pages).toEqual([6, 7, 8, 7]);
            expect(el.shadowRoot.activeElement).toBe(part(el, 'previous'));
            el.remove();
        });

        it('hands the focus to the current page when an arrow button has reached the end', async () => {
            const [forth, back] = await themed(`
                <el-pagination total="200" page="19"></el-pagination>
                <el-pagination total="200" page="2"></el-pagination>
            `);

            part(forth, 'next').focus();
            await userEvent.keyboard('{Enter}');
            await rendered();
            expect(part(forth, 'next').disabled).toBe(true);
            expect(forth.shadowRoot.activeElement).toBe(current(forth));
            expect(current(forth).textContent.trim()).toBe('20');

            part(back, 'previous').focus();
            await userEvent.keyboard('{Enter}');
            await rendered();
            expect(part(back, 'previous').disabled).toBe(true);
            expect(back.shadowRoot.activeElement).toBe(current(back));
            expect(current(back).textContent.trim()).toBe('1');
            forth.parentElement.remove();
        });

        it('does not take the focus from elsewhere when a button is activated without it', async () => {
            const wrapper = await fixture(`
                <div>
                    <input id="search" />
                    <el-pagination total="200" page="5"></el-pagination>
                </div>
            `);
            const el = wrapper.querySelector('el-pagination');
            const input = wrapper.querySelector('#search');
            input.focus();

            // What a click with the mouse is in a browser that does not focus a button for it.
            pageButton(el, 6).click();
            await rendered();
            el.page = 9;
            await rendered();

            expect(el.shadowRoot.activeElement).toBe(null);
            expect(document.activeElement).toBe(input);
            wrapper.remove();
        });

        it('moves the focus once, and not again when the page changes later', async () => {
            const wrapper = await fixture(`
                <div>
                    <input id="search" />
                    <el-pagination total="200" page="5"></el-pagination>
                </div>
            `);
            const el = wrapper.querySelector('el-pagination');
            const input = wrapper.querySelector('#search');

            pageButton(el, 6).focus();
            await userEvent.keyboard('{Enter}');
            await rendered();
            expect(el.shadowRoot.activeElement).toBe(current(el));

            input.focus();
            el.page = 12;
            await rendered();
            el.total = 300;
            await rendered();

            expect(document.activeElement).toBe(input);
            wrapper.remove();
        });
    });

    describe('look', () => {
        it('has square buttons of the control height, in a row with a gap', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`);
            const boxes = [...part(el, 'list').children].map((item) => item.getBoundingClientRect());

            expect(boxes.map((box) => [box.width, box.height])).toEqual(Array(9).fill([40, 40]));
            expect(boxes.map((box) => box.left - boxes[0].left)).toEqual([0, 44, 88, 132, 176, 220, 264, 308, 352]);
            expect(new Set(boxes.map((box) => box.top)).size).toBe(1);
            // Nothing of the space a list has around it by default.
            expect(boxes[0].left).toBe(el.getBoundingClientRect().left);
            expect(sizeOf(el).height).toBe(40);
            // The ellipsis has the box of a button, so the row does not move when it comes or goes.
            expect(sizeOf(part(el, 'ellipsis'))).toEqual({ width: 40, height: 40 });
            el.parentElement.remove();
        });

        it('is as wide on every page', async () => {
            const elements = await themed(
                [1, 3, 5, 10, 16, 18, 20]
                    .map((page) => `<el-pagination total="200" page="${page}"></el-pagination>`)
                    .join(''),
            );
            const widths = elements.map((el) => {
                const list = part(el, 'list');
                return list.lastElementChild.getBoundingClientRect().right - list.getBoundingClientRect().left;
            });

            expect(widths).toEqual(Array(7).fill(9 * 40 + 8 * 4));
            elements[0].parentElement.remove();
        });

        it('has the figure in the middle of its button, and the ellipsis in the middle of its place', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`);
            const offCentre = (box) => {
                const range = document.createRange();
                range.selectNodeContents(box);
                const text = range.getBoundingClientRect();
                const outer = box.getBoundingClientRect();
                return [
                    Math.abs(text.left + text.width / 2 - (outer.left + outer.width / 2)),
                    Math.abs(text.top + text.height / 2 - (outer.top + outer.height / 2)),
                ];
            };

            for (const box of [pageButton(el, 9), current(el), part(el, 'ellipsis')]) {
                const [across, down] = offCentre(box);
                expect(across, box.outerHTML).toBeLessThan(1);
                expect(down, box.outerHTML).toBeLessThan(1);
            }
            const icon = part(el, 'next').querySelector('svg').getBoundingClientRect();
            const button = part(el, 'next').getBoundingClientRect();
            expect(icon.left - button.left).toBe(button.right - icon.right);
            expect(icon.top - button.top).toBe(button.bottom - icon.bottom);
            el.parentElement.remove();
        });

        it('takes the gap and the padding from the spacing scale', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`, '--el-space-1: 10px;');
            const boxes = [...part(el, 'list').children].map((item) => item.getBoundingClientRect());

            expect(boxes[1].left - boxes[0].right).toBe(10);
            expect(getComputedStyle(current(el)).paddingLeft).toBe('10px');
            expect(getComputedStyle(current(el)).paddingRight).toBe('10px');
            expect(getComputedStyle(current(el)).paddingTop).toBe('0px');
            el.parentElement.remove();
        });

        it('keeps its height in a text with high lines', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`, 'line-height: 60px;');
            const heights = [...part(el, 'list').children].map((item) => item.getBoundingClientRect().height);

            expect(heights).toEqual(Array(9).fill(40));
            expect(sizeOf(el).height).toBe(40);
            el.parentElement.remove();
        });

        it('does not let its figures be selected, and fades the tint with the duration of the theme', async () => {
            const el = await themed(
                `<el-pagination total="200" page="10"></el-pagination>`,
                '--el-duration-md: 200ms;',
            );

            expect(getComputedStyle(pageButton(el, 9)).userSelect).toBe('none');
            expect(getComputedStyle(part(el, 'ellipsis')).userSelect).toBe('none');
            expect(getComputedStyle(pageButton(el, 9)).transitionProperty).toBe('background');
            expect(getComputedStyle(pageButton(el, 9)).transitionDuration).toBe('0.2s');
            el.parentElement.remove();
        });

        it('paints a page as text on nothing, and the current page as a fill of the accent colour', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`);
            const page = getComputedStyle(pageButton(el, 9));
            const now = getComputedStyle(current(el));

            expect(page.backgroundColor).toBe(TRANSPARENT);
            expect(page.color).toBe('rgb(10, 10, 10)');
            expect(page.borderTopStyle).toBe('none');
            expect(page.borderRadius).toBe('6px');
            expect(page.fontFamily).toBe('monospace');
            expect(page.fontWeight).toBe('400');
            expect(page.cursor).toBe('pointer');
            expect(page.fontVariantNumeric).toBe('tabular-nums');

            expect(now.backgroundColor).toBe('rgb(0, 80, 200)');
            expect(now.color).toBe('rgb(250, 250, 240)');
            expect(now.fontWeight).toBe('600');
            expect(now.cursor).toBe('default');

            expect(getComputedStyle(part(el, 'previous')).color).toBe('rgb(10, 10, 10)');
            expect(getComputedStyle(part(el, 'ellipsis')).color).toBe('rgb(110, 110, 110)');
            el.parentElement.remove();
        });

        it('shows without a theme: the text colour of the page, and a current page that stands out', async () => {
            const el = await fixture(
                `<div style="color: rgb(90, 90, 90); font: 16px/20px sans-serif"><el-pagination total="200" page="10"></el-pagination></div>`,
            ).then((wrapper) => wrapper.firstElementChild);

            expect(getComputedStyle(pageButton(el, 9)).color).toBe('rgb(90, 90, 90)');
            expect(getComputedStyle(pageButton(el, 9)).backgroundColor).toBe(TRANSPARENT);
            expect(getComputedStyle(part(el, 'ellipsis')).color).toBe('rgb(90, 90, 90)');
            expect(getComputedStyle(current(el)).backgroundColor).toBe('rgb(37, 99, 235)');
            expect(getComputedStyle(current(el)).color).toBe('rgb(255, 255, 255)');
            // 2.5rem, the control height without a theme.
            expect(sizeOf(pageButton(el, 9))).toEqual({ width: 40, height: 40 });
            expect(getComputedStyle(pageButton(el, 9)).fontFamily).toBe('sans-serif');
            el.parentElement.remove();
        });

        it('tints a button that is pressed, and leaves the current page and a disabled button as they are', async () => {
            const el = await themed(`<el-pagination total="200" page="1"></el-pagination>`);

            await forcePseudoClasses(pageButton(el, 2), ['active']);
            expect(getComputedStyle(pageButton(el, 2)).backgroundColor).toBe(
                'color(srgb 0.0392157 0.0392157 0.0392157 / 0.24)',
            );
            await forcePseudoClasses(current(el), ['hover', 'active']);
            expect(getComputedStyle(current(el)).backgroundColor).toBe('rgb(0, 80, 200)');
            await forcePseudoClasses(part(el, 'previous'), ['hover', 'active']);
            expect(getComputedStyle(part(el, 'previous')).backgroundColor).toBe(TRANSPARENT);
            el.parentElement.remove();
        });

        it('shows the focus of the keyboard as a ring from the tokens', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`);

            expect(getComputedStyle(pageButton(el, 9)).outlineStyle).toBe('none');
            await forcePseudoClasses(pageButton(el, 9), ['focus-visible']);
            const ring = getComputedStyle(pageButton(el, 9));

            expect(ring.outlineStyle).toBe('solid');
            expect(ring.outlineWidth).toBe('3px');
            expect(ring.outlineColor).toBe('rgb(200, 0, 100)');
            expect(ring.outlineOffset).toBe('1px');
            el.parentElement.remove();
        });

        it('grows a button with a long number, in width only', async () => {
            const el = await themed(`<el-pagination total="99999990" page="5000000"></el-pagination>`);
            const figures = document.createRange();
            figures.selectNodeContents(current(el));

            expect(row(el)).toBe('1 … 4999999 5000000 5000001 … 9999999');
            // Seven figures do not fit into the square, whatever the font; one figure does.
            expect(sizeOf(current(el)).height).toBe(40);
            expect(sizeOf(current(el)).width).toBeGreaterThan(40);
            expect(sizeOf(pageButton(el, 1))).toEqual({ width: 40, height: 40 });
            // As wide as the number and the padding at both sides: nothing is cut off.
            expect(getComputedStyle(current(el)).paddingLeft).toBe('4px');
            expect(Math.abs(sizeOf(current(el)).width - (figures.getBoundingClientRect().width + 8))).toBeLessThan(0.5);
            el.parentElement.remove();
        });

        it('breaks into a second row where it does not fit, and is never wider than its container', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`, 'width: 200px;');

            expect(el.getBoundingClientRect().width).toBe(200);
            expect(part(el, 'list').scrollWidth).toBe(200);
            // Four buttons and three gaps fit into 200px: 9 places are three rows.
            expect(sizeOf(el).height).toBe(3 * 40 + 2 * 4);
            el.parentElement.remove();
        });
    });

    describe('size', () => {
        it('is medium by default, and says so on the host', async () => {
            const el = await fixture(`<el-pagination total="100"></el-pagination>`);
            expect(el.size).toBe('medium');
            expect(el.getAttribute('size')).toBe('medium');
            el.remove();
        });

        it('has buttons of 0.8, 1 and 1.25 times the control height, with the font size of the size', async () => {
            const [small, medium, large] = await themed(
                `
                <el-pagination total="200" page="10" size="small"></el-pagination>
                <el-pagination total="200" page="10" size="medium"></el-pagination>
                <el-pagination total="200" page="10" size="large"></el-pagination>
            `,
                // A size for a finger, which a mouse does not need.
                '--el-touch-target: 44px;',
            );
            const box = (el) => [...new Set(parts(el, 'button').map((button) => JSON.stringify(sizeOf(button))))];

            expect(box(small)).toEqual([JSON.stringify({ width: 32, height: 32 })]);
            expect(box(medium)).toEqual([JSON.stringify({ width: 40, height: 40 })]);
            expect(box(large)).toEqual([JSON.stringify({ width: 50, height: 50 })]);
            expect([small, medium, large].map((el) => getComputedStyle(current(el)).fontSize)).toEqual([
                '14px',
                '16px',
                '18px',
            ]);
            expect([small, medium, large].map((el) => sizeOf(part(el, 'ellipsis')).height)).toEqual([32, 40, 50]);
            // One below the other, with nothing of the margin a list has by default.
            expect(medium.getBoundingClientRect().top).toBe(small.getBoundingClientRect().bottom);
            expect(large.getBoundingClientRect().top).toBe(medium.getBoundingClientRect().bottom);
            // The arrow heads grow with the font.
            expect([small, medium, large].map((el) => sizeOf(el.shadowRoot.querySelector('svg')))).toEqual([
                { width: 17.5, height: 17.5 },
                { width: 20, height: 20 },
                { width: 22.5, height: 22.5 },
            ]);
            small.parentElement.remove();
        });

        it('follows a size that is set from a script', async () => {
            const el = await themed(`<el-pagination total="200"></el-pagination>`);

            el.size = 'large';
            await rendered();

            expect(el.getAttribute('size')).toBe('large');
            expect(sizeOf(current(el))).toEqual({ width: 50, height: 50 });
            el.parentElement.remove();
        });
    });

    describe('icons', () => {
        it('has arrow heads that point away from the row, and turn with the reading direction', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-pagination total="200" page="10"></el-pagination>
                    <div dir="rtl"><el-pagination total="200" page="10"></el-pagination></div>
                </div>
            `);
            const [ltr, rtl] = wrapper.querySelectorAll('el-pagination');
            const icon = (el, name) => part(el, name).querySelector('svg');
            const left = (el, name) => part(el, name).getBoundingClientRect().left;

            expect(icon(ltr, 'previous').querySelector('polyline').getAttribute('points')).toBe('15 18 9 12 15 6');
            expect(icon(ltr, 'next').querySelector('polyline').getAttribute('points')).toBe('9 18 15 12 9 6');
            expect(getComputedStyle(icon(ltr, 'previous')).transform).toBe('none');
            expect(left(ltr, 'previous')).toBeLessThan(left(ltr, 'next'));

            // The page before is at the right there, and its arrow head points to the right.
            expect(left(rtl, 'previous')).toBeGreaterThan(left(rtl, 'next'));
            expect(getComputedStyle(icon(rtl, 'previous')).transform).toBe('matrix(-1, 0, 0, 1, 0, 0)');
            expect(getComputedStyle(icon(rtl, 'next')).transform).toBe('matrix(-1, 0, 0, 1, 0, 0)');
            wrapper.remove();
        });

        it('shows icons of the page in their place, and keeps the names of the buttons', async () => {
            const el = await fixture(`
                <el-pagination total="200" page="10">
                    <span slot="previous-icon" aria-hidden="true">←</span>
                    <span slot="next-icon" aria-hidden="true">→</span>
                </el-pagination>
            `);
            const slotted = (name) => part(el, name).querySelector('slot').assignedElements();

            expect(slotted('previous').map((icon) => icon.textContent)).toEqual(['←']);
            expect(slotted('next').map((icon) => icon.textContent)).toEqual(['→']);
            // The arrow heads are the fallback of the slots, and are not rendered now.
            expect(part(el, 'previous').querySelector('svg').getBoundingClientRect().width).toBe(0);
            expect(await accessibleName(part(el, 'previous'))).toBe('Previous page');
            expect(await accessibleName(part(el, 'next'))).toBe('Next page');
            el.remove();
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('has buttons of at least --el-touch-target, in every size', async () => {
            const [small, medium, large] = await themed(
                `
                <el-pagination total="200" page="10" size="small"></el-pagination>
                <el-pagination total="200" page="10" size="medium"></el-pagination>
                <el-pagination total="200" page="10" size="large"></el-pagination>
            `,
                '--el-touch-target: 44px;',
            );
            const boxes = (el) => [
                ...new Set([...part(el, 'list').children].map((item) => JSON.stringify(sizeOf(item)))),
            ];

            expect(boxes(small)).toEqual([JSON.stringify({ width: 44, height: 44 })]);
            expect(boxes(medium)).toEqual([JSON.stringify({ width: 44, height: 44 })]);
            expect(boxes(large)).toEqual([JSON.stringify({ width: 50, height: 50 })]);
            small.parentElement.remove();
        });

        it('keeps its sizes without --el-touch-target', async () => {
            const el = await themed(`<el-pagination total="200" page="10" size="small"></el-pagination>`);

            expect(sizeOf(current(el))).toEqual({ width: 32, height: 32 });
            expect(sizeOf(part(el, 'ellipsis'))).toEqual({ width: 32, height: 32 });
            el.parentElement.remove();
        });

        it('shows a pressed style, and no hover style for the :hover that a tap leaves behind', async () => {
            const el = await themed(`<el-pagination total="200" page="10"></el-pagination>`);

            await forcePseudoClasses(pageButton(el, 9), ['hover']);
            expect(pageButton(el, 9).matches(':hover')).toBe(true);
            expect(getComputedStyle(pageButton(el, 9)).backgroundColor).toBe(TRANSPARENT);

            await forcePseudoClasses(pageButton(el, 11), ['hover', 'active']);
            expect(getComputedStyle(pageButton(el, 11)).backgroundColor).toBe(
                'color(srgb 0.0392157 0.0392157 0.0392157 / 0.24)',
            );
            el.parentElement.remove();
        });
    });

    describe('with forced colours', () => {
        useForcedColors();

        it('marks the current page with the colours of a selection', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-pagination total="200" page="10"></el-pagination>
                    <span style="forced-color-adjust: none; background: Highlight; color: HighlightText">selection</span>
                </div>
            `);
            const el = wrapper.querySelector('el-pagination');
            const selection = getComputedStyle(wrapper.querySelector('span'));

            expect(matchMedia('(forced-colors: active)').matches).toBe(true);
            expect(getComputedStyle(current(el)).backgroundColor).toBe(selection.backgroundColor);
            expect(getComputedStyle(current(el)).color).toBe(selection.color);
            // Without the plate a browser paints behind forced text: it has the colour of the page,
            // and the text of a selection on it cannot be read. Only a screenshot shows the plate.
            expect(getComputedStyle(current(el)).forcedColorAdjust).toBe('none');
            expect(getComputedStyle(pageButton(el, 9)).forcedColorAdjust).toBe('auto');
            // The fill of the theme is gone, and the other pages have none.
            expect(getComputedStyle(current(el)).backgroundColor).not.toBe('rgb(0, 80, 200)');
            expect(getComputedStyle(pageButton(el, 9)).backgroundColor).not.toBe(selection.backgroundColor);
            wrapper.remove();
        });
    });

    describe('server-side rendering', () => {
        it('renders the whole row on the server', async () => {
            const el = await fixture(`<el-pagination total="200" page="10"></el-pagination>`);
            // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
            const markup = el
                .template()
                .toString()
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/\s+/g, ' ');

            expect(markup).toMatch(/<nav part="base" aria-label="Pagination"\s*>/);
            expect(markup).toMatch(/aria-label="Page 10" aria-current="page" data-page="10"\s*> 10 <\/button>/);
            expect(markup).toMatch(
                /part="button page" type="button" aria-label="Page 9"\s+data-page="9"\s*> 9 <\/button>/,
            );
            expect(markup.match(/<li part="ellipsis" aria-hidden="true"\s*>…<\/li>/g).length).toBe(2);
            expect(markup.match(/aria-current/g).length).toBe(1);
            expect(markup).not.toMatch(/disabled/);
            el.remove();
        });

        it('takes over a server-rendered pagination as it is', async () => {
            // The markup the SSR renderer writes: the template of the element as a Declarative Shadow
            // DOM, rendered from the attributes the element has in the page.
            const source = document.createElement('el-pagination');
            Object.assign(source, source.properties(), { total: 200, page: 20 });
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(`
                <el-pagination total="200" page="20">
                    <template shadowrootmode="open">${source.template().toString()}</template>
                </el-pagination>
            `);
            const el = wrapper.querySelector('el-pagination');
            const server = {
                row: row(el),
                current: current(el),
                next: part(el, 'next'),
                disabled: part(el, 'next').disabled,
            };
            await rendered();

            expect(server.row).toBe('1 … 16 17 18 19 20');
            expect(server.disabled).toBe(true);
            expect(row(el)).toBe(server.row);
            expect(current(el)).toBe(server.current);
            expect(part(el, 'next')).toBe(server.next);

            // And it works from there.
            const pages = changes(el);
            part(el, 'previous').click();
            await rendered();
            expect(pages).toEqual([19]);
            expect(current(el).textContent.trim()).toBe('19');
            wrapper.remove();
        });
    });

    it('has no accessibility violations', async () => {
        const wrapper = await fixture(`
            <main style="${tokens} background: rgb(255, 255, 255)">
                <el-pagination total="200" page="10" label="Pages of the first list"></el-pagination>
                <el-pagination total="200" page="1" size="small" label="Pages of the second list"></el-pagination>
                <el-pagination total="5" size="large" label="Pages of the third list">
                    <span slot="previous-icon" aria-hidden="true">←</span>
                </el-pagination>
            </main>
        `);

        const results = await axe.run(wrapper);
        expect(results.violations).toEqual([]);
        wrapper.remove();
    });
});
