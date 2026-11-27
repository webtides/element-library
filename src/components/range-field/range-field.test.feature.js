import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleDescription,
    accessibleName,
    accessibleRole,
    aTimeout,
    fixture,
    nextFrame,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './range-field.js';
define();

const frames = async () => {
    await nextFrame();
    await nextFrame();
};
const controlOf = (el) => el.querySelector('input[type="range"]');
// What `input-change` reports for a field, from now on.
const changesOf = (el) => {
    const changes = [];
    el.addEventListener('input-change', (event) => changes.push(event.detail));
    return changes;
};
// What the browser does when the user drags the thumb to a value: the control has the value, then
// the event.
const drag = (control, value) => {
    control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('Feature | RangeField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-range-field></el-range-field>`);
        await nextFrame();
        expect(controlOf(el)).not.toBeNull();
    });

    describe('the span', () => {
        it('gives min, max and step to the control', async () => {
            const el = await fixture(
                `<el-range-field name="span" label="Width" min="10" max="50" step="5" value="20"></el-range-field>`,
            );
            const control = controlOf(el);

            expect([control.min, control.max, control.step, control.value]).toEqual(['10', '50', '5', '20']);
            expect(el.value).toBe('20');
        });

        it('takes every value of the span with step="any"', async () => {
            const el = await fixture(
                `<el-range-field name="span-any" label="Opacity" min="0" max="1" step="any" value="0.25"></el-range-field>`,
            );
            const control = controlOf(el);

            expect(control.step).toBe('any');
            drag(control, '0.333');
            await frames();
            expect(el.value).toBe('0.333');
        });

        it('follows a span that changes, and says the value the control keeps', async () => {
            const el = await fixture(`<el-range-field name="span-later" label="Width" value="80"></el-range-field>`);
            const changes = changesOf(el);

            el.max = 50;
            await frames();
            await frames();

            expect(controlOf(el).max).toBe('50');
            expect(controlOf(el).value).toBe('50');
            expect(el.value).toBe('50');
            expect(changes).toEqual(['50']);
        });
    });

    describe('without a value', () => {
        it('takes over the value of the control, the middle of the span, and reports no change', async () => {
            const wrapper = await fixture(`<div></div>`);
            const changes = changesOf(wrapper);
            wrapper.innerHTML = `
                <el-range-field name="none" label="Volume"></el-range-field>
                <el-range-field name="none-span" label="Width" min="10" max="50" step="5"></el-range-field>
            `;
            await frames();
            await frames();
            const [plain, span] = wrapper.children;

            expect([controlOf(plain).value, plain.value]).toEqual(['50', '50']);
            expect([controlOf(span).value, span.value]).toEqual(['30', '30']);
            expect(changes).toEqual([]);
        });

        it('is not touched for having a value, and is touched once the control was left', async () => {
            const el = await fixture(`<el-range-field name="untouched" label="Volume" value="20"></el-range-field>`);
            await frames();
            expect(el.touched).toBe(false);
            expect(el.matches(':state(touched)')).toBe(false);

            controlOf(el).focus();
            controlOf(el).blur();
            await frames();

            expect(el.touched).toBe(true);
            expect(el.matches(':state(touched)')).toBe(true);
        });
    });

    describe('when the value changes', () => {
        it('follows the thumb while it moves, and reports every value once', async () => {
            const el = await fixture(`<el-range-field name="moves" label="Volume" value="20"></el-range-field>`);
            const control = controlOf(el);
            const changes = changesOf(el);

            drag(control, '21');
            drag(control, '22');
            await frames();
            drag(control, '40');
            await frames();
            // The end of the move: the browser fires `change` with the value it already has.
            control.dispatchEvent(new Event('change', { bubbles: true }));
            await frames();

            expect(el.value).toBe('40');
            expect(changes.at(-1)).toBe('40');
            expect(changes.filter((value) => value === '40')).toHaveLength(1);
            expect(new Set(changes).size).toBe(changes.length);
        });

        it('moves with the arrow keys, by one step', async () => {
            const el = await fixture(
                `<el-range-field name="keys" label="Volume" min="0" max="50" step="5" value="20"></el-range-field>`,
            );
            const changes = changesOf(el);

            // One key at a time: the field tells of a change once it has rendered, so two keys
            // are one change or two, by whether a frame lies between them.
            controlOf(el).focus();
            for (const key of ['{ArrowRight}', '{ArrowLeft}', '{ArrowLeft}', '{End}']) {
                await userEvent.keyboard(key);
                await frames();
            }

            expect(el.value).toBe('50');
            expect(changes).toEqual(['25', '20', '15', '50']);
        });

        it('moves the thumb to a value that a script sets, also after the user has moved it', async () => {
            const el = await fixture(`<el-range-field name="script" label="Volume" value="20"></el-range-field>`);
            const control = controlOf(el);
            const changes = changesOf(el);

            el.value = '35';
            await frames();
            expect(control.value).toBe('35');

            drag(control, '60');
            await frames();
            el.value = '10';
            await frames();

            expect(control.value).toBe('10');
            expect(el.value).toBe('10');
            expect(changes).toEqual(['35', '60', '10']);
        });

        it('takes over the value the control keeps for one outside the span or beside a step', async () => {
            const el = await fixture(
                `<el-range-field name="kept" label="Width" min="0" max="50" step="5" value="20"></el-range-field>`,
            );
            const changes = changesOf(el);

            el.value = '80';
            await frames();
            await frames();
            expect([controlOf(el).value, el.value]).toEqual(['50', '50']);

            el.value = '12';
            await frames();
            await frames();
            expect([controlOf(el).value, el.value]).toEqual(['10', '10']);
            expect(changes).toEqual(['50', '10']);
        });

        it('puts the thumb back in the middle for a value that is taken away', async () => {
            const el = await fixture(`<el-range-field name="taken" label="Volume" value="20"></el-range-field>`);

            el.value = null;
            await frames();
            await frames();

            expect([controlOf(el).value, el.value]).toEqual(['50', '50']);
        });
    });

    describe('with show-value', () => {
        const shown = (el) => el.querySelector('.value-now')?.textContent.trim() ?? null;

        it('shows no value by default', async () => {
            const el = await fixture(`<el-range-field name="hidden-value" label="Volume" value="20"></el-range-field>`);
            expect(el.querySelector('.value')).toBeNull();
        });

        it('shows the value beside the control and follows the thumb', async () => {
            const el = await fixture(
                `<el-range-field name="shown" label="Volume" value="20" show-value="true"></el-range-field>`,
            );
            await frames();
            const control = controlOf(el);
            expect(shown(el)).toBe('20');
            // In the row of the control, after it.
            expect(el.querySelector('.value').parentElement).toBe(control.parentElement);
            expect(el.querySelector('.value').getBoundingClientRect().left).toBeGreaterThanOrEqual(
                control.getBoundingClientRect().right,
            );

            drag(control, '73');
            await frames();
            expect(shown(el)).toBe('73');
        });

        it('shows the value the field took over from the control', async () => {
            const el = await fixture(
                `<el-range-field name="shown-none" label="Volume" show-value="true"></el-range-field>`,
            );
            await frames();
            await frames();
            expect(shown(el)).toBe('50');
        });

        it('keeps the control as long as it is while the value gets more digits', async () => {
            const el = await fixture(
                `<div style="width: 300px"><el-range-field name="shown-width" label="Volume" value="5" show-value="true"></el-range-field></div>`,
            );
            const control = controlOf(el);
            control.style.flex = '1';
            await frames();
            const widths = [];
            for (const value of ['5', '50', '100']) {
                drag(control, value);
                await frames();
                widths.push([sizeOf(control).width, sizeOf(el.querySelector('.value')).width]);
            }

            expect(widths[1]).toEqual(widths[0]);
            expect(widths[2]).toEqual(widths[0]);
            // The room is the one of the longest value, which is not seen.
            const room = el.querySelector('.value-room');
            expect(room.textContent.trim()).toBe('100');
            expect(getComputedStyle(room).visibility).toBe('hidden');
        });

        it('hides the shown value from a screen reader, which reads it from the control', async () => {
            const el = await fixture(
                `<el-range-field name="shown-aria" label="Volume" value="20" show-value="true"></el-range-field>`,
            );
            await frames();
            expect(el.querySelector('.value').getAttribute('aria-hidden')).toBe('true');
            expect(await accessibleName(controlOf(el))).toBe('Volume');
        });
    });

    describe('for a screen reader', () => {
        it('is a slider named by its label and described by its messages', async () => {
            const el = await fixture(`
                <el-range-field
                    name="described"
                    label="Volume"
                    help-message="Of the alarm"
                    error-message="Too loud"
                    value="90"
                ></el-range-field>
            `);
            await frames();
            const control = controlOf(el);

            expect(await accessibleRole(control)).toBe('slider');
            expect(await accessibleName(control)).toBe('Volume');
            expect(await accessibleDescription(control)).toBe('Of the alarm');
            expect(control.getAttribute('aria-invalid')).toBe('false');
            expect(el.querySelector('.error-message')).toBeNull();

            // A range is never invalid for the browser: the page says so, after its own check.
            el.valid = false;
            el.touched = true;
            await frames();

            expect(control.getAttribute('aria-invalid')).toBe('true');
            expect(el.querySelector('.error-message').getAttribute('role')).toBe('alert');
            expect(await accessibleDescription(control)).toBe('Of the alarm Too loud');
        });

        it('shows the error message it was rendered with', async () => {
            const el = await fixture(
                `<el-range-field name="rendered-error" label="Volume" value="90" valid="false" error-message="Too loud"></el-range-field>`,
            );
            await frames();
            expect(el.touched).toBe(true);
            expect(el.querySelector('.error-message').textContent.trim()).toBe('Too loud');
        });

        it('has no detectable a11y violations, with and without its messages and the shown value', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-range-field name="axe-plain" label="Volume" value="20"></el-range-field>
                    <el-range-field name="axe-shown" label="Width" help-message="In pixels" value="20" show-value="true"></el-range-field>
                    <el-range-field name="axe-error" label="Weight" value="20" valid="false" error-message="Too heavy"></el-range-field>
                    <el-range-field name="axe-disabled" label="Height" value="20" disabled="true"></el-range-field>
                </div>
            `);
            await frames();
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = async (name, attributes = '') => {
            const form = await fixture(
                `<form><el-range-field name="${name}" label="Volume" ${attributes}></el-range-field></form>`,
            );
            await frames();
            return form;
        };
        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await frames();
            await frames();
        };

        it('submits its value under its name: the rendered one, and the one of the control without one', async () => {
            expect(data(await inForm('form-value', 'value="20"'))).toEqual({ 'form-value': '20' });
            expect(data(await inForm('form-none'))).toEqual({ 'form-none': '50' });
        });

        it('submits a value that the user picks, and one that a script sets', async () => {
            const form = await inForm('form-change', 'value="20"');
            const el = form.firstElementChild;

            drag(controlOf(el), '64');
            await frames();
            expect(data(form)).toEqual({ 'form-change': '64' });

            el.value = '7';
            await frames();
            expect(data(form)).toEqual({ 'form-change': '7' });
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="20" disabled="true"');
            expect(controlOf(form).disabled).toBe(true);
            expect(data(form)).toEqual({});
        });

        it('never keeps the form from being submitted: the control always has a value', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(true);
        });

        it('goes back to the value it was rendered with when the form is reset', async () => {
            const form = await inForm('form-reset', 'value="20" show-value="true"');
            const el = form.firstElementChild;
            const state = () => ({
                control: controlOf(el).value,
                value: el.value,
                shown: el.querySelector('.value-now').textContent.trim(),
                submitted: new FormData(form).get('form-reset'),
                touched: el.touched,
            });
            const rendered = { control: '20', value: '20', shown: '20', submitted: '20', touched: false };
            expect(state()).toEqual(rendered);

            controlOf(el).focus();
            drag(controlOf(el), '77');
            controlOf(el).blur();
            await frames();
            expect(state()).toEqual({ control: '77', value: '77', shown: '77', submitted: '77', touched: true });
            const changes = changesOf(el);

            await reset(form);

            expect(state()).toEqual(rendered);
            expect(changes).toEqual(['20']);
        });

        it('goes back to the middle of the span after a reset when it was rendered without a value', async () => {
            const form = await inForm('form-reset-none', 'min="0" max="10"');
            const el = form.firstElementChild;
            expect([controlOf(el).value, el.value]).toEqual(['5', '5']);

            drag(controlOf(el), '9');
            await frames();
            expect(el.value).toBe('9');

            await reset(form);

            expect([controlOf(el).value, el.value]).toEqual(['5', '5']);
            expect(data(form)).toEqual({ 'form-reset-none': '5' });
        });
    });

    describe('the size of the control', () => {
        it('keeps the look and the size of the browser', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px; --el-color-accent: rgb(1, 2, 3)">
                    <input type="range" />
                    <el-range-field name="size-browser" label="Volume"></el-range-field>
                </div>
            `);
            await frames();
            const [native, control] = wrapper.querySelectorAll('input');

            expect(sizeOf(control)).toEqual(sizeOf(native));
            expect(getComputedStyle(control).accentColor).toBe(getComputedStyle(native).accentColor);
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            it('is at least --el-touch-target high', async () => {
                const wrapper = await fixture(
                    `<div style="--el-touch-target: 44px"><el-range-field name="size-touch" label="Volume"></el-range-field></div>`,
                );
                await frames();
                expect(sizeOf(controlOf(wrapper)).height).toBeGreaterThanOrEqual(44);
            });

            it('keeps its height without --el-touch-target', async () => {
                const wrapper = await fixture(
                    `<div><input type="range" /><el-range-field name="size-touch-plain" label="Volume"></el-range-field></div>`,
                );
                await frames();
                const [native, control] = wrapper.querySelectorAll('input');
                expect(sizeOf(control).height).toBe(sizeOf(native).height);
            });
        });
    });
});
