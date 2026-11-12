import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { aTimeout, fixture, nextFrame, oneEvent, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './tab-link.js';
define();

describe('Feature | TabLink', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-link></el-tab-link>`);
        await nextFrame();
    });

    it('is a tab', async () => {
        const el = await fixture(`<el-tab-link for="a">a</el-tab-link>`);

        expect(el.getAttribute('role')).toBe('tab');
    });

    it('keeps a role the page gave it', async () => {
        const el = await fixture(`<el-tab-link for="a" role="button">a</el-tab-link>`);

        expect(el.getAttribute('role')).toBe('button');
    });

    it('dispatches tab-select on a click, on Enter and on Space', async () => {
        const el = await fixture(`<el-tab-link for="a">a</el-tab-link>`);

        for (const act of [
            () => el.click(),
            () => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })),
            () => el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })),
        ]) {
            const selected = oneEvent(el, 'tab-select');
            act();
            expect((await selected).detail).toEqual({ selected: 'a' });
        }
    });

    it('dispatches nothing while disabled', async () => {
        const el = await fixture(`<el-tab-link for="a" disabled>a</el-tab-link>`);
        let events = 0;
        el.addEventListener('tab-select', () => events++);

        el.click();
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

        expect(events).toBe(0);
    });

    it('exposes a disabled link as disabled', async () => {
        const el = await fixture(`<el-tab-link for="a" disabled>a</el-tab-link>`);

        expect(el.getAttribute('aria-disabled')).toBe('true');
    });

    // The attribute is set after the start here. One that was there at the start cannot be taken
    // away again: element-js writes a removed attribute back empty.
    it('follows a disabled attribute that is set and removed later', async () => {
        const el = await fixture(`<el-tab-link for="a">a</el-tab-link>`);

        el.setAttribute('disabled', '');
        await aTimeout(20);
        expect(el.getAttribute('aria-disabled')).toBe('true');

        el.removeAttribute('disabled');
        await aTimeout(20);
        expect(el.hasAttribute('disabled')).toBe(false);
        expect(el.hasAttribute('aria-disabled')).toBe(false);
    });

    it('is active while it is selected', async () => {
        const el = await fixture(`<el-tab-link for="a">a</el-tab-link>`);
        expect(el.matches(':state(active)')).toBe(false);

        el.setAttribute('aria-selected', 'true');
        expect(el.matches(':state(active)')).toBe(true);

        el.setAttribute('aria-selected', 'false');
        expect(el.matches(':state(active)')).toBe(false);
    });

    it('does not mark a link that is not disabled', async () => {
        const el = await fixture(`<el-tab-link for="a">a</el-tab-link>`);

        expect(el.hasAttribute('aria-disabled')).toBe(false);
    });

    it('has no detectable a11y violations while disabled', async () => {
        const wrapper = await fixture(`
            <div role="tablist" style="background: #fff; color: #111827">
                <el-tab-link for="a" disabled>Disabled</el-tab-link>
            </div>
        `);
        const results = await axe.run(wrapper);

        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(
            `<div style="--el-touch-target: 44px"><el-tab-link for="a">a</el-tab-link></div>`,
        );
        expect(sizeOf(wrapper.querySelector('el-tab-link')).height).toBeLessThan(44);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('is at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-tab-link for="a">a</el-tab-link></div>`,
            );
            const { width, height } = sizeOf(wrapper.querySelector('el-tab-link'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });
    });
});
