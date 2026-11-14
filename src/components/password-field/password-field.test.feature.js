import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { aTimeout, fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './password-field.js';
define();

const passwordFixture = (attrs = '') =>
    fixture(`<el-password-field name="password" label="Password" ${attrs}></el-password-field>`);

describe('Feature | PasswordField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-password-field></el-password-field>`);
        await nextFrame();
    });

    it('renders a masked input with a reveal button by default', async () => {
        const el = await passwordFixture();
        expect(el.querySelector('input').getAttribute('type')).toBe('password');
        const toggle = el.querySelector('[data-password-toggle]');
        expect(toggle).not.toBeNull();
        expect(toggle.getAttribute('aria-label')).toBe('Show password');
        expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });

    it('reveals and re-masks the value when the toggle is clicked', async () => {
        const el = await passwordFixture();

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(el.passwordVisible).toBe(true);
        expect(el.querySelector('input').getAttribute('type')).toBe('text');
        expect(el.querySelector('[data-password-toggle]').getAttribute('aria-label')).toBe('Hide password');
        expect(el.querySelector('[data-password-toggle]').getAttribute('aria-pressed')).toBe('true');

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(el.passwordVisible).toBe(false);
        expect(el.querySelector('input').getAttribute('type')).toBe('password');
    });

    it('takes the two labels of the reveal button from show-label and hide-label', async () => {
        const el = await passwordFixture('show-label="Passwort anzeigen" hide-label="Passwort verbergen"');
        const label = () => el.querySelector('[data-password-toggle]').getAttribute('aria-label');
        expect(label()).toBe('Passwort anzeigen');

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(label()).toBe('Passwort verbergen');
    });

    it('omits the reveal button with password-toggle="false"', async () => {
        const el = await passwordFixture('password-toggle="false"');
        await nextFrame();
        expect(el.querySelector('[data-password-toggle]')).toBeNull();
        expect(el.querySelector('input').getAttribute('type')).toBe('password');
    });

    it('has no detectable a11y violations', async () => {
        const el = await passwordFixture('required="true"');
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    // The danger colour is the default theme's: without a theme the message is `red`, 3.99 : 1 on white.
    it('announces its error message and has no a11y violations in the error state', async () => {
        const el = await passwordFixture(
            'error-message="Enter your password" valid="false" style="--el-color-danger: #dc2626"',
        );
        await nextFrame();
        const message = el.querySelector('.error-message');

        expect(message.getAttribute('role')).toBe('alert');
        expect(el.querySelector('input').getAttribute('aria-describedby').split(' ')).toContain(message.id);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('keeps the text entry attributes on the input when the toggle renders it again', async () => {
        const el = await passwordFixture('autocomplete="new-password" autocapitalize="none" spellcheck="false"');
        const expected = { autocomplete: 'new-password', autocapitalize: 'none', spellcheck: 'false' };
        const onInput = () =>
            Object.fromEntries(
                Object.keys(expected).map((name) => [name, el.querySelector('input').getAttribute(name)]),
            );
        expect(onInput()).toEqual(expected);

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(el.querySelector('input').getAttribute('type')).toBe('text');
        expect(onInput()).toEqual(expected);

        el.querySelector('[data-password-toggle]').click();
        await nextFrame();
        expect(onInput()).toEqual(expected);
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(
            `<div style="--el-touch-target: 44px"><el-password-field name="password" label="Password"></el-password-field></div>`,
        );
        expect(sizeOf(wrapper.querySelector('[data-password-toggle]')).width).toBeLessThan(44);
    });

    it('empties the input and its value with the cross of a field that is not valid', async () => {
        const el = await passwordFixture('value="secret"');
        // As a page marks a field for an error that the server found.
        el.valid = false;
        await nextFrame();
        await nextFrame();
        const changes = [];
        el.addEventListener('input-change', (event) => changes.push(event.detail));

        await userEvent.click(el.querySelector('[data-clear-input]'));
        await nextFrame();
        await nextFrame();

        expect(el.querySelector('input').value).toBe('');
        expect(el.value).toBe('');
        expect(changes).toEqual(['']);
    });

    describe('with text that goes into the middle of its value', () => {
        const caret = (input) => [input.selectionStart, input.selectionEnd];
        const withCaretAfterHello = async (name) => {
            const el = await fixture(
                `<el-password-field name="${name}" label="Greeting" value="Hello world"></el-password-field>`,
            );
            await nextFrame();
            const input = el.querySelector('input');
            input.focus();
            input.setSelectionRange(5, 5);
            return { el, input };
        };

        it('keeps the caret where it is while keys are typed', async () => {
            const { el, input } = await withCaretAfterHello('caret-keys');

            await userEvent.keyboard('XY');
            await nextFrame();
            await nextFrame();

            expect(input.value).toBe('HelloXY world');
            expect(el.value).toBe('HelloXY world');
            expect(caret(input)).toEqual([7, 7]);
        });

        it('keeps the caret where it is when two characters come within one frame', async () => {
            const { el, input } = await withCaretAfterHello('caret-frame');

            // Fast typing, a key that repeats, a script that types: the field has seen the second
            // character before it has rendered for the first.
            for (const character of ['X', 'Y']) {
                input.setRangeText(character, input.selectionStart, input.selectionEnd, 'end');
                input.dispatchEvent(new InputEvent('input', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup', { key: character, bubbles: true }));
            }
            await nextFrame();
            await nextFrame();

            expect(input.value).toBe('HelloXY world');
            expect(el.value).toBe('HelloXY world');
            expect(caret(input)).toEqual([7, 7]);
        });

        it('keeps text that no key brought when the field renders for another reason', async () => {
            const { el, input } = await withCaretAfterHello('caret-render');

            // A paste with the mouse: the input has the text, and the field does not know it yet.
            input.setRangeText(', dear', 5, 5, 'end');
            input.dispatchEvent(new InputEvent('input', { bubbles: true }));
            el.label = 'Salutation';
            await nextFrame();
            await nextFrame();

            expect(el.querySelector('label').textContent.trim()).toBe('Salutation');
            expect(input.value).toBe('Hello, dear world');
            expect(caret(input)).toEqual([11, 11]);
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(
                `<form><el-password-field name="${name}" label="Password" ${attributes}></el-password-field></form>`,
            );

        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await nextFrame();
            await nextFrame();
        };

        it('submits its value under its name', async () => {
            const form = await inForm('form-value', 'value="first-secret"');
            expect(data(form)).toEqual({ 'form-value': 'first-secret' });
        });

        it('submits a value that a script sets, and one that the user types', async () => {
            const form = await inForm('form-change', 'value="first-secret"');
            const el = form.firstElementChild;

            el.value = 'second-secret';
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'second-secret' });

            const control = el.querySelector('input');
            control.value = 'third-secret';
            control.dispatchEvent(new Event('change', { bubbles: true }));
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'third-secret' });
            expect(el.value).toBe('third-secret');
        });

        it('shows and submits a value that a script sets after the user has typed', async () => {
            const form = await inForm('form-after-typing', 'value="first"');
            const el = form.firstElementChild;
            const control = el.querySelector('input');
            control.focus();
            control.setSelectionRange(5, 5);
            await userEvent.keyboard('x');
            await nextFrame();
            await nextFrame();
            expect([control.value, el.value]).toEqual(['firstx', 'firstx']);

            // The value attribute of the input is its default, which the browser no longer shows now.
            el.value = 'outside';
            await nextFrame();
            await nextFrame();

            expect(control.value).toBe('outside');
            expect(data(form)).toEqual({ 'form-after-typing': 'outside' });
            expect(el.value).toBe('outside');

            // And the user goes on from there.
            await userEvent.keyboard('!');
            await nextFrame();
            await nextFrame();
            expect([control.value, el.value]).toEqual(['outside!', 'outside!']);
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="first-secret" disabled="true"');
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and empty', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.firstElementChild.value = 'first-secret';
            await nextFrame();
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });

        it('goes back to the state it was rendered with when the form is reset', async () => {
            const form = await inForm(
                'form-reset',
                'value="first-secret" required="true" error-message="Enter a password"',
            );
            const el = form.firstElementChild;
            const control = el.querySelector('input');
            const state = () => ({
                control: control.value,
                value: el.value,
                submitted: new FormData(form).get('form-reset'),
                touched: el.touched,
                valid: el.valid,
                message: el.querySelector('.error-message')?.textContent.trim() ?? null,
            });
            // A field that is rendered with a value is touched from the start.
            const rendered = {
                control: 'first-secret',
                value: 'first-secret',
                submitted: 'first-secret',
                touched: true,
                valid: true,
                message: null,
            };
            expect(state()).toEqual(rendered);

            await userEvent.click(control);
            control.select();
            await userEvent.keyboard('{Backspace}');
            control.blur();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({
                control: '',
                value: '',
                submitted: '',
                touched: true,
                valid: false,
                message: 'Enter a password',
            });

            await reset(form);

            expect(state()).toEqual(rendered);
        });

        it('is empty and not touched after a reset when it was rendered so', async () => {
            const form = await inForm('form-reset-empty', 'required="true" error-message="Enter a password"');
            const el = form.firstElementChild;
            const control = el.querySelector('input');
            const state = () => ({
                control: control.value,
                value: el.value,
                touched: el.touched,
                valid: el.valid,
                message: el.querySelector('.error-message')?.textContent.trim() ?? null,
            });
            const rendered = { control: '', value: null, touched: false, valid: true, message: null };
            expect(state()).toEqual(rendered);

            await userEvent.click(control);
            await userEvent.keyboard('other');
            control.blur();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({ control: 'other', value: 'other', touched: true, valid: true, message: null });

            await reset(form);

            expect(state()).toEqual(rendered);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the toggle and the input at least --el-touch-target', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-password-field name="password" label="Password"></el-password-field></div>`,
            );
            const toggle = sizeOf(wrapper.querySelector('[data-password-toggle]'));
            expect(Math.min(toggle.width, toggle.height)).toBeGreaterThanOrEqual(44);
            expect(sizeOf(wrapper.querySelector('input')).height).toBeGreaterThanOrEqual(44);
        });
    });
});
