import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './checkbox-field.js';
define();

describe('Feature | CheckboxField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-checkbox-field></el-checkbox-field>`);
        await nextFrame();
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(
            `<div style="--el-touch-target: 44px"><el-checkbox-field name="a" label="a"></el-checkbox-field></div>`,
        );
        expect(sizeOf(wrapper.querySelector('.field > label')).height).toBeLessThan(44);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the label, which is the hit area, at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-checkbox-field name="a" label="a"></el-checkbox-field></div>`,
            );
            for (const label of wrapper.querySelectorAll('.field > label')) {
                const { width, height } = sizeOf(label);
                expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
            }
        });

        it('keeps the size of the label without --el-touch-target', async () => {
            const el = await fixture(`<el-checkbox-field name="a" label="a"></el-checkbox-field>`);
            expect(sizeOf(el.querySelector('.field > label')).height).toBeLessThan(44);
        });
    });
});
