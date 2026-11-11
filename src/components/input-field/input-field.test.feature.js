import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
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

    it('has no detectable a11y violations when rendered with a label', async () => {
        const el = await fixture(`
            <el-input-field name="email" label="Email address"></el-input-field>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
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
