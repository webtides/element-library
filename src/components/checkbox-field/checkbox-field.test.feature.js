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

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(
                `<form><el-checkbox-field name="${name}" label="Accept the terms" ${attributes}></el-checkbox-field></form>`,
            );

        it('submits its value while it is checked, and nothing while it is not', async () => {
            const form = await inForm('form-value', 'value="yes" checked="true"');
            const el = form.firstElementChild;
            expect(data(form)).toEqual({ 'form-value': 'yes' });

            el.checked = false;
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({});

            el.querySelector('input').click();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-value': 'yes' });
            expect(el.checked).toBe(true);
        });

        it('submits "on" when it has no value, like a native checkbox', async () => {
            const form = await inForm('form-on', 'checked="true"');
            expect(data(form)).toEqual({ 'form-on': 'on' });
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="yes" checked="true" disabled="true"');
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and not checked', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.querySelector('input').click();
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });
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
