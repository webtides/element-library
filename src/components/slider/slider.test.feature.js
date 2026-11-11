import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './slider.js';
define();

describe('Feature | Slider', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-slider></el-slider>`);
        await nextFrame();
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
