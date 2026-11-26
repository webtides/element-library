import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
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
import { define } from './tree.js';
import { define as defineItem } from '../tree-item/tree-item.js';
define();
defineItem();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const tokens = `
    --el-space-1: 4px; --el-space-2: 8px; --el-space-4: 16px;
    --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(100, 100, 100);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(0, 0, 200); --el-focus-ring-width: 2px;
    --el-radius-md: 6px; --el-font-size-sm: 14px;
`;
// A place with text of 16px on lines of 24px, on white, 300px wide.
const place = `font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255); width: 300px;`;
const placed = async (markup, style = tokens) => {
    const wrapper = await fixture(`
        <div style="${place} ${style}">
            <button class="before" type="button">Before</button>
            ${markup}
            <button class="after" type="button">After</button>
        </div>
    `);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-tree');
};
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};

// Inbox (open): Work (open): Invoices (current), Travel; Private (closed): Family. Drafts. Archive (closed): 2025.
const folders = `
    <el-tree label="Folders">
        <el-tree-item id="inbox" label="Inbox" href="#inbox" open="true">
            <span slot="start" class="icon" style="display:block;width:16px;height:16px"></span>
            <span slot="end">12</span>
            <el-tree-item id="work" label="Work" href="#work" open="true">
                <el-tree-item id="invoices" label="Invoices" href="#invoices" current="true"></el-tree-item>
                <el-tree-item id="travel" label="Travel" href="#travel"></el-tree-item>
            </el-tree-item>
            <el-tree-item id="private" label="Private" href="#private">
                <el-tree-item id="family" label="Family" href="#family"></el-tree-item>
            </el-tree-item>
        </el-tree-item>
        <el-tree-item id="drafts" label="Drafts" href="#drafts"></el-tree-item>
        <el-tree-item id="archive" label="Archive" href="#archive">
            <el-tree-item id="y2025" label="2025" href="#2025"></el-tree-item>
        </el-tree-item>
    </el-tree>
`;
const item = (el, id) => el.querySelector(`#${id}`);
const row = (el, id) => part(item(el, id), 'row');
const label = (el, id) => part(item(el, id), 'label');
const toggle = (el, id) => part(item(el, id), 'toggle');
const isShown = (el, id) => item(el, id).getBoundingClientRect().height > 0;
const shown = (el) =>
    [...el.querySelectorAll('el-tree-item')].filter((entry) => isShown(el, entry.id)).map((entry) => entry.id);
/** The entry the focus is in, and whether it is on the button of the entry. */
const focused = () => {
    const host = document.activeElement;
    const inner = host?.shadowRoot?.activeElement;
    if (!inner) return host?.className || host?.id;
    return inner.matches('[part~="toggle"]') ? `${host.id}:toggle` : host.id;
};

