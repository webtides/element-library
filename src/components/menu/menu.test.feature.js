import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    forcePseudoClasses,
    nextFrame,
    oneEvent,
    realPointer,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
import { activeElement } from '../../utils/focus.js';
import { define } from './menu.js';
import { define as defineMenuItem } from '../menu-item/menu-item.js';
import { define as defineMenuGroup } from '../menu-group/menu-group.js';
import { define as defineButton } from '../button/button.js';
import { define as defineDivider } from '../divider/divider.js';
define();
defineMenuItem();
defineMenuGroup();
defineButton();
defineDivider();

// An open menu is in the top layer: every test takes its fixture out of the page again.
const wrappers = [];
afterEach(async () => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
    await realPointer().leave();
});

// A theme: a control height of 40px, borders of 1px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-radius-lg: 8px; --el-border-width: 1px; --el-control-height: 40px;
    --el-touch-target: 44px; --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px;
    --el-font-size-xs: 12px; --el-font-size-sm: 14px; --el-focus-ring-width: 2px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(90, 90, 90);
    --el-color-border: rgb(150, 150, 150); --el-color-danger: rgb(200, 0, 0);
    --el-color-focus-ring: rgb(0, 0, 200);
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;

const icon = `<svg slot="icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" /></svg>`;
const three = `
    <el-menu-item id="edit" value="edit">Edit</el-menu-item>
    <el-menu-item id="duplicate" value="duplicate">Duplicate</el-menu-item>
    <el-menu-item id="delete" value="delete" variant="danger">Delete</el-menu-item>
`;

/**
 * A menu with a button, 100px from the corner of the page, and a button after it.
 * @param {string} [entries]
 * @param {object} [options]
 */
