import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleName,
    fixture,
    forcePseudoClasses,
    nextFrame,
    oneEvent,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './tag.js';
define();

const base = (el) => el.shadowRoot.querySelector('[part="base"]');
const removeButton = (el) => el.shadowRoot.querySelector('[part="remove-button"]');
const paint = (el) => {
    const { backgroundColor, borderTopColor, color } = getComputedStyle(base(el));
    return { background: backgroundColor, border: borderTopColor, text: color };
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const variants = ['neutral', 'brand', 'success', 'warning', 'danger'];
const appearances = ['filled', 'outlined', 'plain'];
// Colours that are far enough from the background to be read, as a theme has to provide them.
const tokens = `
    --el-color-bg: rgb(255, 255, 255);
    --el-color-bg-muted: rgb(240, 240, 240);
    --el-color-fg: rgb(10, 10, 10);
    --el-color-border: rgb(200, 200, 200);
    --el-color-accent: rgb(0, 0, 255);
    --el-color-success: rgb(0, 128, 0);
    --el-color-warning: rgb(255, 165, 0);
    --el-color-danger: rgb(200, 0, 0);
`;

describe('Feature | Tag', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tag>TypeScript</el-tag>`);
        await nextFrame();
        expect(base(el)).not.toBeNull();
    });

    it('shows its text, and is no more than that for assistive technology', async () => {
        const el = await fixture(`<el-tag>TypeScript</el-tag>`);
        expect(base(el).querySelector('slot').assignedNodes()[0].textContent).toBe('TypeScript');
        expect(el.hasAttribute('role')).toBe(false);
        expect(base(el).hasAttribute('role')).toBe(false);
        expect(removeButton(el)).toBeNull();
    });

    describe('variant, appearance and size', () => {
        it('is neutral, filled and medium by default, and says so on the host', async () => {
            const el = await fixture(`<el-tag>a</el-tag>`);
            expect(el.getAttribute('variant')).toBe('neutral');
            expect(el.getAttribute('appearance')).toBe('filled');
            expect(el.getAttribute('size')).toBe('medium');
        });

        it('reads one colour token per variant for the fill', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">${variants.map((variant) => `<el-tag variant="${variant}">a</el-tag>`).join('')}</div>
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
            expect(danger.background).toBe('rgb(200, 0, 0)');
        });

        it('paints the variant as a fill, as an outline or as text only', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-tag variant="danger" appearance="filled">a</el-tag>
                    <el-tag variant="danger" appearance="outlined">a</el-tag>
                    <el-tag variant="danger" appearance="plain">a</el-tag>
                </div>
            `);
            const [filled, outlined, plain] = [...wrapper.children].map(paint);

            expect(filled).toEqual({
                background: 'rgb(200, 0, 0)',
                border: 'rgb(200, 0, 0)',
                text: 'rgb(255, 255, 255)',
            });
            expect(outlined).toEqual({ background: TRANSPARENT, border: 'rgb(200, 0, 0)', text: 'rgb(200, 0, 0)' });
            expect(plain).toEqual({ background: TRANSPARENT, border: TRANSPARENT, text: 'rgb(200, 0, 0)' });
        });

        it('has three sizes, each smaller than a control of that size', async () => {
            const wrapper = await fixture(`
                <div style="--el-control-height: 40px; --el-font-size-sm: 14px; --el-font-size-md: 16px">
                    <el-tag size="small">a</el-tag>
                    <el-tag>a</el-tag>
                    <el-tag size="large">a</el-tag>
                </div>
            `);
            const [small, medium, large] = wrapper.children;

            // 0.7 times the height of a control: of 32, 40 and 50px
            expect([small, medium, large].map((el) => sizeOf(el).height)).toEqual([22.4, 28, 35]);
            // 0.875 times the font size of a control: of 14, 16 and 18px
            expect([small, medium, large].map((el) => getComputedStyle(base(el)).fontSize)).toEqual([
                '12.25px',
                '14px',
                '15.75px',
            ]);
        });

        it('takes a variant, an appearance and a size set from a script', async () => {
            const wrapper = await fixture(`<div style="${tokens}"><el-tag>a</el-tag></div>`);
            const el = wrapper.firstElementChild;

            el.variant = 'brand';
            el.appearance = 'outlined';
            el.size = 'small';
            await nextFrame();

            expect(el.getAttribute('variant')).toBe('brand');
            expect(el.getAttribute('appearance')).toBe('outlined');
            expect(el.getAttribute('size')).toBe('small');
            expect(paint(el)).toEqual({ background: TRANSPARENT, border: 'rgb(0, 0, 255)', text: 'rgb(0, 0, 255)' });
            expect(sizeOf(el).height).toBe(22.4);
        });

        it('has fully rounded ends as a pill', async () => {
            const wrapper = await fixture(`<div><el-tag>a</el-tag><el-tag pill="true">a</el-tag></div>`);
            const [plain, pill] = wrapper.children;
            expect(getComputedStyle(base(plain)).borderTopLeftRadius).not.toBe('999px');
            expect(getComputedStyle(base(pill)).borderTopLeftRadius).toBe('999px');
        });

        it('can be read in every variant and appearance, given colours that can', async () => {
            const wrapper = await fixture(`
                <div style="${tokens} background: rgb(255, 255, 255); padding: 8px">
                    ${variants
                        .flatMap((variant) =>
                            appearances.map(
                                (appearance) =>
                                    `<el-tag variant="${variant}" appearance="${appearance}">Status</el-tag>`,
                            ),
                        )
                        .join('')}
                </div>
            `);
            const results = await axe.run(wrapper, { runOnly: ['color-contrast'] });

            expect(results.violations).toEqual([]);
            expect(results.passes.flatMap((pass) => pass.nodes)).toHaveLength(15);
        });
    });

    it('cuts off a text that does not fit, and keeps the remove button', async () => {
        const wrapper = await fixture(`
            <div style="width: 120px">
                <el-tag removable="true">A keyword that is much too long for this place</el-tag>
            </div>
        `);
        const el = wrapper.firstElementChild;

        expect(sizeOf(el).width).toBe(120);
        expect(getComputedStyle(el.shadowRoot.querySelector('[part="content"]')).textOverflow).toBe('ellipsis');
        expect(removeButton(el).getBoundingClientRect().right).toBeLessThanOrEqual(el.getBoundingClientRect().right);
    });

    describe('removable', () => {
        it('has a remove button that the keyboard reaches', async () => {
            const el = await fixture(`<el-tag removable="true">TypeScript</el-tag>`);
            const button = removeButton(el);

            expect(button.tagName).toBe('BUTTON');
            expect(button.getAttribute('type')).toBe('button');
            expect(button.tabIndex).toBe(0);

            button.focus();
            expect(el.shadowRoot.activeElement).toBe(button);
        });

        it('names the remove button with its label and the text of the tag', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-tag removable="true">TypeScript</el-tag>
                    <el-tag removable="true" remove-label="Entfernen">Svelte</el-tag>
                </div>
            `);
            const [english, german] = wrapper.children;

            expect(await accessibleName(removeButton(english))).toBe('Remove TypeScript');
            expect(await accessibleName(removeButton(german))).toBe('Entfernen Svelte');

            german.removeLabel = 'Löschen';
            german.textContent = 'Vite';
            await nextFrame();
            expect(await accessibleName(removeButton(german))).toBe('Löschen Vite');
        });

        it('fires tag-remove from the button and stays where it is', async () => {
            const wrapper = await fixture(`<div><el-tag removable="true">TypeScript</el-tag></div>`);
            const el = wrapper.firstElementChild;

            // The event leaves the shadow root and reaches a listener further up.
            const removed = oneEvent(wrapper, 'tag-remove');
            removeButton(el).click();
            const event = await removed;

            expect(event.target).toBe(el);
            expect(event.bubbles).toBe(true);
            expect(event.composed).toBe(true);
            expect(el.parentElement).toBe(wrapper);
        });

        it('gets and loses its button when removable is set from a script', async () => {
            const el = await fixture(`<el-tag>TypeScript</el-tag>`);
            let count = 0;
            el.addEventListener('tag-remove', () => count++);

            el.removable = true;
            await nextFrame();
            removeButton(el).click();
            expect(count).toBe(1);

            el.removable = false;
            await nextFrame();
            expect(removeButton(el)).toBeNull();
        });

        it('shows the focus of the button in the text colour of the tag', async () => {
            const wrapper = await fixture(`
                <div style="${tokens} --el-color-focus-ring: rgb(0, 0, 255)">
                    <el-tag variant="brand" removable="true">TypeScript</el-tag>
                </div>
            `);
            const button = removeButton(wrapper.firstElementChild);
            expect(getComputedStyle(button).outlineStyle).toBe('none');

            // The focus colour of the theme is the fill of a brand tag, so the ring is not that one.
            await forcePseudoClasses(button, ['focus-visible']);
            const { outlineStyle, outlineColor, outlineWidth } = getComputedStyle(button);
            expect({ outlineStyle, outlineColor, outlineWidth }).toEqual({
                outlineStyle: 'solid',
                outlineColor: 'rgb(255, 255, 255)',
                outlineWidth: '2px',
            });
        });

        it('keeps its button small on a fine pointer', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-tag removable="true">TypeScript</el-tag></div>
            `);
            const el = wrapper.firstElementChild;
            expect(sizeOf(el).height).toBe(28);
            expect(sizeOf(removeButton(el)).height).toBeLessThan(28);
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            it('has a remove button of at least --el-touch-target, in every size', async () => {
                const wrapper = await fixture(`
                    <div style="--el-touch-target: 44px">
                        <el-tag size="small" removable="true">a</el-tag>
                        <el-tag removable="true">a</el-tag>
                        <el-tag size="large" removable="true" pill="true">a</el-tag>
                    </div>
                `);
                for (const el of wrapper.children) {
                    const { width, height } = sizeOf(removeButton(el));
                    expect(Math.min(width, height), el.outerHTML).toBeGreaterThanOrEqual(44);
                }
            });

            it('keeps its sizes without --el-touch-target, and without a button', async () => {
                const wrapper = await fixture(`
                    <div>
                        <el-tag removable="true">a</el-tag>
                        <span style="--el-touch-target: 44px"><el-tag>a</el-tag></span>
                    </div>
                `);
                const [removable, plain] = wrapper.querySelectorAll('el-tag');
                expect(sizeOf(removable).height).toBe(28);
                expect(sizeOf(plain).height).toBe(28);
            });
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-tag hidden>TypeScript</el-tag>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('has no detectable a11y violations', async () => {
        const wrapper = await fixture(`
            <div style="${tokens}">
                <el-tag>TypeScript</el-tag>
                <el-tag variant="brand" removable="true">Svelte</el-tag>
                <el-tag variant="danger" appearance="outlined" pill="true" removable="true">Vite</el-tag>
            </div>
        `);
        const results = await axe.run(wrapper);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
        // The rule for the name of a button has seen the two remove buttons inside the shadow roots.
        expect(results.passes.find((pass) => pass.id === 'button-name').nodes).toHaveLength(2);
    });

    it('has its remove button with its name in the server-rendered markup', async () => {
        const el = await fixture(`<el-tag removable="true" remove-label="Entfernen">Svelte</el-tag>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<button[^>]*\saria-labelledby=['"]remove-label content['"]/);
        expect(markup).toMatch(/<span id=['"]remove-label['"] hidden>\s*(<!--[^>]*-->)*\s*Entfernen/);
        expect(markup).toMatch(/<span[^>]*\sid=['"]content['"][^>]*>\s*<slot><\/slot>/);

        const plain = await fixture(`<el-tag>Svelte</el-tag>`);
        expect(plain.template().toString()).not.toMatch(/<button/);
    });
});
