import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './form-field.js';
import { define as defineInputField } from '../input-field/input-field.js';
import { define as definePasswordField } from '../password-field/password-field.js';
import { define as defineTextareaField } from '../textarea-field/textarea-field.js';
import { define as defineSelectField } from '../select-field/select-field.js';
import { define as defineCheckboxField } from '../checkbox-field/checkbox-field.js';
import { define as defineSwitchField } from '../switch-field/switch-field.js';
import { define as defineRadioField } from '../radio-field/radio-field.js';
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
                switch: 'input',
                radio: 'fieldset',
            };
            for (const kind of Object.keys(MESSAGES)) {
                const message = refused.fieldOf(kind).querySelector('.error-message');
                expect([kind, message.getAttribute('role')]).toEqual([kind, 'alert']);
                // The checkbox does not name its message yet, after a blur either.
                if (!describedBy[kind]) continue;
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
    });
});
