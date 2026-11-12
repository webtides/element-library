import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent, sizeOf, useTouchScreen } from '../../test-helpers.js';
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

    it('gives the page its scrolling back when it is removed while it is open', async () => {
        const root = document.documentElement;
        const overflowBefore = root.style.overflow;
        const paddingBefore = root.style.paddingRight;

        const el = await dialogFixture();
        await el.show();
        expect(root.style.overflow).toBe('hidden');

        el.remove();
        expect(root.style.overflow).toBe(overflowBefore);
        expect(root.style.paddingRight).toBe(paddingBefore);
        expect(el.shadowRoot.querySelector('dialog').open).toBe(false);
    });

    it('leaves the lock of another dialog alone when it is removed while it is open or closing', async () => {
        const root = document.documentElement;
        const overflowBefore = root.style.overflow;

        const below = await dialogFixture();
        await below.show();

        const removedOpen = await dialogFixture();
        await removedOpen.show();
        removedOpen.remove();
        expect(root.style.overflow).toBe('hidden');

        // Removed during the transition out: the close that is under way finishes afterwards, and
        // must not give back a lock that the removal has given back already.
        const wrapper = await fixture(
            `<div style="--el-duration-md: 100ms"><el-dialog label="Dialog title"><p>Dialog body content.</p></el-dialog></div>`,
        );
        const removedClosing = wrapper.querySelector('el-dialog');
        await removedClosing.show();
        const closed = oneEvent(removedClosing, 'dialog-after-hide');
        removedClosing.open = false;
        await nextFrame();
        removedClosing.remove();
        await closed;
        expect(root.style.overflow).toBe('hidden');

        await below.hide();
        expect(root.style.overflow).toBe(overflowBefore);
    });

    it('opens as a modal again when it comes back into the page while `open`', async () => {
        const root = document.documentElement;
        const overflowBefore = root.style.overflow;

        const el = await dialogFixture();
        await el.show();
        const parent = el.parentNode;
        el.remove();

        const shown = oneEvent(el, 'dialog-after-show');
        parent.append(el);
        await shown;
        expect(el.open).toBe(true);
        expect(el.shadowRoot.querySelector('dialog').matches(':modal')).toBe(true);
        expect(root.style.overflow).toBe('hidden');

        await el.hide();
        expect(root.style.overflow).toBe(overflowBefore);
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

    it('gives an empty footer no room, and one that gets content its room', async () => {
        const el = await fixture(`<el-dialog label="Title"><p>Body only.</p></el-dialog>`);
        await el.show();
        const part = (name) => el.shadowRoot.querySelector(`[part="${name}"]`);
        const heightOf = (node) => node.getBoundingClientRect().height;

        expect(getComputedStyle(part('footer')).display).toBe('none');
        expect(heightOf(part('base'))).toBe(heightOf(part('header')) + heightOf(part('body')));

        el.insertAdjacentHTML('beforeend', '<button slot="footer" type="button">OK</button>');
        await nextFrame();
        expect(getComputedStyle(part('footer')).display).toBe('flex');
        expect(heightOf(part('footer'))).toBeGreaterThan(0);

        el.querySelector('[slot="footer"]').remove();
        await nextFrame();
        expect(getComputedStyle(part('footer')).display).toBe('none');
        await el.hide();
    });

    it('shows the footer of a server-rendered dialog', async () => {
        // The markup the SSR renderer writes: the template of the element as a Declarative Shadow
        // DOM. The browser fills the slots while it parses, before the element takes over.
        const source = document.createElement('el-dialog');
        Object.assign(source, source.properties(), { label: 'Title' });
        const wrapper = document.createElement('div');
        document.body.append(wrapper);
        wrapper.setHTMLUnsafe(`
            <el-dialog label="Title">
                <template shadowrootmode="open">${source.template().toString()}</template>
                <p>Body</p>
                <button slot="footer" type="button">OK</button>
            </el-dialog>
        `);
        const el = wrapper.querySelector('el-dialog');
        await nextFrame();
        await nextFrame();

        await el.show();
        expect(getComputedStyle(el.shadowRoot.querySelector('[part="footer"]')).display).toBe('flex');
        await el.hide();
        wrapper.remove();
    });

    it('has no detectable a11y violations while open', async () => {
        const el = await dialogFixture();
        await el.show();
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
        await el.hide();
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(
            `<div style="--el-touch-target: 44px"><el-dialog label="Dialog title"><p>Dialog body content.</p></el-dialog></div>`,
        );
        const el = wrapper.querySelector('el-dialog');
        await el.show();
        expect(sizeOf(el.shadowRoot.querySelector('[part~="close-button"]'))).toEqual({ width: 20, height: 20 });
        await el.hide();
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the close button at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-dialog label="Dialog title"><p>Dialog body content.</p></el-dialog></div>`,
            );
            const el = wrapper.querySelector('el-dialog');
            await el.show();
            const { width, height } = sizeOf(el.shadowRoot.querySelector('[part~="close-button"]'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
            await el.hide();
        });
    });
});
