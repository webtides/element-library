import { describe, it, expect } from 'vite-plus/test';
import { nextFrame } from '../../test-helpers.js';
import TextareaField, { define } from './textarea-field.js';

// These tests cover the time before `el-textarea-field` is defined, so the element must not be
// registered up front. A subclass under another tag is only used to call `template()`, which gives
// the same markup the SSR renderer writes into the element.
customElements.define('el-textarea-field-ssr-source', class extends TextareaField {});

const VALUE = 'a <b> & "c"\nline two';

const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('\n', '&#10;');

// The attribute of a property: `helpMessage` is `help-message`.
const dashed = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function serverRender(properties) {
    const source = document.createElement('el-textarea-field-ssr-source');
    Object.assign(source, source.properties(), properties);
    const attributes = Object.entries(properties)
        .map(([name, value]) => `${dashed(name)}="${escapeAttribute(String(value))}"`)
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
        expect(el.querySelector(`#${describedBy}`)).toBe(el.querySelector('.help-message'));
    });

    // The label and the help message of each field, as the browser connects them by id.
    const connections = (wrapper) =>
        [...wrapper.querySelectorAll('el-textarea-field')].map((el) => ({
            label: el.querySelector('label').control === control(el),
            help:
                document.getElementById(control(el).getAttribute('aria-describedby')) ===
                el.querySelector('.help-message'),
        }));
    const idsOf = (wrapper) => [...wrapper.querySelectorAll('[id]')].map((node) => node.id);
    const own = [
        { label: true, help: true },
        { label: true, help: true },
    ];
    const twoWithOneName = () =>
        mount(
            serverRender({ name: 'comment', label: 'First', helpMessage: 'First help' }) +
                serverRender({ name: 'comment', label: 'Second', helpMessage: 'Second help' }),
        ).closest('div');

    it('gives two fields with the same name ids of their own, before the element is defined', () => {
        const wrapper = twoWithOneName();

        expect(customElements.get('el-textarea-field')).toBeUndefined();
        expect(new Set(idsOf(wrapper)).size).toBe(idsOf(wrapper).length);
        expect(connections(wrapper)).toEqual(own);
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

    it('keeps the label and the help message of each field its own while the elements start', async () => {
        const wrapper = twoWithOneName();
        const serverControls = [...wrapper.querySelectorAll('textarea')];
        const serverIds = idsOf(wrapper);
        await frames();

        // The elements write their own ids to the markup of the server, and replace nothing.
        expect([...wrapper.querySelectorAll('textarea')]).toEqual(serverControls);
        expect(idsOf(wrapper).filter((id) => serverIds.includes(id))).toEqual([]);
        expect(new Set(idsOf(wrapper)).size).toBe(idsOf(wrapper).length);
        expect(connections(wrapper)).toEqual(own);
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
