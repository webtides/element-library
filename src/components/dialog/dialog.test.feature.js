import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent } from '../../test-helpers.js';
import { define } from './dialog.js';
define();

const dialogFixture = (attrs = '') =>
    fixture(`
        <el-dialog label="Dialog title" ${attrs}>
            <p>Dialog body content.</p>
            <button slot="footer" type="button">Close</button>
        </el-dialog>
    `);

describe('Feature | Dialog', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-dialog></el-dialog>`);
        await nextFrame();
        expect(el.shadowRoot.querySelector('[part="base"]')).not.toBeNull();
    });

    it('opens and closes via show() / hide()', async () => {
        const el = await dialogFixture();
        const dialog = el.shadowRoot.querySelector('dialog');

        await el.show();
        expect(el.open).toBe(true);
        expect(dialog.open).toBe(true);
        expect(el.matches(':state(open)')).toBe(true);

        await el.hide();
        expect(el.open).toBe(false);
        expect(dialog.open).toBe(false);
        expect(el.matches(':state(open)')).toBe(false);
    });

    it('moves focus into the dialog when opened', async () => {
        const el = await dialogFixture();
        await el.show();
        // Focus lands inside the shadow DOM, so the host becomes document.activeElement.
        expect(document.activeElement).toBe(el);
        await el.hide();
    });

    it('locks document scroll while open and restores it (with padding) on close', async () => {
        const root = document.documentElement;
        const overflowBefore = root.style.overflow;
        const paddingBefore = root.style.paddingRight;

        const el = await dialogFixture();
        await el.show();
        // Scroll is locked while open; the scrollbar-compensation padding never goes negative.
        expect(root.style.overflow).toBe('hidden');
        expect(parseFloat(root.style.paddingRight) || 0).toBeGreaterThanOrEqual(0);

        await el.hide();
        // Both the overflow and the padding are returned to exactly what they were before.
        expect(root.style.overflow).toBe(overflowBefore);
        expect(root.style.paddingRight).toBe(paddingBefore);
    });

    it('emits a cancelable dialog-request-close and closes on the close button', async () => {
        const el = await dialogFixture();
        await el.show();

        let source;
        el.addEventListener('dialog-request-close', (event) => {
            source = event.detail.source;
        });

        const closed = oneEvent(el, 'dialog-after-hide');
        el.shadowRoot.querySelector('[data-dialog-close]').click();
        await closed;

        expect(source).toBe('close-button');
        expect(el.open).toBe(false);
    });

    it('routes the native cancel (Escape) through a cancelable close', async () => {
        const el = await dialogFixture();
        await el.show();
        const dialog = el.shadowRoot.querySelector('dialog');

        const closed = oneEvent(el, 'dialog-after-hide');
        dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
        await closed;

        expect(el.open).toBe(false);
    });

    it('stays open when dialog-request-close is prevented', async () => {
        const el = await dialogFixture();
        await el.show();
        el.addEventListener('dialog-request-close', (event) => event.preventDefault());

        el.requestClose('keyboard');
        await nextFrame();

        expect(el.open).toBe(true);
    });

    it('treats a click outside the panel as an overlay close', async () => {
        const el = await dialogFixture();
        await el.show();
        const dialog = el.shadowRoot.querySelector('dialog');

        const closed = oneEvent(el, 'dialog-after-hide');
        // Target the dialog itself at the top-left corner, well outside the centered panel box.
        dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
        await closed;

        expect(el.open).toBe(false);
    });

    it('omits the header and close button with no-header', async () => {
        const el = await dialogFixture('no-header="true"');
        await nextFrame();
        expect(el.shadowRoot.querySelector('[part="header"]')).toBeNull();
        expect(el.shadowRoot.querySelector('[data-dialog-close]')).toBeNull();
        // The accessible name falls back to the label.
        expect(el.shadowRoot.querySelector('dialog').getAttribute('aria-label')).toBe('Dialog title');
    });

    it('collapses the footer when nothing is slotted into it', async () => {
        const withFooter = await dialogFixture();
        await nextFrame();
        expect(withFooter.shadowRoot.querySelector('[part="footer"]').classList.contains('is-empty')).toBe(false);

        const withoutFooter = await fixture(`<el-dialog label="Title"><p>Body only.</p></el-dialog>`);
        await nextFrame();
        expect(withoutFooter.shadowRoot.querySelector('[part="footer"]').classList.contains('is-empty')).toBe(true);
    });

    it('has no detectable a11y violations while open', async () => {
        const el = await dialogFixture();
        await el.show();
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
        await el.hide();
    });
});
