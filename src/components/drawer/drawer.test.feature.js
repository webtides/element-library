import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    fixture,
    nextFrame,
    aTimeout,
    oneEvent,
    sizeOf,
    useTouchScreen,
    useReducedMotion,
    accessibleName,
    accessibleRole,
} from '../../test-helpers.js';
import { define } from './drawer.js';
import { define as defineDialog } from '../dialog/dialog.js';
define();
defineDialog();

// An open drawer makes everything else in the page inert, so every test takes its fixture out of
// the page again. A drawer that is removed while it is open gives the page back.
const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

/**
 * A drawer of 200px, and a button before it in the page. The wrapper sets the tokens that a test
 * measures.
 * @param {object} [options]
 * @param {string} [options.attrs] - Attributes of the drawer.
 * @param {string} [options.tokens] - The inline style of the wrapper.
 * @param {string} [options.content] - The children of the drawer.
 * @param {string} [options.dir] - The `dir` attribute of the wrapper.
 */
async function drawerFixture({
    attrs = '',
    tokens = '--el-drawer-size: 200px',
    content = '<p>Content</p>',
    dir = '',
} = {}) {
    const wrapper = await fixture(`
        <div ${dir ? `dir="${dir}"` : ''} style="${tokens}">
            <button class="opener" type="button">Open</button>
            <el-drawer label="Filters" ${attrs}>${content}</el-drawer>
        </div>
    `);
    wrappers.push(wrapper);
    const el = wrapper.querySelector('el-drawer');
    return {
        wrapper,
        el,
        opener: wrapper.querySelector('.opener'),
        dialog: el.shadowRoot.querySelector('dialog'),
        part: (name) => el.shadowRoot.querySelector(`[part~="${name}"]`),
    };
}

/** Where an element is in the viewport. */
function box(node) {
    const { left, top, right, bottom, width, height } = node.getBoundingClientRect();
    return { left, top, right, bottom, width, height };
}

/** The widths of the four borders: top, right, bottom, left. */
function borders(node) {
    const style = getComputedStyle(node);
    return [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].join(' ');
}

/** Where the drawer is right after the platform has opened it, before it slides in. */
async function boxBeforeTheSlide(el, dialog) {
    let before;
    el.addEventListener('drawer-initial-focus', () => (before = box(dialog)), { once: true });
    await el.show();
    return before;
}

const untilShown = (dialog) => expect.poll(() => dialog.classList.contains('showing')).toBe(true);

