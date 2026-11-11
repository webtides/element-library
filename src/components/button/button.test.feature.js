import { describe, it, expect } from 'vite-plus/test';
import { fixture, forcePseudoClasses, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
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

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px"><el-button size="small">OK</el-button></div>
        `);
        const control = wrapper.querySelector('el-button').shadowRoot.querySelector('[part="base"]');
        expect(sizeOf(control).height).toBe(32);
    });

    it('shows a pressed style without a touch screen', async () => {
        const el = await fixture(`<el-button variant="primary">Save</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(getComputedStyle(control).filter).toBe('none');

        // The hover style is not checked: it needs a pointer that can hover, and a page does not
        // get one back everywhere after a touch screen test (see useTouchScreen).
        await forcePseudoClasses(control, ['active']);
        expect(getComputedStyle(control).filter).toBe('brightness(0.88)');
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('is at least --el-touch-target in both directions, whatever its size and shape', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-button size="small">a</el-button>
                    <el-button>a</el-button>
                    <el-button size="large">a</el-button>
                    <el-button size="small" circle="true">a</el-button>
                    <el-button circle="true">a</el-button>
                    <el-button size="large" circle="true">a</el-button>
                    <el-button size="small" variant="text">a</el-button>
                    <el-button size="small" href="#target">a</el-button>
                </div>
            `);
            for (const button of wrapper.querySelectorAll('el-button')) {
                const { width, height } = sizeOf(button.shadowRoot.querySelector('[part="base"]'));
                expect(Math.min(width, height), button.outerHTML).toBeGreaterThanOrEqual(44);
            }
        });

        it('keeps a circle round', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-button size="small" circle="true">a</el-button></div>
            `);
            const control = wrapper.querySelector('el-button').shadowRoot.querySelector('[part="base"]');
            expect(sizeOf(control)).toEqual({ width: 44, height: 44 });
        });

        it('keeps its size without --el-touch-target', async () => {
            const el = await fixture(`<el-button size="small">OK</el-button>`);
            expect(sizeOf(el.shadowRoot.querySelector('[part="base"]')).height).toBe(32);
        });

        it('shows a pressed style, and no hover style for the :hover that a tap leaves behind', async () => {
            const el = await fixture(`<el-button variant="primary">Save</el-button>`);
            const control = el.shadowRoot.querySelector('[part="base"]');

            // A touch screen keeps :hover on the element that was tapped last.
            await forcePseudoClasses(control, ['hover']);
            expect(control.matches(':hover')).toBe(true);
            expect(getComputedStyle(control).filter).toBe('none');

            await forcePseudoClasses(control, ['hover', 'active']);
            expect(getComputedStyle(control).filter).toBe('brightness(0.88)');
        });
    });
});
