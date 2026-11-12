import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './textarea-field.js';
define();

describe('Feature | TextareaField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-textarea-field></el-textarea-field>`);
        await nextFrame();
    });

    it('renders the value as the content of the textarea', async () => {
        const el = await fixture(`<el-textarea-field name="body" value="Milk"></el-textarea-field>`);
        await nextFrame();
        const textarea = el.querySelector('textarea');

        expect(textarea.value).toBe('Milk');
        expect(textarea.textContent).toBe('Milk');
        expect(textarea.hasAttribute('value')).toBe(false);
    });

    it('renders an empty textarea without a value', async () => {
        const el = await fixture(`<el-textarea-field name="body"></el-textarea-field>`);
        await nextFrame();

        expect(el.querySelector('textarea').value).toBe('');
    });

    it('shows a value set through the property, line breaks and markup characters included', async () => {
        const el = await fixture(`<el-textarea-field name="body" value="Milk"></el-textarea-field>`);
        await nextFrame();

        el.value = 'a <b> & "c"\nline two';
        await nextFrame();
        await nextFrame();

        expect(el.querySelector('textarea').value).toBe('a <b> & "c"\nline two');
    });

    it('points aria-describedby at the help message', async () => {
        const el = await fixture(`
            <el-textarea-field name="body" label="Body" help-message="Up to 500 characters"></el-textarea-field>
        `);
        await nextFrame();
        const describedBy = el.querySelector('textarea').getAttribute('aria-describedby');

        expect(el.querySelector(`#${describedBy}`).textContent).toBe('Up to 500 characters');
    });

    it('has no detectable a11y violations when rendered with a label', async () => {
        const el = await fixture(`
            <el-textarea-field name="message" label="Message" help-message="Up to 500 characters"></el-textarea-field>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });

    it('passes the text entry attributes on to the textarea', async () => {
        const el = await fixture(`
            <el-textarea-field
                name="body"
                autocomplete="off"
                inputmode="text"
                enterkeyhint="enter"
                autocapitalize="sentences"
                autocorrect="on"
                spellcheck="true"
            ></el-textarea-field>
        `);
        await nextFrame();
        const textarea = el.querySelector('textarea');

        expect(textarea.getAttribute('autocomplete')).toBe('off');
        expect(textarea.getAttribute('inputmode')).toBe('text');
        expect(textarea.getAttribute('enterkeyhint')).toBe('enter');
        expect(textarea.getAttribute('autocapitalize')).toBe('sentences');
        expect(textarea.getAttribute('autocorrect')).toBe('on');
        expect(textarea.getAttribute('spellcheck')).toBe('true');
    });

    it('renders no text entry attribute that is not set', async () => {
        const el = await fixture(`<el-textarea-field name="body"></el-textarea-field>`);
        await nextFrame();
        const textarea = el.querySelector('textarea');

        for (const name of [
            'autocomplete',
            'inputmode',
            'enterkeyhint',
            'autocapitalize',
            'autocorrect',
            'spellcheck',
        ]) {
            expect(textarea.hasAttribute(name), name).toBe(false);
        }
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(
                `<form><el-textarea-field name="${name}" label="Message" ${attributes}></el-textarea-field></form>`,
            );

        it('submits its value under its name', async () => {
            const form = await inForm('form-value', 'value="First draft"');
            expect(data(form)).toEqual({ 'form-value': 'First draft' });
        });

        it('submits a value that a script sets, and one that the user types', async () => {
            const form = await inForm('form-change', 'value="First draft"');
            const el = form.firstElementChild;

            el.value = 'Second draft';
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'Second draft' });

            const control = el.querySelector('textarea');
            control.value = 'Third draft';
            control.dispatchEvent(new Event('change', { bubbles: true }));
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'Third draft' });
            expect(el.value).toBe('Third draft');
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="First draft" disabled="true"');
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and empty', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.firstElementChild.value = 'First draft';
            await nextFrame();
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the textarea and the clear cross at least --el-touch-target', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-textarea-field name="note" label="Note" rows="1"></el-textarea-field>
                </div>
            `);
            const el = wrapper.querySelector('el-textarea-field');
            el.touched = true;
            el.valid = false;
            await nextFrame();
            await nextFrame();

            expect(sizeOf(el.querySelector('textarea')).height).toBeGreaterThanOrEqual(44);
            const { width, height } = sizeOf(el.querySelector('[data-clear-input]'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });
    });
});
