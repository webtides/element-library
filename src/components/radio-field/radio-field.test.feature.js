import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './radio-field.js';
define();

// Options are passed as a JSON attribute so they are present at connect time (the group's initial
// validity is computed in connected()).
const radioFixture = (attrs = '', options = ['Starter', 'Pro', 'Enterprise']) =>
    fixture(
        `<el-radio-field name="plan" label="Choose a plan" options='${JSON.stringify(options)}' ${attrs}></el-radio-field>`,
    );

describe('Feature | RadioField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-radio-field></el-radio-field>`);
        await nextFrame();
    });

    it('renders one radio per option inside a fieldset/legend', async () => {
        const el = await radioFixture();
        expect(el.querySelectorAll('input[type="radio"]')).toHaveLength(3);
        expect(el.querySelector('fieldset')).not.toBeNull();
        expect(el.querySelector('legend').textContent.trim()).toBe('Choose a plan');
    });

    it('selecting a radio updates value and emits input-change', async () => {
        const el = await radioFixture();
        const changed = oneEvent(el, 'input-change');
        el.querySelectorAll('input[type="radio"]')[1].click();
        const event = await changed;
        expect(el.value).toBe('Pro');
        expect(event.detail).toBe('Pro');
    });

    it('shares a name so the radios are mutually exclusive', async () => {
        const el = await radioFixture();
        const radios = [...el.querySelectorAll('input[type="radio"]')];
        expect(radios.every((radio) => radio.name === 'plan')).toBe(true);

        radios[0].click();
        await nextFrame();
        radios[2].click();
        await nextFrame();

        expect(radios.filter((radio) => radio.checked)).toHaveLength(1);
        expect(el.value).toBe('Enterprise');
    });

    it('is invalid while required and unselected, valid once a choice is made', async () => {
        const el = await radioFixture('required="true"');
        // The state reflects validity immediately; the message stays hidden until touched.
        expect(el.matches(':state(invalid)')).toBe(true);

        el.querySelectorAll('input[type="radio"]')[0].click();
        await nextFrame();
        expect(el.matches(':state(valid)')).toBe(true);
    });

    it('disables an individual option via the option object', async () => {
        const el = await radioFixture('', [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B', disabled: true },
        ]);
        const radios = el.querySelectorAll('input[type="radio"]');
        expect(radios[0].disabled).toBe(false);
        expect(radios[1].disabled).toBe(true);
    });

    it('has no detectable a11y violations', async () => {
        const el = await radioFixture('value="Pro"');
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('announces its error message and has no a11y violations in the error state', async () => {
        const el = await radioFixture('required="true" valid="false" error-message="Choose a plan"');
        await nextFrame();
        const message = el.querySelector('.error-message');

        expect(message.getAttribute('role')).toBe('alert');
        expect(el.querySelector('fieldset').getAttribute('aria-describedby').split(' ')).toContain(message.id);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(
            `<div style="--el-touch-target: 44px"><el-radio-field name="a" label="Plan"></el-radio-field></div>`,
        );
        wrapper.querySelector('el-radio-field').options = ['a', 'b'];
        await nextFrame();
        await nextFrame();
        expect(sizeOf(wrapper.querySelector('.option')).height).toBeLessThan(44);
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(
                `<form><el-radio-field name="${name}" label="Plan" options='["free", "pro", "team"]' ${attributes}></el-radio-field></form>`,
            );

        it('submits the selected option under its name, and nothing while none is selected', async () => {
            const selected = await inForm('form-value', 'value="pro"');
            expect(data(selected)).toEqual({ 'form-value': 'pro' });

            const none = await inForm('form-none');
            expect(data(none)).toEqual({});
        });

        it('submits an option that a script selects, and one that the user picks', async () => {
            const form = await inForm('form-change', 'value="free"');
            const el = form.firstElementChild;

            el.value = 'pro';
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'pro' });

            el.querySelector('input[value="team"]').click();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'team' });
            expect(el.value).toBe('team');
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="pro" disabled="true"');
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and nothing is selected', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.querySelector('input[value="pro"]').click();
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the label of every option, which is its hit area, at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-radio-field name="a" label="Plan"></el-radio-field></div>`,
            );
            wrapper.querySelector('el-radio-field').options = ['a', 'b'];
            await nextFrame();
            await nextFrame();
            for (const label of wrapper.querySelectorAll('.option')) {
                const { width, height } = sizeOf(label);
                expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
            }
        });
    });
});
