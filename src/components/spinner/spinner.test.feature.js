import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useReducedMotion } from '../../test-helpers.js';
import { define } from './spinner.js';
define();

const base = (el) => el.shadowRoot.querySelector('[part="base"]');

describe('Feature | Spinner', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-spinner></el-spinner>`);
        await nextFrame();
    });

    it('is a progressbar without a value, named "Loading"', async () => {
        const el = await fixture(`<el-spinner></el-spinner>`);
        expect(base(el).getAttribute('role')).toBe('progressbar');
        expect(base(el).getAttribute('aria-label')).toBe('Loading');
        expect(base(el).hasAttribute('aria-valuenow')).toBe(false);
    });

    it('takes its name from the label, also when it is set from a script', async () => {
        const el = await fixture(`<el-spinner label="Wird geladen"></el-spinner>`);
        expect(base(el).getAttribute('aria-label')).toBe('Wird geladen');

        el.label = 'Chargement';
        await nextFrame();
        expect(base(el).getAttribute('aria-label')).toBe('Chargement');
    });

    it('has no detectable a11y violations', async () => {
        const el = await fixture(`<el-spinner></el-spinner>`);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
        // The rule for the name of a progressbar has seen the ring inside the shadow root.
        expect(results.passes.map((pass) => pass.id)).toContain('aria-progressbar-name');
    });

    it('is as large as the text it stands in', async () => {
        const wrapper = await fixture(`
            <div style="font-size: 20px">
                <el-spinner></el-spinner>
                <el-spinner style="font-size: 48px"></el-spinner>
            </div>
        `);
        const [inherited, own] = wrapper.children;
        expect(sizeOf(inherited)).toEqual({ width: 20, height: 20 });
        expect(sizeOf(own)).toEqual({ width: 48, height: 48 });
        // The ring fills it. Not measured with sizeOf(): the bounding box of a turned ring is larger.
        expect([base(own).offsetWidth, base(own).offsetHeight]).toEqual([48, 48]);
    });

    it('has three sizes, in steps from the font size', async () => {
        const wrapper = await fixture(`
            <div style="font-size: 20px">
                <el-spinner size="small"></el-spinner>
                <el-spinner></el-spinner>
                <el-spinner size="large"></el-spinner>
            </div>
        `);
        const [small, medium, large] = wrapper.children;

        expect(medium.getAttribute('size')).toBe('medium');
        // 0.8, 1 and 1.25 times the font size
        expect([small, medium, large].map((el) => sizeOf(el))).toEqual([
            { width: 16, height: 16 },
            { width: 20, height: 20 },
            { width: 25, height: 25 },
        ]);

        medium.size = 'large';
        await nextFrame();
        expect(medium.getAttribute('size')).toBe('large');
        expect(sizeOf(medium)).toEqual({ width: 25, height: 25 });
    });

    describe('colours', () => {
        const colours = (el) => {
            const { borderTopColor, borderRightColor } = getComputedStyle(base(el));
            return { indicator: borderTopColor, track: borderRightColor };
        };

        it('paints the indicator in the accent colour and the track in a fifth of the text colour', async () => {
            const wrapper = await fixture(`
                <div style="color: rgb(0, 0, 0); --el-color-accent: rgb(0, 0, 255)"><el-spinner></el-spinner></div>
            `);
            expect(colours(wrapper.firstElementChild)).toEqual({
                indicator: 'rgb(0, 0, 255)',
                track: 'color(srgb 0 0 0 / 0.2)',
            });
        });

        it('paints the indicator in the text colour without a theme', async () => {
            const wrapper = await fixture(`<div style="color: rgb(200, 0, 0)"><el-spinner></el-spinner></div>`);
            expect(colours(wrapper.firstElementChild)).toEqual({
                indicator: 'rgb(200, 0, 0)',
                track: 'color(srgb 0.784314 0 0 / 0.2)',
            });
        });

        it('takes both colours from its own tokens', async () => {
            const wrapper = await fixture(`
                <div
                    style="
                        --el-color-accent: rgb(0, 0, 255);
                        --el-spinner-indicator-color: rgb(1, 2, 3);
                        --el-spinner-track-color: rgb(4, 5, 6);
                    "
                >
                    <el-spinner></el-spinner>
                </div>
            `);
            expect(colours(wrapper.firstElementChild)).toEqual({ indicator: 'rgb(1, 2, 3)', track: 'rgb(4, 5, 6)' });
        });
    });

    it('turns without an end', async () => {
        const el = await fixture(`<el-spinner></el-spinner>`);
        const { animationName, animationDuration, animationIterationCount } = getComputedStyle(base(el));
        expect({ animationName, animationDuration, animationIterationCount }).toEqual({
            animationName: 'el-spinner-spin',
            animationDuration: '0.8s',
            animationIterationCount: 'infinite',
        });
        expect(base(el).getAnimations()[0].playState).toBe('running');
    });

    describe('for a user who prefers reduced motion', () => {
        useReducedMotion();

        it('turns at half the speed, and does not stand still', async () => {
            const el = await fixture(`<el-spinner></el-spinner>`);
            expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
            expect(getComputedStyle(base(el)).animationDuration).toBe('1.6s');
            expect(base(el).getAnimations()[0].playState).toBe('running');
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-spinner hidden></el-spinner>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('has its role and its name in the server-rendered markup', async () => {
        const el = await fixture(`<el-spinner label="Wird geladen"></el-spinner>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/\srole=['"]progressbar['"]/);
        expect(markup).toMatch(/\saria-label=['"]Wird geladen['"]/);
    });
});
