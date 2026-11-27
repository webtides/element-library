import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame } from '../../test-helpers.js';
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
