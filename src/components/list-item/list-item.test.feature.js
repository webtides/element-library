import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    sizeOf,
    withAndWithoutPageReset,
} from '../../test-helpers.js';
import { define } from './list-item.js';
import { define as defineList } from '../list/list.js';
import { define as defineButton } from '../button/button.js';
define();
defineList();
defineButton();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);

const tokens = `
    --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px;
    --el-border-width: 1px; --el-color-border: rgb(200, 200, 200);
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(100, 100, 100);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(0, 0, 200); --el-focus-ring-width: 2px;
    --el-font-size-sm: 14px;
`;
// A place with text of 16px on lines of 24px, on white, 400px wide.
const place = `font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255); width: 400px;`;
const listOf = async (markup, attributes = 'label="Rows"') => {
    const wrapper = await fixture(`<div style="${place} ${tokens}"><el-list ${attributes}>${markup}</el-list></div>`);
    await nextFrame();
    return wrapper.firstElementChild;
};
const itemOf = async (markup) => (await listOf(markup)).firstElementChild;

describe('Feature | ListItem', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-list-item></el-list-item>`);
        await nextFrame();
    });

    describe('its parts', () => {
        it('has a start, a title, a line under it, an end and a control, in that order', async () => {
            const el = await itemOf(`
                <el-list-item>
                    <span slot="start" style="display:block;width:40px;height:40px"></span>
                    Ada Lovelace
                    <span slot="description">The notes are ready</span>
                    <span slot="end">09:12</span>
                    <button slot="action" type="button">More</button>
                </el-list-item>
            `);
            const box = (node) => node.getBoundingClientRect();
            const start = box(el.querySelector('[slot="start"]'));
            const title = box(part(el, 'title'));
            const description = box(part(el, 'description'));
            const end = box(el.querySelector('[slot="end"]'));
            const action = box(el.querySelector('[slot="action"]'));

            expect(start.right).toBeLessThan(title.left);
            expect(Math.round(title.left - start.right)).toBe(12);
            expect(description.top).toBe(title.bottom);
            expect(description.left).toBe(title.left);
            expect(title.right).toBeLessThanOrEqual(end.left);
            expect(Math.round(action.left - end.right)).toBe(12);
            expect(Math.round(box(part(el, 'base')).right - action.right)).toBe(16);

            // The line under the title and the end are quieter than the title.
            expect(getComputedStyle(part(el, 'title')).color).toBe('rgb(10, 10, 10)');
            expect(getComputedStyle(part(el, 'description')).color).toBe('rgb(100, 100, 100)');
            expect(getComputedStyle(part(el, 'description')).fontSize).toBe('14px');
            expect(getComputedStyle(part(el, 'end')).color).toBe('rgb(100, 100, 100)');
        });

        it('takes no room for a part that nothing is slotted into', async () => {
            const el = await itemOf(`<el-list-item>Only a title</el-list-item>`);

            expect(sizeOf(part(el, 'start')).width).toBe(0);
            expect(sizeOf(part(el, 'description')).height).toBe(0);
            expect(sizeOf(part(el, 'end')).width).toBe(0);
            expect(sizeOf(part(el, 'action')).width).toBe(0);
            // 12 + 24 + 12.
            expect(sizeOf(part(el, 'base')).height).toBe(48);
            expect(sizeOf(part(el, 'title')).width).toBe(400 - 32);
        });
    });

    describe('the gaps between its parts', () => {
        // What the page slots in has a size of its own, which a reset leaves alone.
        const row = `
            <el-list-item>
                <span slot="start" style="display:block;width:40px;height:40px"></span>
                Ada Lovelace
                <span slot="description">The notes are ready</span>
                <span slot="end" style="display:block;width:48px;height:24px"></span>
                <span slot="action" style="display:block;width:32px;height:32px"></span>
            </el-list-item>
        `;
        const gapsOf = (el) => {
            const box = (node) => node.getBoundingClientRect();
            const base = box(part(el, 'base'));
            const start = box(el.querySelector('[slot="start"]'));
            const end = box(el.querySelector('[slot="end"]'));
            const action = box(el.querySelector('[slot="action"]'));
            return {
                beforeStart: Math.round(start.left - base.left),
                startToTitle: Math.round(box(part(el, 'title')).left - start.right),
                textToEnd: Math.round(end.left - box(part(el, 'text')).right),
                endToAction: Math.round(action.left - end.right),
                afterAction: Math.round(base.right - action.right),
            };
        };

        it('are the same on a page that takes the margin off every element', async () => {
            const { plain, reset } = await withAndWithoutPageReset(async () => gapsOf(await itemOf(row)));

            // The padding of the row is --el-space-4, a gap --el-space-3.
            expect(plain).toEqual({
                beforeStart: 16,
                startToTitle: 12,
                textToEnd: 12,
                endToAction: 12,
                afterAction: 16,
            });
            expect(reset).toEqual(plain);
        });

        it('are not there for a part that nothing is slotted into, with the reset as without it', async () => {
            const { plain, reset } = await withAndWithoutPageReset(async () => {
                const el = await itemOf(`<el-list-item>Only a title</el-list-item>`);
                return {
                    start: sizeOf(part(el, 'start')).width,
                    end: sizeOf(part(el, 'end')).width,
                    action: sizeOf(part(el, 'action')).width,
                    // The texts begin at the padding of the row: its list has no first column.
                    title: Math.round(
                        part(el, 'title').getBoundingClientRect().left - part(el, 'base').getBoundingClientRect().left,
                    ),
                    titleWidth: sizeOf(part(el, 'title')).width,
                };
            });

            expect(plain).toEqual({ start: 0, end: 0, action: 0, title: 16, titleWidth: 400 - 32 });
            expect(reset).toEqual(plain);
        });

        it('are after every element of a start, and in front of every element of an end', async () => {
            const el = await itemOf(`
                <el-list-item>
                    <span slot="start" style="display:block;width:16px;height:16px"></span>
                    <span slot="start" style="display:block;width:16px;height:16px"></span>
                    Two icons
                    <span slot="end" style="display:block;width:16px;height:16px"></span>
                    <span slot="end" style="display:block;width:16px;height:16px"></span>
                </el-list-item>
            `);
            const [first, second] = [...el.querySelectorAll('[slot="start"]')].map((node) =>
                node.getBoundingClientRect(),
            );
            const [third, fourth] = [...el.querySelectorAll('[slot="end"]')].map((node) =>
                node.getBoundingClientRect(),
            );

            expect(Math.round(second.left - first.right)).toBe(12);
            expect(Math.round(part(el, 'title').getBoundingClientRect().left - second.right)).toBe(12);
            expect(Math.round(third.left - part(el, 'text').getBoundingClientRect().right)).toBe(12);
            expect(Math.round(fourth.left - third.right)).toBe(12);
        });

        it('take their width from --el-list-gap, set on the list or on a row', async () => {
            const list = await listOf(row + row, 'label="Rows" style="--el-list-gap: 20px"');
            const [first, second] = list.children;
            second.style.setProperty('--el-list-gap', '4px');
            await nextFrame();

            expect(gapsOf(first)).toEqual({
                beforeStart: 16,
                startToTitle: 20,
                textToEnd: 20,
                endToAction: 20,
                afterAction: 16,
            });
            expect(gapsOf(second)).toMatchObject({ textToEnd: 4, endToAction: 4 });
            // The texts of all rows begin on one line, after the widest start and its gap.
            expect(Math.round(part(second, 'title').getBoundingClientRect().left)).toBe(
                Math.round(part(first, 'title').getBoundingClientRect().left),
            );
        });

        it('are not taken by a margin of the page, which adds to them', async () => {
            const el = await itemOf(row);
            el.querySelector('[slot="start"]').style.marginInlineEnd = '8px';
            el.querySelector('[slot="end"]').style.marginInlineStart = '8px';
            await nextFrame();

            expect(gapsOf(el)).toMatchObject({ startToTitle: 20, textToEnd: 20 });
        });
    });

    describe('a row that is a link', () => {
        const link = `
            <el-list-item href="#ada">
                <span slot="start" style="display:block;width:40px;height:40px"></span>
                Ada Lovelace
                <span slot="description">The notes are ready</span>
                <span slot="end">09:12</span>
                <el-button slot="action" size="small" appearance="plain" aria-label="Remove">x</el-button>
            </el-list-item>
            <el-list-item>No link</el-list-item>
        `;

        it('has a native link as its title, and text without href', async () => {
            const el = await listOf(link);
            const [first, second] = el.children;

            expect(part(first, 'title').tagName).toBe('A');
            expect(part(first, 'title').getAttribute('href')).toBe('#ada');
            expect(await accessibleRole(part(first, 'title'))).toBe('link');
            expect(await accessibleName(part(first, 'title'))).toBe('Ada Lovelace');
            expect(part(second, 'title').tagName).toBe('SPAN');
            expect(second.shadowRoot.querySelector('a')).toBeNull();
        });

        it('passes target on, and writes rel with it', async () => {
            const el = await itemOf(`<el-list-item href="https://example.com" target="_blank">Out</el-list-item>`);
            expect(part(el, 'title').getAttribute('target')).toBe('_blank');
            expect(part(el, 'title').getAttribute('rel')).toBe('noreferrer noopener');

            const plain = await itemOf(`<el-list-item href="#in">In</el-list-item>`);
            expect(part(plain, 'title').hasAttribute('target')).toBe(false);
            expect(part(plain, 'title').hasAttribute('rel')).toBe(false);
        });

        it('is one target: the link is hit everywhere on the row but on the control', async () => {
            const el = await itemOf(link);
            // A point outside of the viewport hits nothing.
            el.scrollIntoView({ block: 'center' });
            const row = part(el, 'base').getBoundingClientRect();
            const centreOf = (node) => {
                const box = node.getBoundingClientRect();
                return [box.left + box.width / 2, box.top + box.height / 2];
            };
            const points = {
                'the padding at the start': [row.left + 3, row.top + 3],
                'the start': centreOf(el.querySelector('[slot="start"]')),
                'the title': centreOf(part(el, 'title')),
                'the line under it': centreOf(part(el, 'description')),
                'the room between the texts and the end': [row.left + 250, row.bottom - 3],
                'the end': centreOf(el.querySelector('[slot="end"]')),
                'the padding at the end': [row.right - 3, row.bottom - 3],
            };

            for (const [name, [x, y]] of Object.entries(points)) {
                expect(el.shadowRoot.elementFromPoint(x, y), name).toBe(part(el, 'title'));
                expect(document.elementFromPoint(x, y), name).toBe(el);
            }
        });

        it('leads to its address with a click anywhere on the row', async () => {
            const el = await itemOf(link);
            history.replaceState(null, '', location.pathname + location.search);

            // On the end of the row, far from the title.
            const row = el.getBoundingClientRect();
            const end = el.querySelector('[slot="end"]').getBoundingClientRect();
            await userEvent.click(el, {
                position: { x: end.left + end.width / 2 - row.left, y: end.top + end.height / 2 - row.top },
            });
            expect(location.hash).toBe('#ada');
            history.replaceState(null, '', location.pathname + location.search);
        });

        it('keeps a control in action a target of its own', async () => {
            const el = await itemOf(link);
            const button = el.querySelector('el-button');
            el.scrollIntoView({ block: 'center' });
            const box = button.getBoundingClientRect();
            let clicks = 0;
            button.addEventListener('click', () => clicks++);
            history.replaceState(null, '', location.pathname + location.search);

            expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(button);
            await userEvent.click(button);

            expect(clicks).toBe(1);
            expect(location.hash).toBe('');
        });

        it('takes the keyboard focus once, and the control after it', async () => {
            const el = await itemOf(link);
            const before = document.createElement('button');
            el.parentElement.before(before);
            before.focus();

            await userEvent.tab();
            expect(el.shadowRoot.activeElement).toBe(part(el, 'title'));
            await userEvent.tab();
            expect(document.activeElement).toBe(el.querySelector('el-button'));
            before.remove();
        });

        it('shows the focus ring around the row, and inside of it', async () => {
            const el = await itemOf(link);
            const before = document.createElement('button');
            el.parentElement.before(before);
            before.focus();
            await userEvent.tab();

            const ring = getComputedStyle(part(el, 'title'), '::after');
            expect(ring.outlineStyle).toBe('solid');
            expect(ring.outlineWidth).toBe('2px');
            expect(ring.outlineColor).toBe('rgb(0, 0, 200)');
            expect(ring.outlineOffset).toBe('-2px');
            // As large as the row.
            expect(ring.width).toBe(`${sizeOf(part(el, 'base')).width}px`);
            expect(ring.height).toBe(`${sizeOf(part(el, 'base')).height}px`);
            expect(getComputedStyle(part(el, 'title')).outlineStyle).toBe('none');
            before.remove();
        });
    });

    describe('the current row', () => {
        it('has aria-current="page" on its link', async () => {
            const el = await itemOf(`<el-list-item href="#drafts" current="true">Drafts</el-list-item>`);

            expect(part(el, 'title').getAttribute('aria-current')).toBe('page');
            expect(part(el, 'base').hasAttribute('aria-current')).toBe(false);
        });

        it('has aria-current="true" on the row without a link', async () => {
            const el = await itemOf(`<el-list-item current="true">Drafts</el-list-item>`);

            expect(part(el, 'base').getAttribute('aria-current')).toBe('true');
        });

        it('has none while it is not the current row, also after it was', async () => {
            const el = await itemOf(`<el-list-item href="#drafts" current="true">Drafts</el-list-item>`);
            el.current = false;
            await nextFrame();
            await nextFrame();

            expect(part(el, 'title').hasAttribute('aria-current')).toBe(false);
            expect(part(el, 'base').classList.contains('item--current')).toBe(false);
        });

        it('is told apart by a bar at its start and a heavier title, not by a colour alone', async () => {
            const el = await listOf(`
                <el-list-item href="#inbox">Inbox</el-list-item>
                <el-list-item href="#drafts" current="true">Drafts</el-list-item>
            `);
            const [other, current] = el.children;
            const bar = getComputedStyle(part(current, 'base'), '::before');

            expect(bar.borderInlineStartWidth).toBe('3px');
            expect(bar.borderInlineStartColor).toBe('rgb(0, 0, 200)');
            expect(bar.height).toBe(`${sizeOf(part(current, 'base')).height - 1}px`);
            expect(getComputedStyle(part(other, 'base'), '::before').content).toBe('none');
            expect(getComputedStyle(part(current, 'title')).fontWeight).toBe('600');
            expect(getComputedStyle(part(other, 'title')).fontWeight).toBe('400');
            expect(getComputedStyle(part(current, 'base')).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
            // The bar does not move the texts.
            expect(part(current, 'title').getBoundingClientRect().left).toBe(
                part(other, 'title').getBoundingClientRect().left,
            );
        });
    });

    describe('a mark', () => {
        it('is read in front of the title, and is part of the name of the link', async () => {
            const el = await itemOf(`<el-list-item href="#ada" mark="Unread">Ada Lovelace</el-list-item>`);

            expect(await accessibleName(part(el, 'title'))).toBe('Unread Ada Lovelace');
            expect(part(el, 'mark').getAttribute('aria-hidden')).toBe('true');
        });

        it('comes and goes with the property', async () => {
            const el = await itemOf(`<el-list-item>Ada Lovelace</el-list-item>`);
            expect(part(el, 'mark')).toBeNull();

            el.mark = 'Unread';
            await nextFrame();
            await nextFrame();
            expect(part(el, 'mark')).not.toBeNull();
            expect(part(el, 'title').textContent.trim()).toBe('Unread');

            el.mark = '';
            await nextFrame();
            await nextFrame();
            expect(part(el, 'mark')).toBeNull();
            expect(part(el, 'title').textContent.trim()).toBe('');
        });
    });

    describe('long texts', () => {
        const long = 'Averyveryverylongwordwithoutanyspaceatallthatauserhastypedintoafieldandthatgoesonandon';

        it('breaks a long title into more lines, inside of a word where it has to', async () => {
            const el = await listOf(`
                <el-list-item>${long}<span slot="description">${long}</span><span slot="end">${long}</span></el-list-item>
            `);
            const item = el.firstElementChild;

            expect(sizeOf(part(item, 'title')).height).toBeGreaterThan(24);
            expect(sizeOf(el).width).toBe(400);
            expect(el.parentElement.scrollWidth).toBe(400);
            expect(part(item, 'base').scrollWidth).toBe(400);
            // The end takes half of the row at most.
            expect(sizeOf(part(item, 'end')).width).toBeLessThanOrEqual((400 - 32) / 2);
        });

        describe('beside what is in end, on a phone', () => {
            // A title and a line under it that are each longer than the row, 375px wide.
            const title = 'Notes of the meeting with the board about the plans for the coming year';
            const text = `${title}<span slot="description">${title}, and what follows from them</span>`;
            const date = `<span slot="end" class="in-end">24.11.2026</span>`;
            const iconWith = (style) =>
                `<svg slot="end" class="in-end" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style="${style}"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" /></svg>`;
            // An icon as it is, and one the page keeps from shrinking, as a utility class does.
            const icon = iconWith('');
            const fixedIcon = iconWith('flex: none');
            const phone = async (markup) => {
                const wrapper = await fixture(
                    `<div style="${place} ${tokens} width: 375px;"><el-list label="Notes">${markup}</el-list></div>`,
                );
                await nextFrame();
                return wrapper.firstElementChild;
            };
            const box = (node) => node.getBoundingClientRect();
            // Where the padding at the end of a row begins.
            const padding = (item) => Math.round((box(part(item, 'base')).right - 16) * 10) / 10;
            const end = (item) => Math.round(box(item.querySelector('.in-end')).right * 10) / 10;

            it('keeps a date in end on one line', async () => {
                const el = await phone(`
                    <el-list-item href="#long">${text}${date}</el-list-item>
                    <el-list-item href="#short">Short${date}</el-list-item>
                `);
                const [long, short] = [...el.children].map((item) => box(item.querySelector('.in-end')));

                expect(sizeOf(part(el.children[0], 'title')).height).toBeGreaterThan(24);
                expect(long.height).toBe(24);
                // As wide as in a row with a short text.
                expect(long.width).toBe(short.width);
                expect(end(el.children[0])).toBe(padding(el.children[0]));
            });

            it('keeps an icon in end in the row: it ends where the padding of the row begins', async () => {
                const el = await phone(`
                    <el-list-item href="#long">${text}${icon}</el-list-item>
                    <el-list-item href="#fixed">${text}${fixedIcon}</el-list-item>
                `);

                for (const item of el.children) {
                    const href = item.getAttribute('href');
                    expect(sizeOf(item.querySelector('.in-end')), href).toEqual({ width: 16, height: 16 });
                    expect(end(item), href).toBe(padding(item));
                    // The gap, and the icon.
                    expect(sizeOf(part(item, 'end')).width, href).toBe(12 + 16);
                }
                expect(el.parentElement.scrollWidth).toBe(375);
            });

            it('ends what is in end on one line in all rows of a list', async () => {
                const el = await phone(`
                    <el-list-item href="#one">${text}${date}</el-list-item>
                    <el-list-item href="#two">Short${date}</el-list-item>
                    <el-list-item href="#three">${text}${icon}</el-list-item>
                    <el-list-item href="#four">${text}${fixedIcon}</el-list-item>
                    <el-list-item href="#five">Short${icon}</el-list-item>
                `);
                const items = [...el.children];

                expect(new Set(items.map(end)).size).toBe(1);
                expect(end(items[0])).toBe(padding(items[0]));
            });

            it('gives what is wider than half of the row half of it, and breaks it there', async () => {
                const el = await phone(`
                    <el-list-item href="#long">${text}<span slot="end" class="in-end">${title}</span></el-list-item>
                `);
                const item = el.firstElementChild;

                // Half of what is between the paddings of the row.
                expect(sizeOf(part(item, 'end')).width).toBe((375 - 32) / 2);
                expect(sizeOf(item.querySelector('.in-end')).height).toBeGreaterThan(24);
                expect(end(item)).toBe(padding(item));
                expect(el.parentElement.scrollWidth).toBe(375);
            });
        });

        it('cuts the title and the line under it after one line with truncate', async () => {
            const el = await listOf(`
                <el-list-item truncate="true" href="#long">${long}<span slot="description">${long} ${long}</span></el-list-item>
            `);
            const item = el.firstElementChild;

            expect(sizeOf(part(item, 'title')).height).toBe(24);
            expect(getComputedStyle(part(item, 'title')).textOverflow).toBe('ellipsis');
            expect(part(item, 'title').scrollWidth).toBeGreaterThan(part(item, 'title').clientWidth);
            expect(sizeOf(part(item, 'description')).height).toBe(24);
            expect(el.parentElement.scrollWidth).toBe(400);
            // The link is still the whole row.
            item.scrollIntoView({ block: 'center' });
            const row = part(item, 'base').getBoundingClientRect();
            expect(item.shadowRoot.elementFromPoint(row.right - 3, row.bottom - 3)).toBe(part(item, 'title'));
        });
    });

    describe('for assistive technology', () => {
        it('has no detectable a11y violations', async () => {
            const el = await listOf(`
                <el-list-item href="#ada" mark="Unread" current="true">
                    Ada Lovelace
                    <span slot="description">The notes are ready</span>
                    <span slot="end">09:12</span>
                    <el-button slot="action" size="small" appearance="plain" aria-label="Remove">x</el-button>
                </el-list-item>
                <el-list-item current="true">Grace Hopper<span slot="end">08:40</span></el-list-item>
                <el-list-item truncate="true">Alan Turing</el-list-item>
            `);

            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });
});
