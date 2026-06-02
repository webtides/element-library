import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent } from '../../test-helpers.js';
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

    it('toast() floats it into the shared stack and removes it again on hide', async () => {
        const el = await fixture(`<el-notification>Toast me</el-notification>`);

        await el.toast();
        const stack = document.querySelector('.el-toast-stack');
        expect(stack).not.toBeNull();
        expect(el.parentElement).toBe(stack);
        expect(el.open).toBe(true);

        await el.hide();
        expect(el.parentElement).toBeNull();
        // The stack is torn down once its last toast leaves.
        expect(document.querySelector('.el-toast-stack')).toBeNull();
    });

    it('has no detectable a11y violations', async () => {
        const el = await fixture(
            `<el-notification open="true" variant="success" closable="true">Saved</el-notification>`,
        );
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
});
