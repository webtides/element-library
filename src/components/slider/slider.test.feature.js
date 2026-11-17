import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
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

    it('names its arrows when their slots are empty', async () => {
        const el = await sliderFixture();
        const [previous, next] = el.shadowRoot.querySelectorAll('[part~="arrow"]');

        expect(await accessibleName(previous)).toBe('Previous item');
        expect(await accessibleName(next)).toBe('Next item');
        // The names are for screen readers only.
        expect(sizeOf(previous.querySelector('.visually-hidden'))).toEqual({ width: 1, height: 1 });
        const results = await axe.run(el, { runOnly: ['button-name'] });
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('leaves the name of an arrow to what is in its slot', async () => {
        const wrapper = await fixture(`
            <div style="width: 320px">
                <el-slider>
                    <div class="item">1</div>
                    <div class="item">2</div>
                    <span slot="arrow-left">Zurück</span>
                    <span slot="arrow-right">Weiter</span>
                </el-slider>
            </div>
        `);
        await nextFrame();
        const [previous, next] = wrapper.querySelector('el-slider').shadowRoot.querySelectorAll('[part~="arrow"]');

        expect(await accessibleName(previous)).toBe('Zurück');
        expect(await accessibleName(next)).toBe('Weiter');
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

        const touchFixture = async () => {
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
            return wrapper.querySelector('el-slider');
        };

        it('makes the arrows at least --el-touch-target in both directions', async () => {
            const el = await touchFixture();
            const arrows = el.shadowRoot.querySelectorAll('[part~="arrow"]');
            expect(arrows.length).toBe(2);
            for (const arrow of arrows) {
                const { width, height } = sizeOf(arrow);
                expect(Math.min(width, height), arrow.getAttribute('part')).toBeGreaterThanOrEqual(44);
            }
        });

        it('gives every dot a hit area of --el-touch-target that no other dot covers', async () => {
            const el = await touchFixture();
            const dots = [...el.shadowRoot.querySelectorAll('[part~="dot"]')];
            expect(dots.length).toBe(3);

            for (const dot of dots) {
                // The dot itself keeps its size.
                expect(sizeOf(dot)).toEqual({ width: 10, height: 10 });

                dot.scrollIntoView({ block: 'center' });
                const { left, top, width, height } = dot.getBoundingClientRect();
                const center = { x: left + width / 2, y: top + height / 2 };
                // 21 px from the center in every direction is still this dot: 2 × 21 < 44.
                for (const [dx, dy] of [
                    [-21, 0],
                    [21, 0],
                    [0, -21],
                    [0, 21],
                ]) {
                    expect(el.shadowRoot.elementFromPoint(center.x + dx, center.y + dy)).toBe(dot);
                }
            }
        });

        it('goes to the item of a dot that is tapped beside it', async () => {
            const el = await touchFixture();
            const last = [...el.shadowRoot.querySelectorAll('[part~="dot"]')].at(-1);
            last.scrollIntoView({ block: 'center' });
            const { left, top, width, height } = last.getBoundingClientRect();

            el.shadowRoot.elementFromPoint(left + width / 2 + 18, top + height / 2 - 18).click();
            await nextFrame();

            expect(el.selectedIndex).toBe(2);
        });
    });
});
