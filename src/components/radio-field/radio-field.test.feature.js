import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    aTimeout,
    fixture,
    nextFrame,
    oneEvent,
    sizeOf,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
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

    describe('an error of the page', () => {
        const messageOf = (el) => el.querySelector('.error-message')?.textContent.trim() ?? null;

        // The group works out its validity from `required` and its value. What the page says after a
        // check of its own, such as "that plan is sold out", is no part of that.
        it('keeps the error it was rendered with, with and without a value and required', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-radio-field name="rendered-value" label="Plan" options='["free", "pro"]' value="pro" valid="false" error-message="Pro is sold out"></el-radio-field>
                    <el-radio-field name="rendered-required" label="Plan" options='["free", "pro"]' value="pro" required="true" valid="false" error-message="Pro is sold out"></el-radio-field>
                    <el-radio-field name="rendered-none" label="Plan" options='["free", "pro"]' valid="false" error-message="Choose a plan"></el-radio-field>
                </div>
            `);
            await nextFrame();
            await nextFrame();

            for (const el of wrapper.children) {
                expect([el.getAttribute('name'), el.valid, el.touched]).toEqual([el.getAttribute('name'), false, true]);
                expect(el.querySelector('fieldset').getAttribute('aria-invalid')).toBe('true');
            }
            expect([...wrapper.children].map(messageOf)).toEqual([
                'Pro is sold out',
                'Pro is sold out',
                'Choose a plan',
            ]);
        });

        it('takes it away once the user chooses again', async () => {
            const el = await radioFixture('value="Pro" valid="false" error-message="Pro is sold out"');
            await nextFrame();
            expect(messageOf(el)).toBe('Pro is sold out');

            el.querySelector('input[value="Starter"]').click();
            await nextFrame();
            await nextFrame();

            expect([el.valid, messageOf(el)]).toEqual([true, null]);
        });
    });

    describe('when the user moves in the group and leaves it', () => {
        const groupWithButton = async (name, attributes = '') => {
            const wrapper = await fixture(`
                <div>
                    <el-radio-field name="${name}" label="Plan" options='["free", "pro", "team"]' required="true" error-message="Choose a plan" ${attributes}></el-radio-field>
                    <button>After</button>
                </div>
            `);
            await nextFrame();
            return wrapper;
        };
        const messageOf = (el) => el.querySelector('.error-message')?.textContent.trim() ?? null;

        it('is not touched while the focus moves from radio to radio with the arrow keys', async () => {
            const wrapper = await groupWithButton('moves-keys');
            const el = wrapper.firstElementChild;
            const radios = el.querySelectorAll('input');
            radios[0].focus();

            await userEvent.keyboard('{ArrowDown}');
            await nextFrame();
            await nextFrame();

            expect(document.activeElement).toBe(radios[1]);
            expect([el.value, el.touched]).toEqual(['pro', false]);
        });

        it('is not touched by a click on another option', async () => {
            const wrapper = await groupWithButton('moves-click');
            const el = wrapper.firstElementChild;
            el.querySelector('input').focus();

            // The label is the hit area: the pointer goes down on it while the focus is still on
            // the first radio, which loses it.
            await userEvent.click(el.querySelectorAll('.option')[2]);
            await nextFrame();
            await nextFrame();

            expect([el.value, el.touched, messageOf(el)]).toEqual(['team', false, null]);
        });

        it('is touched once the focus has left the group, and shows its error message without a choice', async () => {
            const wrapper = await groupWithButton('moves-leaves');
            const el = wrapper.firstElementChild;
            el.querySelector('input').focus();
            expect([el.touched, messageOf(el)]).toEqual([false, null]);

            await userEvent.keyboard('{Tab}');
            await nextFrame();
            await nextFrame();

            expect(document.activeElement).toBe(wrapper.querySelector('button'));
            expect([el.touched, messageOf(el)]).toEqual([true, 'Choose a plan']);
        });
    });

    describe('a colour or an icon in front of the label of an option', () => {
        const SYMBOLS = `
            <svg width="0" height="0" style="position: absolute" aria-hidden="true">
                <symbol id="radio-option-tag" viewBox="0 0 24 24"><path d="M4 4h8l8 8-8 8-8-8z" /></symbol>
            </svg>
        `;
        const OPTIONS = [
            { value: 'work', label: 'Work', color: 'rgb(200, 30, 30)' },
            { value: 'home', label: 'Home', color: '#1e5fc8', icon: '#radio-option-tag' },
            { value: 'later', label: 'Later', icon: '#radio-option-tag' },
            { value: 'none', label: 'None' },
            'Plain',
        ];
        const decorated = async (attributes = '') => {
            const wrapper = await fixture(`
                <div style="font: 16px/24px sans-serif">
                    ${SYMBOLS}
                    <el-radio-field name="radio-decorated" label="Tags" options='${JSON.stringify(OPTIONS)}' ${attributes}></el-radio-field>
                </div>
            `);
            await nextFrame();
            await nextFrame();
            return wrapper.querySelector('el-radio-field');
        };
        const optionOf = (el, index) => el.querySelectorAll('.option')[index];
        const box = (node) => node.getBoundingClientRect();

        it('shows a dot in the colour an option names, between its circle and its label', async () => {
            const el = await decorated();
            const option = optionOf(el, 0);
            const dot = option.querySelector('.option-color');

            expect(getComputedStyle(dot).backgroundColor).toBe('rgb(200, 30, 30)');
            expect([box(dot).width, box(dot).height]).toEqual([12, 12]);
            expect(getComputedStyle(dot).borderTopLeftRadius).toBe('50%');
            expect(box(option.querySelector('.radio-indicator')).right).toBeLessThanOrEqual(box(dot).left);
            expect(box(dot).right).toBeLessThanOrEqual(box(option.querySelector('.option-label')).left);
            expect(getComputedStyle(optionOf(el, 1).querySelector('.option-color')).backgroundColor).toBe(
                'rgb(30, 95, 200)',
            );
        });

        it('shows an icon of the page there, in the colour of the text, and both where an option has both', async () => {
            const el = await decorated();
            const icon = optionOf(el, 2).querySelector('svg.option-icon');
            const both = optionOf(el, 1);

            expect(icon.querySelector('use').getAttribute('href')).toBe('#radio-option-tag');
            expect([box(icon).width, box(icon).height]).toEqual([20, 20]);
            expect(getComputedStyle(icon).fill).toBe(getComputedStyle(optionOf(el, 2)).color);
            expect(box(icon).right).toBeLessThanOrEqual(box(optionOf(el, 2).querySelector('.option-label')).left);
            // The colour first, then the icon.
            expect(box(both.querySelector('.option-color')).right).toBeLessThanOrEqual(
                box(both.querySelector('.option-icon')).left,
            );
        });

        it('takes both for decorations: the name of an option stays its label', async () => {
            const el = await decorated();

            for (const [index, name] of ['Work', 'Home', 'Later', 'None', 'Plain'].entries()) {
                expect(await accessibleName(optionOf(el, index).querySelector('input')), name).toBe(name);
            }
            for (const start of el.querySelectorAll('.option-start')) {
                expect(start.getAttribute('aria-hidden')).toBe('true');
            }
        });

        it('has nothing in front of the label of an option that names neither, as before', async () => {
            const el = await decorated();

            expect(el.querySelectorAll('.option-start').length).toBe(3);
            for (const index of [3, 4]) {
                expect([...optionOf(el, index).children].map((child) => child.className || child.localName)).toEqual([
                    'input',
                    'radio-indicator',
                    'option-label',
                ]);
            }
        });

        it('takes the options as a property as well, and follows new ones', async () => {
            const el = await fixture(`<el-radio-field name="radio-property" label="Tags"></el-radio-field>`);
            el.options = OPTIONS;
            await nextFrame();
            await nextFrame();
            expect(getComputedStyle(optionOf(el, 0).querySelector('.option-color')).backgroundColor).toBe(
                'rgb(200, 30, 30)',
            );
            expect(optionOf(el, 2).querySelector('use').getAttribute('href')).toBe('#radio-option-tag');

            el.options = [{ value: 'work', label: 'Work', color: 'rgb(0, 120, 60)' }, 'Plain'];
            await nextFrame();
            await nextFrame();
            expect(getComputedStyle(optionOf(el, 0).querySelector('.option-color')).backgroundColor).toBe(
                'rgb(0, 120, 60)',
            );
            expect(el.querySelectorAll('.option-start').length).toBe(1);
        });

        it('has the colour and the icon in server-rendered markup', () => {
            const source = document.createElement('el-radio-field');
            Object.assign(source, source.properties(), { name: 'radio-ssr', label: 'Tags', options: OPTIONS });
            const wrapper = document.createElement('div');
            wrapper.setHTMLUnsafe(source.template().toString());
            const starts = [...wrapper.querySelectorAll('.option')].map((option) =>
                option.querySelector('.option-start'),
            );

            expect(starts.map((start) => !!start)).toEqual([true, true, true, false, false]);
            expect(starts[0].querySelector('.option-color').getAttribute('style')).toContain('rgb(200, 30, 30)');
            expect(starts[1].querySelector('.option-color').getAttribute('style')).toContain('#1e5fc8');
            expect(starts[1].querySelector('use').getAttribute('href')).toBe('#radio-option-tag');
            expect(starts[0].getAttribute('aria-hidden')).toBe('true');
        });

        it('checks an option for a click on its colour or on its icon, as for one on its label', async () => {
            const el = await decorated();

            await userEvent.click(optionOf(el, 0).querySelector('.option-color'));
            expect(optionOf(el, 0).querySelector('input').checked).toBe(true);
            await userEvent.click(optionOf(el, 2).querySelector('.option-icon'));
            expect(optionOf(el, 2).querySelector('input').checked).toBe(true);
        });

        it('passes axe with options that have a colour, an icon or both', async () => {
            const el = await decorated();

            const results = await axe.run(el);

            expect(results.violations).toEqual([]);
        });

        describe('where the user forces colours', () => {
            useForcedColors();

            it('keeps the colour of the dot: it is what the user finds the option by', async () => {
                const el = await decorated();

                expect(matchMedia('(forced-colors: active)').matches).toBe(true);
                expect(getComputedStyle(optionOf(el, 0).querySelector('.option-color')).backgroundColor).toBe(
                    'rgb(200, 30, 30)',
                );
            });
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(
                `<form><el-radio-field name="${name}" label="Plan" options='["free", "pro", "team"]' ${attributes}></el-radio-field></form>`,
            );

        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await nextFrame();
            await nextFrame();
        };

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

        // The checked attribute of a radio is only its default: once the user has chosen it, the
        // browser no longer follows the attribute.
        it('selects the option of a value that a script sets, also after the user has chosen every option', async () => {
            const form = await inForm('form-script', 'value="free"');
            const el = form.firstElementChild;
            const state = () => ({
                control: form.querySelector('input:checked')?.value ?? null,
                value: el.value,
                submitted: new FormData(form).get('form-script'),
            });

            for (const radio of form.querySelectorAll('input')) radio.click();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({ control: 'team', value: 'team', submitted: 'team' });

            el.value = 'free';
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({ control: 'free', value: 'free', submitted: 'free' });

            // No value: nothing is selected, and nothing is submitted. element-js writes the value
            // back as an empty attribute, so the field reads '' afterwards.
            el.value = null;
            await nextFrame();
            await nextFrame();
            expect([state().control, state().submitted]).toEqual([null, null]);
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

        it('goes back to the option it was rendered with when the form is reset', async () => {
            const form = await inForm('form-reset', 'value="pro" required="true" error-message="Choose a plan"');
            const el = form.firstElementChild;
            const state = () => ({
                control: form.querySelector('input:checked')?.value ?? null,
                value: el.value,
                submitted: new FormData(form).get('form-reset'),
                touched: el.touched,
                valid: el.valid,
            });
            const rendered = { control: 'pro', value: 'pro', submitted: 'pro', touched: false, valid: true };
            expect(state()).toEqual(rendered);

            const team = form.querySelector('input[value="team"]');
            team.focus();
            team.click();
            team.blur();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({ control: 'team', value: 'team', submitted: 'team', touched: true, valid: true });

            await reset(form);

            expect(state()).toEqual(rendered);
        });

        it('has no option selected after a reset when it was rendered so', async () => {
            const form = await inForm('form-reset-none', 'required="true" error-message="Choose a plan"');
            const el = form.firstElementChild;
            const state = () => ({
                control: form.querySelector('input:checked')?.value ?? null,
                value: el.value,
                touched: el.touched,
                valid: el.valid,
                message: el.querySelector('.error-message')?.textContent.trim() ?? null,
            });
            // A required group without a choice is not valid from the start, and says so once it is touched.
            const rendered = { control: null, value: null, touched: false, valid: false, message: null };
            expect(state()).toEqual(rendered);

            const pro = form.querySelector('input[value="pro"]');
            pro.focus();
            pro.click();
            pro.blur();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({ control: 'pro', value: 'pro', touched: true, valid: true, message: null });

            await reset(form);

            expect(state()).toEqual(rendered);
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
