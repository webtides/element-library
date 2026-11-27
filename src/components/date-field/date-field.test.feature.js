import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleDescription,
    accessibleName,
    aTimeout,
    fixture,
    nextFrame,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './date-field.js';
define();

const frames = async () => {
    await nextFrame();
    await nextFrame();
};
// After a reset: the field goes back a task after the event, and its control with the render after that.
const settled = async () => {
    await aTimeout(0);
    await frames();
};
const controlOf = (el) => el.querySelector('input');
// What `input-change` reports for a field, from now on.
const changesOf = (el) => {
    const changes = [];
    el.addEventListener('input-change', (event) => changes.push(event.detail));
    return changes;
};
// What the browser does when the user picks a value in its picker: the control has the value, then
// `input` and `change`. No key is pressed. The picker itself is drawn by the browser outside of the
// page, where a test does not reach it.
const pick = async (el, value) => {
    const control = controlOf(el);
    control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    await frames();
};
// The keys go to the parts of the control, in the order of the language of the browser: month, day
// and year in the tests. A control that has the focus is not focused again: that would put the
// focus back on its first part.
const type = async (el, keys) => {
    if (document.activeElement !== controlOf(el)) controlOf(el).focus();
    await userEvent.keyboard(keys);
    await frames();
};
const messageOf = (el) => el.querySelector('.error-message')?.textContent.trim() ?? null;

