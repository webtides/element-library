import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './amount-field.js';
define();

describe('Feature | AmountField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-amount-field></el-amount-field>`);
        await nextFrame();
    });

    it('renders its label and names the input by it', async () => {
        const el = await fixture(`<el-amount-field name="quantity" label="Quantity"></el-amount-field>`);
        await nextFrame();
        const label = el.shadowRoot.querySelector('[part="label"]');
        const input = el.shadowRoot.querySelector('[part="input"]');

        expect(label.textContent.trim()).toBe('Quantity');
        expect(input.labels[0]).toBe(label);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('renders no label when there is none', async () => {
        const el = await fixture(`<el-amount-field name="quantity"></el-amount-field>`);
        await nextFrame();

        expect(el.shadowRoot.querySelector('label')).toBeNull();
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
