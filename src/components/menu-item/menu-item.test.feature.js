import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleRole, fixture, nextFrame, useForcedColors } from '../../test-helpers.js';
import { define } from './menu-item.js';
define();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};

// What an entry does in a menu is in the tests of the menu. Here: the entry alone.
describe('Feature | MenuItem', () => {
    it('is a button with the role of a menu item, out of the order of the Tab key', async () => {
        const el = await fixture(`<el-menu-item value="edit">Edit</el-menu-item>`);
        await rendered();
        const base = part(el, 'base');

        expect(base.localName).toBe('button');
        expect(base.getAttribute('type')).toBe('button');
        expect(base.getAttribute('role')).toBe('menuitem');
        expect(base.getAttribute('tabindex')).toBe('-1');
        expect(el.value).toBe('edit');
        el.remove();
    });

    it('is a link with an address, and a button again without one', async () => {
        const el = await fixture(`<el-menu-item href="/docs">Documentation</el-menu-item>`);
        await rendered();
        expect(part(el, 'base').localName).toBe('a');
        expect(part(el, 'base').getAttribute('href')).toBe('/docs');
        expect(part(el, 'base').hasAttribute('target')).toBe(false);
        expect(part(el, 'base').hasAttribute('rel')).toBe(false);

        el.href = '';
        await rendered();
        expect(part(el, 'base').localName).toBe('button');
        el.remove();
    });

    it('takes the focus on the control inside of it', async () => {
        const el = await fixture(`<el-menu-item>Edit</el-menu-item>`);
        await rendered();

        el.focus();

        expect(el.shadowRoot.activeElement).toBe(part(el, 'base'));
        el.remove();
    });

    it('has room for an icon once there is one, and none after it has gone', async () => {
        const el = await fixture(`<el-menu-item>Edit</el-menu-item>`);
        await rendered();
        expect(part(el, 'icon').hidden).toBe(true);

        el.insertAdjacentHTML('afterbegin', '<svg slot="icon" width="16" height="16" aria-hidden="true"></svg>');
        await rendered();
        expect(part(el, 'icon').hidden).toBe(false);

        el.querySelector('svg').remove();
        await rendered();
        expect(part(el, 'icon').hidden).toBe(true);
        el.remove();
    });

    it('takes a disabled attribute that is there, set to true or empty, for disabled', async () => {
        for (const [attribute, expected] of [
            ['disabled="true"', 'true'],
            ['disabled', 'true'],
            ['disabled="false"', null],
            ['', null],
        ]) {
            const el = await fixture(`<el-menu-item ${attribute}>Move</el-menu-item>`);
            await rendered();
            expect(part(el, 'base').getAttribute('aria-disabled'), attribute).toBe(expected);
            el.remove();
        }
    });

    describe('an entry that is checked', () => {
        const mark = (el) => getComputedStyle(part(el, 'mark'), '::before');

        it('is on or off with the type checkbox, and says which', async () => {
            const el = await fixture(`<el-menu-item type="checkbox" checked="true">Show archived</el-menu-item>`);
            await rendered();
            const base = part(el, 'base');

            expect(base.getAttribute('role')).toBe('menuitemcheckbox');
            expect(await accessibleRole(base)).toBe('menuitemcheckbox');
            expect(base.getAttribute('aria-checked')).toBe('true');

            el.checked = false;
            await rendered();
            expect(part(el, 'base').getAttribute('aria-checked')).toBe('false');
            el.remove();
        });

        it('is one of several with the type radio, and says whether it is the chosen one', async () => {
            const wrapper = await fixture(`
                <div role="menu" aria-label="View">
                    <el-menu-item id="list" type="radio" checked="true">List</el-menu-item>
                    <el-menu-item id="grid" type="radio">Grid</el-menu-item>
                </div>
            `);
            await rendered();
            const base = (id) => part(wrapper.querySelector(id), 'base');

            expect(await accessibleRole(base('#list'))).toBe('menuitemradio');
            expect(base('#list').getAttribute('aria-checked')).toBe('true');
            expect(base('#grid').getAttribute('aria-checked')).toBe('false');
            wrapper.remove();
        });

        it('takes a checked attribute that is there, set to true or empty, for checked', async () => {
            for (const [attribute, expected] of [
                ['checked="true"', 'true'],
                ['checked', 'true'],
                ['checked="false"', 'false'],
                ['', 'false'],
            ]) {
                const el = await fixture(`<el-menu-item type="radio" ${attribute}>List</el-menu-item>`);
                await rendered();
                expect(part(el, 'base').getAttribute('aria-checked'), attribute).toBe(expected);
                el.remove();
            }
        });

        it('says nothing of a state without a type, and has no place for a mark', async () => {
            const el = await fixture(`<el-menu-item checked="true">Edit</el-menu-item>`);
            await rendered();

            expect(part(el, 'base').getAttribute('role')).toBe('menuitem');
            expect(part(el, 'base').hasAttribute('aria-checked')).toBe(false);
            expect(part(el, 'mark').getBoundingClientRect().width).toBe(0);
            el.remove();
        });

        it('shows a check while it is on, a dot while it is the chosen one, and nothing while it is neither', async () => {
            const wrapper = await fixture(`
                <div style="font: 16px/24px sans-serif">
                    <el-menu-item id="on" type="checkbox" checked="true">On</el-menu-item>
                    <el-menu-item id="off" type="checkbox">Off</el-menu-item>
                    <el-menu-item id="chosen" type="radio" checked="true">Chosen</el-menu-item>
                    <el-menu-item id="other" type="radio">Other</el-menu-item>
                </div>
            `);
            await rendered();
            const of = (id) => mark(wrapper.querySelector(id));

            // The check is the sign of a checkbox field, as text.
            expect(of('#on').content).toBe('"✓"');
            expect(of('#off').content).toBe('none');
            // The dot is a border around nothing.
            expect(of('#chosen').content).toBe('""');
            expect(of('#chosen').borderTopWidth).toBe('3px');
            expect(of('#chosen').borderTopLeftRadius).toBe('50%');
            expect(of('#other').content).toBe('none');
            // The mark is not read: the control says the state.
            for (const el of wrapper.querySelectorAll('el-menu-item')) {
                expect(part(el, 'mark').getAttribute('aria-hidden')).toBe('true');
            }
            wrapper.remove();
        });

        it('keeps its text where it is when it is checked, and in line with the entries beside it', async () => {
            const wrapper = await fixture(`
                <div style="font: 16px/24px sans-serif; width: 240px">
                    <el-menu-item id="list" type="radio" checked="true">List</el-menu-item>
                    <el-menu-item id="grid" type="radio">Grid</el-menu-item>
                    <el-menu-item id="archived" type="checkbox">Show archived</el-menu-item>
                </div>
            `);
            await rendered();
            const item = (id) => wrapper.querySelector(id);
            const textOf = (id) => part(item(id), 'label').getBoundingClientRect().left;
            const heightOf = (id) => item(id).getBoundingClientRect().height;
            const before = { list: textOf('#list'), grid: textOf('#grid'), height: heightOf('#grid') };

            expect(before.grid).toBe(before.list);
            expect(textOf('#archived')).toBe(before.list);
            // The mark has a place of its own in front of the text.
            expect(part(item('#grid'), 'mark').getBoundingClientRect().width).toBe(16);

            item('#list').checked = false;
            item('#grid').checked = true;
            item('#archived').checked = true;
            await rendered();

            expect(textOf('#list')).toBe(before.list);
            expect(textOf('#grid')).toBe(before.grid);
            expect(textOf('#archived')).toBe(before.list);
            expect(heightOf('#grid')).toBe(before.height);
            wrapper.remove();
        });

        it('has the mark in front of its icon', async () => {
            const el = await fixture(`
                <el-menu-item type="checkbox" checked="true">
                    <svg slot="icon" width="16" height="16" aria-hidden="true"></svg>Pinned
                </el-menu-item>
            `);
            await rendered();
            const left = (name) => part(el, name).getBoundingClientRect().left;

            expect(left('mark')).toBeLessThan(left('icon'));
            expect(left('icon')).toBeLessThan(left('label'));
            el.remove();
        });

        it('does not change its state when it is chosen: the page sets it', async () => {
            const el = await fixture(`<el-menu-item type="checkbox">Show archived</el-menu-item>`);
            await rendered();
            let clicks = 0;
            el.addEventListener('click', () => clicks++);

            part(el, 'base').click();
            await rendered();

            expect(clicks).toBe(1);
            expect(el.checked).toBe(false);
            expect(part(el, 'base').getAttribute('aria-checked')).toBe('false');
            el.remove();
        });

        it('says its state while it is disabled as well', async () => {
            const el = await fixture(`<el-menu-item type="radio" checked="true" disabled="true">List</el-menu-item>`);
            await rendered();
            const base = part(el, 'base');

            expect(base.getAttribute('role')).toBe('menuitemradio');
            expect(base.getAttribute('aria-checked')).toBe('true');
            expect(base.getAttribute('aria-disabled')).toBe('true');
            expect(mark(el).content).toBe('""');
            el.remove();
        });

        it('is a link that says its state, with an address', async () => {
            const el = await fixture(`<el-menu-item type="radio" checked="true" href="?view=list">List</el-menu-item>`);
            await rendered();
            const base = part(el, 'base');

            expect(base.localName).toBe('a');
            expect(await accessibleRole(base)).toBe('menuitemradio');
            expect(base.getAttribute('aria-checked')).toBe('true');
            el.remove();
        });

        it('passes axe with entries that are checked, and with one that is disabled', async () => {
            const wrapper = await fixture(`
                <div role="menu" aria-label="View">
                    <div role="group" aria-label="Layout">
                        <el-menu-item type="radio" checked="true">List</el-menu-item>
                        <el-menu-item type="radio">Grid</el-menu-item>
                        <el-menu-item type="radio" disabled="true">Board</el-menu-item>
                    </div>
                    <el-menu-item type="checkbox" checked="true">Show archived</el-menu-item>
                    <el-menu-item type="checkbox">Show drafts</el-menu-item>
                </div>
            `);
            await rendered();

            const results = await axe.run(wrapper);
            expect(results.violations).toEqual([]);
            wrapper.remove();
        });

        describe('where the user forces colours', () => {
            useForcedColors();

            it('shows the check and the dot in the colour of the text', async () => {
                const wrapper = await fixture(`
                    <div style="font: 16px/24px sans-serif">
                        <el-menu-item id="forced-on" type="checkbox" checked="true">On</el-menu-item>
                        <el-menu-item id="forced-chosen" type="radio" checked="true">Chosen</el-menu-item>
                    </div>
                `);
                await rendered();
                const text = (id) => getComputedStyle(part(wrapper.querySelector(id), 'base')).color;
                const of = (id) => mark(wrapper.querySelector(id));

                expect(matchMedia('(forced-colors: active)').matches).toBe(true);
                expect(of('#forced-on').content).toBe('"✓"');
                expect(of('#forced-on').color).toBe(text('#forced-on'));
                // A border stays where a background is taken away.
                expect(of('#forced-chosen').borderTopWidth).toBe('3px');
                expect(of('#forced-chosen').borderTopColor).toBe(text('#forced-chosen'));
                expect(of('#forced-chosen').borderTopStyle).toBe('solid');
                wrapper.remove();
            });
        });
    });

    it('passes axe in a menu of the page', async () => {
        const wrapper = await fixture(`
            <div role="menu" aria-label="Actions">
                <el-menu-item>Edit</el-menu-item>
                <el-menu-item href="#docs">Documentation</el-menu-item>
                <el-menu-item disabled="true">Move</el-menu-item>
            </div>
        `);
        await rendered();

        const results = await axe.run(wrapper);
        expect(results.violations).toEqual([]);
        wrapper.remove();
    });
});
