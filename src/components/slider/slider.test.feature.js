import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './slider.js';
define();

const sliderFixture = async (attrs = '') => {
    const wrapper = await fixture(`
        <div style="width: 320px">
            <el-slider ${attrs}>
                <div class="item">1</div>
                <div class="item">2</div>
                <div class="item">3</div>
            </el-slider>
        </div>
    `);
    await nextFrame();
    return wrapper.querySelector('el-slider');
};

const dotLabels = (el) =>
    [...el.shadowRoot.querySelectorAll('[part~="dot"]')].map((dot) => dot.getAttribute('aria-label'));

describe('Feature | Slider', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-slider></el-slider>`);
        await nextFrame();
    });

    it('names its dots by the number of their item', async () => {
        const el = await sliderFixture();

        expect(dotLabels(el)).toEqual(['Go to item 1', 'Go to item 2', 'Go to item 3']);
    });

    it('takes the label of its dots from dot-label', async () => {
        const el = await sliderFixture('dot-label="Gehe zu Element"');

        expect(dotLabels(el)).toEqual(['Gehe zu Element 1', 'Gehe zu Element 2', 'Gehe zu Element 3']);
    });

    it('lets the keyboard reach the scroller', async () => {
        const el = await sliderFixture();
        const results = await axe.run(el, { runOnly: ['scrollable-region-focusable'] });

        expect(results.violations).toEqual([]);
        expect(results.passes.flatMap((pass) => pass.nodes)).toHaveLength(1);
    });

    it('has no detectable a11y violations', async () => {
        const el = await sliderFixture();
        const results = await axe.run(el);

        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the dots and the arrows at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px; width: 320px">
                    <el-slider>
                        <li class="item">1</li>
                        <li class="item">2</li>
                        <li class="item">3</li>
                    </el-slider>
                </div>
            `);
            await nextFrame();
            const controls = wrapper
                .querySelector('el-slider')
                .shadowRoot.querySelectorAll('[part~="dot"], [part~="arrow"]');
            expect(controls.length).toBe(5);
            for (const control of controls) {
                const { width, height } = sizeOf(control);
                expect(Math.min(width, height), control.getAttribute('part')).toBeGreaterThanOrEqual(44);
            }
        });
    });
});
