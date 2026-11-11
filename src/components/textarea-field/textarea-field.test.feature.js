import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame } from '../../test-helpers.js';
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
});
