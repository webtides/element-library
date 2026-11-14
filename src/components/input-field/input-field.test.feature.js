import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { aTimeout, fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './input-field.js';
define();

const TEXT_ENTRY = {
    autocomplete: 'one-time-code',
    inputmode: 'numeric',
    enterkeyhint: 'done',
    autocapitalize: 'none',
    autocorrect: 'off',
    spellcheck: 'false',
};
const textEntryMarkup = Object.entries(TEXT_ENTRY)
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ');
const textEntryOn = (control) =>
    Object.fromEntries(
        Object.keys(TEXT_ENTRY)
            .filter((name) => control.hasAttribute(name))
            .map((name) => [name, control.getAttribute(name)]),
    );

// The markup the SSR renderer writes: it assigns the parsed attributes as properties and
// stringifies the template, without connecting the element.
function serverMarkup(properties) {
    const source = document.createElement('el-input-field');
    Object.assign(source, source.properties(), properties);
    return source.template().toString();
}
function serverControl(properties) {
    const wrapper = document.createElement('div');
    wrapper.setHTMLUnsafe(serverMarkup(properties));
    return wrapper.querySelector('input');
}

describe('Feature | InputField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-input-field></el-input-field>`);
        await nextFrame();
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-input-field name="hidden-field" label="Hidden" hidden></el-input-field>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('stacks the label, the help message, the control and the error message', async () => {
        const el = await fixture(`
            <el-input-field
                name="stacked-field"
                label="Email address"
                help-message="We only use it to sign you in."
                error-message="Please enter your email address."
                valid="false"
                touched="true"
            ></el-input-field>
        `);
        const tops = ['label', '.help-message', '.field', '.error-message'].map(
            (selector) => el.querySelector(selector).getBoundingClientRect().top,
        );
        expect(tops).toEqual([...tops].sort((a, b) => a - b));
        expect(new Set(tops).size).toBe(4);
    });

    it('has no detectable a11y violations when rendered with a label', async () => {
        const el = await fixture(`
            <el-input-field name="email" label="Email address"></el-input-field>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });

    // The danger colour is the default theme's: without a theme the message is `red`, 3.99 : 1 on white.
    it('announces its error message and has no a11y violations in the error state', async () => {
        const el = await fixture(`
            <el-input-field
                name="email"
                label="Email address"
                error-message="Enter an email address"
                valid="false"
                style="--el-color-danger: #dc2626"
            ></el-input-field>
        `);
        await nextFrame();
        const message = el.querySelector('.error-message');

        expect(message.textContent).toBe('Enter an email address');
        expect(message.getAttribute('role')).toBe('alert');
        expect(el.querySelector('input').getAttribute('aria-describedby').split(' ')).toContain(message.id);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('describes the input by the help message alone while there is no error', async () => {
        const el = await fixture(`
            <el-input-field name="email" label="Email address" error-message="Enter an email address"></el-input-field>
        `);
        await nextFrame();

        expect(el.querySelector('.error-message')).toBeNull();
        expect(el.querySelector('input').getAttribute('aria-describedby')).toBe('email-help-message');
    });

    it('passes the text entry attributes on to the input', async () => {
        const el = await fixture(`<el-input-field name="code" ${textEntryMarkup}></el-input-field>`);
        await nextFrame();

        expect(textEntryOn(el.querySelector('input'))).toEqual(TEXT_ENTRY);
    });

    it('renders no text entry attribute that is not set', async () => {
        const el = await fixture(`<el-input-field name="code"></el-input-field>`);
        await nextFrame();

        expect(textEntryOn(el.querySelector('input'))).toEqual({});
    });

    it('follows a text entry attribute that is added, changed or removed later', async () => {
        const el = await fixture(`<el-input-field name="code" autocomplete="username"></el-input-field>`);
        await nextFrame();
        const input = el.querySelector('input');

        el.setAttribute('inputmode', 'email');
        el.setAttribute('spellcheck', 'false');
        el.setAttribute('autocomplete', 'email');
        await nextFrame();
        await nextFrame();
        expect(textEntryOn(input)).toEqual({ autocomplete: 'email', inputmode: 'email', spellcheck: 'false' });

        el.removeAttribute('inputmode');
        el.removeAttribute('spellcheck');
        await nextFrame();
        await nextFrame();
        expect(textEntryOn(input)).toEqual({ autocomplete: 'email' });
    });

    it('mirrors an attribute that element-js writes back empty after it was removed', async () => {
        const el = await fixture(`<el-input-field name="code" autocomplete="username"></el-input-field>`);
        await nextFrame();

        // element-js reflects a property that came from an attribute, and reflects `null` as an
        // empty attribute. Removing such an attribute therefore leaves it empty on the element.
        el.removeAttribute('autocomplete');
        await nextFrame();
        await nextFrame();

        expect(el.getAttribute('autocomplete')).toBe('');
        expect(textEntryOn(el.querySelector('input'))).toEqual({ autocomplete: '' });
    });

    it('follows a text entry property that is set later', async () => {
        const el = await fixture(`<el-input-field name="code"></el-input-field>`);
        await nextFrame();

        el.enterkeyhint = 'next';
        el.spellcheck = false;
        await nextFrame();
        await nextFrame();

        expect(textEntryOn(el.querySelector('input'))).toEqual({ enterkeyhint: 'next', spellcheck: 'false' });
    });

    it('writes the text entry attributes into the server-rendered markup', () => {
        expect(textEntryOn(serverControl({ name: 'code', ...TEXT_ENTRY, spellcheck: false }))).toEqual(TEXT_ENTRY);
        expect(textEntryOn(serverControl({ name: 'code' }))).toEqual({});
    });

    it('keeps the server-rendered input and its text entry attributes when the element starts', async () => {
        const wrapper = document.createElement('div');
        document.body.append(wrapper);
        wrapper.setHTMLUnsafe(
            `<el-input-field name="code" ${textEntryMarkup}>${serverMarkup({ name: 'code', ...TEXT_ENTRY, spellcheck: false })}</el-input-field>`,
        );
        const el = wrapper.querySelector('el-input-field');
        const serverInput = el.querySelector('input');
        await nextFrame();
        await nextFrame();

        expect(el.querySelector('input')).toBe(serverInput);
        expect(textEntryOn(serverInput)).toEqual(TEXT_ENTRY);

        el.setAttribute('enterkeyhint', 'go');
        await nextFrame();
        await nextFrame();
        expect(textEntryOn(serverInput)).toEqual({ ...TEXT_ENTRY, enterkeyhint: 'go' });
    });

    // The SSR renderer parses the attributes itself (0.4.0) and renders "1.50" as the number 1.5.
    // The element takes the attribute as text and corrects the input when it starts.
    it('puts the text of its value attribute into server-rendered markup that has the parsed number', async () => {
        const wrapper = document.createElement('div');
        document.body.append(wrapper);
        wrapper.setHTMLUnsafe(
            `<el-input-field name="ssr-price" value="1.50">${serverMarkup({ name: 'ssr-price', value: 1.5 })}</el-input-field>`,
        );
        const el = wrapper.querySelector('el-input-field');
        const serverInput = el.querySelector('input');
        expect(serverInput.value).toBe('1.5');
        await nextFrame();
        await nextFrame();

        expect(el.querySelector('input')).toBe(serverInput);
        expect(serverInput.value).toBe('1.50');
        expect(el.value).toBe('1.50');
    });

    describe('with the cross of a field that is not valid', () => {
        // Text that is no address, typed with real keys. Once the field was left it is touched and
        // not valid, and renders the cross.
        const withCross = async (name, attributes = '') => {
            const form = await fixture(`
                <form><el-input-field name="${name}" type="email" label="Mail" ${attributes}></el-input-field></form>
            `);
            const el = form.firstElementChild;
            const input = el.querySelector('input');
            await userEvent.click(input);
            await userEvent.keyboard('abc');
            input.blur();
            await nextFrame();
            await nextFrame();
            const changes = [];
            el.addEventListener('input-change', (event) => changes.push(event.detail));
            return { form, el, input, changes };
        };
        const state = ({ form, el, input }) => ({
            control: input.value,
            value: el.value,
            submitted: new FormData(form).get(el.name),
            valid: el.valid,
            touched: el.touched,
        });
        const clear = async ({ el }, how) => {
            if (how === 'a click on the cross') await userEvent.click(el.querySelector('[data-clear-input]'));
            else el.clearInput();
            await nextFrame();
            await nextFrame();
        };

        for (const how of ['a click on the cross', 'clearInput()']) {
            it(`empties the control and the value of the field, and reports it, with ${how}`, async () => {
                const field = await withCross(`cross-${how.length}`);
                expect(state(field)).toEqual({
                    control: 'abc',
                    value: 'abc',
                    submitted: 'abc',
                    valid: false,
                    touched: true,
                });

                await clear(field, how);

                // No address is required, so the empty field is valid.
                expect(state(field)).toEqual({ control: '', value: '', submitted: '', valid: true, touched: false });
                expect(field.changes).toEqual(['']);
                expect(document.activeElement).toBe(field.input);
            });
        }

        it('leaves a required field not valid, and without its mark', async () => {
            const field = await withCross('cross-required', 'required="true"');

            await clear(field, 'a click on the cross');

            expect(state(field)).toEqual({ control: '', value: '', submitted: '', valid: false, touched: false });
            expect(field.el.querySelector('.validity')).toBeNull();
        });
    });

    describe('with text that goes into the middle of its value', () => {
        const caret = (input) => [input.selectionStart, input.selectionEnd];
        const withCaretAfterHello = async (name) => {
            const el = await fixture(
                `<el-input-field name="${name}" label="Greeting" value="Hello world"></el-input-field>`,
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
            fixture(`<form><el-input-field name="${name}" label="Email" ${attributes}></el-input-field></form>`);

        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await nextFrame();
            await nextFrame();
        };

        it('submits its value under its name', async () => {
            const form = await inForm('form-value', 'value="ada@example.com"');
            expect(data(form)).toEqual({ 'form-value': 'ada@example.com' });
        });

        it('submits a value that a script sets, and one that the user types', async () => {
            const form = await inForm('form-change', 'value="ada@example.com"');
            const el = form.firstElementChild;

            el.value = 'grace@example.com';
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'grace@example.com' });

            const control = el.querySelector('input');
            control.value = 'joan@example.com';
            control.dispatchEvent(new Event('change', { bubbles: true }));
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'joan@example.com' });
            expect(el.value).toBe('joan@example.com');
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
            const form = await inForm('form-disabled', 'value="ada@example.com" disabled="true"');
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and empty', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.firstElementChild.value = 'ada@example.com';
            await nextFrame();
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });

        it('goes back to the state it was rendered with when the form is reset', async () => {
            const form = await inForm(
                'form-reset',
                'value="ada@example.com" required="true" error-message="Enter an email address"',
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
                control: 'ada@example.com',
                value: 'ada@example.com',
                submitted: 'ada@example.com',
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
                message: 'Enter an email address',
            });

            await reset(form);

            expect(state()).toEqual(rendered);
        });

        it('is empty and not touched after a reset when it was rendered so', async () => {
            const form = await inForm('form-reset-empty', 'required="true" error-message="Enter an email address"');
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
            await userEvent.keyboard('grace');
            control.blur();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({ control: 'grace', value: 'grace', touched: true, valid: true, message: null });

            await reset(form);

            expect(state()).toEqual(rendered);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        const touchedField = async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-input-field name="email" label="Email"></el-input-field></div>
            `);
            const el = wrapper.querySelector('el-input-field');
            el.touched = true;
            await nextFrame();
            await nextFrame();
            return el;
        };

        it('makes the input at least --el-touch-target high', async () => {
            const el = await touchedField();
            expect(sizeOf(el.querySelector('input')).height).toBeGreaterThanOrEqual(44);
        });

        it('makes the clear cross at least --el-touch-target in both directions', async () => {
            const el = await touchedField();
            el.valid = false;
            await nextFrame();
            await nextFrame();
            const { width, height } = sizeOf(el.querySelector('[data-clear-input]'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });

        it('keeps the width of the input when the validity changes', async () => {
            const el = await touchedField();
            // As a theme does: the input takes the room that the mark beside it leaves.
            el.querySelector('input').style.width = '100%';
            const whileValid = sizeOf(el.querySelector('input')).width;
            el.valid = false;
            await nextFrame();
            await nextFrame();
            expect(sizeOf(el.querySelector('input')).width).toBe(whileValid);
        });
    });
});
