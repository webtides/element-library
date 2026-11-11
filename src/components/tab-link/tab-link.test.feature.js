import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './tab-link.js';
define();

describe('Feature | TabLink', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-link></el-tab-link>`);
        await nextFrame();
    });

    it('exposes a disabled link as disabled', async () => {
        const el = await fixture(`<el-tab-link for="a" disabled>a</el-tab-link>`);
        expect(el.getAttribute('aria-disabled')).toBe('true');

        el.removeAttribute('disabled');
        expect(el.hasAttribute('aria-disabled')).toBe(false);

        el.setAttribute('disabled', '');
        expect(el.getAttribute('aria-disabled')).toBe('true');
    });

    it('does not mark a link that is not disabled', async () => {
        const el = await fixture(`<el-tab-link for="a">a</el-tab-link>`);

        expect(el.hasAttribute('aria-disabled')).toBe(false);
    });

    it('has no detectable a11y violations while disabled', async () => {
        const wrapper = await fixture(`
            <div style="background: #fff; color: #111827">
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