const menu = async (
    entries = three,
    {
        attributes = '',
        trigger = '<el-button slot="trigger">More</el-button>',
        style = theme,
        dir = 'ltr',
        place = 'padding: 100px;',
    } = {},
) => {
    const wrapper = await fixture(`
        <div dir="${dir}" style="${style} ${place}">
            <button class="before" type="button">Before</button>
            <el-menu ${attributes}>${trigger}${entries}</el-menu>
            <button class="after" type="button">After</button>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-menu');
};

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const panelOf = (el) => part(el, 'panel');
const triggerOf = (el) => el.querySelector('[slot="trigger"]');
/** The control of a trigger: the button inside of an el-button, or the element itself. */
const control = (trigger) => trigger.shadowRoot?.querySelector('button') ?? trigger;
const isShown = (el) => panelOf(el).matches(':popover-open');
/** The entry that has the focus, by its id. */
const focused = () => activeElement()?.getRootNode().host?.id;
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const openWith = async (el, key = '{Enter}') => {
    control(triggerOf(el)).focus();
    await userEvent.keyboard(key);
    await rendered();
};
const selections = (el) => {
    const chosen = [];
    el.addEventListener('menu-select', (event) => chosen.push([event.detail.value, event.detail.item.id]));
    return chosen;
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

describe('Feature | Menu', () => {
    describe('the button', () => {
        it('says that it opens a menu, and whether the menu is open', async () => {
            const el = await menu();
            const trigger = triggerOf(el);

            expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
            // An el-button passes both on to the control inside of it, which is what is announced.
            expect(control(trigger).getAttribute('aria-haspopup')).toBe('menu');
            expect(control(trigger).getAttribute('aria-expanded')).toBe('false');

            el.open = true;
            await rendered();
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(control(trigger).getAttribute('aria-expanded')).toBe('true');

            el.open = false;
            await rendered();
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
        });

        it('can be a native button of the page', async () => {
            const el = await menu(three, { trigger: '<button slot="trigger" type="button">More</button>' });
            const trigger = triggerOf(el);

            expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
            await openWith(el);
            expect(trigger.getAttribute('aria-expanded')).toBe('true');
            expect(focused()).toBe('edit');
        });

        it('opens the menu with a click, and puts the focus on its first entry', async () => {
            const el = await menu();

            await userEvent.click(triggerOf(el));
            await rendered();

            expect(el.open).toBe(true);
            expect(isShown(el)).toBe(true);
            expect(focused()).toBe('edit');
        });

        it('closes the menu with a second click', async () => {
            const el = await menu();
            await userEvent.click(triggerOf(el));
            await rendered();

            await userEvent.click(triggerOf(el));
            await rendered();

            expect(el.open).toBe(false);
            expect(isShown(el)).toBe(false);
        });

        it('opens the menu with Enter, Space and ArrowDown at its first entry, and with ArrowUp at its last', async () => {
            for (const [key, entry] of [
                ['{Enter}', 'edit'],
                [' ', 'edit'],
                ['{ArrowDown}', 'edit'],
                ['{ArrowUp}', 'delete'],
            ]) {
                const el = await menu();
                await openWith(el, key);

                expect(el.open, key).toBe(true);
                expect(focused(), key).toBe(entry);
                el.open = false;
                await rendered();
            }
        });

        it('leaves an arrow key with a modifier to the browser', async () => {
            const el = await menu();
            control(triggerOf(el)).focus();

            await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
            await rendered();

            expect(el.open).toBe(false);
        });
    });

    describe('the menu', () => {
        it('is a menu of menu items to assistive technology, with the name of its button', async () => {
            const el = await menu();
            await openWith(el);

            expect(await accessibleRole(panelOf(el))).toBe('menu');
            expect(await accessibleName(panelOf(el))).toBe('More');
            for (const item of el.querySelectorAll('el-menu-item')) {
                expect(await accessibleRole(part(item, 'base'))).toBe('menuitem');
            }
            expect(await accessibleName(part(el.querySelector('#duplicate'), 'base'))).toBe('Duplicate');
        });

        it('has the name the page gives it', async () => {
            const el = await menu(three, { attributes: 'label="Actions for the invoice"' });
            await openWith(el);
            expect(await accessibleName(panelOf(el))).toBe('Actions for the invoice');

            el.label = '';
            await rendered();
            expect(panelOf(el).hasAttribute('aria-label')).toBe(false);
            expect(await accessibleName(panelOf(el))).toBe('More');
        });

        it('says whether it is open: on the host, to a stylesheet and with an event', async () => {
            const el = await menu();
            const told = [];
            el.addEventListener('menu-show', () => told.push('show'));
            el.addEventListener('menu-hide', () => told.push('hide'));

            el.show();
            await rendered();
            expect([el.getAttribute('open'), el.matches(':state(open)'), isShown(el)]).toEqual(['true', true, true]);

            el.hide();
            await rendered();
            expect([el.getAttribute('open'), el.matches(':state(open)'), isShown(el)]).toEqual(['false', false, false]);

            el.toggle();
            await rendered();
            expect(isShown(el)).toBe(true);
            expect(told).toEqual(['show', 'hide', 'show']);
        });

        it('is open from the start where the page says so', async () => {
            const el = await menu(three, { attributes: 'open="true"' });

            expect(isShown(el)).toBe(true);
            expect(triggerOf(el).getAttribute('aria-expanded')).toBe('true');
        });
    });

    describe('the keyboard in the menu', () => {
        it('moves through the entries with the arrow keys, around the ends', async () => {
            const el = await menu();
            await openWith(el);
            const seen = [focused()];

            for (const key of ['{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{ArrowUp}', '{ArrowUp}']) {
                await userEvent.keyboard(key);
                seen.push(focused());
            }

            expect(seen).toEqual(['edit', 'duplicate', 'delete', 'edit', 'delete', 'duplicate']);
        });

        it('goes to the first and to the last entry with Home and End', async () => {
            const el = await menu();
            await openWith(el);

            await userEvent.keyboard('{End}');
            expect(focused()).toBe('delete');
            await userEvent.keyboard('{Home}');
            expect(focused()).toBe('edit');
        });

        it('goes to the next entry that starts with a letter', async () => {
            const el = await menu();
            await openWith(el);
            const seen = [];

            // Two entries start with a D: the letter goes from one to the other and round.
            for (const key of ['d', 'd', 'D', 'e', 'x']) {
                await userEvent.keyboard(key);
                seen.push(focused());
            }

            expect(seen).toEqual(['duplicate', 'delete', 'duplicate', 'edit', 'edit']);
        });

        it('compares a letter with the text of an entry, not with its icon', async () => {
            const el = await menu(`
                <el-menu-item id="archive">${icon.replace('aria-hidden="true"', 'aria-hidden="true"><title>Zip</title')}Archive</el-menu-item>
                <el-menu-item id="zoom">Zoom</el-menu-item>
            `);
            await openWith(el);

            await userEvent.keyboard('z');

            expect(focused()).toBe('zoom');
        });

        it('keeps the entries out of the order of the Tab key: the menu moves the focus', async () => {
            const el = await menu();

            for (const item of el.querySelectorAll('el-menu-item')) {
                expect(part(item, 'base').getAttribute('tabindex')).toBe('-1');
            }
            // Closed, the Tab key goes from the button to what follows the menu.
            control(triggerOf(el)).focus();
            await userEvent.keyboard('{Tab}');
            expect(document.activeElement).toBe(el.parentElement.querySelector('.after'));
        });

        it('reaches an entry that came later', async () => {
            const el = await menu();
            el.insertAdjacentHTML('beforeend', '<el-menu-item id="print" value="print">Print</el-menu-item>');
            await rendered();
            await openWith(el);

            await userEvent.keyboard('{End}');

            expect(focused()).toBe('print');
        });

        it('leaves out an entry the page has hidden', async () => {
            const el = await menu(`
                <el-menu-item id="edit">Edit</el-menu-item>
                <el-menu-item id="secret" hidden>Secret</el-menu-item>
                <el-menu-item id="delete">Delete</el-menu-item>
            `);
            await openWith(el);

            await userEvent.keyboard('{ArrowDown}');

            expect(focused()).toBe('delete');
        });
    });

    describe('closing', () => {
        it('closes with Escape, and gives the focus back to the button', async () => {
            const el = await menu();
            await openWith(el);
            await userEvent.keyboard('{ArrowDown}');

            await userEvent.keyboard('{Escape}');
            await rendered();

            expect(el.open).toBe(false);
            expect(isShown(el)).toBe(false);
            expect(document.activeElement).toBe(triggerOf(el));
            expect(triggerOf(el).getAttribute('aria-expanded')).toBe('false');
        });

        it('closes with the Tab key, and the focus moves on', async () => {
            const el = await menu();
            await openWith(el);

            await userEvent.keyboard('{Tab}');
            await rendered();

            expect(el.open).toBe(false);
            expect(document.activeElement).toBe(el.parentElement.querySelector('.after'));
        });

        it('closes with Shift and Tab, and the focus is on the button', async () => {
            const el = await menu();
            await openWith(el);

            await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
            await rendered();

            expect(el.open).toBe(false);
            expect(document.activeElement).toBe(triggerOf(el));
        });

        it('closes with a click beside it', async () => {
            const el = await menu();
            await openWith(el);

            await userEvent.click(el.parentElement, { position: { x: 5, y: 5 } });
            await rendered();

            expect(el.open).toBe(false);
            expect(isShown(el)).toBe(false);
        });

        it('gives the focus back when a script closes it while an entry has the focus', async () => {
            const el = await menu();
            await openWith(el);

            el.hide();
            await rendered();

            expect(document.activeElement).toBe(triggerOf(el));
        });

        it('opens again after every way of closing', async () => {
            const el = await menu();
            for (const close of ['{Escape}', '{Tab}']) {
                await openWith(el);
                await userEvent.keyboard(close);
                await rendered();
                expect(el.open, close).toBe(false);
            }

            await userEvent.click(triggerOf(el));
            await rendered();

            expect(el.open).toBe(true);
            expect(focused()).toBe('edit');
        });
    });

    describe('choosing an entry', () => {
        it('closes the menu, tells the page which one it was, and gives the focus back', async () => {
            const el = await menu();
            const chosen = selections(el);
            await openWith(el);

            await userEvent.keyboard('{ArrowDown}{Enter}');
            await rendered();

            expect(chosen).toEqual([['duplicate', 'duplicate']]);
            expect(el.open).toBe(false);
            expect(document.activeElement).toBe(triggerOf(el));
        });

        it('chooses with the space bar and with a click', async () => {
            const el = await menu();
            const chosen = selections(el);

            await openWith(el);
            await userEvent.keyboard(' ');
            await rendered();
            await openWith(el);
            await userEvent.click(el.querySelector('#delete'));
            await rendered();

            expect(chosen).toEqual([
                ['edit', 'edit'],
                ['delete', 'delete'],
            ]);
            expect(el.open).toBe(false);
        });

        it('is a click on the entry, which the page can hear there as well', async () => {
            const el = await menu();
            let clicks = 0;
            el.querySelector('#edit').addEventListener('click', () => (clicks += 1));
            await openWith(el);

            await userEvent.keyboard('{Enter}');

            expect(clicks).toBe(1);
        });

        it('tells of the choice before the menu closes, and the event crosses a shadow root', async () => {
            const el = await menu();
            let state;
            el.parentElement.addEventListener('menu-select', (event) => {
                state = [el.open, event.composed, event.bubbles];
            });
            await openWith(el);

            await userEvent.keyboard('{Enter}');

            expect(state).toEqual([true, true, true]);
        });

        it('follows an entry that is a link, and closes', async () => {
            const el = await menu(`
                <el-menu-item id="edit">Edit</el-menu-item>
                <el-menu-item id="docs" value="docs" href="#menu-docs">Documentation</el-menu-item>
            `);
            const chosen = selections(el);
            const before = location.hash;
            const link = part(el.querySelector('#docs'), 'base');

            expect(link.localName).toBe('a');
            expect(link.getAttribute('href')).toBe('#menu-docs');
            await openWith(el);
            expect(await accessibleRole(link)).toBe('menuitem');
            await userEvent.keyboard('{ArrowDown}{Enter}');
            await rendered();

            expect(location.hash).toBe('#menu-docs');
            expect(chosen).toEqual([['docs', 'docs']]);
            expect(el.open).toBe(false);
            history.replaceState(null, '', before || location.pathname + location.search);
        });

        it('follows a link with the space bar as well: in a menu the key chooses every entry', async () => {
            const el = await menu(`<el-menu-item id="docs" href="#menu-space">Documentation</el-menu-item>`);
            const before = location.hash;
            await openWith(el);

            await userEvent.keyboard(' ');
            await rendered();

            expect(location.hash).toBe('#menu-space');
            history.replaceState(null, '', before || location.pathname + location.search);
        });

        it('opens a link where the page says, with a rel for it', async () => {
            const el = await menu(`<el-menu-item id="docs" href="/docs" target="_blank">Documentation</el-menu-item>`);
            const link = part(el.querySelector('#docs'), 'base');

            expect(link.getAttribute('target')).toBe('_blank');
            expect(link.getAttribute('rel')).toBe('noreferrer noopener');
        });
    });

    describe('an entry that is disabled', () => {
        const entries = `
            <el-menu-item id="edit" value="edit">Edit</el-menu-item>
            <el-menu-item id="move" value="move" disabled="true">Move</el-menu-item>
            <el-menu-item id="docs" value="docs" href="#menu-disabled" disabled="true">Documentation</el-menu-item>
        `;

        it('says so, and is reached by the keyboard all the same', async () => {
            const el = await menu(entries);
            await openWith(el);

            await userEvent.keyboard('{ArrowDown}');

            expect(focused()).toBe('move');
            expect(part(el.querySelector('#move'), 'base').getAttribute('aria-disabled')).toBe('true');
            expect(part(el.querySelector('#edit'), 'base').hasAttribute('aria-disabled')).toBe(false);
        });

        it('cannot be chosen: nothing is told, and the menu stays open', async () => {
            const el = await menu(entries);
            const chosen = selections(el);
            let clicks = 0;
            el.querySelector('#move').addEventListener('click', () => (clicks += 1));
            await openWith(el);

            await userEvent.keyboard('{ArrowDown}{Enter}');
            await userEvent.keyboard(' ');
            await userEvent.click(el.querySelector('#move'));
            await rendered();

            expect(chosen).toEqual([]);
            expect(clicks).toBe(0);
            expect(el.open).toBe(true);
        });

        it('is no link while it is disabled', async () => {
            const el = await menu(entries);
            const before = location.hash;
            const docs = part(el.querySelector('#docs'), 'base');

            expect(docs.localName).toBe('button');
            expect(docs.hasAttribute('href')).toBe(false);
            await openWith(el);
            await userEvent.keyboard('{End}{Enter}');

            expect(location.hash).toBe(before);
            expect(el.open).toBe(true);
        });

        it('looks like it', async () => {
            const el = await menu(entries);
            await openWith(el);
            const move = getComputedStyle(part(el.querySelector('#move'), 'base'));

            expect(move.opacity).toBe('0.55');
            expect(move.cursor).toBe('not-allowed');
        });

        it('can be chosen again once it is enabled', async () => {
            const el = await menu(entries);
            const chosen = selections(el);
            el.querySelector('#move').disabled = false;
            await rendered();
            await openWith(el);

            await userEvent.keyboard('{ArrowDown}{Enter}');

            expect(chosen).toEqual([['move', 'move']]);
        });
    });

    describe('icons, groups and a danger', () => {
        it('has the icon of an entry in front of its text, and no room for one that is not there', async () => {
            const el = await menu(`
                <el-menu-item id="edit">${icon}Edit</el-menu-item>
                <el-menu-item id="plain">Plain</el-menu-item>
            `);
            await openWith(el);
            const edit = el.querySelector('#edit');
            const plain = el.querySelector('#plain');
            const left = (item, name) =>
                part(item, name).getBoundingClientRect().left - item.getBoundingClientRect().left;

            expect(left(edit, 'icon')).toBe(12);
            expect(left(edit, 'label')).toBe(12 + 16 + 8);
            expect(part(plain, 'icon').hidden).toBe(true);
            expect(left(plain, 'label')).toBe(12);
        });

        it('divides its entries into groups, each a group with its heading as its name', async () => {
            const el = await menu(`
                <el-menu-item id="edit">Edit</el-menu-item>
                <el-menu-group id="share" label="Share">
                    <el-menu-item id="mail">Mail</el-menu-item>
                    <el-menu-item id="link">Copy link</el-menu-item>
                </el-menu-group>
                <el-menu-group id="rest">
                    <el-menu-item id="delete" variant="danger">Delete</el-menu-item>
                </el-menu-group>
            `);
            await openWith(el);
            const share = part(el.querySelector('#share'), 'base');
            const rest = part(el.querySelector('#rest'), 'base');

            expect(await accessibleRole(share)).toBe('group');
            expect(await accessibleName(share)).toBe('Share');
            expect(part(el.querySelector('#share'), 'label').textContent.trim()).toBe('Share');
            // The heading the eye sees is not read a second time.
            expect(part(el.querySelector('#share'), 'label').getAttribute('aria-hidden')).toBe('true');
            // A group without a heading has no name, and no room for one.
            expect(rest.hasAttribute('aria-label')).toBe(false);
            expect(part(el.querySelector('#rest'), 'label').hidden).toBe(true);
            // A line over each: something is before them in the menu.
            expect(getComputedStyle(share).borderTopWidth).toBe('1px');
            expect(getComputedStyle(rest).borderTopWidth).toBe('1px');
        });

        it('has no line over a group that is the first thing in the menu', async () => {
            const el = await menu(`
                <el-menu-group id="first" label="File">
                    <el-menu-item id="open">Open</el-menu-item>
                </el-menu-group>
                <el-menu-group id="second" label="Edit">
                    <el-menu-item id="undo">Undo</el-menu-item>
                </el-menu-group>
            `);
            await openWith(el);

            // The button of the menu is a child before it, in a slot of its own: not counted.
            expect(getComputedStyle(part(el.querySelector('#first'), 'base')).borderTopWidth).toBe('0px');
            expect(getComputedStyle(part(el.querySelector('#second'), 'base')).borderTopWidth).toBe('1px');
        });

        it('moves through the entries of the groups as through one row', async () => {
            const el = await menu(`
                <el-menu-item id="edit">Edit</el-menu-item>
                <el-menu-group label="Share"><el-menu-item id="mail">Mail</el-menu-item></el-menu-group>
                <el-divider></el-divider>
                <el-menu-item id="delete">Delete</el-menu-item>
            `);
            await openWith(el);
            const seen = [focused()];

            for (let i = 0; i < 3; i++) {
                await userEvent.keyboard('{ArrowDown}');
                seen.push(focused());
            }

            expect(seen).toEqual(['edit', 'mail', 'delete', 'edit']);
        });

        it('shows an entry for something that cannot be undone in the colour of a danger', async () => {
            const el = await menu();
            await openWith(el);
            const colour = (id) => getComputedStyle(part(el.querySelector(id), 'base')).color;

            expect(colour('#delete')).toBe('rgb(200, 0, 0)');
            expect(colour('#edit')).toBe('rgb(10, 10, 10)');
            expect(el.querySelector('#delete').getAttribute('variant')).toBe('danger');
        });
    });

    describe('the panel', () => {
        const boxOf = (node) => {
            const { left, top, right, bottom, width, height } = node.getBoundingClientRect();
            return { left, top, right, bottom, width, height };
        };

        it('is in the top layer, below its button and in line with the start of it', async () => {
            const el = await menu();
            await openWith(el);
            const trigger = boxOf(triggerOf(el));
            const panel = boxOf(panelOf(el));

            expect(panelOf(el).matches(':popover-open')).toBe(true);
            expect(getComputedStyle(panelOf(el)).position).toBe('fixed');
            expect(Math.round(panel.left)).toBe(Math.round(trigger.left));
            expect(Math.round(panel.top)).toBe(Math.round(trigger.bottom + 4));
            expect(panelOf(el).dataset.placement).toBe('bottom-start');
        });

        it('moves nothing on the page, and takes no room', async () => {
            const el = await menu();
            const before = [boxOf(el), boxOf(el.parentElement.querySelector('.after')), boxOf(el.parentElement)];

            await openWith(el);

            expect([boxOf(el), boxOf(el.parentElement.querySelector('.after')), boxOf(el.parentElement)]).toEqual(
                before,
            );
        });

        it('is not clipped by an element around it that clips', async () => {
            const el = await menu(three, {
                place: 'padding: 100px; height: 20px; overflow: hidden; position: relative;',
            });
            await openWith(el);
            const panel = boxOf(panelOf(el));
            const item = el.querySelector('#delete');
            const { left, top, width, height } = item.getBoundingClientRect();

            expect(panel.height).toBeGreaterThan(100);
            // What is at the place of the last entry is the entry.
            const hit = document.elementFromPoint(left + width / 2, top + height / 2);
            expect(hit).toBe(item);
        });

        it('is at the side the page names', async () => {
            const el = await menu(three, { attributes: 'placement="right-start" distance="10"' });
            await openWith(el);
            const trigger = boxOf(triggerOf(el));
            const panel = boxOf(panelOf(el));

            expect(Math.round(panel.left)).toBe(Math.round(trigger.right + 10));
            expect(Math.round(panel.top)).toBe(Math.round(trigger.top));
        });

        it('goes to the other side where it has no room', async () => {
            const el = await menu(three, { place: 'position: fixed; bottom: 10px; left: 100px;' });
            await openWith(el);
            const trigger = boxOf(triggerOf(el));
            const panel = boxOf(panelOf(el));

            expect(panelOf(el).dataset.placement).toBe('top-start');
            expect(Math.round(panel.bottom)).toBe(Math.round(trigger.top - 4));
        });

        it('stays inside of the viewport', async () => {
            const el = await menu(
                `<el-menu-item id="long">An action with a name that is long enough to leave the viewport</el-menu-item>`,
                { place: 'position: fixed; top: 10px; right: 0;' },
            );
            await openWith(el);
            const panel = boxOf(panelOf(el));

            expect(panel.right).toBeLessThanOrEqual(innerWidth - 8);
            expect(panel.left).toBeGreaterThanOrEqual(8);
        });

        it('is in line with the right edge of its button in a right-to-left page', async () => {
            const el = await menu(three, { dir: 'rtl' });
            await openWith(el);

            expect(Math.round(boxOf(panelOf(el)).right)).toBe(Math.round(boxOf(triggerOf(el)).right));
        });

        it('follows a new placement while it is open', async () => {
            const el = await menu();
            await openWith(el);

            el.placement = 'right-start';
            await rendered();
            await rendered();

            expect(panelOf(el).dataset.placement).toBe('right-start');
        });

        it('scrolls a long menu in what the browser shows', async () => {
            const many = Array.from(
                { length: 60 },
                (_, i) => `<el-menu-item id="e${i}">Entry ${i}</el-menu-item>`,
            ).join('');
            const el = await menu(many, { place: 'position: fixed; top: 10px; left: 10px;' });
            await openWith(el);
            const panel = panelOf(el);

            expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(innerHeight - 16);
            expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
            await userEvent.keyboard('{End}');
            const last = el.querySelector('#e59').getBoundingClientRect();
            expect(last.bottom).toBeLessThanOrEqual(panel.getBoundingClientRect().bottom);
        });
    });

    describe('look', () => {
        it('has a surface, a border and its entries from the tokens', async () => {
            const el = await menu();
            await openWith(el);
            const panel = getComputedStyle(panelOf(el));
            const item = part(el.querySelector('#duplicate'), 'base');

            expect(panel.backgroundColor).toBe('rgb(255, 255, 255)');
            expect([panel.borderTopWidth, panel.borderTopColor, panel.borderTopLeftRadius]).toEqual([
                '1px',
                'rgb(150, 150, 150)',
                '8px',
            ]);
            expect(panel.fontSize).toBe('14px');
            // An entry is as wide as the menu inside of its padding, and a little lower than a control.
            expect(item.getBoundingClientRect().height).toBe(34);
            expect(item.getBoundingClientRect().width).toBe(panelOf(el).clientWidth - 8);
            expect(getComputedStyle(item).backgroundColor).toBe(TRANSPARENT);
        });

        it('shows the entry that has the focus of the keyboard, with a ring inside of it', async () => {
            const el = await menu();
            await openWith(el);
            const item = part(el.querySelector('#edit'), 'base');
            await forcePseudoClasses(item, ['focus-visible']);
            const style = getComputedStyle(item);

            expect([style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset]).toEqual([
                'solid',
                '2px',
                'rgb(0, 0, 200)',
                '-2px',
            ]);
            expect(style.backgroundColor).not.toBe(TRANSPARENT);
        });

        it('is no wider than it is told, and wraps a text that is longer', async () => {
            const el = await menu(
                `<el-menu-item id="long">An action with a name that is much longer than a menu is wide by default</el-menu-item>`,
            );
            await openWith(el);

            expect(panelOf(el).getBoundingClientRect().width).toBe(320);
            expect(el.querySelector('#long').getBoundingClientRect().height).toBeGreaterThan(34);
        });

        it('is at least as wide as the page says', async () => {
            const el = await menu(`<el-menu-item id="a">A</el-menu-item>`, {
                style: `${theme} --el-menu-min-width: 240px;`,
            });
            await openWith(el);

            expect(panelOf(el).getBoundingClientRect().width).toBe(240);
        });
    });

    describe('without a theme', () => {
        it('reads in a light and in a dark scheme', async () => {
            for (const scheme of ['light', 'dark']) {
                const el = await menu(three, {
                    style: `color-scheme: ${scheme}; background: Canvas; color: CanvasText; font: 16px/24px sans-serif;`,
                });
                await openWith(el);

                expect(getComputedStyle(panelOf(el)).backgroundColor).not.toBe(TRANSPARENT);
                const results = await axe.run(el.parentElement, { runOnly: ['color-contrast'] });
                expect(results.violations, scheme).toEqual([]);
                el.open = false;
                await rendered();
            }
        });
    });

    describe('where the user forces colours', () => {
        useForcedColors();

        it('shows the entry that has the focus by its ring, and the line over a group', async () => {
            const el = await menu(
                `
                <el-menu-item id="edit">Edit</el-menu-item>
                <el-menu-group id="rest"><el-menu-item id="delete">Delete</el-menu-item></el-menu-group>
            `,
                { style: 'font: 16px/24px sans-serif;' },
            );
            await openWith(el);
            const item = part(el.querySelector('#edit'), 'base');
            await forcePseudoClasses(item, ['focus-visible']);
            const style = getComputedStyle(item);

            expect(style.outlineStyle).toBe('solid');
            expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
            expect(style.outlineColor).not.toBe(TRANSPARENT);
            expect(getComputedStyle(part(el.querySelector('#rest'), 'base')).borderTopWidth).toBe('1px');
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes every entry at least as high as a finger needs', async () => {
            const el = await menu();
            el.open = true;
            await rendered();

            for (const item of el.querySelectorAll('el-menu-item')) {
                expect(part(item, 'base').getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
            }
        });
    });

    describe('more than one menu', () => {
        it('closes one when another opens', async () => {
            const wrapper = await fixture(`
                <div style="${theme} padding: 100px;">
                    <el-menu id="one"><el-button slot="trigger">One</el-button><el-menu-item>First</el-menu-item></el-menu>
                    <el-menu id="two"><el-button slot="trigger">Two</el-button><el-menu-item>Second</el-menu-item></el-menu>
                </div>
            `);
            wrappers.push(wrapper);
            await rendered();
            const [one, two] = wrapper.querySelectorAll('el-menu');

            one.open = true;
            await rendered();
            two.open = true;
            await rendered();

            expect([one.open, two.open]).toEqual([false, true]);
            expect(triggerOf(one).getAttribute('aria-expanded')).toBe('false');
        });
    });

    describe('accessibility', () => {
        it('passes axe while it is closed', async () => {
            const el = await menu();
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe while it is open, with groups, a link, an icon and an entry that is disabled', async () => {
            const el = await menu(`
                <el-menu-item id="edit">${icon}Edit</el-menu-item>
                <el-menu-item id="docs" href="#docs">Documentation</el-menu-item>
                <el-menu-item id="move" disabled="true">Move</el-menu-item>
                <el-divider></el-divider>
                <el-menu-group label="Danger">
                    <el-menu-item id="delete" variant="danger">Delete</el-menu-item>
                </el-menu-group>
            `);
            await openWith(el);

            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });

        it('passes axe with a button that shows an icon alone', async () => {
            const el = await menu(three, {
                trigger: `<el-button slot="trigger" circle="true" aria-label="Actions"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" /></svg></el-button>`,
            });
            await openWith(el);

            expect(await accessibleName(panelOf(el))).toBe('Actions');
            const results = await axe.run(el.parentElement);
            expect(results.violations).toEqual([]);
        });
    });

    it('tells of a menu that has opened once it is shown', async () => {
        const el = await menu();
        const shown = oneEvent(el, 'menu-show');

        el.open = true;
        await shown;

        expect(isShown(el)).toBe(true);
    });
});
