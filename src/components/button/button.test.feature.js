import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleDescription,
    accessibleName,
    fixture,
    forcePseudoClasses,
    nextFrame,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
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

    // The fill writes dark text on --el-color-warning, so the token is a light colour; as the
    // label of the outlined button it would be 3.19 : 1 on white.
    it('keeps the label of an outlined warning button readable in a light and a dark scheme', async () => {
        const schemes = [
            { bg: '#ffffff', fg: '#111827' },
            { bg: '#0f1115', fg: '#f3f4f6' },
        ];
        for (const { bg, fg } of schemes) {
            const wrapper = await fixture(`
                <div style="--el-color-warning: #d97706; --el-color-fg: ${fg}; background: ${bg}; padding: 8px">
                    <el-button variant="warning" appearance="outlined">Careful</el-button>
                    <el-button variant="warning">Careful</el-button>
                </div>
            `);
            const results = await axe.run(wrapper, { runOnly: ['color-contrast'] });

            expect(results.violations, bg).toEqual([]);
            expect(
                results.passes.flatMap((pass) => pass.nodes),
                bg,
            ).toHaveLength(2);
        }
    });

    describe('variant, appearance and size', () => {
        const base = (el) => el.shadowRoot.querySelector('[part="base"]');
        const paint = (el) => {
            const { backgroundColor, borderTopColor, color } = getComputedStyle(base(el));
            return { background: backgroundColor, border: borderTopColor, text: color };
        };
        const TRANSPARENT = 'rgba(0, 0, 0, 0)';
        const tokens = `
            --el-color-bg: rgb(255, 255, 255);
            --el-color-bg-muted: rgb(240, 240, 240);
            --el-color-fg: rgb(10, 10, 10);
            --el-color-border: rgb(200, 200, 200);
            --el-color-accent: rgb(0, 0, 255);
            --el-color-success: rgb(0, 128, 0);
            --el-color-warning: rgb(255, 165, 0);
            --el-color-danger: rgb(255, 0, 0);
        `;

        it('is neutral, filled and medium by default, and says so on the host', async () => {
            const el = await fixture(`<el-button>Save</el-button>`);
            expect(el.getAttribute('variant')).toBe('neutral');
            expect(el.getAttribute('appearance')).toBe('filled');
            expect(el.getAttribute('size')).toBe('medium');
        });

        it('reads one colour token per variant for the fill', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-button>a</el-button>
                    <el-button variant="brand">a</el-button>
                    <el-button variant="success">a</el-button>
                    <el-button variant="warning">a</el-button>
                    <el-button variant="danger">a</el-button>
                </div>
            `);
            const [neutral, brand, success, warning, danger] = [...wrapper.children].map(paint);

            expect(neutral).toEqual({
                background: 'rgb(240, 240, 240)',
                border: 'rgb(200, 200, 200)',
                text: 'rgb(10, 10, 10)',
            });
            expect(brand).toEqual({
                background: 'rgb(0, 0, 255)',
                border: 'rgb(0, 0, 255)',
                text: 'rgb(255, 255, 255)',
            });
            expect(success.background).toBe('rgb(0, 128, 0)');
            expect(warning.background).toBe('rgb(255, 165, 0)');
            expect(danger.background).toBe('rgb(255, 0, 0)');
        });

        it('paints the variant as a fill, as an outline or as text only', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-button variant="danger" appearance="filled">a</el-button>
                    <el-button variant="danger" appearance="outlined">a</el-button>
                    <el-button variant="danger" appearance="plain">a</el-button>
                    <el-button appearance="outlined">a</el-button>
                    <el-button appearance="plain">a</el-button>
                </div>
            `);
            const [filled, outlined, plain, neutralOutlined, neutralPlain] = [...wrapper.children].map(paint);

            expect(filled).toEqual({
                background: 'rgb(255, 0, 0)',
                border: 'rgb(255, 0, 0)',
                text: 'rgb(255, 255, 255)',
            });
            expect(outlined).toEqual({ background: TRANSPARENT, border: 'rgb(255, 0, 0)', text: 'rgb(255, 0, 0)' });
            expect(plain).toEqual({ background: TRANSPARENT, border: TRANSPARENT, text: 'rgb(255, 0, 0)' });
            expect(neutralOutlined).toEqual({
                background: TRANSPARENT,
                border: 'rgb(200, 200, 200)',
                text: 'rgb(10, 10, 10)',
            });
            expect(neutralPlain).toEqual({ background: TRANSPARENT, border: TRANSPARENT, text: 'rgb(10, 10, 10)' });
        });

        it('takes a variant, an appearance and a size set from a script', async () => {
            const wrapper = await fixture(`<div style="${tokens}"><el-button>a</el-button></div>`);
            const el = wrapper.firstElementChild;
            const mediumFontSize = getComputedStyle(base(el)).fontSize;

            el.variant = 'brand';
            el.appearance = 'outlined';
            el.size = 'small';
            await nextFrame();

            expect(el.getAttribute('variant')).toBe('brand');
            expect(el.getAttribute('appearance')).toBe('outlined');
            expect(el.getAttribute('size')).toBe('small');
            expect(paint(el)).toEqual({ background: TRANSPARENT, border: 'rgb(0, 0, 255)', text: 'rgb(0, 0, 255)' });
            expect(mediumFontSize).toBe('16px');
            expect(getComputedStyle(base(el)).fontSize).toBe('14px');
        });

        it('has three sizes', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-button size="small">a</el-button>
                    <el-button size="medium">a</el-button>
                    <el-button size="large">a</el-button>
                    <el-button size="small" circle="true">a</el-button>
                    <el-button size="large" circle="true">a</el-button>
                </div>
            `);
            const [small, medium, large, smallCircle, largeCircle] = [...wrapper.children].map(base);

            expect([small, medium, large].map((control) => getComputedStyle(control).fontSize)).toEqual([
                '14px',
                '16px',
                '18px',
            ]);
            expect(sizeOf(small).height).toBeLessThan(sizeOf(medium).height);
            expect(sizeOf(medium).height).toBeLessThan(sizeOf(large).height);
            // A circle is as wide and high as the control height of its size: 0.8 and 1.25 times 40px.
            expect(sizeOf(smallCircle)).toEqual({ width: 32, height: 32 });
            expect(sizeOf(largeCircle)).toEqual({ width: 50, height: 50 });
        });

        // The values of the API before the shared vocabulary. They are not mapped.
        it('is neutral and filled for a variant it does not know', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-button variant="primary" outline="true">a</el-button>
                    <el-button>a</el-button>
                </div>
            `);
            const [unknown, neutral] = [...wrapper.children].map(paint);
            expect(unknown).toEqual(neutral);
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-button hidden>Save</el-button>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    // The control inside the shadow root is what has the focus and what a screen reader announces.
    describe('ARIA attributes of the element', () => {
        const control = (el) => el.shadowRoot.querySelector('[part="base"]');
        // A changed attribute asks for a render, which is there after two frames.
        const rendered = async () => {
            await nextFrame();
            await nextFrame();
        };

        it('names the control with the aria-label of the element', async () => {
            const el = await fixture(`<el-button circle="true" aria-label="Add">+</el-button>`);
            expect(control(el).getAttribute('aria-label')).toBe('Add');
            expect(await accessibleName(control(el))).toBe('Add');
        });

        it('passes a state on to the control, and every change of it', async () => {
            const el = await fixture(`<el-button aria-expanded="false" aria-haspopup="menu">Options</el-button>`);
            expect(control(el).getAttribute('aria-expanded')).toBe('false');
            expect(control(el).getAttribute('aria-haspopup')).toBe('menu');

            el.setAttribute('aria-expanded', 'true');
            await rendered();
            expect(control(el).getAttribute('aria-expanded')).toBe('true');

            // element-js writes an attribute that was there from the start back as an empty one when
            // it is removed. For the control an empty one is none.
            el.removeAttribute('aria-expanded');
            await rendered();
            expect(control(el).hasAttribute('aria-expanded')).toBe(false);
            expect(control(el).getAttribute('aria-haspopup')).toBe('menu');

            // The ARIA properties of the platform write the attribute, so they arrive as well.
            el.ariaPressed = 'true';
            await rendered();
            expect(control(el).getAttribute('aria-pressed')).toBe('true');

            // An attribute that came later goes for good.
            el.removeAttribute('aria-pressed');
            await rendered();
            expect(el.hasAttribute('aria-pressed')).toBe(false);
            expect(control(el).hasAttribute('aria-pressed')).toBe(false);
        });

        it('passes them on to the link of a link button', async () => {
            const el = await fixture(`<el-button href="/docs" aria-current="page" aria-label="Docs">D</el-button>`);
            expect(control(el).tagName).toBe('A');
            expect(control(el).getAttribute('aria-current')).toBe('page');
            expect(await accessibleName(control(el))).toBe('Docs');
        });

        it('keeps the attributes on the element, where a stylesheet can select them', async () => {
            const el = await fixture(`<el-button aria-pressed="true">Bold</el-button>`);
            expect(el.matches('el-button[aria-pressed="true"]')).toBe(true);
        });

        it('does not pass on what the button sets itself', async () => {
            const el = await fixture(`<el-button aria-busy="true" aria-disabled="true">Save</el-button>`);
            expect(control(el).getAttribute('aria-busy')).toBe('false');
            expect(control(el).hasAttribute('aria-disabled')).toBe(false);
        });

        it('hands the control the elements that the element names by id', async () => {
            const wrapper = await fixture(`
                <div>
                    <span id="aria-name">Remove the draft</span>
                    <el-button aria-labelledby="aria-name" aria-describedby="aria-hint aria-more" aria-controls="aria-panel">
                        x
                    </el-button>
                    <p id="aria-hint">This cannot be undone.</p>
                    <p id="aria-more">The published version stays.</p>
                    <div id="aria-panel"></div>
                </div>
            `);
            const el = wrapper.querySelector('el-button');
            const byId = (id) => wrapper.querySelector(`#${id}`);

            expect(control(el).ariaControlsElements).toEqual([byId('aria-panel')]);
            expect(await accessibleName(control(el))).toBe('Remove the draft');
            expect(await accessibleDescription(control(el))).toBe(
                'This cannot be undone. The published version stays.',
            );

            el.setAttribute('aria-describedby', 'aria-more');
            await rendered();
            expect(await accessibleDescription(control(el))).toBe('The published version stays.');

            el.removeAttribute('aria-describedby');
            el.setAttribute('aria-controls', 'aria-nothing');
            await rendered();
            expect(await accessibleDescription(control(el))).toBe('');
            expect(control(el).ariaControlsElements).toBeNull();
        });

        it('finds those elements in the shadow root the button is used in', async () => {
            const host = await fixture(`<div></div>`);
            const root = host.attachShadow({ mode: 'open' });
            root.innerHTML = `<el-button aria-describedby="hint">Save</el-button><p id="hint">Saves the draft.</p>`;
            await rendered();

            expect(await accessibleDescription(control(root.querySelector('el-button')))).toBe('Saves the draft.');
        });

        it('has them in the server-rendered markup', async () => {
            const el = await fixture(`<el-button circle="true" aria-label="Add" aria-expanded="false">+</el-button>`);
            // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
            const markup = el.template().toString();
            expect(markup).toMatch(/<button\s[^>]*\saria-label=['"]Add['"]/);
            expect(markup).toMatch(/<button\s[^>]*\saria-expanded=['"]false['"]/);
        });

        it('has no detectable a11y violations as an icon button with a name', async () => {
            const wrapper = await fixture(`
                <div><el-button circle="true" aria-label="Add" aria-pressed="false">+</el-button></div>
            `);
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            expect(results.passes.find((pass) => pass.id === 'button-name').nodes).toHaveLength(1);
        });
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px"><el-button size="small">OK</el-button></div>
        `);
        const control = wrapper.querySelector('el-button').shadowRoot.querySelector('[part="base"]');
        expect(sizeOf(control).height).toBe(32);
    });

    it('shows a pressed style without a touch screen', async () => {
        const el = await fixture(`<el-button variant="brand">Save</el-button>`);
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
                    <el-button size="small" variant="brand" appearance="plain">a</el-button>
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
            const el = await fixture(`<el-button variant="brand">Save</el-button>`);
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
