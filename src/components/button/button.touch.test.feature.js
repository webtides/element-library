import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame, sizeOf, touchAndHold, useTouchScreen } from '../../test-helpers.js';
import { define } from './button.js';
define();

// A file of its own, so that it gets a page of its own: once a page has seen a real mouse event
// (button.test.feature.js sends some), Chromium no longer sets :active for a finger on a touch
// screen, and the pressed test below would fail.
describe('Feature | Button on a touch screen', () => {
    useTouchScreen();

    it('is at least --el-touch-target in both directions, whatever its size and shape', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px">
                <el-button size="small">a</el-button>
                <el-button>a</el-button>
                <el-button size="large">a</el-button>
                <el-button size="small" circle="true">a</el-button>
                <el-button circle="true">a</el-button>
                <el-button size="large" circle="true">a</el-button>
                <el-button size="small" variant="text">a</el-button>
                <el-button size="small" href="#target">a</el-button>
            </div>
        `);
        for (const button of wrapper.querySelectorAll('el-button')) {
            const { width, height } = sizeOf(button.shadowRoot.querySelector('[part="base"]'));
            expect(Math.min(width, height), button.outerHTML).toBeGreaterThanOrEqual(44);
        }
    });

    it('keeps a circle round', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px"><el-button size="small" circle="true">a</el-button></div>
        `);
        const control = wrapper.querySelector('el-button').shadowRoot.querySelector('[part="base"]');
        expect(sizeOf(control)).toEqual({ width: 44, height: 44 });
    });

    it('keeps its size without --el-touch-target', async () => {
        const el = await fixture(`<el-button size="small">OK</el-button>`);
        expect(sizeOf(el.shadowRoot.querySelector('[part="base"]')).height).toBe(32);
    });

    it('shows a pressed style while it is touched, and no hover style after the tap', async () => {
        const el = await fixture(`<el-button variant="primary">Save</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');

        const tap = touchAndHold(control, 800);
        await expect.poll(() => getComputedStyle(control).filter).toBe('brightness(0.88)');
        await tap;
        await nextFrame();

        // The tap leaves :hover on the button. Its hover style must not come with it.
        expect(control.matches(':hover')).toBe(true);
        expect(getComputedStyle(control).filter).toBe('none');
    });
});