describe('Feature | Tree', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tree></el-tree>`);
        await nextFrame();
    });

    describe('nesting', () => {
        it('shows the entries of open branches, to any depth, and hides the ones of closed branches', async () => {
            const el = await placed(folders);

            expect(shown(el)).toEqual(['inbox', 'work', 'invoices', 'travel', 'private', 'drafts', 'archive']);
            expect(getComputedStyle(part(item(el, 'private'), 'children')).display).toBe('none');
            expect(getComputedStyle(part(item(el, 'work'), 'children')).display).toBe('block');
        });

        // Where a row begins: the place of the button of a branch, which every row has.
        const start = (el, id) => row(el, id).firstElementChild.getBoundingClientRect().left;

        it('moves the entries of every level in by --el-tree-indent, --el-space-4 unset', async () => {
            const el = await placed(folders);

            expect(start(el, 'inbox') - el.getBoundingClientRect().left).toBe(8);
            expect(start(el, 'work') - start(el, 'inbox')).toBe(16);
            expect(start(el, 'invoices') - start(el, 'work')).toBe(16);
            // The names of a level begin on one line, with a button in front of them or without.
            expect(label(el, 'drafts').getBoundingClientRect().left).toBe(
                label(el, 'archive').getBoundingClientRect().left,
            );
            expect(
                label(el, 'invoices').getBoundingClientRect().left - label(el, 'work').getBoundingClientRect().left,
            ).toBe(16);

            el.style.setProperty('--el-tree-indent', '30px');
            expect(start(el, 'invoices') - start(el, 'work')).toBe(30);
            expect(start(el, 'work') - start(el, 'inbox')).toBe(30);
        });

        it('keeps its indent without a theme', async () => {
            const el = await placed(folders, '');

            expect(start(el, 'work') - start(el, 'inbox')).toBe(16);
            expect(start(el, 'invoices') - start(el, 'inbox')).toBe(32);
        });

        it('has rows as wide as the tree on every level', async () => {
            const el = await placed(folders);

            for (const id of ['inbox', 'work', 'invoices']) expect(sizeOf(row(el, id)).width, id).toBe(300);
        });
    });

    describe('opening and closing', () => {
        it('opens and closes a branch with its button, and writes the state to the attribute', async () => {
            const el = await placed(folders);

            await userEvent.click(toggle(el, 'private'));
            await rendered();
            expect(item(el, 'private').open).toBe(true);
            expect(item(el, 'private').getAttribute('open')).toBe('true');
            expect(isShown(el, 'family')).toBe(true);
            expect(toggle(el, 'private').getAttribute('aria-expanded')).toBe('true');

            await userEvent.click(toggle(el, 'private'));
            await rendered();
            expect(item(el, 'private').getAttribute('open')).toBe('false');
            expect(isShown(el, 'family')).toBe(false);
            expect(toggle(el, 'private').getAttribute('aria-expanded')).toBe('false');
        });

        it('does not follow the link of the entry with a click on its button', async () => {
            const el = await placed(folders);
            history.replaceState(null, '', location.pathname + location.search);

            await userEvent.click(toggle(el, 'archive'));
            expect(location.hash).toBe('');
            expect(item(el, 'archive').open).toBe(true);
        });

        it('takes the state from the attribute and from the property', async () => {
            const el = await placed(folders);

            item(el, 'archive').setAttribute('open', 'true');
            await rendered();
            expect(isShown(el, 'y2025')).toBe(true);

            item(el, 'inbox').open = false;
            await rendered();
            expect(shown(el)).toEqual(['inbox', 'drafts', 'archive', 'y2025']);
            // The branches inside keep their own state.
            expect(item(el, 'work').open).toBe(true);
        });

        it('tells the page with tree-item-toggle, and not when the state is set from a script', async () => {
            const el = await placed(folders);
            const seen = [];
            el.addEventListener('tree-item-toggle', (event) => seen.push([event.target.id, event.detail.open]));

            item(el, 'archive').open = true;
            await rendered();
            expect(seen).toEqual([]);

            await userEvent.click(toggle(el, 'private'));
            await userEvent.click(toggle(el, 'archive'));
            expect(seen).toEqual([
                ['private', true],
                ['archive', false],
            ]);
        });

        it('has no button on an entry without entries below it, and gets one when they come', async () => {
            const el = await placed(folders);
            expect(toggle(el, 'drafts')).toBeNull();
            expect(item(el, 'drafts').hasItems).toBe(false);

            item(el, 'drafts').insertAdjacentHTML(
                'beforeend',
                `<el-tree-item id="late" label="Late" href="#late"></el-tree-item>`,
            );
            await rendered();
            await rendered();
            expect(toggle(el, 'drafts')).not.toBeNull();
            expect(item(el, 'drafts').hasItems).toBe(true);

            await userEvent.click(toggle(el, 'drafts'));
            await rendered();
            expect(isShown(el, 'late')).toBe(true);
        });

        it('opens and closes a branch without an address with its whole row', async () => {
            const el = await placed(`
                <el-tree label="Library">
                    <el-tree-item id="guides" label="Guides">
                        <el-tree-item id="start" label="Getting started" href="#start"></el-tree-item>
                    </el-tree-item>
                    <el-tree-item id="plain" label="A name alone"></el-tree-item>
                </el-tree>
            `);
            const guides = label(el, 'guides');

            expect(guides.tagName).toBe('BUTTON');
            expect(guides.getAttribute('aria-expanded')).toBe('false');
            expect(toggle(el, 'guides')).toBeNull();
            expect(label(el, 'plain').tagName).toBe('SPAN');

            // At the end of the row, far from the name.
            const box = row(el, 'guides').getBoundingClientRect();
            await userEvent.click(item(el, 'guides'), { position: { x: box.width - 5, y: box.height / 2 } });
            await rendered();
            expect(item(el, 'guides').open).toBe(true);
            expect(guides.getAttribute('aria-expanded')).toBe('true');
            expect(isShown(el, 'start')).toBe(true);
        });
    });

    describe('an entry that is a link', () => {
        it('has a native link as its name, with the whole row as its target', async () => {
            const el = await placed(folders);
            const inbox = item(el, 'inbox');
            inbox.scrollIntoView({ block: 'center' });
            const box = row(el, 'inbox').getBoundingClientRect();
            const centreOf = (node) => {
                const rect = node.getBoundingClientRect();
                return [rect.left + rect.width / 2, rect.top + rect.height / 2];
            };

            expect(label(el, 'inbox').tagName).toBe('A');
            expect(label(el, 'inbox').getAttribute('href')).toBe('#inbox');
            expect(await accessibleRole(label(el, 'inbox'))).toBe('link');
            expect(await accessibleName(label(el, 'inbox'))).toBe('Inbox');

            for (const [name, [x, y]] of Object.entries({
                'the icon at the start': centreOf(inbox.querySelector('[slot="start"]')),
                'the count at the end': centreOf(inbox.querySelector('[slot="end"]')),
                'the padding at the end': [box.right - 3, box.bottom - 3],
            })) {
                expect(inbox.shadowRoot.elementFromPoint(x, y), name).toBe(label(el, 'inbox'));
            }
            // The button of the branch is a target of its own.
            expect(inbox.shadowRoot.elementFromPoint(...centreOf(toggle(el, 'inbox'))).closest('button')).toBe(
                toggle(el, 'inbox'),
            );
        });

        it('leads to its address with a click on the row', async () => {
            const el = await placed(folders);
            history.replaceState(null, '', location.pathname + location.search);
            const box = row(el, 'drafts').getBoundingClientRect();

            await userEvent.click(item(el, 'drafts'), { position: { x: box.width - 5, y: box.height / 2 } });
            expect(location.hash).toBe('#drafts');
            history.replaceState(null, '', location.pathname + location.search);
        });

        it('passes target on, and writes rel with it', async () => {
            const el = await placed(`
                <el-tree><el-tree-item id="out" label="Out" href="https://example.com" target="_blank"></el-tree-item></el-tree>
            `);

            expect(label(el, 'out').getAttribute('target')).toBe('_blank');
            expect(label(el, 'out').getAttribute('rel')).toBe('noreferrer noopener');
        });

        it('takes its name from the label slot before the attribute', async () => {
            const el = await placed(`
                <el-tree>
                    <el-tree-item id="rich" label="Plain" href="#rich"><span slot="label">Rich <b>name</b></span></el-tree-item>
                </el-tree>
            `);

            expect(await accessibleName(label(el, 'rich'))).toBe('Rich name');
            // A name in the label slot is no entry below.
            expect(item(el, 'rich').hasItems).toBe(false);
            expect(toggle(el, 'rich')).toBeNull();
        });
    });

    describe('the current entry', () => {
        it('has aria-current="page" on its link', async () => {
            const el = await placed(folders);

            expect(label(el, 'invoices').getAttribute('aria-current')).toBe('page');
            expect(label(el, 'travel').hasAttribute('aria-current')).toBe(false);
        });

        it('is told apart by a bar at its start and a heavier name, not by a colour alone', async () => {
            const el = await placed(folders);
            const bar = getComputedStyle(row(el, 'invoices'), '::before');

            expect(bar.borderInlineStartWidth).toBe('3px');
            expect(bar.borderInlineStartColor).toBe('rgb(0, 0, 200)');
            expect(getComputedStyle(row(el, 'travel'), '::before').content).toBe('none');
            expect(getComputedStyle(label(el, 'invoices')).fontWeight).toBe('600');
            expect(getComputedStyle(label(el, 'travel')).fontWeight).toBe('400');
            expect(getComputedStyle(row(el, 'invoices')).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
            // The bar does not move the name.
            expect(label(el, 'invoices').getBoundingClientRect().left).toBe(
                label(el, 'travel').getBoundingClientRect().left,
            );
        });

        it('follows the property', async () => {
            const el = await placed(folders);

            item(el, 'invoices').current = false;
            item(el, 'travel').current = true;
            await rendered();
            expect(label(el, 'invoices').hasAttribute('aria-current')).toBe(false);
            expect(label(el, 'travel').getAttribute('aria-current')).toBe('page');
        });

        describe('with forced colours', () => {
            useForcedColors();

            it('keeps its bar and its weight', async () => {
                const el = await placed(folders);
                const bar = getComputedStyle(row(el, 'invoices'), '::before');

                expect(matchMedia('(forced-colors: active)').matches).toBe(true);
                expect([bar.borderInlineStartWidth, bar.borderInlineStartStyle]).toEqual(['3px', 'solid']);
                expect(getComputedStyle(label(el, 'invoices')).fontWeight).toBe('600');
            });
        });
    });

    describe('the parts of a row', () => {
        it('has an icon at the start, the name and a count at the end, in that order', async () => {
            const el = await placed(folders);
            const inbox = item(el, 'inbox');
            const box = (node) => node.getBoundingClientRect();
            const icon = box(inbox.querySelector('[slot="start"]'));
            const name = box(label(el, 'inbox'));
            const count = box(inbox.querySelector('[slot="end"]'));

            expect(box(toggle(el, 'inbox')).right).toBeLessThanOrEqual(icon.left);
            expect(icon.right).toBeLessThanOrEqual(name.left);
            expect(name.right).toBeLessThanOrEqual(count.left);
            expect(Math.round(box(row(el, 'inbox')).right - count.right)).toBe(8);
            expect(getComputedStyle(part(inbox, 'end')).color).toBe('rgb(100, 100, 100)');
            expect(getComputedStyle(part(inbox, 'end')).fontSize).toBe('14px');
        });

        it('takes no room for a start and an end that nothing is slotted into', async () => {
            const el = await placed(folders);

            expect(getComputedStyle(part(item(el, 'drafts'), 'start')).display).toBe('none');
            expect(getComputedStyle(part(item(el, 'drafts'), 'end')).display).toBe('none');
            expect(getComputedStyle(part(item(el, 'inbox'), 'start')).display).not.toBe('none');
        });

        it('breaks a long name, inside of a word where it has to, and stays as wide as its place', async () => {
            const el = await placed(`
                <el-tree>
                    <el-tree-item id="long" label="averyveryverylongnamewithoutaspacethatauserhastypedintoafieldandmore" href="#long" open="true">
                        <span slot="end">128</span>
                        <el-tree-item id="deep" label="anotherveryverylongnamewithoutanyspaceatallinit" href="#deep"></el-tree-item>
                    </el-tree-item>
                </el-tree>
            `);

            expect(sizeOf(el).width).toBe(300);
            expect(el.parentElement.scrollWidth).toBe(300);
            expect(sizeOf(label(el, 'long')).height).toBeGreaterThan(24);
            expect(row(el, 'deep').scrollWidth).toBe(300);
        });
    });

    describe('the keyboard', () => {
        const press = async (key) => {
            await userEvent.keyboard(key);
            await nextFrame();
            await nextFrame();
        };
        const focus = (el, id) => label(el, id).focus();

        it('goes up and down between the entries that are shown, and stops at the ends', async () => {
            const el = await placed(folders);
            focus(el, 'inbox');

            const seen = [];
            for (let step = 0; step < 7; step++) {
                await press('{ArrowDown}');
                seen.push(focused());
            }
            expect(seen).toEqual(['work', 'invoices', 'travel', 'private', 'drafts', 'archive', 'archive']);

            await press('{ArrowUp}');
            await press('{ArrowUp}');
            expect(focused()).toBe('private');

            focus(el, 'inbox');
            await press('{ArrowUp}');
            expect(focused()).toBe('inbox');
        });

        it('opens a closed branch with the right arrow key, and goes into an open one', async () => {
            const el = await placed(folders);
            focus(el, 'private');

            await press('{ArrowRight}');
            expect(item(el, 'private').open).toBe(true);
            expect(focused()).toBe('private');

            await press('{ArrowRight}');
            expect(focused()).toBe('family');

            // An entry without entries below it stays where it is.
            await press('{ArrowRight}');
            expect(focused()).toBe('family');
        });

        it('closes an open branch with the left arrow key, and goes to the entry above from a closed one', async () => {
            const el = await placed(folders);
            focus(el, 'invoices');

            await press('{ArrowLeft}');
            expect(focused()).toBe('work');
            expect(item(el, 'work').open).toBe(true);

            await press('{ArrowLeft}');
            expect(item(el, 'work').open).toBe(false);
            expect(focused()).toBe('work');

            await press('{ArrowLeft}');
            expect(focused()).toBe('inbox');

            // The first level has nothing above it.
            await press('{ArrowLeft}');
            await press('{ArrowLeft}');
            expect(focused()).toBe('inbox');
            expect(item(el, 'inbox').open).toBe(false);
        });

        it('goes to the first and the last entry that is shown with Home and End', async () => {
            const el = await placed(folders);
            focus(el, 'travel');

            await press('{End}');
            expect(focused()).toBe('archive');
            await press('{Home}');
            expect(focused()).toBe('inbox');
        });

        it('tells the page of a branch that a key has opened or closed', async () => {
            const el = await placed(folders);
            const seen = [];
            el.addEventListener('tree-item-toggle', (event) => seen.push([event.target.id, event.detail.open]));
            focus(el, 'private');

            await press('{ArrowRight}');
            await press('{ArrowLeft}');
            expect(seen).toEqual([
                ['private', true],
                ['private', false],
            ]);
        });

        it('keeps the keys from scrolling the page, and leaves the others alone', async () => {
            const el = await placed(folders);
            focus(el, 'inbox');
            const prevented = [];
            el.addEventListener('keydown', (event) =>
                queueMicrotask(() => prevented.push([event.key, event.defaultPrevented])),
            );

            await press('{ArrowDown}');
            await press('{Home}');
            await press('a');
            expect(prevented).toEqual([
                ['ArrowDown', true],
                ['Home', true],
                ['a', false],
            ]);
        });

        it('moves from the button of a branch as from its entry', async () => {
            const el = await placed(folders);
            toggle(el, 'work').focus();

            await press('{ArrowDown}');
            expect(focused()).toBe('invoices');
        });

        it('opens and goes in the other way round in a text that runs from right to left', async () => {
            const el = await placed(
                folders.replace('<el-tree label="Folders">', '<el-tree label="Folders" dir="rtl">'),
            );
            focus(el, 'private');

            await press('{ArrowLeft}');
            expect(item(el, 'private').open).toBe(true);
            await press('{ArrowRight}');
            expect(item(el, 'private').open).toBe(false);
        });

        it('keeps every link and every button of a branch a stop of the Tab key', async () => {
            const el = await placed(folders);
            el.parentElement.querySelector('.before').focus();

            const seen = [];
            for (let step = 0; step < 5; step++) {
                await userEvent.tab();
                seen.push(focused());
            }
            expect(seen).toEqual(['inbox:toggle', 'inbox', 'work:toggle', 'work', 'invoices']);
        });

        it('shows the focus ring around the row, inside of it', async () => {
            const el = await placed(folders);
            el.parentElement.querySelector('.before').focus();
            await userEvent.tab();
            await userEvent.tab();

            const ring = getComputedStyle(label(el, 'inbox'), '::after');
            expect([ring.outlineStyle, ring.outlineWidth, ring.outlineColor, ring.outlineOffset]).toEqual([
                'solid',
                '2px',
                'rgb(0, 0, 200)',
                '-2px',
            ]);
            expect(ring.width).toBe(`${sizeOf(row(el, 'inbox')).width}px`);
        });
    });

    describe('for assistive technology', () => {
        it('is a list of lists: every entry an item, every branch a list of its own', async () => {
            const el = await placed(folders);

            expect(await accessibleRole(part(el, 'base'))).toBe('list');
            expect(await accessibleName(part(el, 'base'))).toBe('Folders');
            expect(await accessibleRole(part(item(el, 'inbox'), 'base'))).toBe('listitem');
            expect(await accessibleRole(part(item(el, 'inbox'), 'children'))).toBe('list');
            expect(await accessibleRole(part(item(el, 'invoices'), 'base'))).toBe('listitem');
        });

        it('names the button of a branch by the name of its entry, and says whether the branch is open', async () => {
            const el = await placed(folders);

            expect(await accessibleRole(toggle(el, 'inbox'))).toBe('button');
            expect(await accessibleName(toggle(el, 'inbox'))).toBe('Inbox');
            expect(toggle(el, 'inbox').getAttribute('aria-expanded')).toBe('true');
            expect(toggle(el, 'private').getAttribute('aria-expanded')).toBe('false');
            expect(toggle(el, 'inbox').getAttribute('aria-controls')).toBe(part(item(el, 'inbox'), 'children').id);
        });

        it('has no detectable a11y violations, and the lists and their entries are seen as such', async () => {
            const el = await placed(folders);

            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            const passed = results.passes.map((pass) => pass.id);
            expect(passed).toContain('aria-required-children');
            expect(passed).toContain('aria-required-parent');
        });

        it('has no detectable a11y violations with branches that lead nowhere', async () => {
            const el = await placed(`
                <el-tree label="Library">
                    <el-tree-item label="Guides" open="true">
                        <el-tree-item label="Theming" href="#theming" current="true"></el-tree-item>
                    </el-tree-item>
                    <el-tree-item label="A name alone" current="true"></el-tree-item>
                </el-tree>
            `);

            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes every row that is a target at least --el-touch-target high, and the button of a branch in both directions', async () => {
            const el = await placed(folders, `${tokens} --el-touch-target: 44px;`);

            for (const id of ['inbox', 'work', 'invoices', 'drafts']) {
                expect(sizeOf(row(el, id)).height, id).toBeGreaterThanOrEqual(44);
            }
            const { width, height } = sizeOf(toggle(el, 'inbox'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });
    });
});
