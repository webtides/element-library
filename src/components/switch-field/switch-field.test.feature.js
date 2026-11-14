import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { aTimeout, fixture, nextFrame, oneEvent, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './switch-field.js';
define();

const switchFixture = (attrs = '') =>
    fixture(`<el-switch-field name="notifications" label="Enable notifications" ${attrs}></el-switch-field>`);

describe('Feature | SwitchField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-switch-field></el-switch-field>`);
        await nextFrame();
    });

    it('renders a native checkbox with role="switch"', async () => {
        const el = await switchFixture();
        const input = el.querySelector('input');
        expect(input.type).toBe('checkbox');
        expect(input.getAttribute('role')).toBe('switch');
    });

    it('defaults to off', async () => {
        const el = await switchFixture();
        expect(el.checked).toBe(false);
        expect(el.querySelector('input').checked).toBe(false);
        expect(el.matches(':state(checked)')).toBe(false);
    });

    it('toggling it on updates checked, the state and emits input-change', async () => {
        const el = await switchFixture();
        const changed = oneEvent(el, 'input-change');
        el.querySelector('input').click();
        await changed;
        await nextFrame();
        expect(el.checked).toBe(true);
        expect(el.matches(':state(checked)')).toBe(true);
    });

    it('honours checked="true" declaratively', async () => {
        const el = await switchFixture('checked="true"');
        expect(el.checked).toBe(true);
        expect(el.querySelector('input').checked).toBe(true);
        expect(el.matches(':state(checked)')).toBe(true);
    });

    it('reflects the disabled state onto the native input', async () => {
        const el = await switchFixture('disabled="true"');
        expect(el.querySelector('input').disabled).toBe(true);
    });

    it('has no detectable a11y violations', async () => {
        const el = await switchFixture();
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(
            `<div style="--el-touch-target: 44px"><el-switch-field name="a" label="a"></el-switch-field></div>`,
        );
        expect(sizeOf(wrapper.querySelector('.field > label')).height).toBeLessThan(44);
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(
                `<form><el-switch-field name="${name}" label="Enable notifications" ${attributes}></el-switch-field></form>`,
            );

        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await nextFrame();
            await nextFrame();
        };

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

        it('goes back to the checked state it was rendered with when the form is reset', async () => {
            const on = await inForm('form-reset-on', 'value="yes" checked="true"');
            const off = await inForm('form-reset-off', 'value="yes" required="true" error-message="Turn it on"');
            const state = (form) => {
                const el = form.firstElementChild;
                return {
                    control: el.querySelector('input').checked,
                    checked: el.checked,
                    submitted: new FormData(form).get(el.name),
                    touched: el.touched,
                    valid: el.valid,
                    message: el.querySelector('.error-message')?.textContent.trim() ?? null,
                };
            };
            const renderedOn = {
                control: true,
                checked: true,
                submitted: 'yes',
                touched: false,
                valid: true,
                message: null,
            };
            const renderedOff = {
                control: false,
                checked: false,
                submitted: null,
                touched: false,
                valid: true,
                message: null,
            };
            expect(state(on)).toEqual(renderedOn);
            expect(state(off)).toEqual(renderedOff);

            // The one that was on goes off, and the required one is left without a check.
            on.querySelector('input').focus();
            on.querySelector('input').click();
            off.querySelector('input').focus();
            off.querySelector('input').blur();
            await nextFrame();
            await nextFrame();
            expect(state(on)).toEqual({
                ...renderedOn,
                control: false,
                checked: false,
                submitted: null,
                touched: true,
            });
            expect(state(off)).toEqual({ ...renderedOff, touched: true, valid: false, message: 'Turn it on' });

            await reset(on);
            await reset(off);

            expect(state(on)).toEqual(renderedOn);
            expect(state(off)).toEqual(renderedOff);
        });

        it('goes off again after a reset when the user had turned it on', async () => {
            const form = await inForm('form-reset-turned-on', 'value="yes"');
            const el = form.firstElementChild;

            el.querySelector('input').click();
            await nextFrame();
            await nextFrame();
            expect([el.querySelector('input').checked, el.checked]).toEqual([true, true]);

            await reset(form);

            expect([el.querySelector('input').checked, el.checked]).toEqual([false, false]);
            expect(new FormData(form).get('form-reset-turned-on')).toBe(null);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the label, which is the hit area, at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-switch-field name="a" label="a"></el-switch-field></div>`,
            );
            for (const label of wrapper.querySelectorAll('.field > label')) {
                const { width, height } = sizeOf(label);
                expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
            }
        });
    });
});
