import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    sizeOf,
    useForcedColors,
    useReducedMotion,
} from '../../test-helpers.js';
import { define } from './progress-bar.js';
define();

const base = (el) => el.shadowRoot.querySelector('[part="base"]');
const indicator = (el) => el.shadowRoot.querySelector('[part="indicator"]');
// A place of 300px with text of 20px, in blue.
const place = `width: 300px; font: 20px/30px sans-serif; color: rgb(0, 0, 255);`;
const placed = async (markup, style = '') => {
    const wrapper = await fixture(`<div style="${place} ${style}">${markup}</div>`);
    return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
};
// The value as assistive technology reads it.
const aria = (el) => ({
    min: base(el).getAttribute('aria-valuemin'),
    max: base(el).getAttribute('aria-valuemax'),
    now: base(el).getAttribute('aria-valuenow'),
});
const filled = (el) => sizeOf(indicator(el)).width;
const colours = (el) => ({
    indicator: getComputedStyle(indicator(el)).backgroundColor,
    track: getComputedStyle(base(el)).backgroundColor,
});

describe('Feature | ProgressBar', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-progress-bar></el-progress-bar>`);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a progressbar at 0 of 100, named "Progress"', async () => {
            const el = await fixture(`<el-progress-bar></el-progress-bar>`);

            expect(await accessibleRole(base(el))).toBe('progressbar');
            expect(await accessibleName(base(el))).toBe('Progress');
            expect(aria(el)).toEqual({ min: '0', max: '100', now: '0' });
        });

        it('takes its name from the label, also when it is set from a script', async () => {
            const el = await fixture(`<el-progress-bar label="Upload"></el-progress-bar>`);
            expect(await accessibleName(base(el))).toBe('Upload');

            el.label = 'Téléversement';
            await nextFrame();
            expect(await accessibleName(base(el))).toBe('Téléversement');
        });

        it('has no detectable a11y violations, with a value and without', async () => {
            const wrapper = await fixture(`
                <div style="${place} background: rgb(255, 255, 255)">
                    <el-progress-bar value="40" label="Upload"></el-progress-bar>
                    <el-progress-bar indeterminate="true" label="Import"></el-progress-bar>
                </div>
            `);
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            // The rule for the name of a progressbar has seen the bars inside the shadow roots.
            expect(results.passes.map((pass) => pass.id)).toContain('aria-progressbar-name');
        });
    });

    describe('value', () => {
        it('fills the share of the track that value is of max', async () => {
            const [none, third, quarter, full] = await placed(`
                <el-progress-bar></el-progress-bar>
                <el-progress-bar value="30"></el-progress-bar>
                <el-progress-bar value="3" max="12"></el-progress-bar>
                <el-progress-bar value="100"></el-progress-bar>
            `);

            expect([none, third, quarter, full].map(filled)).toEqual([0, 90, 75, 300]);
            expect(aria(third)).toEqual({ min: '0', max: '100', now: '30' });
            expect(aria(quarter)).toEqual({ min: '0', max: '12', now: '3' });
        });

        it('fills a share that is no whole percent to the tenth of a pixel', async () => {
            const el = await placed(`<el-progress-bar value="1" max="3"></el-progress-bar>`);

            expect(indicator(el).style.width).toBe('33.33%');
            expect(filled(el)).toBe(100);
        });

        it('follows a value and a max set from a script', async () => {
            const el = await placed(`<el-progress-bar value="30"></el-progress-bar>`);

            el.value = 60;
            await nextFrame();
            expect(filled(el)).toBe(180);
            expect(aria(el).now).toBe('60');

            el.max = 240;
            await nextFrame();
            expect(filled(el)).toBe(75);
            expect(aria(el)).toEqual({ min: '0', max: '240', now: '60' });
        });

        it('shows a value outside of the range as the nearest one inside', async () => {
            const [below, above] = await placed(`
                <el-progress-bar value="-20"></el-progress-bar>
                <el-progress-bar value="150"></el-progress-bar>
            `);

            expect([filled(below), aria(below).now]).toEqual([0, '0']);
            expect([filled(above), aria(above).now]).toEqual([300, '100']);
            // The property is left alone.
            expect(above.value).toBe(150);
        });

        it('counts a value that is no number as 0, and a max that is none above zero as 100', async () => {
            const [noValue, noMax, zeroMax] = await placed(`
                <el-progress-bar value="half"></el-progress-bar>
                <el-progress-bar value="50" max="all"></el-progress-bar>
                <el-progress-bar value="50" max="0"></el-progress-bar>
            `);

            expect([filled(noValue), aria(noValue).now]).toEqual([0, '0']);
            expect([filled(noMax), aria(noMax).max]).toEqual([150, '100']);
            expect([filled(zeroMax), aria(zeroMax).max]).toEqual([150, '100']);
        });

        it('starts at the right in a text that runs from right to left', async () => {
            const wrapper = await placed(`<div dir="rtl"><el-progress-bar value="30"></el-progress-bar></div>`);
            const el = wrapper.firstElementChild;

            expect(filled(el)).toBe(90);
            expect(indicator(el).getBoundingClientRect().right).toBe(base(el).getBoundingClientRect().right);
        });

        it('moves to a new value in the duration of the theme, and at once without one', async () => {
            const [plain, themed] = await placed(`
                <el-progress-bar value="30"></el-progress-bar>
                <el-progress-bar value="30" style="--el-duration-md: 200ms"></el-progress-bar>
            `);
            const transition = (el) => {
                const { transitionProperty, transitionDuration } = getComputedStyle(indicator(el));
                return { transitionProperty, transitionDuration };
            };

            expect(transition(plain)).toEqual({ transitionProperty: 'width', transitionDuration: '0s' });
            expect(transition(themed)).toEqual({ transitionProperty: 'width', transitionDuration: '0.2s' });
        });
    });

    describe('indeterminate', () => {
        const animation = (el) => {
            const { animationName, animationDuration, animationIterationCount } = getComputedStyle(indicator(el));
            return { animationName, animationDuration, animationIterationCount };
        };

        it('has no value', async () => {
            const el = await fixture(`<el-progress-bar indeterminate="true" value="30"></el-progress-bar>`);

            expect(await accessibleRole(base(el))).toBe('progressbar');
            expect(await accessibleName(base(el))).toBe('Progress');
            expect(base(el).hasAttribute('aria-valuenow')).toBe(false);
        });

        it('lets two fifths of the track pass over it, without an end', async () => {
            const el = await placed(`<el-progress-bar indeterminate="true"></el-progress-bar>`);

            expect(filled(el)).toBe(120);
            expect(indicator(el).hasAttribute('style')).toBe(false);
            expect(animation(el)).toEqual({
                animationName: 'el-progress-bar-pass',
                animationDuration: '1.6s',
                animationIterationCount: 'infinite',
            });
            expect(indicator(el).getAnimations()[0].playState).toBe('running');
        });

        it('starts before the track and ends behind it, so the loop has no jump', async () => {
            const el = await placed(`<el-progress-bar indeterminate="true"></el-progress-bar>`);
            const [running] = indicator(el).getAnimations();
            const track = base(el).getBoundingClientRect();

            running.pause();
            running.currentTime = 0;
            expect(indicator(el).getBoundingClientRect().right).toBe(track.left);
            running.currentTime = 1600 - 0.001;
            expect(Math.round(indicator(el).getBoundingClientRect().left)).toBe(track.right);
        });

        it('passes from right to left in a text that runs from right to left', async () => {
            const wrapper = await placed(
                `<div dir="rtl"><el-progress-bar indeterminate="true"></el-progress-bar></div>`,
            );
            const el = wrapper.firstElementChild;
            const [running] = indicator(el).getAnimations();
            const track = base(el).getBoundingClientRect();

            expect(animation(el).animationName).toBe('el-progress-bar-pass-rtl');
            running.pause();
            running.currentTime = 0;
            expect(indicator(el).getBoundingClientRect().left).toBe(track.right);
            running.currentTime = 1600 - 0.001;
            expect(Math.round(indicator(el).getBoundingClientRect().right)).toBe(track.left);
        });

        it('does not show what is outside of the track', async () => {
            const el = await placed(`<el-progress-bar indeterminate="true"></el-progress-bar>`);
            expect(getComputedStyle(base(el)).overflow).toBe('hidden');
        });

        it('gets a value when the progress is known, and loses it again', async () => {
            const el = await placed(`<el-progress-bar indeterminate="true" value="30"></el-progress-bar>`);

            el.indeterminate = false;
            await nextFrame();
            expect(aria(el)).toEqual({ min: '0', max: '100', now: '30' });
            expect(filled(el)).toBe(90);
            expect(animation(el).animationName).toBe('none');

            el.indeterminate = true;
            await nextFrame();
            expect(base(el).hasAttribute('aria-valuenow')).toBe(false);
            expect(filled(el)).toBe(120);
            expect(animation(el).animationName).toBe('el-progress-bar-pass');
        });

        describe('for a user who prefers reduced motion', () => {
            useReducedMotion();

            it('fades over the whole track, and nothing crosses the page', async () => {
                const [ltr, rtl] = await placed(`
                    <el-progress-bar indeterminate="true"></el-progress-bar>
                    <div dir="rtl"><el-progress-bar indeterminate="true"></el-progress-bar></div>
                `);
                expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);

                for (const el of [ltr, rtl.firstElementChild]) {
                    expect(filled(el)).toBe(300);
                    expect(animation(el)).toEqual({
                        animationName: 'el-progress-bar-fade',
                        animationDuration: '2s',
                        animationIterationCount: 'infinite',
                    });
                    const [running] = indicator(el).getAnimations();
                    expect(running.playState).toBe('running');
                    expect(running.effect.getKeyframes().map((keyframe) => keyframe.opacity)).toEqual([
                        '1',
                        '0.4',
                        '1',
                    ]);
                    expect(getComputedStyle(indicator(el)).transform).toBe('none');
                }
            });
        });
    });

    describe('size and shape', () => {
        it('is as wide as its container and half a rem high', async () => {
            const el = await placed(`<el-progress-bar value="30"></el-progress-bar>`);

            expect(sizeOf(el)).toEqual({ width: 300, height: 8 });
            expect(sizeOf(base(el))).toEqual({ width: 300, height: 8 });
            expect(sizeOf(indicator(el))).toEqual({ width: 90, height: 8 });
        });

        it('takes its height from --el-progress-bar-height', async () => {
            const el = await placed(
                `<el-progress-bar value="30" style="--el-progress-bar-height: 20px"></el-progress-bar>`,
            );

            expect(sizeOf(el)).toEqual({ width: 300, height: 20 });
            expect(sizeOf(indicator(el))).toEqual({ width: 90, height: 20 });
        });

        it('has the radius of the theme, on the track and on what is filled', async () => {
            const [plain, themed] = await placed(`
                <el-progress-bar value="30"></el-progress-bar>
                <el-progress-bar value="30" style="--el-radius-md: 0px"></el-progress-bar>
            `);

            expect(getComputedStyle(base(plain)).borderRadius).toBe('4px');
            expect(getComputedStyle(indicator(plain)).borderRadius).toBe('4px');
            expect(getComputedStyle(base(themed)).borderRadius).toBe('0px');
            expect(getComputedStyle(indicator(themed)).borderRadius).toBe('0px');
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-progress-bar hidden></el-progress-bar>`);
            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('colours', () => {
        it('fills in the text colour on a fifth of it without a theme', async () => {
            const el = await placed(`<el-progress-bar value="30"></el-progress-bar>`);
            expect(colours(el)).toEqual({ indicator: 'rgb(0, 0, 255)', track: 'color(srgb 0 0 1 / 0.2)' });
        });

        it('fills in the accent colour of the theme', async () => {
            const el = await placed(
                `<el-progress-bar value="30"></el-progress-bar>`,
                '--el-color-accent: rgb(255, 0, 0);',
            );
            expect(colours(el)).toEqual({ indicator: 'rgb(255, 0, 0)', track: 'color(srgb 0 0 1 / 0.2)' });
        });

        it('takes both colours from its own tokens', async () => {
            const el = await placed(
                `<el-progress-bar
                    value="30"
                    style="--el-progress-bar-indicator-color: rgb(1, 2, 3); --el-progress-bar-track-color: rgb(4, 5, 6)"
                ></el-progress-bar>`,
                '--el-color-accent: rgb(255, 0, 0);',
            );
            expect(colours(el)).toEqual({ indicator: 'rgb(1, 2, 3)', track: 'rgb(4, 5, 6)' });
        });

        describe('when colours are forced', () => {
            useForcedColors();

            it('draws the track with a border and fills it in the colour of a selection', async () => {
                const [el, text, selection] = await placed(`
                    <el-progress-bar value="30"></el-progress-bar>
                    <span style="color: CanvasText">Text</span>
                    <span style="color: Highlight">Selection</span>
                `);
                expect(matchMedia('(forced-colors: active)').matches).toBe(true);

                const { borderTopWidth, borderTopColor } = getComputedStyle(base(el));
                expect({ borderTopWidth, borderTopColor }).toEqual({
                    borderTopWidth: '1px',
                    borderTopColor: getComputedStyle(text).color,
                });
                expect(colours(el).indicator).toBe(getComputedStyle(selection).color);
                // The border is part of the height: the bar is as high as without forced colours.
                expect(sizeOf(el).height).toBe(8);
            });
        });
    });

    it('has its role, its value and what is filled in the server-rendered markup', async () => {
        const el = await fixture(`<el-progress-bar value="30" label="Upload"></el-progress-bar>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/\srole=['"]progressbar['"]/);
        expect(markup).toMatch(/\saria-label=['"]Upload['"]/);
        expect(markup).toMatch(/\saria-valuenow=['"]30['"]/);
        expect(markup).toMatch(/\sstyle=['"]width: 30%['"]/);

        el.indeterminate = true;
        expect(el.template().toString()).not.toMatch(/aria-valuenow/);
    });
});
