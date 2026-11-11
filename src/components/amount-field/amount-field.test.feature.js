import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './amount-field.js';
define();

describe('Feature | AmountField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-amount-field></el-amount-field>`);
        await nextFrame();
    });

    it('keeps the width of its buttons on a fine pointer', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px"><el-amount-field name="quantity"></el-amount-field></div>
        `);
        const plus = wrapper.querySelector('el-amount-field').shadowRoot.querySelector('[part~="plus"]');
        expect(sizeOf(plus).width).toBeLessThan(44);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the buttons and the input at least --el-touch-target', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-amount-field name="quantity"></el-amount-field></div>
            `);
            const root = wrapper.querySelector('el-amount-field').shadowRoot;
            for (const button of root.querySelectorAll('[part~="button"]')) {
                const { width, height } = sizeOf(button);
                expect(Math.min(width, height), button.getAttribute('part')).toBeGreaterThanOrEqual(44);
            }
            expect(sizeOf(root.querySelector('[part="input"]')).height).toBeGreaterThanOrEqual(44);
        });
    });
});
