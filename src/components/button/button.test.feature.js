import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './button.js';
define();

describe('Feature | Button', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-button>Click me</el-button>`);
        await nextFrame();
    });

    it('renders a native button by default', async () => {
        const el = await fixture(`<el-button>Click me</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.tagName).toBe('BUTTON');
        expect(control.getAttribute('type')).toBe('button');
    });

    it('renders an anchor when href is set', async () => {
        const el = await fixture(`<el-button href="https://example.com">Go</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.tagName).toBe('A');
        expect(control.getAttribute('href')).toBe('https://example.com');
        expect(control.getAttribute('role')).toBe('button');
    });

    it('reflects the disabled state onto the native button', async () => {
        const el = await fixture(`<el-button disabled="true">Nope</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.disabled).toBe(true);
    });

    it('drops href and disables the anchor while disabled', async () => {
        const el = await fixture(`<el-button href="https://example.com" disabled="true">Go</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.hasAttribute('href')).toBe(false);
        expect(control.getAttribute('aria-disabled')).toBe('true');
        expect(control.getAttribute('tabindex')).toBe('-1');
    });

    it('renders a spinner while loading', async () => {
        const el = await fixture(`<el-button loading="true">Saving</el-button>`);
        expect(el.shadowRoot.querySelector('[part="spinner"]')).not.toBeNull();
    });

    it('submits the nearest form when type=submit', async () => {
        const form = await fixture(`<form><el-button type="submit">Send</el-button></form>`);
        let submitted = false;
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            submitted = true;
        });
        const button = form.querySelector('el-button');
        button.shadowRoot.querySelector('[part="base"]').click();
        await nextFrame();
        expect(submitted).toBe(true);
    });

    it('leaves unset attributes out of the server-rendered markup', async () => {
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const controlTag = (el, tag) =>
            el
                .template()
                .toString()
                .match(new RegExp(`<${tag}\\s[^>]*>`))[0];

        const link = await fixture(`<el-button href="/docs">Docs</el-button>`);
        expect(controlTag(link, 'a')).toMatch(/\shref=['"]\/docs['"]/);
        // A stray `download` would make the browser save the target instead of navigating to it.
        expect(controlTag(link, 'a')).not.toMatch(/\s(target|rel|download)=/);

        const button = await fixture(`<el-button>Save</el-button>`);
        expect(controlTag(button, 'button')).not.toMatch(/\s(name|value)=/);
    });
});