describe('Feature | DateField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-date-field></el-date-field>`);
        await nextFrame();
        expect(controlOf(el)).not.toBeNull();
    });

    describe('the control', () => {
        it('is the one of the browser for a date, with no limits', async () => {
            const el = await fixture(`<el-date-field name="plain" label="Birthday"></el-date-field>`);
            const control = controlOf(el);

            expect(el.querySelectorAll('input')).toHaveLength(1);
            expect(control.type).toBe('date');
            for (const name of ['min', 'max', 'step'])
                expect([name, control.hasAttribute(name)]).toEqual([name, false]);
        });

        it('is the one for a time, for both, for a month and for a week', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-date-field name="type-time" label="Time" type="time" value="14:30"></el-date-field>
                    <el-date-field name="type-both" label="Start" type="datetime-local" value="2026-11-15T14:30"></el-date-field>
                    <el-date-field name="type-month" label="Month" type="month" value="2026-11"></el-date-field>
                    <el-date-field name="type-week" label="Week" type="week" value="2026-W46"></el-date-field>
                </div>
            `);
            await frames();
            const fields = [...wrapper.children];

            expect(fields.map((el) => controlOf(el).type)).toEqual(['time', 'datetime-local', 'month', 'week']);
            expect(fields.map((el) => controlOf(el).value)).toEqual([
                '14:30',
                '2026-11-15T14:30',
                '2026-11',
                '2026-W46',
            ]);
            expect(fields.map((el) => el.value)).toEqual(['14:30', '2026-11-15T14:30', '2026-11', '2026-W46']);
        });

        it('gets the limits and the step, also when they change', async () => {
            const el = await fixture(
                `<el-date-field name="limits" label="Delivery" min="2026-11-16" max="2026-12-23" step="7"></el-date-field>`,
            );
            const control = controlOf(el);
            expect([control.min, control.max, control.step]).toEqual(['2026-11-16', '2026-12-23', '7']);

            el.min = '2026-12-01';
            el.max = null;
            el.step = null;
            await frames();

            expect(control.min).toBe('2026-12-01');
            expect([control.hasAttribute('max'), control.hasAttribute('step')]).toEqual([false, false]);
        });

        it('takes an empty limit as none', async () => {
            const el = await fixture(
                `<el-date-field name="empty-limits" label="Delivery" min="" max="" step=""></el-date-field>`,
            );
            const control = controlOf(el);
            for (const name of ['min', 'max', 'step'])
                expect([name, control.hasAttribute(name)]).toEqual([name, false]);
        });
    });

    describe('the value', () => {
        it('is given to the control in its format', async () => {
            const el = await fixture(
                `<el-date-field name="given" label="Birthday" value="2026-11-15"></el-date-field>`,
            );
            await frames();

            expect(controlOf(el).value).toBe('2026-11-15');
            expect(el.value).toBe('2026-11-15');
            // A field with a value was filled in.
            expect(el.touched).toBe(true);
        });

        it('is empty for a value the control does not take, and the field says so', async () => {
            const wrapper = await fixture(`<div></div>`);
            const changes = changesOf(wrapper);
            wrapper.innerHTML = `
                <el-date-field name="other-format" label="Birthday" value="15.11.2026"></el-date-field>
                <el-date-field name="no-such-day" label="Birthday" value="2026-02-30"></el-date-field>
                <el-date-field name="date-for-time" label="Time" type="time" value="2026-11-15"></el-date-field>
            `;
            await frames();
            await frames();

            for (const el of wrapper.children) {
                expect([el.getAttribute('name'), controlOf(el).value, el.value]).toEqual([
                    el.getAttribute('name'),
                    '',
                    '',
                ]);
                expect(el.touched).toBe(false);
            }
            expect(changes).toEqual(['', '', '']);
        });

        it('takes a value that a script sets, also after the user has entered one', async () => {
            const el = await fixture(
                `<el-date-field name="script" label="Birthday" value="2026-11-15"></el-date-field>`,
            );
            await frames();
            const changes = changesOf(el);

            el.value = '2026-12-24';
            await frames();
            expect(controlOf(el).value).toBe('2026-12-24');

            await pick(el, '2027-01-06');
            el.value = '2026-05-01';
            await frames();

            expect([controlOf(el).value, el.value]).toEqual(['2026-05-01', '2026-05-01']);
            expect(changes).toEqual(['2026-12-24', '2027-01-06', '2026-05-01']);
        });

        it('is empty after a script has set a value the control does not take, and reports that alone', async () => {
            const el = await fixture(
                `<el-date-field name="script-other" label="Birthday" value="2026-11-15"></el-date-field>`,
            );
            await frames();
            const changes = changesOf(el);

            el.value = '24.12.2026';
            await frames();
            await frames();

            expect([controlOf(el).value, el.value]).toEqual(['', '']);
            expect(changes).toEqual(['']);
        });

        it('is empty once the type no longer takes it', async () => {
            const el = await fixture(`<el-date-field name="retyped" label="When" value="2026-11-15"></el-date-field>`);
            await frames();

            el.type = 'time';
            await frames();
            await frames();

            expect(controlOf(el).type).toBe('time');
            expect([controlOf(el).value, el.value]).toEqual(['', '']);
        });

        it('is empty for a value that is taken away', async () => {
            const el = await fixture(
                `<el-date-field name="taken" label="Birthday" value="2026-11-15"></el-date-field>`,
            );
            await frames();

            el.value = null;
            await frames();

            expect(controlOf(el).value).toBe('');
        });
    });

    describe('when the user enters a date', () => {
        it('has no value while the date is not complete, and the one of the control once it is', async () => {
            const el = await fixture(`<el-date-field name="typed" label="Birthday"></el-date-field>`);

            await type(el, '1115');
            expect([controlOf(el).value, el.value]).toEqual(['', null]);
            // A date that is half entered is none.
            expect(el.valid).toBe(false);

            await type(el, '2026');
            expect([controlOf(el).value, el.value]).toEqual(['2026-11-15', '2026-11-15']);
            expect(el.valid).toBe(true);
        });

        // The control drops a date that is half entered when its value, its limits or its step are
        // written again, with the same text as well. The field is rendered between the keys: its first
        // key makes it not valid, and a field can be rendered for any other reason.
        it('keeps what was entered so far when the field is rendered between two keys', async () => {
            const el = await fixture(`
                <el-date-field name="typed-slowly" label="Delivery" min="2026-01-01" max="2026-12-31" step="1" autocomplete="off" required="true" help-message="This year"></el-date-field>
            `);

            for (const key of '11152026') {
                await type(el, key);
                el.helpMessage = `This year, ${key}`;
                await frames();
            }

            expect([controlOf(el).value, el.value]).toEqual(['2026-11-15', '2026-11-15']);
            expect(el.valid).toBe(true);
        });

        it('keeps the first key of a field without a value: the value stays none', async () => {
            const el = await fixture(`<el-date-field name="typed-first" label="Birthday"></el-date-field>`);
            const changes = changesOf(el);
            expect(el.value).toBeNull();

            await type(el, '1');
            expect(el.value).toBeNull();
            expect(controlOf(el).hasAttribute('value')).toBe(false);
            await type(el, '1152026');

            expect(el.value).toBe('2026-11-15');
            expect(changes).not.toContain('');
        });

        it('reports every value once', async () => {
            const el = await fixture(`<el-date-field name="typed-once" label="Birthday"></el-date-field>`);
            const changes = changesOf(el);

            await type(el, '11152026');
            await pick(el, '2026-12-24');

            expect(changes.at(-1)).toBe('2026-12-24');
            expect(changes.filter((value) => value === '2026-11-15')).toHaveLength(1);
            expect(new Set(changes).size).toBe(changes.length);
        });

        it('keeps what the user changes in a part of the date', async () => {
            const el = await fixture(`<el-date-field name="part" label="Birthday" value="2026-11-15"></el-date-field>`);
            await frames();

            // The first part is the month: one up.
            await type(el, '{ArrowUp}');
            expect([controlOf(el).value, el.value]).toEqual(['2026-12-15', '2026-12-15']);

            // The field is rendered again when it is left, with the value the user gave it.
            controlOf(el).blur();
            await frames();
            expect([controlOf(el).value, el.value]).toEqual(['2026-12-15', '2026-12-15']);
        });

        it('is empty again once a part of the date is deleted', async () => {
            const el = await fixture(
                `<el-date-field name="deleted" label="Birthday" value="2026-11-15"></el-date-field>`,
            );
            await frames();

            await type(el, '{Backspace}');
            expect([controlOf(el).value, el.value]).toEqual(['', '']);

            // The other parts are still there: the month alone is entered again.
            await type(el, '12');
            expect([controlOf(el).value, el.value]).toEqual(['2026-12-15', '2026-12-15']);
        });

        it('takes a value that is picked in the picker, without a key', async () => {
            const el = await fixture(`<el-date-field name="picked" label="Birthday"></el-date-field>`);
            const changes = changesOf(el);

            await pick(el, '2026-11-15');

            expect(el.value).toBe('2026-11-15');
            expect(changes).toEqual(['2026-11-15']);
        });

        // Not every browser fires `change` before the control is left.
        it('takes a value the control reports with `input` alone', async () => {
            const el = await fixture(`<el-date-field name="picked-input" label="Birthday"></el-date-field>`);
            const control = controlOf(el);

            control.value = '2026-11-15';
            control.dispatchEvent(new Event('input', { bubbles: true }));
            await frames();

            expect(el.value).toBe('2026-11-15');
        });
    });

    describe('with limits', () => {
        const limited = (name, attributes = '') =>
            fixture(
                `<el-date-field name="${name}" label="Delivery" min="2026-11-16" max="2026-12-23" error-message="Between 16 November and 23 December" ${attributes}></el-date-field>`,
            );

        it('is valid inside of them', async () => {
            const el = await limited('inside');
            await pick(el, '2026-11-16');
            controlOf(el).focus();
            controlOf(el).blur();
            await frames();

            expect(el.valid).toBe(true);
            expect(messageOf(el)).toBeNull();
        });

        it('is not valid before the earliest and after the latest value, and shows its message once it was left', async () => {
            for (const [name, value] of [
                ['before', '2026-11-15'],
                ['after', '2026-12-24'],
            ]) {
                const el = await limited(name);
                controlOf(el).focus();
                await pick(el, value);

                expect([name, el.value, el.valid]).toEqual([name, value, false]);
                expect(messageOf(el)).toBeNull();

                controlOf(el).blur();
                await frames();
                expect(messageOf(el)).toBe('Between 16 November and 23 December');
                expect(controlOf(el).getAttribute('aria-invalid')).toBe('true');
            }
        });

        it('shows the message of a value it was rendered with that is outside of them', async () => {
            const el = await limited('rendered-outside', 'value="2027-01-01"');
            await frames();

            // A field with a value was filled in: it is touched, and says what is wrong when it gets the focus.
            controlOf(el).focus();
            controlOf(el).blur();
            await frames();

            expect(el.valid).toBe(false);
            expect(messageOf(el)).toBe('Between 16 November and 23 December');
        });

        it('is not valid beside a step', async () => {
            const el = await fixture(
                `<el-date-field name="stepped" label="Pick-up" type="time" min="09:00" max="17:00" step="900"></el-date-field>`,
            );

            await pick(el, '09:15');
            expect(el.valid).toBe(true);

            await pick(el, '09:20');
            expect([el.value, el.valid]).toEqual(['09:20', false]);
        });

        it('keeps the form from being submitted with a value outside of them, and shows its message', async () => {
            const form = await fixture(`
                <form>
                    <el-date-field name="refused" label="Delivery" min="2026-11-16" error-message="From 16 November on"></el-date-field>
                    <button type="submit">Send</button>
                </form>
            `);
            const el = form.firstElementChild;
            let submitted = 0;
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submitted += 1;
            });
            await pick(el, '2026-11-01');
            el.touched = false;
            await frames();

            form.querySelector('button').click();
            await frames();
            expect(submitted).toBe(0);
            expect(messageOf(el)).toBe('From 16 November on');

            await pick(el, '2026-11-20');
            form.querySelector('button').click();
            await frames();
            expect(submitted).toBe(1);
        });
    });

    describe('as an input field', () => {
        it('shows its error message once a required field was left empty', async () => {
            const el = await fixture(
                `<el-date-field name="required" label="Birthday" required="true" error-message="Enter your birthday"></el-date-field>`,
            );
            await frames();
            expect(messageOf(el)).toBeNull();

            controlOf(el).focus();
            controlOf(el).blur();
            await frames();

            expect(el.valid).toBe(false);
            expect(messageOf(el)).toBe('Enter your birthday');
        });

        it('submits its value under its name, and nothing for a value the control did not take', async () => {
            const form = await fixture(`
                <form>
                    <el-date-field name="sent" label="Birthday" value="2026-11-15"></el-date-field>
                    <el-date-field name="sent-time" label="Time" type="time" value="14:30"></el-date-field>
                    <el-date-field name="sent-other" label="Birthday" value="15.11.2026"></el-date-field>
                    <el-date-field name="sent-off" label="Birthday" value="2026-11-15" disabled="true"></el-date-field>
                </form>
            `);
            await frames();
            await frames();

            expect(Object.fromEntries(new FormData(form))).toEqual({
                sent: '2026-11-15',
                'sent-time': '14:30',
                'sent-other': '',
            });
        });

        it('goes back to the value it was rendered with when the form is reset', async () => {
            const form = await fixture(
                `<form><el-date-field name="back" label="Birthday" value="2026-11-15"></el-date-field></form>`,
            );
            const el = form.firstElementChild;
            await frames();
            await pick(el, '2026-12-24');
            expect(new FormData(form).get('back')).toBe('2026-12-24');
            const changes = changesOf(el);

            form.reset();
            await settled();
            await frames();

            expect([controlOf(el).value, el.value, new FormData(form).get('back')]).toEqual([
                '2026-11-15',
                '2026-11-15',
                '2026-11-15',
            ]);
            expect(changes).toEqual(['2026-11-15']);
        });

        it('goes back to empty after a reset when it was rendered with a value the control did not take', async () => {
            const form = await fixture(
                `<form><el-date-field name="back-other" label="Birthday" value="15.11.2026"></el-date-field></form>`,
            );
            const el = form.firstElementChild;
            await frames();
            await frames();
            await pick(el, '2026-12-24');

            form.reset();
            await settled();
            await frames();

            expect([controlOf(el).value, el.value]).toEqual(['', '']);
        });
    });

    describe('before the script has run', () => {
        // The markup the SSR renderer writes: it assigns the properties and stringifies the template,
        // without connecting the element.
        const serverString = (properties) => {
            const source = document.createElement('el-date-field');
            Object.assign(source, source.properties(), properties);
            return source.template().toString();
        };
        const serverControl = (properties) => {
            const wrapper = document.createElement('div');
            wrapper.setHTMLUnsafe(serverString(properties));
            return wrapper.querySelector('input');
        };

        it('has its type, its value, its limits and its step in the markup', async () => {
            const control = serverControl({ value: '2026-11-20', min: '2026-11-16', max: '2026-12-23', step: 7 });

            expect(control.type).toBe('date');
            expect([control.value, control.min, control.max, control.step]).toEqual([
                '2026-11-20',
                '2026-11-16',
                '2026-12-23',
                '7',
            ]);
        });

        it('has no attribute for a limit it does not have', async () => {
            const control = serverControl({});
            for (const name of ['min', 'max', 'step', 'list'])
                expect([name, control.hasAttribute(name)]).toEqual([name, false]);
        });

        it('keeps the server-rendered control, its value and its limits when the element starts', async () => {
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            const properties = { name: 'ssr-delivery', value: '2026-11-20', min: '2026-11-16', max: '2026-12-23' };
            wrapper.setHTMLUnsafe(
                `<el-date-field name="ssr-delivery" value="2026-11-20" min="2026-11-16" max="2026-12-23">${serverString(properties)}</el-date-field>`,
            );
            const el = wrapper.querySelector('el-date-field');
            const control = controlOf(el);
            const changes = changesOf(el);
            await frames();
            await frames();

            expect(controlOf(el)).toBe(control);
            expect([control.value, control.min, control.max, el.value]).toEqual([
                '2026-11-20',
                '2026-11-16',
                '2026-12-23',
                '2026-11-20',
            ]);
            expect(changes).toEqual([]);
            wrapper.remove();
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the control at least --el-touch-target high, in every size', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-date-field name="touch-small" label="Small" size="small"></el-date-field>
                    <el-date-field name="touch-medium" label="Medium"></el-date-field>
                    <el-date-field name="touch-time" label="Time" type="time"></el-date-field>
                </div>
            `);
            await frames();
            for (const control of wrapper.querySelectorAll('input')) {
                expect(sizeOf(control).height, control.outerHTML).toBeGreaterThanOrEqual(44);
            }
        });

        it('keeps its height without --el-touch-target', async () => {
            const wrapper = await fixture(
                `<div><input type="date" /><el-date-field name="touch-plain" label="Birthday"></el-date-field></div>`,
            );
            await frames();
            const [native, control] = wrapper.querySelectorAll('input');
            expect(sizeOf(control).height).toBe(sizeOf(native).height);
        });
    });

    describe('for a screen reader', () => {
        it('is named by its label and described by its messages', async () => {
            const el = await fixture(`
                <el-date-field name="described" label="Delivery" help-message="On a weekday" error-message="Pick a day" required="true"></el-date-field>
            `);
            await frames();
            const control = controlOf(el);

            expect(await accessibleName(control)).toBe('Delivery');
            expect(await accessibleDescription(control)).toBe('On a weekday');
            expect(control.getAttribute('aria-invalid')).toBe('false');

            control.focus();
            control.blur();
            await frames();

            expect(control.getAttribute('aria-invalid')).toBe('true');
            expect(el.querySelector('.error-message').getAttribute('role')).toBe('alert');
            expect(await accessibleDescription(control)).toBe('On a weekday Pick a day');
        });

        it('has no detectable a11y violations, in every type, with its messages and disabled', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-date-field name="axe-date" label="Date" value="2026-11-15"></el-date-field>
                    <el-date-field name="axe-time" label="Time" type="time" help-message="In the afternoon"></el-date-field>
                    <el-date-field name="axe-both" label="Start" type="datetime-local"></el-date-field>
                    <el-date-field name="axe-month" label="Month" type="month"></el-date-field>
                    <el-date-field name="axe-week" label="Week" type="week"></el-date-field>
                    <el-date-field name="axe-error" label="Delivery" valid="false" touched="true" error-message="Pick a day"></el-date-field>
                    <el-date-field name="axe-disabled" label="Arrival" value="2026-11-15" disabled="true"></el-date-field>
                </div>
            `);
            await frames();
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    it('takes content of the page into its control, and keeps the limits of its date on the input', async () => {
        const el = await fixture(`
            <el-date-field name="content-date" label="Delivery" min="2026-01-01" max="2026-12-31" clearable="true" value="2026-11-27">
                <span slot="end" id="content-date-end">UTC</span>
            </el-date-field>
        `);
        await frames();
        const control = el.querySelector(':scope > .field > .control');
        const input = el.querySelector('input');

        expect(input.parentElement).toBe(control);
        expect(el.querySelector('#content-date-end').parentElement).toBe(control.querySelector('.control-end'));
        expect([input.type, input.min, input.max, input.value]).toEqual([
            'date',
            '2026-01-01',
            '2026-12-31',
            '2026-11-27',
        ]);
        expect(await accessibleDescription(input)).toBe('UTC');

        el.querySelector('.control-clear').click();
        await frames();
        expect(input.value).toBe('');
        expect(String(el.value ?? '')).toBe('');
    });
});
