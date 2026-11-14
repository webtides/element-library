import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, accessibleRole, fixture, nextFrame, sizeOf, useForcedColors } from '../../test-helpers.js';
import { define } from './progress-ring.js';
define();

const base = (el) => el.shadowRoot.querySelector('[part="base"]');
const track = (el) => el.shadowRoot.querySelector('[part="track"]');
const indicator = (el) => el.shadowRoot.querySelector('[part="indicator"]');
// A place with text of 20px, in blue.
const place = `font: 20px/30px sans-serif; color: rgb(0, 0, 255);`;
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
// The share of the ring that is not drawn. The length of the ring counts as 100.
const open = (el) => getComputedStyle(indicator(el)).strokeDashoffset;
const colours = (el) => ({
    indicator: getComputedStyle(indicator(el)).stroke,
    track: getComputedStyle(track(el)).stroke,
});
// A point on the line of the indicator, at a share of its way, in the coordinates of the page and
// counted from the top left corner of the element.
const pointAt = (el, share) => {
    const circle = indicator(el);
    const point = circle.getPointAtLength(circle.getTotalLength() * share).matrixTransform(circle.getScreenCTM());
    const { left, top } = el.getBoundingClientRect();
    return { x: Math.round((point.x - left) * 10) / 10, y: Math.round((point.y - top) * 10) / 10 };
};

