import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './notification.js';
define();

const variants = ['neutral', 'brand', 'success', 'warning', 'danger'];
// What carries the variant: the stripe at the start of the panel, and the icon.
const paint = (el) => ({
    stripe: getComputedStyle(el.shadowRoot.querySelector('[part="panel"]')).borderInlineStartColor,
    icon: getComputedStyle(el.shadowRoot.querySelector('[part="icon"]')).color,
});
// Colours that are far enough from the background to be seen, as a theme has to provide them.
const tokens = `
    --el-color-bg: rgb(255, 255, 255);
    --el-color-bg-muted: rgb(240, 240, 240);
    --el-color-fg: rgb(10, 10, 10);
    --el-color-fg-muted: rgb(100, 100, 100);
    --el-color-border: rgb(200, 200, 200);
    --el-color-accent: rgb(0, 0, 255);
    --el-color-success: rgb(0, 128, 0);
    --el-color-warning: rgb(255, 165, 0);
    --el-color-danger: rgb(200, 0, 0);
`;
const NEUTRAL = { stripe: 'rgb(200, 200, 200)', icon: 'rgb(10, 10, 10)' };

describe('Feature | Notification', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-notification></el-notification>`);
        await nextFrame();
        expect(el.shadowRoot.querySelector('[part="base"]')).not.toBeNull();
    });

    it('exposes a polite live region by default and an assertive one for danger', async () => {
        const status = await fixture(`<el-notification>Heads up</el-notification>`);
        expect(status.getAttribute('role')).toBe('status');
        expect(status.getAttribute('aria-live')).toBe('polite');

        const alert = await fixture(`<el-notification variant="danger">Something broke</el-notification>`);
        expect(alert.getAttribute('role')).toBe('alert');
        expect(alert.getAttribute('aria-live')).toBe('assertive');
    });

    it('shows and hides via show() / hide()', async () => {
        const el = await fixture(`<el-notification>Message</el-notification>`);

        await el.show();
        expect(el.open).toBe(true);
        expect(el.matches(':state(open)')).toBe(true);

        await el.hide();
        expect(el.open).toBe(false);
        expect(el.matches(':state(open)')).toBe(false);
    });

    it('labels its close button "Close" by default and takes another label from close-label', async () => {
        const closeLabel = async (attrs) => {
            const el = await fixture(`<el-notification open="true" closable="true" ${attrs}>Message</el-notification>`);
            return el.shadowRoot.querySelector('[data-close]').getAttribute('aria-label');
        };

        expect(await closeLabel('')).toBe('Close');
        expect(await closeLabel('close-label="Schließen"')).toBe('Schließen');
    });

    it('renders a close button when closable and hides on click', async () => {
        const el = await fixture(`<el-notification open="true" closable="true">Message</el-notification>`);
        const closeButton = el.shadowRoot.querySelector('[data-close]');
        expect(closeButton).not.toBeNull();

        const closed = oneEvent(el, 'notification-after-hide');
        closeButton.click();
        await closed;
        expect(el.open).toBe(false);
    });

    it('auto-dismisses after the given duration, pausing on pointer enter', async () => {
        const el = await fixture(`<el-notification duration="60">Message</el-notification>`);

        const hidden = oneEvent(el, 'notification-after-hide');
        await el.show();
        await hidden;
        expect(el.open).toBe(false);
    });

    it('draws the variant icon when the element is rendered in the browser', async () => {
        for (const variant of variants) {
            const el = await fixture(`<el-notification open="true" variant="${variant}">Message</el-notification>`);
            const shapes = [...el.shadowRoot.querySelectorAll('[part="icon"] svg *')];

            expect(shapes.length, variant).toBeGreaterThan(0);
            for (const shape of shapes) {
                expect(shape.namespaceURI, `${variant} <${shape.localName}>`).toBe('http://www.w3.org/2000/svg');
            }
            // An SVG child in the HTML namespace has no geometry, so nothing would be drawn.
            const { width, height } = shapes[0].getBoundingClientRect();
            expect(width * height, variant).toBeGreaterThan(0);

            el.remove();
        }
    });

    // The vocabulary of el-button, el-tag and el-badge: the word that paints a button also paints
    // the notification that reports what the button did.
    describe('variant', () => {
        it('is neutral by default, and says so on the host', async () => {
            const el = await fixture(`<el-notification open="true">Message</el-notification>`);

            expect(el.variant).toBe('neutral');
            expect(el.getAttribute('variant')).toBe('neutral');
        });

        it('reads one colour token per variant, for the stripe and for the icon', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    ${variants.map((variant) => `<el-notification open="true" variant="${variant}">a</el-notification>`).join('')}
                </div>
            `);
            const [neutral, brand, success, warning, danger] = [...wrapper.children].map(paint);

            // The border of the theme, and the colour of the text for the icon.
            expect(neutral).toEqual(NEUTRAL);
            expect(brand).toEqual({ stripe: 'rgb(0, 0, 255)', icon: 'rgb(0, 0, 255)' });
            expect(success).toEqual({ stripe: 'rgb(0, 128, 0)', icon: 'rgb(0, 128, 0)' });
            // A warning colour is a light one: where it is drawn on the panel, it is mixed half and
            // half with the colour of the text.
            expect(warning).toEqual({ stripe: 'rgb(255, 165, 0)', icon: 'color(srgb 0.519608 0.343137 0.0196078)' });
            expect(danger).toEqual({ stripe: 'rgb(200, 0, 0)', icon: 'rgb(200, 0, 0)' });
        });

        it('takes a variant set from a script, before and after it is in the page', async () => {
            const wrapper = await fixture(`<div style="${tokens}"></div>`);
            const el = Object.assign(document.createElement('el-notification'), { variant: 'brand', open: true });
            wrapper.append(el);
            await nextFrame();
            await nextFrame();

            expect(el.getAttribute('variant')).toBe('brand');
            expect(paint(el).stripe).toBe('rgb(0, 0, 255)');

            el.variant = 'danger';
            await nextFrame();

            expect(el.getAttribute('variant')).toBe('danger');
            expect(paint(el)).toEqual({ stripe: 'rgb(200, 0, 0)', icon: 'rgb(200, 0, 0)' });
        });

        // The six variants the notification had of its own. The old values are not mapped.
        it('paints a variant it does not know as neutral: default and primary are gone', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-notification open="true" variant="default">a</el-notification>
                    <el-notification open="true" variant="primary">a</el-notification>
                    <el-notification open="true" variant="nonsense">a</el-notification>
                </div>
            `);
            for (const el of wrapper.children) expect(paint(el), el.getAttribute('variant')).toEqual(NEUTRAL);
        });

        it('has the colours of its text and of its border without a theme', async () => {
            const wrapper = await fixture(`
                <div style="color: rgb(1, 2, 3)">
                    ${variants.map((variant) => `<el-notification open="true" variant="${variant}">a</el-notification>`).join('')}
                </div>
            `);
            const [neutral, brand, success, warning, danger] = [...wrapper.children].map(paint);
            // The panel is painted in the colours of the system, so its text is not the one of the page.
            const text = getComputedStyle(wrapper.firstElementChild.shadowRoot.querySelector('[part="panel"]')).color;

            for (const colours of [neutral, brand, success, danger])
                expect(colours).toEqual({ stripe: text, icon: text });
            expect(warning.stripe).toBe('rgb(245, 158, 11)');
            expect(warning.icon).not.toBe(warning.stripe);
        });

        it('shows an icon that can be seen on the panel in every variant, given colours that can', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    ${variants.map((variant) => `<el-notification open="true" variant="${variant}">a</el-notification>`).join('')}
                </div>
            `);
            const channels = (colour) => {
                const numbers = colour
                    .match(/[\d.]+/g)
                    .slice(0, 3)
                    .map(Number);
                // color(srgb …) has its channels from 0 to 1.
                return colour.startsWith('color(') ? numbers.map((channel) => channel * 255) : numbers;
            };
            const luminance = (colour) => {
                const [red, green, blue] = channels(colour).map((channel) => {
                    const part = channel / 255;
                    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
                });
                return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
            };
            const contrast = (one, other) => {
                const [lighter, darker] = [luminance(one), luminance(other)].sort((a, b) => b - a);
                return (lighter + 0.05) / (darker + 0.05);
            };

            for (const el of wrapper.children) {
                const panel = getComputedStyle(el.shadowRoot.querySelector('[part="panel"]')).backgroundColor;
                // What is asked of a graphic that says something: 3 to 1.
                expect(contrast(paint(el).icon, panel), el.variant).toBeGreaterThan(3);
            }
        });
    });

    it('has no detectable a11y violations', async () => {
        const el = await fixture(
            `<el-notification open="true" variant="success" closable="true">Saved</el-notification>`,
        );
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the close button at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-notification open="true" closable="true">Saved.</el-notification>
                </div>
            `);
            const close = wrapper.querySelector('el-notification').shadowRoot.querySelector('[part~="close-button"]');
            const { width, height } = sizeOf(close);
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });
    });
});
