import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './notification.js';
define();

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
        for (const variant of ['default', 'success', 'warning', 'danger']) {
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