describe('Feature | Drawer', () => {
    it('can connect without errors, closed', async () => {
        const { el, dialog } = await drawerFixture();
        expect(el.open).toBe(false);
        expect(dialog.open).toBe(false);
        expect(getComputedStyle(dialog).display).toBe('none');
    });

    describe('the surface', () => {
        it('is a modal dialog of the platform, named by its label', async () => {
            const { el, dialog } = await drawerFixture();
            await el.show();
            expect(dialog.matches(':modal')).toBe(true);
            expect(await accessibleRole(dialog)).toBe('dialog');
            expect(await accessibleName(dialog)).toBe('Filters');
        });

        it('takes its name from the label slot', async () => {
            const { el, dialog } = await drawerFixture({
                content: '<span slot="label">Sort and filter</span><p>Content</p>',
            });
            await el.show();
            expect(await accessibleName(dialog)).toBe('Sort and filter');
        });

        it('keeps the page behind it out of reach while it is open', async () => {
            const { el, opener } = await drawerFixture();
            await el.show();
            opener.focus();
            expect(document.activeElement).not.toBe(opener);

            await el.hide();
            opener.focus();
            expect(document.activeElement).toBe(opener);
        });

        it('takes the focus when it opens and gives it back when it closes', async () => {
            const { el, opener } = await drawerFixture();
            opener.focus();

            await el.show();
            expect(document.activeElement).toBe(el);
            expect(el.shadowRoot.activeElement.getAttribute('part')).toBe('close-button');

            await el.hide();
            expect(document.activeElement).toBe(opener);
        });

        it('gives the focus to the element in it that has autofocus', async () => {
            const { el } = await drawerFixture({
                content: '<input class="search" aria-label="Search" autofocus />',
            });
            await el.show();
            expect(document.activeElement).toBe(el.querySelector('.search'));
        });

        it('keeps the focus of the keyboard inside', async () => {
            const { el, opener } = await drawerFixture({
                content: '<button class="inside" type="button">Apply</button>',
            });
            await el.show();

            // Between the last element and the first one the focus is on the browser itself.
            const stops = new Set();
            for (let i = 0; i < 8; i++) {
                await userEvent.tab();
                stops.add(document.activeElement);
            }
            expect(stops.has(el.querySelector('.inside'))).toBe(true);
            expect(stops.has(el)).toBe(true);
            expect(stops.has(opener)).toBe(false);
        });
    });

    describe('placement', () => {
        it('lies along the end of the line by default, from the top to the bottom', async () => {
            const { el, dialog } = await drawerFixture();
            expect(el.getAttribute('placement')).toBe('end');
            await el.show();
            expect(box(dialog)).toEqual({
                left: innerWidth - 200,
                top: 0,
                right: innerWidth,
                bottom: innerHeight,
                width: 200,
                height: innerHeight,
            });
        });

        it('lies along the start of the line with placement="start"', async () => {
            const { el, dialog } = await drawerFixture({ attrs: 'placement="start"' });
            await el.show();
            expect(box(dialog)).toEqual({
                left: 0,
                top: 0,
                right: 200,
                bottom: innerHeight,
                width: 200,
                height: innerHeight,
            });
        });

        it('lies across the top with placement="top"', async () => {
            const { el, dialog } = await drawerFixture({ attrs: 'placement="top"' });
            await el.show();
            expect(box(dialog)).toEqual({
                left: 0,
                top: 0,
                right: innerWidth,
                bottom: 200,
                width: innerWidth,
                height: 200,
            });
        });

        it('lies across the bottom with placement="bottom"', async () => {
            const { el, dialog } = await drawerFixture({ attrs: 'placement="bottom"' });
            await el.show();
            expect(box(dialog)).toEqual({
                left: 0,
                top: innerHeight - 200,
                right: innerWidth,
                bottom: innerHeight,
                width: innerWidth,
                height: 200,
            });
        });

        it('is at the end with a placement that is none of the four', async () => {
            const { el, dialog } = await drawerFixture({ attrs: 'placement="middle"' });
            await el.show();
            expect(box(dialog)).toMatchObject({
                left: innerWidth - 200,
                right: innerWidth,
                top: 0,
                bottom: innerHeight,
            });
        });

        it('moves to another edge while it is open, and reflects the property', async () => {
            const { el, dialog } = await drawerFixture();
            await el.show();

            el.placement = 'start';
            await nextFrame();
            await nextFrame();
            expect(el.getAttribute('placement')).toBe('start');
            expect(box(dialog)).toMatchObject({ left: 0, right: 200 });

            el.placement = 'bottom';
            await nextFrame();
            await nextFrame();
            expect(box(dialog)).toMatchObject({ left: 0, right: innerWidth, bottom: innerHeight, height: 200 });
        });

        it('is 25rem wide at the start and the end without a size', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '' });
            await el.show();
            expect(box(dialog).width).toBe(400);
        });

        it('is as high as its content at the top and the bottom without a size', async () => {
            for (const placement of ['top', 'bottom']) {
                const { el, dialog, part } = await drawerFixture({
                    attrs: `placement="${placement}"`,
                    tokens: '--el-space-4: 10px',
                    content: '<div style="height: 120px">Content</div>',
                });
                await el.show();
                // The body is its content and its padding below, no more.
                expect(box(part('body')).height).toBe(130);
                // Header and body, and no room for the empty footer.
                expect(box(dialog).height).toBeCloseTo(box(part('header')).height + 130, 3);
                await el.hide();
            }
        });

        it('is never larger than the viewport', async () => {
            const side = await drawerFixture({ tokens: '--el-drawer-size: 5000px' });
            await side.el.show();
            expect(box(side.dialog)).toMatchObject({ left: 0, right: innerWidth, width: innerWidth });
            await side.el.hide();

            const below = await drawerFixture({ attrs: 'placement="bottom"', tokens: '--el-drawer-size: 5000px' });
            await below.el.show();
            expect(box(below.dialog)).toMatchObject({ top: 0, bottom: innerHeight, height: innerHeight });
        });

        it('counts its border into its size', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-border-width: 4px' });
            await el.show();
            expect(box(dialog).width).toBe(200);
        });

        it('has a border on the edge that faces the page, and only there', async () => {
            const expected = {
                end: '0px 0px 0px 2px',
                start: '0px 2px 0px 0px',
                top: '0px 0px 2px 0px',
                bottom: '2px 0px 0px 0px',
            };
            for (const [placement, widths] of Object.entries(expected)) {
                const { el, dialog } = await drawerFixture({
                    attrs: `placement="${placement}"`,
                    tokens: '--el-drawer-size: 200px; --el-border-width: 2px; --el-color-border: rgb(1, 2, 3)',
                });
                await el.show();
                expect(borders(dialog), placement).toBe(widths);
                await el.hide();
            }
        });

        it('stays at the top when a page makes it shorter than the viewport', async () => {
            const style = document.createElement('style');
            style.textContent = 'el-drawer.short::part(base) { max-block-size: 300px; }';
            document.head.append(style);
            try {
                const { el, dialog } = await drawerFixture({ attrs: 'class="short"' });
                await el.show();
                expect(box(dialog)).toMatchObject({ top: 0, height: 300 });
            } finally {
                style.remove();
            }
        });

        it('has square corners, whatever the radius of the theme', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-radius-lg: 12px' });
            await el.show();
            expect(getComputedStyle(dialog).borderRadius).toBe('0px');
        });

        describe('comes in from the edge it lies along', () => {
            const cases = [
                ['end', '', (before) => before.left >= innerWidth],
                ['start', '', (before) => before.right <= 0],
                ['top', '', (before) => before.bottom <= 0],
                ['bottom', '', (before) => before.top >= innerHeight],
                ['end', 'rtl', (before) => before.right <= 0],
                ['start', 'rtl', (before) => before.left >= innerWidth],
            ];
            for (const [placement, dir, isOutside] of cases) {
                it(`${placement}${dir ? `, in a right-to-left page` : ''}`, async () => {
                    const { el, dialog } = await drawerFixture({ attrs: `placement="${placement}"`, dir });
                    const before = await boxBeforeTheSlide(el, dialog);
                    expect(isOutside(before), JSON.stringify(before)).toBe(true);
                });
            }
        });

        describe('in a right-to-left page', () => {
            it('has its end on the left and its start on the right', async () => {
                const end = await drawerFixture({ dir: 'rtl' });
                await end.el.show();
                expect(box(end.dialog)).toMatchObject({ left: 0, right: 200 });
                await end.el.hide();

                const start = await drawerFixture({ dir: 'rtl', attrs: 'placement="start"' });
                await start.el.show();
                expect(box(start.dialog)).toMatchObject({ left: innerWidth - 200, right: innerWidth });
            });

            it('has its border on the other side', async () => {
                const { el, dialog } = await drawerFixture({
                    dir: 'rtl',
                    tokens: '--el-drawer-size: 200px; --el-border-width: 2px',
                });
                await el.show();
                expect(borders(dialog)).toBe('0px 2px 0px 0px');
            });

            it('follows a dir on the page', async () => {
                document.documentElement.setAttribute('dir', 'rtl');
                try {
                    const { el, dialog } = await drawerFixture();
                    const before = await boxBeforeTheSlide(el, dialog);
                    expect(before.right).toBeLessThanOrEqual(0);
                    expect(box(dialog)).toMatchObject({ left: 0, right: 200 });
                } finally {
                    document.documentElement.removeAttribute('dir');
                }
            });

            it('follows a dir on the drawer itself', async () => {
                const { el, dialog } = await drawerFixture({ attrs: 'dir="rtl"' });
                const before = await boxBeforeTheSlide(el, dialog);
                expect(before.right).toBeLessThanOrEqual(0);
                expect(box(dialog)).toMatchObject({ left: 0, right: 200 });
            });
        });
    });

    describe('opening and closing', () => {
        it('opens and closes with show() and hide(), which wait for the slide', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-duration-md: 150ms' });

            // The slide takes 150ms. A transition runs with the frames of the screen, so the time
            // that has passed here can be a little less.
            let started = performance.now();
            await el.show();
            expect(performance.now() - started).toBeGreaterThanOrEqual(100);
            expect(el.open).toBe(true);
            expect(el.getAttribute('open')).toBe('true');
            expect(el.matches(':state(open)')).toBe(true);
            // It has arrived.
            expect(box(dialog).left).toBe(innerWidth - 200);

            started = performance.now();
            await el.hide();
            expect(performance.now() - started).toBeGreaterThanOrEqual(100);
            expect(el.open).toBe(false);
            expect(el.getAttribute('open')).toBe('false');
            expect(el.matches(':state(open)')).toBe(false);
            expect(dialog.open).toBe(false);
        });

        it('slides without fading', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-duration-md: 150ms' });
            let opacity;
            el.addEventListener('drawer-initial-focus', () => (opacity = getComputedStyle(dialog).opacity));
            await el.show();
            expect(opacity).toBe('1');
        });

        it('closes for a form with method="dialog" in it', async () => {
            const { el, dialog } = await drawerFixture({
                content: '<form method="dialog"><button>Apply</button></form>',
            });
            await el.show();
            const log = [];
            for (const what of ['request-close', 'hide', 'after-hide']) {
                el.addEventListener(`drawer-${what}`, () => log.push(what));
            }

            const closed = oneEvent(el, 'drawer-after-hide');
            await userEvent.click(el.querySelector('form button'));
            await closed;

            expect(el.open).toBe(false);
            expect(dialog.open).toBe(false);
            expect(log).toEqual(['hide', 'after-hide']);
        });

        it('turns round when it is opened again while it slides out', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-duration-md: 200ms' });
            await el.show();
            const log = [];
            for (const what of ['show', 'initial-focus', 'after-show', 'hide', 'after-hide']) {
                el.addEventListener(`drawer-${what}`, () => log.push(what));
            }

            const hidden = el.hide();
            await aTimeout(60);
            const shown = el.show();
            await Promise.all([hidden, shown]);

            expect(log).toEqual(['hide', 'show', 'after-show']);
            expect(el.open).toBe(true);
            expect(dialog.matches(':modal')).toBe(true);
            // Back at its edge.
            expect(box(dialog).left).toBe(innerWidth - 200);
            expect(document.documentElement.style.overflow).toBe('hidden');
        });

        it('turns back when it is closed while it slides in', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-duration-md: 200ms' });
            const before = document.documentElement.style.overflow;
            const log = [];
            for (const what of ['show', 'initial-focus', 'after-show', 'hide', 'after-hide']) {
                el.addEventListener(`drawer-${what}`, () => log.push(what));
            }

            const shown = el.show();
            await aTimeout(60);
            const hidden = el.hide();
            await Promise.all([shown, hidden]);

            expect(log).toEqual(['show', 'initial-focus', 'hide', 'after-hide']);
            expect(el.open).toBe(false);
            expect(dialog.open).toBe(false);
            expect(dialog.classList.contains('showing')).toBe(false);
            expect(document.documentElement.style.overflow).toBe(before);
        });

        it('follows the open attribute and the open property', async () => {
            const { el, dialog } = await drawerFixture();

            const shown = oneEvent(el, 'drawer-after-show');
            el.setAttribute('open', 'true');
            await shown;
            expect(dialog.matches(':modal')).toBe(true);

            const hidden = oneEvent(el, 'drawer-after-hide');
            el.open = false;
            await hidden;
            expect(dialog.open).toBe(false);
        });

        it('is open from the start with the open attribute', async () => {
            const { el, dialog } = await drawerFixture({ attrs: 'open="true"' });
            await untilShown(dialog);
            expect(dialog.matches(':modal')).toBe(true);
            expect(el.matches(':state(open)')).toBe(true);
            expect(box(dialog).left).toBe(innerWidth - 200);
        });

        it('fires its own events in order, which reach a listener further up, and none of the dialog', async () => {
            const { wrapper, el } = await drawerFixture();
            const log = [];
            for (const kind of ['drawer', 'dialog']) {
                for (const what of ['show', 'initial-focus', 'after-show', 'request-close', 'hide', 'after-hide']) {
                    wrapper.addEventListener(`${kind}-${what}`, (event) => log.push(event.type));
                }
            }

            await el.show();
            el.requestClose('keyboard');
            await oneEvent(el, 'drawer-after-hide');

            expect(log).toEqual([
                'drawer-show',
                'drawer-initial-focus',
                'drawer-after-show',
                'drawer-request-close',
                'drawer-hide',
                'drawer-after-hide',
            ]);
        });

        it('closes with Escape', async () => {
            const { el } = await drawerFixture();
            await el.show();

            const requested = oneEvent(el, 'drawer-request-close');
            const hidden = oneEvent(el, 'drawer-after-hide');
            await userEvent.keyboard('{Escape}');

            expect((await requested).detail.source).toBe('keyboard');
            await hidden;
            expect(el.open).toBe(false);
        });

        it('closes with a click on the backdrop', async () => {
            const { el, dialog } = await drawerFixture();
            await el.show();

            const requested = oneEvent(el, 'drawer-request-close');
            const hidden = oneEvent(el, 'drawer-after-hide');
            // 50px beside the drawer, which lies along the right edge.
            await userEvent.click(dialog, { position: { x: -50, y: 100 } });

            expect((await requested).detail.source).toBe('overlay');
            await hidden;
            expect(el.open).toBe(false);
        });

        it('stays open with a click inside it', async () => {
            const { el, part } = await drawerFixture({ content: '<p class="text">Content</p>' });
            await el.show();

            await userEvent.click(el.querySelector('.text'));
            await userEvent.click(part('title'));
            await aTimeout(50);
            expect(el.open).toBe(true);
        });

        it('closes with its close button', async () => {
            const { el, part } = await drawerFixture();
            await el.show();

            const requested = oneEvent(el, 'drawer-request-close');
            const hidden = oneEvent(el, 'drawer-after-hide');
            await userEvent.click(part('close-button'));

            expect((await requested).detail.source).toBe('close-button');
            await hidden;
            expect(el.open).toBe(false);
        });

        it('stays open when a listener refuses the close, however it is asked for', async () => {
            const { el, dialog, part } = await drawerFixture();
            const sources = [];
            el.addEventListener('drawer-request-close', (event) => {
                sources.push(event.detail.source);
                event.preventDefault();
            });
            await el.show();

            await userEvent.keyboard('{Escape}');
            await userEvent.click(dialog, { position: { x: -50, y: 100 } });
            await userEvent.click(part('close-button'));
            await aTimeout(50);

            expect(sources).toEqual(['keyboard', 'overlay', 'close-button']);
            expect(el.open).toBe(true);
            expect(dialog.matches(':modal')).toBe(true);
        });

        it('shows a refused close with a short pulse of the surface', async () => {
            const { el, dialog } = await drawerFixture();
            el.addEventListener('drawer-request-close', (event) => event.preventDefault());
            await el.show();
            expect(dialog.getAnimations()).toHaveLength(0);

            el.requestClose('keyboard');
            const animations = dialog.getAnimations();
            expect(animations).toHaveLength(1);
            await animations[0].finished;
            expect(el.open).toBe(true);
        });

        it('closes with hide() whatever a listener says', async () => {
            const { el, dialog } = await drawerFixture();
            el.addEventListener('drawer-request-close', (event) => event.preventDefault());
            await el.show();
            await el.hide();
            expect(dialog.open).toBe(false);
        });

        it('locks the scrolling of the page while it is open', async () => {
            const root = document.documentElement;
            const before = root.style.overflow;
            const { el } = await drawerFixture();

            await el.show();
            expect(root.style.overflow).toBe('hidden');

            await el.hide();
            expect(root.style.overflow).toBe(before);
        });

        it('shares the lock with a dialog that is open at the same time', async () => {
            const root = document.documentElement;
            const before = root.style.overflow;
            const { wrapper, el } = await drawerFixture();
            wrapper.insertAdjacentHTML('beforeend', '<el-dialog label="Confirm"><p>Sure?</p></el-dialog>');
            const confirm = wrapper.querySelector('el-dialog');
            await nextFrame();

            await el.show();
            await confirm.show();
            await confirm.hide();
            expect(root.style.overflow).toBe('hidden');

            await el.hide();
            expect(root.style.overflow).toBe(before);
        });

        it('gives the page back when it is removed while it is open', async () => {
            const root = document.documentElement;
            const before = root.style.overflow;
            const { el, opener } = await drawerFixture();
            await el.show();

            el.remove();
            expect(root.style.overflow).toBe(before);
            opener.focus();
            expect(document.activeElement).toBe(opener);
        });
    });

    describe('header, body and footer', () => {
        it('has a header with the label as a heading and a close button with a name', async () => {
            const { el, part } = await drawerFixture({ attrs: 'close-label="Close the filters"' });
            await el.show();
            expect(part('title').tagName).toBe('H2');
            expect(part('title').textContent.trim()).toBe('Filters');
            expect(await accessibleName(part('close-button'))).toBe('Close the filters');
        });

        it('has no header with no-header, and is named by the label all the same', async () => {
            const { el, dialog, part } = await drawerFixture({ attrs: 'no-header="true"' });
            await el.show();
            expect(part('header')).toBeNull();
            expect(part('close-button')).toBeNull();
            expect(await accessibleName(dialog)).toBe('Filters');
        });

        it('shows what is put into the header-actions and footer slots', async () => {
            const { el, part } = await drawerFixture({
                content: `
                    <button slot="header-actions" type="button" class="reset">Reset</button>
                    <p>Content</p>
                    <button slot="footer" type="button" class="apply">Apply</button>
                `,
            });
            await el.show();
            const header = box(part('header'));
            const reset = box(el.querySelector('.reset'));
            expect(reset.top).toBeGreaterThanOrEqual(header.top);
            expect(reset.bottom).toBeLessThanOrEqual(header.bottom);
            // The footer is at the bottom of a drawer that goes from the top to the bottom.
            expect(box(part('footer')).bottom).toBe(innerHeight);
            expect(box(el.querySelector('.apply')).bottom).toBeLessThanOrEqual(innerHeight);
        });

        it('lets the body scroll and keeps the header and the footer in place', async () => {
            const { el, dialog, part } = await drawerFixture({
                content: `
                    <div style="height: 3000px">Long content</div>
                    <button slot="footer" type="button">Apply</button>
                `,
            });
            await el.show();
            const body = part('body');
            expect(box(dialog).height).toBe(innerHeight);
            expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
            expect(dialog.scrollHeight).toBe(dialog.clientHeight);
            expect(box(part('header')).top).toBe(0);
            expect(box(part('footer')).bottom).toBe(innerHeight);
        });
    });

    describe('look', () => {
        it('paints nothing without a theme', async () => {
            const { el, dialog } = await drawerFixture();
            await el.show();
            const style = getComputedStyle(dialog);
            expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(borders(dialog)).toBe('0px 0px 0px 0px');
            expect(style.boxShadow).toBe('none');
            expect(getComputedStyle(dialog, '::backdrop').backgroundColor).toBe('rgba(0, 0, 0, 0)');
        });

        it('takes its surface from the tokens, and its backdrop from the one of the dialog', async () => {
            const { el, dialog } = await drawerFixture({
                tokens: [
                    '--el-drawer-size: 200px',
                    '--el-color-bg: rgb(250, 250, 250)',
                    '--el-color-fg: rgb(10, 20, 30)',
                    '--el-color-border: rgb(1, 2, 3)',
                    '--el-border-width: 1px',
                    '--el-shadow-lg: 0 0 10px rgb(4, 5, 6)',
                    '--el-dialog-overlay-background: rgb(7, 8, 9)',
                ].join('; '),
            });
            await el.show();
            const style = getComputedStyle(dialog);
            expect(style.backgroundColor).toBe('rgb(250, 250, 250)');
            expect(style.color).toBe('rgb(10, 20, 30)');
            expect(style.borderLeftColor).toBe('rgb(1, 2, 3)');
            expect(style.boxShadow).toContain('rgb(4, 5, 6)');
            expect(getComputedStyle(dialog, '::backdrop').backgroundColor).toBe('rgb(7, 8, 9)');
        });

        it('takes the style a page gives its parts', async () => {
            const style = document.createElement('style');
            style.textContent = `
                el-drawer.styled::part(base) { border-radius: 16px 0 0 16px; padding-block-end: 10px; }
                el-drawer.styled::part(body) { padding: 5px; }
            `;
            document.head.append(style);
            try {
                const { el, dialog, part } = await drawerFixture({ attrs: 'class="styled"' });
                await el.show();
                expect(getComputedStyle(dialog).borderTopLeftRadius).toBe('16px');
                expect(getComputedStyle(dialog).borderTopRightRadius).toBe('0px');
                expect(getComputedStyle(dialog).paddingBottom).toBe('10px');
                expect(getComputedStyle(part('body')).paddingLeft).toBe('5px');
            } finally {
                style.remove();
            }
        });

        it('grows away from its edge when a close is refused', async () => {
            const origins = {};
            for (const [placement, dir] of [
                ['end', ''],
                ['start', ''],
                ['top', ''],
                ['bottom', ''],
                ['end', 'rtl'],
            ]) {
                const { el, dialog } = await drawerFixture({ attrs: `placement="${placement}"`, dir });
                await el.show();
                origins[`${placement}${dir && ` ${dir}`}`] = getComputedStyle(dialog).transformOrigin;
                await el.hide();
            }
            expect(origins).toEqual({
                end: `200px ${innerHeight / 2}px`,
                start: `0px ${innerHeight / 2}px`,
                top: `${innerWidth / 2}px 0px`,
                bottom: `${innerWidth / 2}px 200px`,
                'end rtl': `0px ${innerHeight / 2}px`,
            });
        });
    });

    describe('for a user who prefers reduced motion', () => {
        useReducedMotion();

        it('is in its place at once', async () => {
            const { el, dialog } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-duration-md: 2s' });
            expect(getComputedStyle(dialog).transitionDuration).toBe('0s');
            const started = performance.now();
            await el.show();
            expect(performance.now() - started).toBeLessThan(1000);
            expect(box(dialog).left).toBe(innerWidth - 200);
        });

        it('does not pulse when a close is refused', async () => {
            const { el, dialog } = await drawerFixture();
            el.addEventListener('drawer-request-close', (event) => event.preventDefault());
            await el.show();
            el.requestClose('keyboard');
            expect(dialog.getAnimations()).toHaveLength(0);
            expect(el.open).toBe(true);
        });
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const { el, part } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-touch-target: 44px' });
        await el.show();
        expect(sizeOf(part('close-button'))).toEqual({ width: 20, height: 20 });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the close button at least --el-touch-target in both directions', async () => {
            const { el, part } = await drawerFixture({ tokens: '--el-drawer-size: 200px; --el-touch-target: 44px' });
            await el.show();
            const { width, height } = sizeOf(part('close-button'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });
    });

    describe('accessibility', () => {
        it('has no detectable a11y violations while it is closed', async () => {
            const { wrapper } = await drawerFixture();
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });

        for (const placement of ['start', 'end', 'top', 'bottom']) {
            it(`has no detectable a11y violations while it is open at the ${placement}`, async () => {
                const { wrapper, el } = await drawerFixture({
                    attrs: `placement="${placement}"`,
                    tokens: '--el-drawer-size: 200px; --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(17, 24, 39)',
                    content: '<p>Content</p><button slot="footer" type="button">Apply</button>',
                });
                await el.show();
                const results = await axe.run(wrapper);
                expect(results.violations.map((violation) => violation.id)).toEqual([]);
            });
        }

        it('has no detectable a11y violations without a header', async () => {
            const { wrapper, el } = await drawerFixture({
                attrs: 'no-header="true"',
                content: '<p>Content</p><button slot="footer" type="button">Close</button>',
            });
            await el.show();
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    it('has its closed dialog, its parts and its slots in the server-rendered markup', async () => {
        const { el } = await drawerFixture();
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<dialog[^>]*\spart=['"]base['"]/);
        // Closed: the browser does not show a dialog without `open`, so nothing flashes.
        expect(markup).not.toMatch(/<dialog[^>]*\sopen[\s=>]/);
        for (const part of ['header', 'title', 'header-actions', 'close-button', 'body', 'footer']) {
            expect(markup, part).toMatch(new RegExp(`\\spart=['"]${part}['"]`));
        }
        for (const slot of ['label', 'header-actions', 'footer']) {
            expect(markup, slot).toMatch(new RegExp(`<slot[^>]*\\sname=['"]${slot}['"]`));
        }
        expect(markup).toMatch(/<slot>/);
    });

    it('takes over server-rendered markup: it opens at its edge, with its footer', async () => {
        // The markup the SSR renderer writes. The browser fills the slots while it parses, before
        // the element takes over.
        const source = document.createElement('el-drawer');
        Object.assign(source, source.properties(), { label: 'Filters', placement: 'start' });
        const wrapper = document.createElement('div');
        wrapper.style.setProperty('--el-drawer-size', '200px');
        document.body.append(wrapper);
        wrappers.push(wrapper);
        wrapper.setHTMLUnsafe(`
            <el-drawer label="Filters" placement="start">
                <template shadowrootmode="open">${source.template().toString()}</template>
                <p>Content</p>
                <button slot="footer" type="button">Apply</button>
            </el-drawer>
        `);
        const el = wrapper.querySelector('el-drawer');
        const serverRendered = el.shadowRoot.querySelector('dialog');
        await nextFrame();
        await nextFrame();

        await el.show();
        const dialog = el.shadowRoot.querySelector('dialog');
        expect(dialog).toBe(serverRendered);
        expect(dialog.matches(':modal')).toBe(true);
        expect(box(dialog)).toMatchObject({ left: 0, right: 200, top: 0, bottom: innerHeight });
        expect(getComputedStyle(el.shadowRoot.querySelector('[part~="footer"]')).display).toBe('flex');
    });
});
