import { describe, it, expect, beforeAll, afterAll } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { aTimeout, fixture, nextFrame } from '../../test-helpers.js';
import { define } from './form-field.js';
import { define as defineInputField } from '../input-field/input-field.js';
import { define as definePasswordField } from '../password-field/password-field.js';
import { define as defineTextareaField } from '../textarea-field/textarea-field.js';
import { define as defineSelectField } from '../select-field/select-field.js';
import { define as defineCheckboxField } from '../checkbox-field/checkbox-field.js';
import { define as defineSwitchField } from '../switch-field/switch-field.js';
import { define as defineRadioField } from '../radio-field/radio-field.js';
import defaultTheme from '../../themes/default.css?raw';
import highContrastTheme from '../../themes/high-contrast.css?raw';
import sketchyTheme from '../../themes/sketchy.css?raw';
define();
defineInputField();
definePasswordField();
defineTextareaField();
defineSelectField();
defineCheckboxField();
defineSwitchField();
defineRadioField();

const frames = async () => {
    await nextFrame();
    await nextFrame();
};
// After a reset: the field goes back a task after the event, and its control with the render after that.
const settled = async () => {
    await aTimeout(0);
    await frames();
};

describe('Feature | FormField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-form-field></el-form-field>`);
        await nextFrame();
    });

    // element-js keeps the stylesheets of an element on its class. A field used to find the ones of
    // its parent class there, when that one was connected first, and never built its own.
    it('lets every field have its own stylesheet when its parent class was connected first', async () => {
        await fixture(`<el-form-field name="sheets-base"></el-form-field>`);
        const input = await fixture(`<el-input-field name="sheets-input" label="Name"></el-input-field>`);
        const password = await fixture(
            `<el-password-field name="sheets-password" label="Password"></el-password-field>`,
        );

        // From the stylesheet of el-input-field: the field is a column.
        expect(getComputedStyle(input).display).toBe('flex');
        // From the stylesheet of el-password-field: the toggle has no border of a native button.
        expect(getComputedStyle(password.querySelector('.password-toggle')).borderTopStyle).toBe('none');
    });

    describe('when the browser refuses to submit the form', () => {
        // Every field that takes part in a form, required and empty, and one that is valid. Not one of
        // them was touched.
        const MESSAGES = {
            input: 'Enter a name',
            password: 'Enter a password',
            textarea: 'Enter a note',
            select: 'Pick a size',
            checkbox: 'Accept the terms',
            switch: 'Give your consent',
            radio: 'Choose a plan',
        };
        const emptyForm = async (prefix, attributes = '') => {
            const form = await fixture(`
                <form ${attributes}>
                    <el-input-field name="${prefix}-input" label="Name" required="true" error-message="${MESSAGES.input}"></el-input-field>
                    <el-password-field name="${prefix}-password" label="Password" required="true" error-message="${MESSAGES.password}"></el-password-field>
                    <el-textarea-field name="${prefix}-textarea" label="Note" required="true" error-message="${MESSAGES.textarea}"></el-textarea-field>
                    <el-select-field name="${prefix}-select" label="Size" placeholder="Pick" required="true" options='["S", "M"]' error-message="${MESSAGES.select}"></el-select-field>
                    <el-checkbox-field name="${prefix}-checkbox" label="Terms" required="true" error-message="${MESSAGES.checkbox}"></el-checkbox-field>
                    <el-switch-field name="${prefix}-switch" label="Consent" required="true" error-message="${MESSAGES.switch}"></el-switch-field>
                    <el-radio-field name="${prefix}-radio" label="Plan" required="true" options='["free", "pro"]' error-message="${MESSAGES.radio}"></el-radio-field>
                    <el-input-field name="${prefix}-valid" label="City" value="Berlin" error-message="Enter a city"></el-input-field>
                    <button type="submit">Send</button>
                </form>
            `);
            const submits = [];
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits.push(event);
            });
            const fieldOf = (kind) => form.querySelector(`[name="${prefix}-${kind}"]`);
            return { form, submits, fieldOf };
        };
        const messageOf = (field) => field.querySelector('.error-message')?.textContent.trim() ?? null;
        const shown = ({ fieldOf }) =>
            Object.fromEntries(Object.keys(MESSAGES).map((kind) => [kind, messageOf(fieldOf(kind))]));
        const nothingShown = Object.fromEntries(Object.keys(MESSAGES).map((kind) => [kind, null]));

        it('shows the error message of every field that is not valid', async () => {
            const refused = await emptyForm('refused');
            expect(shown(refused)).toEqual(nothingShown);

            // What el-button type="submit" does.
            refused.form.requestSubmit();
            await frames();

            expect(refused.submits).toHaveLength(0);
            expect(shown(refused)).toEqual(MESSAGES);
            for (const kind of Object.keys(MESSAGES)) {
                expect([kind, refused.fieldOf(kind).touched, refused.fieldOf(kind).valid]).toEqual([kind, true, false]);
            }
            // The field that is valid shows nothing.
            expect(messageOf(refused.fieldOf('valid'))).toBe(null);
            expect(refused.fieldOf('valid').valid).toBe(true);
        });

        it('shows them for a click on the submit button, and leaves the bubble to the browser', async () => {
            const refused = await emptyForm('refused-click');

            await userEvent.click(refused.form.querySelector('button[type="submit"]'));
            await frames();

            expect(shown(refused)).toEqual(MESSAGES);
            // The event is not cancelled: the browser focuses the first control that is not valid,
            // where it shows its bubble.
            expect(document.activeElement).toBe(refused.fieldOf('input').querySelector('input'));
        });

        it('shows them for Enter in a field', async () => {
            const refused = await emptyForm('refused-enter');

            await userEvent.click(refused.fieldOf('valid').querySelector('input'));
            await userEvent.keyboard('{Enter}');
            await frames();

            expect(shown(refused)).toEqual(MESSAGES);
        });

        it('announces the message like the one that appears when the field is left', async () => {
            const refused = await emptyForm('refused-announced');

            refused.form.requestSubmit();
            await frames();

            const describedBy = {
                input: 'input',
                password: 'input',
                textarea: 'textarea',
                select: 'select',
                checkbox: 'input',
                switch: 'input',
                radio: 'fieldset',
            };
            for (const kind of Object.keys(MESSAGES)) {
                const message = refused.fieldOf(kind).querySelector('.error-message');
                expect([kind, message.getAttribute('role')]).toEqual([kind, 'alert']);
                const control = refused.fieldOf(kind).querySelector(describedBy[kind]);
                expect(control.getAttribute('aria-describedby').split(' ')).toContain(message.id);
            }
        });

        it('takes the message away once the field is valid', async () => {
            const refused = await emptyForm('refused-fixed');
            refused.form.requestSubmit();
            await frames();

            await userEvent.type(refused.fieldOf('input').querySelector('input'), 'Ada');
            await frames();

            expect(messageOf(refused.fieldOf('input'))).toBe(null);
            expect(refused.fieldOf('input').valid).toBe(true);
            expect(messageOf(refused.fieldOf('password'))).toBe(MESSAGES.password);
        });

        it('leaves the fields alone when a script only asks whether the form is valid', async () => {
            const asked = await emptyForm('asked');

            expect(asked.form.checkValidity()).toBe(false);
            expect(asked.form.reportValidity()).toBe(false);
            await frames();

            expect(shown(asked)).toEqual(nothingShown);
            for (const kind of Object.keys(MESSAGES)) {
                expect([kind, asked.fieldOf(kind).touched]).toEqual([kind, false]);
            }
        });

        it('leaves the fields alone in a form with novalidate, which is submitted', async () => {
            const unchecked = await emptyForm('novalidate', 'novalidate');

            unchecked.form.requestSubmit();
            await frames();

            expect(unchecked.submits).toHaveLength(1);
            expect(shown(unchecked)).toEqual(nothingShown);
            for (const kind of Object.keys(MESSAGES)) {
                expect([kind, unchecked.fieldOf(kind).touched]).toEqual([kind, false]);
            }
        });

        it('takes the messages away again when the form is reset', async () => {
            const refused = await emptyForm('refused-reset');
            refused.form.requestSubmit();
            await frames();
            expect(shown(refused)).toEqual(MESSAGES);

            refused.form.reset();
            await settled();

            expect(shown(refused)).toEqual(nothingShown);
            for (const kind of Object.keys(MESSAGES)) {
                expect([kind, refused.fieldOf(kind).touched]).toEqual([kind, false]);
            }
        });
    });

    describe('with an error message', () => {
        // Every field that shows one, touched and not valid. The radio group works out itself whether
        // it is valid: it is required here, and nothing is selected.
        const FIELDS = {
            'el-input-field': '',
            'el-password-field': '',
            'el-textarea-field': '',
            'el-select-field': `options='["S", "M"]'`,
            'el-checkbox-field': '',
            'el-switch-field': '',
            'el-radio-field': `options='["free", "pro"]' required="true"`,
        };
        const withMessage = (tag, name) =>
            `<${tag} name="${name}" label="Field" error-message="Not like this" valid="false" touched="true" ${FIELDS[tag]}></${tag}>`;
        const colorOf = (field) => getComputedStyle(field.querySelector('.error-message')).color;

        for (const tag of Object.keys(FIELDS)) {
            it(`has the danger colour of the theme, and the colour of the text without one, in ${tag}`, async () => {
                const wrapper = await fixture(`
                    <div style="color: rgb(10, 20, 30)">
                        <div style="--el-color-danger: rgb(200, 0, 0)">${withMessage(tag, `message-${tag}-themed`)}</div>
                        <div>${withMessage(tag, `message-${tag}-plain`)}</div>
                    </div>
                `);
                await frames();
                const [themed, plain] = wrapper.querySelectorAll(tag);

                expect(themed.querySelector('.error-message').textContent.trim()).toBe('Not like this');
                expect(colorOf(themed)).toBe('rgb(200, 0, 0)');
                expect(colorOf(plain)).toBe('rgb(10, 20, 30)');
            });
        }

        // The message is small text: 4.5 : 1 against the background of the theme.
        for (const [name, theme] of [
            ['default', defaultTheme],
            ['high-contrast', highContrastTheme],
            ['sketchy', sketchyTheme],
        ]) {
            describe(`in the ${name} theme`, () => {
                let style;
                beforeAll(() => {
                    style = document.createElement('style');
                    style.textContent = theme;
                    document.head.append(style);
                });
                afterAll(() => style.remove());

                for (const scheme of ['light', 'dark']) {
                    it(`can be read in every field, in a ${scheme} scheme`, async () => {
                        const wrapper = await fixture(`
                            <div style="color-scheme: ${scheme}; background: var(--el-color-bg); color: var(--el-color-fg); padding: 8px">
                                ${Object.keys(FIELDS)
                                    .map((tag) => withMessage(tag, `contrast-${name}-${scheme}-${tag}`))
                                    .join('')}
                            </div>
                        `);
                        await frames();
                        const messages = [...wrapper.querySelectorAll('.error-message')];
                        expect(messages).toHaveLength(7);
                        // All seven have the colour of the theme, which is not the colour of the text.
                        expect(new Set(messages.map((message) => getComputedStyle(message).color)).size).toBe(1);
                        expect(getComputedStyle(messages[0]).color).not.toBe(getComputedStyle(wrapper).color);

                        const results = await axe.run({ include: messages }, { runOnly: ['color-contrast'] });

                        expect(results.violations.map((violation) => violation.nodes.map((node) => node.html))).toEqual(
                            [],
                        );
                        expect(results.passes.flatMap((pass) => pass.nodes)).toHaveLength(7);
                    });
                }
            });
        }
    });

    describe('with a value attribute that reads as a number or as JSON', () => {
        // element-js parses an attribute before it becomes a property: these would arrive as 1.5,
        // as a number without its last digits, as 1000, as an array, an object, and so on.
        const VALUES = ['1.50', '12345678901234567890', '1e3', '[1]', '{"a":1}', '007', 'true', 'null'];
        const data = (form) => Object.fromEntries(new FormData(form));

        for (const tag of ['el-input-field', 'el-password-field', 'el-textarea-field']) {
            it(`shows and submits the text as it is, in ${tag}`, async () => {
                const form = await fixture(
                    `<form>${VALUES.map((value, index) => `<${tag} name="text-${tag}-${index}" value='${value}'></${tag}>`).join('')}</form>`,
                );
                const fields = [...form.children];

                expect(fields.map((field) => field.querySelector('input, textarea').value)).toEqual(VALUES);
                expect(fields.map((field) => field.value)).toEqual(VALUES);
                expect(Object.values(data(form))).toEqual(VALUES);
            });
        }

        it('takes a value attribute that is set later as text as well', async () => {
            const el = await fixture(`<el-input-field name="text-later" value="first"></el-input-field>`);

            el.setAttribute('value', '2.50');
            await frames();

            expect(el.value).toBe('2.50');
            expect(el.querySelector('input').value).toBe('2.50');
        });

        it('selects the option whose value is that text, in el-select-field and el-radio-field', async () => {
            const price = `value="1.50" options='["0.50", "1.50", "2.50"]'`;
            const id = `value="12345678901234567890" options='["1", "12345678901234567890"]'`;
            const form = await fixture(`
                <form>
                    <el-select-field name="text-select-price" label="Price" ${price}></el-select-field>
                    <el-select-field name="text-select-id" label="Id" ${id}></el-select-field>
                    <el-radio-field name="text-radio-price" label="Price" ${price}></el-radio-field>
                    <el-radio-field name="text-radio-id" label="Id" ${id}></el-radio-field>
                </form>
            `);
            await frames();

            expect(data(form)).toEqual({
                'text-select-price': '1.50',
                'text-select-id': '12345678901234567890',
                'text-radio-price': '1.50',
                'text-radio-id': '12345678901234567890',
            });
            expect([...form.children].map((field) => field.value)).toEqual([
                '1.50',
                '12345678901234567890',
                '1.50',
                '12345678901234567890',
            ]);
        });

        it('submits that text while it is checked, in el-checkbox-field and el-switch-field', async () => {
            const form = await fixture(`
                <form>
                    <el-checkbox-field name="text-checkbox" label="Price" value="1.50" checked="true"></el-checkbox-field>
                    <el-switch-field name="text-switch" label="Price" value="1.50" checked="true"></el-switch-field>
                </form>
            `);

            expect(data(form)).toEqual({ 'text-checkbox': '1.50', 'text-switch': '1.50' });
        });
    });

    // Every field has a test of its own for what it goes back to. Here: what they share.
    describe('when the form is reset', () => {
        const filledForm = async (prefix) => {
            const form = await fixture(`
                <form>
                    <el-input-field name="${prefix}-name" label="Name" value="Ada"></el-input-field>
                    <el-checkbox-field name="${prefix}-terms" label="Terms" value="yes"></el-checkbox-field>
                    <button type="reset">Start over</button>
                </form>
            `);
            const name = form.querySelector('el-input-field');
            const terms = form.querySelector('el-checkbox-field');
            const state = () => ({
                name: [name.querySelector('input').value, name.value],
                terms: [terms.querySelector('input').checked, terms.checked],
            });
            // What a user does: another name, and a check.
            const change = async () => {
                const input = name.querySelector('input');
                await userEvent.click(input);
                input.select();
                await userEvent.keyboard('Grace');
                // The label is the hit area of the checkbox: its indicator lies over the input.
                await userEvent.click(terms.querySelector('label'));
                await frames();
            };
            return { form, name, terms, state, change };
        };
        const RENDERED = { name: ['Ada', 'Ada'], terms: [false, false] };
        const CHANGED = { name: ['Grace', 'Grace'], terms: [true, true] };

        it('puts the fields back for a click on a reset button', async () => {
            const { form, state, change } = await filledForm('reset-click');
            await change();
            expect(state()).toEqual(CHANGED);

            await userEvent.click(form.querySelector('button[type="reset"]'));
            await settled();

            expect(state()).toEqual(RENDERED);
            expect(Object.fromEntries(new FormData(form))).toEqual({ 'reset-click-name': 'Ada' });
        });

        it('reports the value a field goes back to', async () => {
            const { form, change } = await filledForm('reset-reported');
            await change();
            const changes = [];
            form.addEventListener('input-change', (event) => changes.push([event.target.localName, event.detail]));

            form.reset();
            await settled();

            expect(changes).toEqual([
                ['el-input-field', 'Ada'],
                ['el-checkbox-field', 'yes'],
            ]);
        });

        it('changes nothing when the reset is cancelled, by a listener that comes after the fields', async () => {
            const { form, state, change } = await filledForm('reset-cancelled');
            await change();
            // The fields listen at the root of their tree. This listener was added there after them.
            const cancel = (event) => event.target === form && event.preventDefault();
            document.addEventListener('reset', cancel);

            form.reset();
            await settled();
            document.removeEventListener('reset', cancel);

            expect(state()).toEqual(CHANGED);
        });

        it('leaves the fields of another form alone', async () => {
            const { state, change } = await filledForm('reset-other');
            const other = await fixture(`<form><el-input-field name="reset-other-form"></el-input-field></form>`);
            await change();

            other.reset();
            await settled();

            expect(state()).toEqual(CHANGED);
        });

        it('leaves a field alone that was taken out of the form', async () => {
            const { form, name, state, change } = await filledForm('reset-removed');
            await change();
            const changed = state();
            name.remove();

            form.reset();
            await settled();

            expect(state().name).toEqual(changed.name);
        });

        it('shows the error again that a field was rendered with', async () => {
            const form = await fixture(`
                <form>
                    <el-input-field
                        name="reset-server-error"
                        label="Email"
                        value="ada@example.com"
                        valid="false"
                        error-message="This address is taken"
                    ></el-input-field>
                </form>
            `);
            const field = form.firstElementChild;
            const input = field.querySelector('input');
            const message = () => field.querySelector('.error-message')?.textContent.trim() ?? null;
            expect(message()).toBe('This address is taken');

            // The field asks its control once the user types: the new address is fine.
            await userEvent.click(input);
            input.select();
            await userEvent.keyboard('grace@example.com');
            await frames();
            expect(message()).toBe(null);

            form.reset();
            await settled();

            expect(input.value).toBe('ada@example.com');
            expect(message()).toBe('This address is taken');
        });

        it('follows the reset of a form in a shadow root', async () => {
            const host = await fixture(`<div></div>`);
            const root = host.attachShadow({ mode: 'open' });
            root.setHTMLUnsafe(
                `<form><el-input-field name="reset-shadow" label="Name" value="Ada"></el-input-field></form>`,
            );
            await frames();
            const field = root.querySelector('el-input-field');
            const input = field.querySelector('input');
            await userEvent.click(input);
            input.select();
            await userEvent.keyboard('Grace');
            await frames();
            expect([input.value, field.value]).toEqual(['Grace', 'Grace']);

            root.querySelector('form').reset();
            await settled();

            expect([input.value, field.value]).toEqual(['Ada', 'Ada']);
        });
    });
});
