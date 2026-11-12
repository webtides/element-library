import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useReducedMotion } from '../../test-helpers.js';
import { define } from './badge.js';
define();

const base = (el) => el.shadowRoot.querySelector('[part="base"]');
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

describe('Feature | Badge', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-badge>New</el-badge>`);
        await nextFrame();
    });

    it('shows its text, and is no more than that for assistive technology', async () => {
        const el = await fixture(`<el-badge>New</el-badge>`);
        expect(base(el).querySelector('slot').assignedNodes()[0].textContent).toBe('New');
        expect(el.hasAttribute('role')).toBe(false);
        expect(base(el).hasAttribute('role')).toBe(false);
    });

    describe('variant and appearance', () => {
        it('is neutral and filled by default, and says so on the host', async () => {
            const el = await fixture(`<el-badge>New</el-badge>`);
            expect(el.getAttribute('variant')).toBe('neutral');
            expect(el.getAttribute('appearance')).toBe('filled');
        });

        it('reads one colour token per variant for the fill', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">${variants.map((variant) => `<el-badge variant="${variant}">a</el-badge>`).join('')}</div>
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
                    <el-badge variant="danger" appearance="filled">a</el-badge>
                    <el-badge variant="danger" appearance="outlined">a</el-badge>
                    <el-badge variant="danger" appearance="plain">a</el-badge>
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

        it('takes a variant and an appearance set from a script', async () => {
            const wrapper = await fixture(`<div style="${tokens}"><el-badge>a</el-badge></div>`);
            const el = wrapper.firstElementChild;

            el.variant = 'brand';
            el.appearance = 'outlined';
            await nextFrame();

            expect(el.getAttribute('variant')).toBe('brand');
            expect(el.getAttribute('appearance')).toBe('outlined');
            expect(paint(el)).toEqual({ background: TRANSPARENT, border: 'rgb(0, 0, 255)', text: 'rgb(0, 0, 255)' });
        });

        it('can be read in every variant and appearance, given colours that can', async () => {
            const wrapper = await fixture(`
                <div style="${tokens} background: rgb(255, 255, 255); padding: 8px">
                    ${variants
                        .flatMap((variant) =>
                            appearances.map(
                                (appearance) =>
                                    `<el-badge variant="${variant}" appearance="${appearance}">Status</el-badge>`,
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

    describe('size and shape', () => {
        it('is three quarters of the text it stands in', async () => {
            const wrapper = await fixture(`
                <div style="font-size: 20px; --el-border-width: 1px"><el-badge>New</el-badge></div>
            `);
            const el = wrapper.firstElementChild;
            expect(getComputedStyle(base(el)).fontSize).toBe('15px');
            // One line of 15px, 0.35em above and below it, and the border.
            expect(sizeOf(el).height).toBe(27.5);
        });

        it('is a square with a single character, and a circle as a pill', async () => {
            const wrapper = await fixture(`
                <div style="font-size: 20px">
                    <el-badge>3</el-badge>
                    <el-badge pill="true">3</el-badge>
                    <el-badge pill="true">12 new</el-badge>
                </div>
            `);
            const [square, circle, pill] = wrapper.children;

            expect(sizeOf(square).width).toBe(sizeOf(square).height);
            expect(sizeOf(circle).width).toBe(sizeOf(circle).height);
            expect(getComputedStyle(base(circle)).borderTopLeftRadius).toBe('999px');
            expect(sizeOf(pill).width).toBeGreaterThan(sizeOf(pill).height);
            expect(getComputedStyle(base(square)).borderTopLeftRadius).not.toBe('999px');
        });
    });

    describe('pulse', () => {
        const animation = (el) => getComputedStyle(base(el)).animationName;

        it('pulses only when asked to', async () => {
            const wrapper = await fixture(`<div><el-badge>a</el-badge><el-badge pulse="true">a</el-badge></div>`);
            const [still, pulsing] = wrapper.children;

            expect(animation(still)).toBe('none');
            expect(animation(pulsing)).toBe('el-badge-pulse');
            expect(base(pulsing).getAnimations()[0].playState).toBe('running');

            pulsing.pulse = false;
            await nextFrame();
            expect(animation(pulsing)).toBe('none');
        });

        describe('for a user who prefers reduced motion', () => {
            useReducedMotion();

            it('stands still', async () => {
                const el = await fixture(`<el-badge pulse="true">a</el-badge>`);
                expect(animation(el)).toBe('none');
            });
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-badge hidden>New</el-badge>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('has no detectable a11y violations', async () => {
        const wrapper = await fixture(`
            <div style="${tokens}">
                <p>Inbox <el-badge variant="brand" pill="true">3</el-badge></p>
            </div>
        `);
        const results = await axe.run(wrapper);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('has its surface and its slot in the server-rendered markup', async () => {
        const el = await fixture(`<el-badge pill="true">New</el-badge>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<span[^>]*\spart=['"]base['"][^>]*>\s*<slot><\/slot>\s*<\/span>/);
        expect(markup).toMatch(/\sclass=['"]badge badge--pill['"]/);
    });
});
