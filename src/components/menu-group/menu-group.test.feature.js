import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, accessibleRole, fixture, nextFrame } from '../../test-helpers.js';
import { define } from './menu-group.js';
import { define as defineMenuItem } from '../menu-item/menu-item.js';
define();
defineMenuItem();

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const tokens = `--el-border-width: 1px; --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-font-size-xs: 12px;
    --el-color-border: rgb(150, 150, 150); --el-color-fg-muted: rgb(90, 90, 90); font: 16px/24px sans-serif;`;

// What a group does in a menu is in the tests of the menu. Here: the group itself.
describe('Feature | MenuGroup', () => {
    it('is a group with its heading as its name, and shows the heading', async () => {
        const wrapper = await fixture(`
            <div role="menu" aria-label="Actions" style="${tokens}">
                <el-menu-item>Edit</el-menu-item>
                <el-menu-group label="Share"><el-menu-item>Mail</el-menu-item></el-menu-group>
            </div>
        `);
        await rendered();
        const el = wrapper.querySelector('el-menu-group');
        const label = getComputedStyle(part(el, 'label'));

        expect(await accessibleRole(part(el, 'base'))).toBe('group');
        expect(await accessibleName(part(el, 'base'))).toBe('Share');
        expect(part(el, 'label').textContent.trim()).toBe('Share');
        expect([label.color, label.fontSize, label.fontWeight, label.paddingLeft]).toEqual([
            'rgb(90, 90, 90)',
            '12px',
            '600',
            '12px',
        ]);
        wrapper.remove();
    });

    it('follows a heading that changes, and has none without one', async () => {
        const el = await fixture(`<el-menu-group label="Share"></el-menu-group>`);
        await rendered();

        el.label = 'Teilen';
        await rendered();
        expect(part(el, 'label').textContent.trim()).toBe('Teilen');
        expect(part(el, 'base').getAttribute('aria-label')).toBe('Teilen');

        el.label = '';
        await rendered();
        expect(part(el, 'label').hidden).toBe(true);
        expect(part(el, 'base').hasAttribute('aria-label')).toBe(false);
        el.remove();
    });

    it('has a line over it where something is before it, and none where it is the first', async () => {
        const wrapper = await fixture(`
            <div style="${tokens}">
                <el-menu-group id="first" label="File"></el-menu-group>
                <el-menu-group id="second" label="Edit"></el-menu-group>
            </div>
        `);
        await rendered();
        const line = (id) => getComputedStyle(part(wrapper.querySelector(id), 'base'));

        expect(line('#first').borderTopWidth).toBe('0px');
        expect([line('#second').borderTopWidth, line('#second').borderTopColor, line('#second').marginTop]).toEqual([
            '1px',
            'rgb(150, 150, 150)',
            '4px',
        ]);
        wrapper.remove();
    });

    it('passes axe in a menu of the page', async () => {
        const wrapper = await fixture(`
            <div role="menu" aria-label="Actions" style="${tokens}">
                <el-menu-group label="Share">
                    <el-menu-item>Mail</el-menu-item>
                    <el-menu-item>Copy link</el-menu-item>
                </el-menu-group>
                <el-menu-group><el-menu-item>Delete</el-menu-item></el-menu-group>
            </div>
        `);
        await rendered();

        const results = await axe.run(wrapper);
        expect(results.violations).toEqual([]);
        wrapper.remove();
    });
});
