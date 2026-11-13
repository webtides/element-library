import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { fixture, nextFrame, aTimeout, oneEvent, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './dialog.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

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
        // An open dialog keeps the page locked and inert for the tests that follow.
        await el.hide();
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

    describe('opened and closed in quick succession', () => {
        const wrappers = [];
        afterEach(() => {
            for (const wrapper of wrappers.splice(0)) wrapper.remove();
        });

        /**
         * A dialog whose way in and out takes `duration`, with a log of its events and a button
         * before it in the page.
         */
        async function tracked(duration = '200ms') {
            // A test before this one that left a dialog open would make every state here wrong.
            expect(document.documentElement.style.overflow, 'the page is locked before the test').not.toBe('hidden');
            const wrapper = await fixture(`
                <div style="--el-duration-md: ${duration}">
                    <button class="toggle" type="button">Toggle</button>
                    <el-dialog label="Dialog title"><p>Dialog body content.</p></el-dialog>
                </div>
            `);
            wrappers.push(wrapper);
            const el = wrapper.querySelector('el-dialog');
            const dialog = el.shadowRoot.querySelector('dialog');
            const log = [];
            for (const what of ['show', 'initial-focus', 'after-show', 'hide', 'after-hide']) {
                el.addEventListener(`dialog-${what}`, () => log.push(what));
            }
            const state = () => ({
                open: el.open,
                native: dialog.open,
                showing: dialog.classList.contains('showing'),
                state: el.matches(':state(open)'),
                locked: document.documentElement.style.overflow === 'hidden',
            });
            return { wrapper, el, dialog, log, state, toggle: wrapper.querySelector('.toggle') };
        }

        const SHOWN = { open: true, native: true, showing: true, state: true, locked: true };
        const CLOSED = { open: false, native: false, showing: false, state: false, locked: false };

        /** What may follow an event. A log that ends at rest ends with one of the two `after-` events. */
        const FOLLOWS = {
            show: ['initial-focus', 'after-show', 'hide'],
            'initial-focus': ['after-show', 'hide'],
            'after-show': ['hide'],
            hide: ['after-hide', 'show'],
            'after-hide': ['show'],
        };
        function expectInOrder(log) {
            log.forEach((event, index) => {
                const next = log[index + 1];
                if (next) expect(FOLLOWS[event], `${event} before ${next} in ${log.join(' > ')}`).toContain(next);
            });
            if (log.length > 0) expect(['after-show', 'after-hide'], log.join(' > ')).toContain(log.at(-1));
        }

        it('does nothing when it is opened and closed again before the next frame', async () => {
            const { el, log, state } = await tracked();
            await Promise.all([el.show(), el.hide()]);
            expect(log).toEqual([]);
            expect(state()).toEqual(CLOSED);

            // And it has its way in the next time.
            await el.show();
            expect(log).toEqual(['show', 'initial-focus', 'after-show']);
            expect(state()).toEqual(SHOWN);
        });

        it('does nothing when it is closed and opened again before the next frame', async () => {
            const { el, dialog, log, state } = await tracked();
            await el.show();
            log.length = 0;

            await Promise.all([el.hide(), el.show()]);
            expect(log).toEqual([]);
            expect(state()).toEqual(SHOWN);
            expect(dialog.matches(':modal')).toBe(true);
        });

        it('turns back when it is closed on its way in', async () => {
            const { el, log, state } = await tracked();
            const shown = el.show();
            await aTimeout(60);
            const hidden = el.hide();
            await Promise.all([shown, hidden]);

            expect(log).toEqual(['show', 'initial-focus', 'hide', 'after-hide']);
            expect(state()).toEqual(CLOSED);
        });

        it('closes at once when it is closed before it has begun to come in', async () => {
            const { el, log, state } = await tracked('2s');
            // The way in has begun for the component, and waits for its frames.
            el.addEventListener('dialog-show', () => el.hide(), { once: true });

            const started = performance.now();
            await el.show();
            expect(performance.now() - started).toBeLessThan(1000);
            expect(log).toEqual(['show', 'initial-focus', 'hide', 'after-hide']);
            expect(state()).toEqual(CLOSED);

            // The way in that was cut short wakes up after its frames, and leaves everything alone.
            await aTimeout(100);
            expect(log).toEqual(['show', 'initial-focus', 'hide', 'after-hide']);
            expect(state()).toEqual(CLOSED);
        });

        it('turns round when it is opened on its way out', async () => {
            const { el, dialog, log, state } = await tracked();
            await el.show();
            log.length = 0;

            const hidden = el.hide();
            await aTimeout(60);
            const shown = el.show();
            await Promise.all([hidden, shown]);

            // It was never closed, so the platform has not moved the focus again.
            expect(log).toEqual(['hide', 'show', 'after-show']);
            expect(state()).toEqual(SHOWN);
            expect(dialog.matches(':modal')).toBe(true);
            expect(getComputedStyle(dialog).opacity).toBe('1');
        });

        it('opens anew when the close was over, as without a transition', async () => {
            const { el, log, state } = await tracked('0s');
            await el.show();
            log.length = 0;

            const hidden = el.hide();
            await aTimeout(60);
            const shown = el.show();
            await Promise.all([hidden, shown]);

            expect(log).toEqual(['hide', 'after-hide', 'show', 'initial-focus', 'after-show']);
            expect(state()).toEqual(SHOWN);
        });

        it('resolves show() and hide() when the dialog is at rest, wherever that is', async () => {
            const { el, state } = await tracked();
            const atRest = [];
            const shown = el.show().then(() => atRest.push(state()));
            await aTimeout(60);
            el.hide();
            await shown;
            expect(atRest).toEqual([CLOSED]);

            await el.show();
            const hidden = el.hide().then(() => atRest.push(state()));
            await aTimeout(60);
            el.show();
            await hidden;
            expect(atRest).toEqual([CLOSED, SHOWN]);
        });

        it('lets a second show() wait for the way in that is under way', async () => {
            const { el, state } = await tracked();
            el.show();
            await aTimeout(60);

            let done = false;
            const second = el.show().then(() => (done = true));
            await aTimeout(20);
            expect(done).toBe(false);

            await second;
            expect(state()).toEqual(SHOWN);
        });

        it('keeps the promises waiting when a close and an open cancel each other on the way in', async () => {
            const { el, log, state } = await tracked('600ms');
            el.show();
            await aTimeout(60);

            let done = false;
            const both = Promise.all([el.hide(), el.show()]).then(() => (done = true));
            // The watchers of the two changes have run by now, and found nothing to do. The way in
            // is still under way.
            await aTimeout(100);
            expect(done).toBe(false);

            await both;
            expect(log).toEqual(['show', 'initial-focus', 'after-show']);
            expect(state()).toEqual(SHOWN);
        });

        it('ends where `open` says after many changes, with every event in its place', async () => {
            for (const [duration, last] of [
                ['200ms', true],
                ['200ms', false],
                ['0s', true],
                ['0s', false],
            ]) {
                const { el, log, state } = await tracked(duration);
                for (const open of [true, false, true, true, false, true, false, !last, last]) {
                    el.open = open;
                    await aTimeout(30);
                }
                await (last ? el.show() : el.hide());

                expect(state(), `${duration}, ${last}: ${log.join(' > ')}`).toEqual(last ? SHOWN : CLOSED);
                expectInOrder(log);
                await el.hide();
            }
        });

        it('waits in hide() and show() when `open` got its value just before the call', async () => {
            const { el, log, state } = await tracked();
            await el.show();

            // Set by hand. The dialog begins to move with the next frame.
            el.open = false;
            await el.hide();
            expect(state()).toEqual(CLOSED);

            el.open = true;
            await el.show();
            expect(state()).toEqual(SHOWN);

            // By a request to close, as the close button makes it.
            el.requestClose('close-button');
            await el.hide();
            expect(state()).toEqual(CLOSED);

            // In and out twice, each way to its end.
            const inAndOut = ['show', 'initial-focus', 'after-show', 'hide', 'after-hide'];
            expect(log).toEqual([...inAndOut, ...inAndOut]);
        });

        it('is closed after a double click on a button that toggles it', async () => {
            const { el, toggle, log, state } = await tracked();
            toggle.addEventListener('click', () => (el.open = !el.open));

            // The second click reaches the button again, or the backdrop when the dialog is there
            // by then. Either way it closes what the first one opened.
            await userEvent.dblClick(toggle);
            await aTimeout(400);
            await el.hide();

            expect(state()).toEqual(CLOSED);
            expectInOrder(log);
        });

        it('resolves show() and fires no after-show when it is removed on its way in', async () => {
            const { el, log } = await tracked();
            const shown = el.show();
            await aTimeout(60);
            el.remove();
            await shown;
            await aTimeout(300);

            expect(log).toEqual(['show', 'initial-focus']);
            expect(document.documentElement.style.overflow).not.toBe('hidden');
        });
    });

    describe('with a form that has method="dialog" in it', () => {
        const wrappers = [];
        afterEach(() => {
            for (const wrapper of wrappers.splice(0)) wrapper.remove();
        });

        /** An open dialog with `content` as its children, and a log of the events it fires from then on. */
        async function opened(content) {
            expect(document.documentElement.style.overflow, 'the page is locked before the test').not.toBe('hidden');
            const wrapper = await fixture(`<div><el-dialog label="Dialog title">${content}</el-dialog></div>`);
            wrappers.push(wrapper);
            const el = wrapper.querySelector('el-dialog');
            await el.show();
            const log = [];
            for (const what of ['show', 'after-show', 'request-close', 'hide', 'after-hide']) {
                // The events of a dialog inside this one come by here too.
                el.addEventListener(`dialog-${what}`, (event) => event.target === el && log.push(what));
            }
            return {
                el,
                log,
                dialog: el.shadowRoot.querySelector('dialog'),
                find: (selector) => wrapper.querySelector(selector),
            };
        }

        /** A `submit` as a script fires it. Nothing of the platform follows it, a navigation least of all. */
        const submit = (form, submitter = null) =>
            form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter }));

        it('closes when the button of the form is clicked, and asks nobody', async () => {
            const { el, dialog, log, find } = await opened(`<form method="dialog"><button>OK</button></form>`);

            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.click(find('button'));
            await closed;

            expect(el.open).toBe(false);
            expect(dialog.open).toBe(false);
            expect(document.documentElement.style.overflow).not.toBe('hidden');
            // No `dialog-request-close`: whoever wants it to stay open prevents the `submit`.
            expect(log).toEqual(['hide', 'after-hide']);
        });

        it('closes for Enter in a field of the form', async () => {
            const { el, find } = await opened(`
                <form method="dialog"><input name="name" aria-label="Name" /><button>OK</button></form>
            `);
            find('input').focus();

            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.keyboard('{Enter}');
            await closed;

            expect(el.open).toBe(false);
        });

        it('closes for a button in the footer that belongs to a form in the body', async () => {
            const { el, find } = await opened(`
                <form id="dialog-test-form" method="dialog"><input name="name" aria-label="Name" /></form>
                <button slot="footer" form="dialog-test-form">Save</button>
            `);

            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.click(find('button'));
            await closed;

            expect(el.open).toBe(false);
        });

        it('closes for a button that says so in a form with another method', async () => {
            const { el, find } = await opened(`<form><button formmethod="dialog">Cancel</button></form>`);

            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.click(find('button'));
            await closed;

            expect(el.open).toBe(false);
        });

        it('reads the method in any case of its letters, and past a control with the name "method"', async () => {
            const { el, find } = await opened(`
                <form method="DIALOG"><input name="method" value="post" aria-label="Method" /><button>OK</button></form>
            `);
            // The property of the form is the control now.
            expect(find('form').method).toBe(find('input'));

            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.click(find('button'));
            await closed;

            expect(el.open).toBe(false);
        });

        it('stays open when a listener prevents the submit, wherever it listens', async () => {
            for (const where of ['form', 'el-dialog', 'document']) {
                const { el, log, find } = await opened(`<form method="dialog"><button>OK</button></form>`);
                const target = where === 'document' ? document : find(where);
                const prevent = (event) => event.preventDefault();
                target.addEventListener('submit', prevent);

                await userEvent.click(find('button'));
                await aTimeout(100);
                target.removeEventListener('submit', prevent);

                expect(el.open, where).toBe(true);
                expect(log, where).toEqual([]);
                await el.hide();
            }
        });

        it('stays open while the form is not valid', async () => {
            const { el, log, find } = await opened(`
                <form method="dialog"><input name="name" aria-label="Name" required /><button>OK</button></form>
            `);

            await userEvent.click(find('button'));
            await aTimeout(100);
            expect(el.open).toBe(true);
            expect(log).toEqual([]);

            find('input').value = 'Ada';
            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.click(find('button'));
            await closed;
            expect(el.open).toBe(false);
        });

        it('closes for a button that skips the validation', async () => {
            const { el, find } = await opened(`
                <form method="dialog">
                    <input name="name" aria-label="Name" required />
                    <button class="cancel" formnovalidate>Cancel</button>
                    <button>OK</button>
                </form>
            `);

            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.click(find('.cancel'));
            await closed;
            expect(el.open).toBe(false);
        });

        it('closes for an el-button of the type submit in the form', async () => {
            const { el, find } = await opened(`
                <form method="dialog"><el-button type="submit">OK</el-button></form>
            `);

            const closed = oneEvent(el, 'dialog-after-hide');
            await userEvent.click(find('el-button'));
            await closed;
            expect(el.open).toBe(false);
        });

        it('stays open for a submit with another method', async () => {
            // The control: a `submit` fired by a script closes it like one of the platform.
            const { el, find } = await opened(`<form method="dialog"><button>OK</button></form>`);
            const closed = oneEvent(el, 'dialog-after-hide');
            submit(find('form'), find('button'));
            await closed;
            expect(el.open).toBe(false);

            for (const content of [
                `<form><button>OK</button></form>`,
                `<form method="post"><button>OK</button></form>`,
                // The button decides before the form.
                `<form method="dialog"><button formmethod="post">OK</button></form>`,
                `<form method="dialog"><button formmethod="">OK</button></form>`,
                // Not a form.
                `<div class="form" method="dialog"><button>OK</button></div>`,
            ]) {
                const { el, log, find } = await opened(content);
                submit(find('form, .form'), find('form button'));
                await aTimeout(100);

                expect(el.open, content).toBe(true);
                expect(log, content).toEqual([]);
                await el.hide();
            }
        });

        it('closes the nearest dialog only', async () => {
            const { el, log, find } = await opened(`
                <p>Outer</p>
                <el-dialog class="inner" label="Inner"><form method="dialog"><button>OK</button></form></el-dialog>
            `);
            const inner = find('.inner');
            await inner.show();

            const closed = oneEvent(inner, 'dialog-after-hide');
            await userEvent.click(find('button'));
            await closed;
            await aTimeout(100);

            expect(inner.open).toBe(false);
            expect(el.open).toBe(true);
            expect(log).toEqual([]);
            await el.hide();
        });

        it('leaves a <dialog> of the page inside it to the platform', async () => {
            const { el, log, find } = await opened(`
                <dialog class="native" open><form method="dialog"><button>OK</button></form></dialog>
            `);

            await userEvent.click(find('button'));
            await aTimeout(100);

            expect(find('.native').open).toBe(false);
            expect(el.open).toBe(true);
            expect(log).toEqual([]);
            await el.hide();
        });
    });
});
