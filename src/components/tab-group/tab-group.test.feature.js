import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './tab-group.js';
import { define as defineTabLink } from '../tab-link/tab-link.js';
import { define as defineTabPanel } from '../tab-panel/tab-panel.js';
defineTabLink();
defineTabPanel();
define();

// Four tabs, the third disabled, the second selected. The links are in an element of their own.
const tabsFixture = async (attrs = 'selected="b"', list = '<div>') => {
    const el = await fixture(`
        <el-tab-group ${attrs}>
            ${list}
                <el-tab-link for="a">A</el-tab-link>
                <el-tab-link for="b">B</el-tab-link>
                <el-tab-link for="c" disabled>C</el-tab-link>
                <el-tab-link for="d">D</el-tab-link>
            </${list.match(/\w+/)[0]}>
            <el-tab-panel name="a">Panel A</el-tab-panel>
            <el-tab-panel name="b">Panel B</el-tab-panel>
            <el-tab-panel name="c">Panel C</el-tab-panel>
            <el-tab-panel name="d">Panel D</el-tab-panel>
        </el-tab-group>
    `);
    await nextFrame();
    return el;
};

const link = (el, name) => el.querySelector(`el-tab-link[for="${name}"]`);
const panel = (el, name) => el.querySelector(`el-tab-panel[name="${name}"]`);
const selected = (el) =>
    [...el.querySelectorAll('el-tab-link[aria-selected="true"]')].map((l) => l.getAttribute('for'));
const tabStops = (el) => [...el.querySelectorAll('el-tab-link[tabindex="0"]')].map((l) => l.getAttribute('for'));

/** Presses a key on the focused link and returns the event. */
const press = (key) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    document.activeElement.dispatchEvent(event);
    return event;
};

describe('Feature | TabGroup', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-group></el-tab-group>`);
        await nextFrame();
    });

    it('marks the selected link and keeps it alone in the tab order', async () => {
        const el = await tabsFixture();

        expect(selected(el)).toEqual(['b']);
        expect(tabStops(el)).toEqual(['b']);
        expect(link(el, 'a').getAttribute('aria-selected')).toBe('false');
        expect(link(el, 'a').getAttribute('tabindex')).toBe('-1');
    });

    it('moves the mark and the tab stop with the selection', async () => {
        const el = await tabsFixture();

        link(el, 'd').click();
        await nextFrame();

        expect(el.selected).toBe('d');
        expect(selected(el)).toEqual(['d']);
        expect(tabStops(el)).toEqual(['d']);
        expect(panel(el, 'd').style.display).toBe('block');
        expect(panel(el, 'b').style.display).toBe('none');
    });

    it('labels every panel by its link', async () => {
        const el = await tabsFixture();

        for (const name of ['a', 'b', 'c', 'd']) {
            expect(link(el, name).id, name).not.toBe('');
            expect(panel(el, name).getAttribute('aria-labelledby'), name).toBe(link(el, name).id);
        }
    });

    it('keeps the id a link already has', async () => {
        const el = await fixture(`
            <el-tab-group>
                <div><el-tab-link for="a" id="my-tab">A</el-tab-link></div>
                <el-tab-panel name="a">Panel A</el-tab-panel>
            </el-tab-group>
        `);
        await nextFrame();

        expect(panel(el, 'a').getAttribute('aria-labelledby')).toBe('my-tab');
    });

    it('makes the element around the links the tablist', async () => {
        const el = await tabsFixture();
        const list = link(el, 'a').parentElement;

        expect(list.getAttribute('role')).toBe('tablist');
        expect(list.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('leaves another role of that element alone', async () => {
        const el = await tabsFixture('selected="b"', '<nav role="navigation">');
        const list = link(el, 'a').parentElement;

        expect(list.getAttribute('role')).toBe('navigation');
        expect(list.hasAttribute('aria-orientation')).toBe(false);
    });

    it('has no tablist when the links are direct children of the group', async () => {
        const el = await fixture(`
            <el-tab-group selected="a">
                <el-tab-link for="a">A</el-tab-link>
                <el-tab-link for="b">B</el-tab-link>
                <el-tab-panel name="a">Panel A</el-tab-panel>
                <el-tab-panel name="b">Panel B</el-tab-panel>
            </el-tab-group>
        `);
        await nextFrame();

        expect(el.hasAttribute('role')).toBe(false);
        expect(el.querySelector('[role="tablist"]')).toBeNull();
        // Selection and keys work all the same.
        link(el, 'a').focus();
        press('ArrowRight');
        await nextFrame();
        expect(selected(el)).toEqual(['b']);
    });

    it('moves to the next and the previous link with the arrow keys, skips a disabled link and wraps around', async () => {
        const el = await tabsFixture();
        link(el, 'b').focus();

        // C is disabled.
        expect(press('ArrowRight').defaultPrevented).toBe(true);
        await nextFrame();
        expect(document.activeElement).toBe(link(el, 'd'));
        expect(selected(el)).toEqual(['d']);

        press('ArrowRight');
        await nextFrame();
        expect(document.activeElement).toBe(link(el, 'a'));
        expect(selected(el)).toEqual(['a']);

        press('ArrowLeft');
        await nextFrame();
        expect(document.activeElement).toBe(link(el, 'd'));

        press('ArrowLeft');
        await nextFrame();
        expect(document.activeElement).toBe(link(el, 'b'));
        expect(selected(el)).toEqual(['b']);
    });

    it('moves to the first and the last link with Home and End', async () => {
        const el = await tabsFixture();
        link(el, 'b').focus();

        press('End');
        await nextFrame();
        expect(document.activeElement).toBe(link(el, 'd'));
        expect(selected(el)).toEqual(['d']);

        press('Home');
        await nextFrame();
        expect(document.activeElement).toBe(link(el, 'a'));
        expect(selected(el)).toEqual(['a']);
    });

    it('follows the up and down keys when vertical', async () => {
        const el = await tabsFixture('selected="b" orientation="vertical"');
        expect(link(el, 'a').parentElement.getAttribute('aria-orientation')).toBe('vertical');
        link(el, 'b').focus();

        // The keys of the other direction are left to the page.
        expect(press('ArrowRight').defaultPrevented).toBe(false);
        await nextFrame();
        expect(selected(el)).toEqual(['b']);

        press('ArrowDown');
        await nextFrame();
        expect(document.activeElement).toBe(link(el, 'd'));
        expect(selected(el)).toEqual(['d']);

        press('ArrowUp');
        await nextFrame();
        expect(selected(el)).toEqual(['b']);
    });

    it('selects the focused link with Enter and with Space', async () => {
        const el = await tabsFixture();

        link(el, 'a').focus();
        press('Enter');
        await nextFrame();
        expect(selected(el)).toEqual(['a']);

        link(el, 'd').focus();
        // Space must not scroll the page.
        expect(press(' ').defaultPrevented).toBe(true);
        await nextFrame();
        expect(selected(el)).toEqual(['d']);
    });

    it('has no detectable a11y violations', async () => {
        const el = await tabsFixture();
        const results = await axe.run(el);

        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
});
