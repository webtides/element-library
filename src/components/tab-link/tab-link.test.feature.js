import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './tab-link.js';
define();

describe('Feature | TabLink', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-link></el-tab-link>`);
        await nextFrame();
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