describe('Feature | ProgressRing', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-progress-ring></el-progress-ring>`);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a progressbar at 0 of 100, named "Progress"', async () => {
            const el = await fixture(`<el-progress-ring></el-progress-ring>`);

            expect(await accessibleRole(base(el))).toBe('progressbar');
            expect(await accessibleName(base(el))).toBe('Progress');
            expect(aria(el)).toEqual({ min: '0', max: '100', now: '0' });
        });

        it('takes its name from the label, not from the text in its middle', async () => {
            const el = await fixture(`<el-progress-ring value="45" label="Storage">45 %</el-progress-ring>`);
            expect(await accessibleName(base(el))).toBe('Storage');

            el.label = 'Speicher';
            await nextFrame();
            expect(await accessibleName(base(el))).toBe('Speicher');
        });

        it('keeps the drawing out of the accessibility tree', async () => {
            const el = await fixture(`<el-progress-ring value="45"></el-progress-ring>`);
            expect(el.shadowRoot.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
        });

        it('has no detectable a11y violations, with a text in its middle and without', async () => {
            const wrapper = await fixture(`
                <div style="${place} background: rgb(255, 255, 255)">
                    <el-progress-ring value="45" label="Storage">45 %</el-progress-ring>
                    <el-progress-ring value="3" max="12" label="Files"></el-progress-ring>
                </div>
            `);
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            // The rule for the name of a progressbar has seen the rings inside the shadow roots.
            expect(results.passes.map((pass) => pass.id)).toContain('aria-progressbar-name');
        });
    });

    describe('value', () => {
        it('draws the share of the ring that value is of max', async () => {
            const [none, third, quarter, full] = await placed(`
                <el-progress-ring></el-progress-ring>
                <el-progress-ring value="30"></el-progress-ring>
                <el-progress-ring value="3" max="12"></el-progress-ring>
                <el-progress-ring value="100"></el-progress-ring>
            `);

            // One dash as long as the ring, pushed back by what is not done yet.
            expect(getComputedStyle(indicator(third)).strokeDasharray).toBe('100px');
            expect(indicator(third).getAttribute('pathLength')).toBe('100');
            expect([none, third, quarter, full].map(open)).toEqual(['100px', '70px', '75px', '0px']);
            expect(aria(third)).toEqual({ min: '0', max: '100', now: '30' });
            expect(aria(quarter)).toEqual({ min: '0', max: '12', now: '3' });
        });

        it('draws a share that is no whole percent to the hundredth', async () => {
            const el = await placed(`<el-progress-ring value="1" max="3"></el-progress-ring>`);
            expect(open(el)).toBe('66.67px');
        });

        it('follows a value and a max set from a script', async () => {
            const el = await placed(`<el-progress-ring value="30"></el-progress-ring>`);

            el.value = 60;
            await nextFrame();
            expect(open(el)).toBe('40px');
            expect(aria(el).now).toBe('60');

            el.max = 240;
            await nextFrame();
            expect(open(el)).toBe('75px');
            expect(aria(el)).toEqual({ min: '0', max: '240', now: '60' });
        });

        it('shows a value outside of the range as the nearest one inside', async () => {
            const [below, above] = await placed(`
                <el-progress-ring value="-20"></el-progress-ring>
                <el-progress-ring value="150"></el-progress-ring>
            `);

            expect([open(below), aria(below).now]).toEqual(['100px', '0']);
            expect([open(above), aria(above).now]).toEqual(['0px', '100']);
            // The property is left alone.
            expect(above.value).toBe(150);
        });

        it('counts a value that is no number as 0, and a max that is none above zero as 100', async () => {
            const [noValue, noMax, zeroMax] = await placed(`
                <el-progress-ring value="half"></el-progress-ring>
                <el-progress-ring value="50" max="all"></el-progress-ring>
                <el-progress-ring value="50" max="0"></el-progress-ring>
            `);

            expect([open(noValue), aria(noValue).now]).toEqual(['100px', '0']);
            expect([open(noMax), aria(noMax).max]).toEqual(['50px', '100']);
            expect([open(zeroMax), aria(zeroMax).max]).toEqual(['50px', '100']);
        });

        it('moves to a new value in the duration of the theme, and at once without one', async () => {
            const [plain, themed] = await placed(`
                <el-progress-ring value="30"></el-progress-ring>
                <el-progress-ring value="30" style="--el-duration-md: 200ms"></el-progress-ring>
            `);
            const transition = (el) => {
                const { transitionProperty, transitionDuration } = getComputedStyle(indicator(el));
                return { transitionProperty, transitionDuration };
            };

            expect(transition(plain)).toEqual({ transitionProperty: 'stroke-dashoffset', transitionDuration: '0s' });
            expect(transition(themed)).toEqual({
                transitionProperty: 'stroke-dashoffset',
                transitionDuration: '0.2s',
            });
        });
    });

    describe('the ring', () => {
        it('is a square of 4rem, with a line of a quarter rem inside of it', async () => {
            const el = await placed(`<el-progress-ring value="30"></el-progress-ring>`);

            expect(sizeOf(el)).toEqual({ width: 64, height: 64 });
            expect(sizeOf(base(el))).toEqual({ width: 64, height: 64 });
            for (const circle of [track(el), indicator(el)]) {
                expect(getComputedStyle(circle).strokeWidth).toBe('4px');
                // The middle of the line is half its width inside of the box.
                const { x, y, width, height } = circle.getBBox();
                expect({ x, y, width, height }).toEqual({ x: 2, y: 2, width: 60, height: 60 });
            }
        });

        it('takes its size and the width of its line from its own tokens', async () => {
            const el = await placed(
                `<el-progress-ring
                    value="30"
                    style="--el-progress-ring-size: 100px; --el-progress-ring-track-width: 10px"
                ></el-progress-ring>`,
            );

            expect(sizeOf(el)).toEqual({ width: 100, height: 100 });
            for (const circle of [track(el), indicator(el)]) {
                expect(getComputedStyle(circle).strokeWidth).toBe('10px');
                const { x, y, width, height } = circle.getBBox();
                expect({ x, y, width, height }).toEqual({ x: 5, y: 5, width: 90, height: 90 });
            }
        });

        it('starts at the top and runs clockwise', async () => {
            const el = await placed(
                `<el-progress-ring
                    value="30"
                    style="--el-progress-ring-size: 100px; --el-progress-ring-track-width: 10px"
                ></el-progress-ring>`,
            );

            // The middle of the line: 5px inside of a box of 100px.
            expect(pointAt(el, 0)).toEqual({ x: 50, y: 5 });
            expect(pointAt(el, 0.25)).toEqual({ x: 95, y: 50 });
            expect(pointAt(el, 0.5)).toEqual({ x: 50, y: 95 });
        });

        it('starts at the top in a text that runs from right to left as well', async () => {
            const wrapper = await placed(
                `<div dir="rtl"><el-progress-ring value="30" style="--el-progress-ring-size: 100px; --el-progress-ring-track-width: 10px"></el-progress-ring></div>`,
            );
            const el = wrapper.firstElementChild;

            expect(pointAt(el, 0)).toEqual({ x: 50, y: 5 });
            expect(pointAt(el, 0.25)).toEqual({ x: 95, y: 50 });
        });

        it('is a line only: neither circle has a fill', async () => {
            const el = await placed(`<el-progress-ring value="30"></el-progress-ring>`);

            expect(getComputedStyle(track(el)).fill).toBe('none');
            expect(getComputedStyle(indicator(el)).fill).toBe('none');
        });

        it('stands in a line of text, on the middle of it', async () => {
            const paragraph = await placed(
                `<p style="margin: 0">Storage <el-progress-ring value="30" style="--el-progress-ring-size: 20px"></el-progress-ring></p>`,
            );
            const el = paragraph.querySelector('el-progress-ring');

            expect(getComputedStyle(el).display).toBe('inline-block');
            expect(getComputedStyle(el).verticalAlign).toBe('middle');
            expect(sizeOf(paragraph).height).toBe(30);
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-progress-ring hidden></el-progress-ring>`);
            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('the middle', () => {
        it('shows the slotted text in the middle of the ring', async () => {
            const el = await placed(`<el-progress-ring value="45"><span>45 %</span></el-progress-ring>`);
            const ring = el.getBoundingClientRect();
            const text = el.querySelector('span').getBoundingClientRect();

            expect(Math.abs(text.left + text.width / 2 - (ring.left + ring.width / 2))).toBeLessThan(0.5);
            expect(Math.abs(text.top + text.height / 2 - (ring.top + ring.height / 2))).toBeLessThan(0.5);
        });

        it('sets figures of one width, so the text does not move while the value counts', async () => {
            const el = await placed(`<el-progress-ring value="45">45 %</el-progress-ring>`);
            const label = el.shadowRoot.querySelector('[part="label"]');

            expect(getComputedStyle(label).fontVariantNumeric).toBe('tabular-nums');
            expect(getComputedStyle(label).fontSize).toBe('20px');
        });

        it('does not make the ring larger with a text that is too long for it', async () => {
            const el = await placed(
                `<el-progress-ring value="45">Forty-five percent of the storage</el-progress-ring>`,
            );
            expect(sizeOf(el)).toEqual({ width: 64, height: 64 });
        });
    });

    describe('colours', () => {
        it('draws in the text colour on a fifth of it without a theme', async () => {
            const el = await placed(`<el-progress-ring value="30"></el-progress-ring>`);
            expect(colours(el)).toEqual({ indicator: 'rgb(0, 0, 255)', track: 'color(srgb 0 0 1 / 0.2)' });
        });

        it('draws in the accent colour of the theme', async () => {
            const el = await placed(
                `<el-progress-ring value="30"></el-progress-ring>`,
                '--el-color-accent: rgb(255, 0, 0);',
            );
            expect(colours(el)).toEqual({ indicator: 'rgb(255, 0, 0)', track: 'color(srgb 0 0 1 / 0.2)' });
        });

        it('takes both colours from its own tokens', async () => {
            const el = await placed(
                `<el-progress-ring
                    value="30"
                    style="--el-progress-ring-indicator-color: rgb(1, 2, 3); --el-progress-ring-track-color: rgb(4, 5, 6)"
                ></el-progress-ring>`,
                '--el-color-accent: rgb(255, 0, 0);',
            );
            expect(colours(el)).toEqual({ indicator: 'rgb(1, 2, 3)', track: 'rgb(4, 5, 6)' });
        });

        describe('when colours are forced', () => {
            useForcedColors();

            it('draws the whole ring as a thin line and the share that is done in the colour of a selection', async () => {
                const [el, text, selection] = await placed(`
                    <el-progress-ring value="30" style="--el-progress-ring-indicator-color: rgb(1, 2, 3)"></el-progress-ring>
                    <span style="color: CanvasText">Text</span>
                    <span style="color: Highlight">Selection</span>
                `);
                expect(matchMedia('(forced-colors: active)').matches).toBe(true);

                expect(colours(el)).toEqual({
                    indicator: getComputedStyle(selection).color,
                    track: getComputedStyle(text).color,
                });
                expect(getComputedStyle(track(el)).strokeWidth).toBe('1px');
                expect(getComputedStyle(indicator(el)).strokeWidth).toBe('4px');
                // The thin line lies in the middle of the wide one.
                expect(track(el).getBBox().width).toBe(60);
            });
        });
    });

    it('has its role, its value and what is drawn in the server-rendered markup', async () => {
        const el = await fixture(`<el-progress-ring value="30" label="Storage">30 %</el-progress-ring>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/\srole=['"]progressbar['"]/);
        expect(markup).toMatch(/\saria-label=['"]Storage['"]/);
        expect(markup).toMatch(/\saria-valuenow=['"]30['"]/);
        expect(markup).toMatch(/\sstroke-dashoffset=['"]70['"]/);
    });
});
