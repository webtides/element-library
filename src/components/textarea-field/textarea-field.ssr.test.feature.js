import { describe, it, expect } from 'vite-plus/test';
import { nextFrame } from '../../test-helpers.js';
import TextareaField, { define } from './textarea-field.js';

// These tests cover the time before `el-textarea-field` is defined, so the element must not be
// registered up front. A subclass under another tag is only used to call `template()`, which gives
// the same markup the SSR renderer writes into the element.
customElements.define('el-textarea-field-ssr-source', class extends TextareaField {});

const VALUE = 'a <b> & "c"\nline two';

const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('\n', '&#10;');

function serverRender(properties) {
    const source = document.createElement('el-textarea-field-ssr-source');
    Object.assign(source, source.properties(), properties);
    const attributes = Object.entries(properties)
        .map(([name, value]) => `${name}="${escapeAttribute(String(value))}"`)
        .join(' ');
    return `<form><el-textarea-field ${attributes}>${source.template().toString()}</el-textarea-field></form>`;
}

function mount(html) {
    const wrapper = document.createElement('div');
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-textarea-field');
}

const control = (el) => el.querySelector('textarea');

async function frames(count = 3) {
    for (let frame = 0; frame < count; frame++) await nextFrame();
}

// Order matters: the first two tests run while `el-textarea-field` is still undefined.
describe('Feature | TextareaField | server-rendered', () => {
    it('carries the value as the content of the textarea before the element is defined', () => {
        const el = mount(serverRender({ name: 'body', value: VALUE }));

        expect(customElements.get('el-textarea-field')).toBeUndefined();
        expect(control(el).value).toBe(VALUE);
        expect(control(el).hasAttribute('value')).toBe(false);
        expect(new FormData(el.closest('form')).get('body')).toBe(VALUE);
    });

    it('points aria-describedby at the help message', () => {
        const el = mount(serverRender({ name: 'notes' }));

        expect(customElements.get('el-textarea-field')).toBeUndefined();
        const describedBy = control(el).getAttribute('aria-describedby');
        expect(describedBy).toBe('notes-help-message');
        expect(el.querySelector(`#${describedBy}`)).toBe(el.querySelector('.help-message'));
    });

    it('keeps the server-rendered value and control while the element starts', async () => {
        const el = mount(serverRender({ name: 'body', value: VALUE }));
        const serverControl = control(el);

        define();
        await frames();

        expect(control(el)).toBe(serverControl);
        expect(el.value).toBe(VALUE);
        expect(control(el).value).toBe(VALUE);
    });

    it('shows a value that is set after the element has started', async () => {
        const el = mount(serverRender({ name: 'body', value: VALUE }));
        await frames();

        el.value = 'set later';
        await frames();

        expect(control(el).value).toBe('set later');
    });

    it('shows a value that is set after the user has edited the field', async () => {
        const el = mount(serverRender({ name: 'body', value: VALUE }));
        await frames();

        control(el).value = 'typed';
        control(el).dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
        await frames();
        expect(el.value).toBe('typed');

        el.value = 'set later';
        await frames();
        expect(control(el).value).toBe('set later');

        el.value = null;
        await frames();
        expect(control(el).value).toBe('');
    });

    it('does not overwrite text typed between a change and the next render', async () => {
        const el = mount(serverRender({ name: 'body', value: 'a' }));
        await frames();

        control(el).value = 'ab';
        control(el).dispatchEvent(new KeyboardEvent('keyup', { key: 'b' }));
        // The next key is already in the control, its keyup has not fired yet.
        control(el).value = 'abc';
        await frames();

        expect(el.value).toBe('ab');
        expect(control(el).value).toBe('abc');
    });
});
