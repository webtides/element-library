import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { accessibleName, accessibleRole, fixture, nextFrame, oneEvent, sizeOf } from '../../test-helpers.js';
import { define, toast } from './toast.js';
define();

const base = (el) => el.shadowRoot.querySelector('[part~="base"]');
const texts = (el) => [...el.children].map((entry) => entry.textContent.trim());
const isShown = (el) => el.matches(':popover-open');
const shown = (entry) => oneEvent(entry, 'notification-after-show');
const hidden = (entry) => oneEvent(entry, 'notification-after-hide');
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const rect = (element) => {
    const { left, top, right, bottom, width } = element.getBoundingClientRect();
    const round = (number) => Math.round(number * 10) / 10;
    return {
        left: round(left),
        top: round(top),
        right: round(innerWidth - right),
        bottom: round(innerHeight - bottom),
        centre: round(left + width / 2 - innerWidth / 2),
    };
};
// A region with toasts that are shown, one per text.
const regionWith = async (attributes, ...messages) => {
    const el = await fixture(`<el-toast ${attributes}></el-toast>`);
    const entries = messages.map((message) => el.toast(message, { duration: Infinity }));
    await Promise.all(entries.map(shown));
    return [el, ...entries];
};

describe('Feature | Toast', () => {
    // The function uses the first region of the page: none may be left over from another test.
    afterEach(() => {
        document.querySelectorAll('el-toast, dialog, [data-fixture]').forEach((element) => element.remove());
    });

    it('can connect without errors', async () => {
        await fixture(`<el-toast></el-toast>`);
        await nextFrame();
    });

    describe('what it is', () => {
        it('is a landmark with a name, around its toasts', async () => {
            const [el, entry] = await regionWith('', 'Saved.');

            expect(await accessibleRole(base(el))).toBe('region');
            expect(await accessibleName(base(el))).toBe('Notifications');
            expect(base(el).querySelector('slot').assignedElements()).toEqual([entry]);
        });

        it('takes the name of the landmark from label, for another language', async () => {
            const [el] = await regionWith('label="Meldungen"', 'Gespeichert.');
            expect(await accessibleName(base(el))).toBe('Meldungen');

            el.label = 'Hinweise';
            await rendered();
            expect(await accessibleName(base(el))).toBe('Hinweise');
        });

        it('is nothing to see and no landmark without toasts', async () => {
            const el = await fixture(`<el-toast></el-toast>`);

            expect(el.getAttribute('popover')).toBe('manual');
            expect(isShown(el)).toBe(false);
            expect(getComputedStyle(el).display).toBe('none');
            // Not rendered, so not in the tree a screen reader walks.
            expect(await accessibleRole(base(el))).toBe('none');
        });

        it('comes into the top layer with its first toast, and leaves it with the last', async () => {
            const el = await fixture(`<el-toast></el-toast>`);

            const first = el.toast('First', { duration: Infinity });
            // At once, not a frame later.
            expect(isShown(el)).toBe(true);
            const second = el.toast('Second', { duration: Infinity });
            await Promise.all([shown(first), shown(second)]);
            expect(getComputedStyle(el).display).toBe('block');

            await first.hide();
            expect(isShown(el)).toBe(true);
            await second.hide();
            expect(isShown(el)).toBe(false);
            expect(getComputedStyle(el).display).toBe('none');
        });

        it('lies above everything the page has in front', async () => {
            const cover = await fixture(`
                <div data-fixture>
                    <div style="position: fixed; inset: 0; z-index: 2147483647; background: white"></div>
                    <div popover="manual" style="position: fixed; inset: 0; width: auto; height: auto"></div>
                </div>
            `);
            cover.querySelector('[popover]').showPopover();
            const [, entry] = await regionWith('', 'On top');
            const { left, top, width, height } = entry.getBoundingClientRect();

            expect(document.elementFromPoint(left + width / 2, top + height / 2)).toBe(entry);
        });

        it('comes to the front again with every new toast', async () => {
            const [el, first] = await regionWith('', 'First');
            const centre = (entry) => {
                const { left, top, width, height } = entry.getBoundingClientRect();
                return document.elementFromPoint(left + width / 2, top + height / 2);
            };
            // Something that is opened while the toast is shown lies above it.
            const later = await fixture(
                `<div data-fixture popover="manual" style="position: fixed; inset: 0; width: auto; height: auto"></div>`,
            );
            later.showPopover();
            expect(centre(first)).toBe(later);

            const second = el.toast('Second', { duration: Infinity });
            // Out and in again in one go: there is no moment without the region.
            expect(isShown(el)).toBe(true);
            await shown(second);

            expect(centre(first)).toBe(first);
            expect(centre(second)).toBe(second);
        });

        it('leaves the toasts that are shown as they are when it comes to the front', async () => {
            const wrapper = await fixture(
                `<div data-fixture style="--el-duration-md: 300ms"><el-toast></el-toast></div>`,
            );
            const el = wrapper.firstElementChild;
            const first = el.toast('First', { duration: Infinity });
            await shown(first);
            const close = first.shadowRoot.querySelector('[part~="close-button"]');
            close.focus();
            const events = [];
            for (const name of ['notification-show', 'notification-hide', 'toggle']) {
                first.addEventListener(name, () => events.push(name));
            }
            close.addEventListener('blur', () => events.push('blur'));

            const second = el.toast('Second', { duration: Infinity });
            const opacities = [];
            for (let frame = 0; frame < 6; frame++) {
                opacities.push(getComputedStyle(first.shadowRoot.querySelector('[part~="base"]')).opacity);
                await nextFrame();
            }
            await shown(second);

            // Not hidden and shown again, not faded in again, and the focus is where it was.
            expect(events).toEqual([]);
            expect([...new Set(opacities)]).toEqual(['1']);
            expect(first.shadowRoot.activeElement).toBe(close);
            expect(first.open).toBe(true);
        });

        it('lets the pointer through to the page between its toasts', async () => {
            const page = await fixture(`<button data-fixture style="position: fixed; inset: 0">Page</button>`);
            const [el, first, second] = await regionWith('', 'First', 'Second');
            const gap = (first.getBoundingClientRect().bottom + second.getBoundingClientRect().top) / 2;
            const middle = first.getBoundingClientRect().left + first.getBoundingClientRect().width / 2;

            expect(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom).toBe(8);
            expect(getComputedStyle(el).pointerEvents).toBe('none');
            expect(document.elementFromPoint(middle, gap)).toBe(page);
            expect(document.elementFromPoint(middle, first.getBoundingClientRect().top + 5)).toBe(first);
        });

        it('has nothing of the box the platform gives a popover', async () => {
            const [el] = await regionWith('', 'Saved.');
            const style = getComputedStyle(el);

            expect(style.borderTopStyle).toBe('none');
            expect(style.padding).toBe('0px');
            expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(style.overflow).toBe('visible');
            expect(style.position).toBe('fixed');
            // As large as its toast, and no more.
            expect(sizeOf(el)).toEqual(sizeOf(el.firstElementChild));
        });

        it('is hidden by the hidden attribute', async () => {
            const [el] = await regionWith('hidden', 'Saved.');
            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('toast()', () => {
        it('shows a text as a notification that can be closed and leaves by itself', async () => {
            const el = await fixture(`<el-toast></el-toast>`);

            const entry = el.toast('Saved.');
            await shown(entry);

            expect(entry.localName).toBe('el-notification');
            expect(entry.parentElement).toBe(el);
            expect(entry.textContent).toBe('Saved.');
            expect(entry.open).toBe(true);
            expect(entry.closable).toBe(true);
            expect(entry.duration).toBe(5000);
            expect(entry.variant).toBe('default');
            expect(entry.shadowRoot.querySelector('[part~="close-button"]')).not.toBeNull();
            expect(getComputedStyle(entry.shadowRoot.querySelector('[part~="base"]')).opacity).toBe('1');
        });

        it('takes the variant, the duration, the close button and its label from the options', async () => {
            const el = await fixture(`<el-toast></el-toast>`);

            const entry = el.toast('Not saved.', {
                variant: 'danger',
                duration: Infinity,
                closable: true,
                closeLabel: 'Schließen',
            });
            const plain = el.toast('Saved.', { closable: false });
            await Promise.all([shown(entry), shown(plain)]);

            expect(entry.variant).toBe('danger');
            expect(entry.duration).toBe(Infinity);
            expect(entry.getAttribute('role')).toBe('alert');
            expect(await accessibleName(entry.shadowRoot.querySelector('[part~="close-button"]'))).toBe('Schließen');
            expect(plain.closable).toBe(false);
            expect(plain.duration).toBe(5000);
            expect(plain.shadowRoot.querySelector('[part~="close-button"]')).toBeNull();
        });

        it('shows a node as the content of the notification', async () => {
            const el = await fixture(`<el-toast></el-toast>`);
            const content = document.createElement('span');
            content.innerHTML = 'Saved to <strong>Drafts</strong>.';

            const entry = el.toast(content);
            await shown(entry);

            expect(entry.localName).toBe('el-notification');
            expect(entry.firstElementChild).toBe(content);
            expect(entry.querySelector('strong').textContent).toBe('Drafts');
        });

        it('shows a notification as it is, with the options on top', async () => {
            const el = await fixture(`<el-toast></el-toast>`);
            const note = Object.assign(document.createElement('el-notification'), { variant: 'success' });
            note.textContent = 'Sent.';

            const entry = el.toast(note, { closeLabel: 'Schließen' });
            await shown(entry);

            expect(entry).toBe(note);
            expect(entry.parentElement).toBe(el);
            expect(entry.open).toBe(true);
            // Its own values, not the ones a text would get.
            expect(entry.variant).toBe('success');
            expect(entry.closable).toBe(false);
            expect(entry.duration).toBe(Infinity);
            expect(entry.closeLabel).toBe('Schließen');
        });

        it('takes a toast out of the page once it is closed', async () => {
            const [el, entry] = await regionWith('', 'Saved.');
            const gone = hidden(entry);

            await userEvent.click(entry.shadowRoot.querySelector('[part~="close-button"]'));
            await gone;

            expect(entry.isConnected).toBe(false);
            expect(el.childElementCount).toBe(0);
            expect(isShown(el)).toBe(false);
        });

        it('lets a toast leave by itself after its duration', async () => {
            const el = await fixture(`<el-toast></el-toast>`);
            const before = performance.now();

            const entry = el.toast('Saved.', { duration: 150 });
            await hidden(entry);

            expect(performance.now() - before).toBeGreaterThanOrEqual(150);
            expect(entry.isConnected).toBe(false);
            expect(isShown(el)).toBe(false);
        });

        it('returns the notification, which can be taken away early', async () => {
            const [el, first, second] = await regionWith('', 'First', 'Second');

            await first.hide();

            expect(texts(el)).toEqual(['Second']);
            expect(second.open).toBe(true);
            expect(isShown(el)).toBe(true);
        });

        it('keeps a toast for a region that is not in the page yet', async () => {
            const el = document.createElement('el-toast');
            const entry = el.toast('Early', { duration: Infinity });
            expect(entry.isConnected).toBe(false);

            document.body.append(el);
            await shown(entry);

            expect(entry.parentElement).toBe(el);
            expect(isShown(el)).toBe(true);
        });

        it('leaves a notification alone that fires its events inside of a toast', async () => {
            const el = await fixture(`<el-toast></el-toast>`);
            const content = document.createElement('div');
            content.innerHTML = `<el-notification open="true">Inner</el-notification>`;
            const entry = el.toast(content, { duration: Infinity });
            await shown(entry);
            await rendered();
            const inner = content.firstElementChild;

            await inner.hide();
            await rendered();

            expect(inner.parentElement).toBe(content);
            expect(entry.parentElement).toBe(el);
            expect(entry.open).toBe(true);
        });
    });

    describe('more toasts than places', () => {
        it('shows no more than max toasts at once, and the next when a place is free', async () => {
            const el = await fixture(`<el-toast max="2"></el-toast>`);
            const [first, second, third] = ['First', 'Second', 'Third'].map((text) =>
                el.toast(text, { duration: Infinity }),
            );
            await Promise.all([shown(first), shown(second)]);
            await rendered();

            expect(texts(el)).toEqual(['First', 'Second']);
            expect(third.isConnected).toBe(false);
            expect(third.open).toBeFalsy();

            await first.hide();
            await shown(third);
            expect(texts(el)).toEqual(['Second', 'Third']);
            expect(third.open).toBe(true);
        });

        it('shows the toasts that wait in the order they came', async () => {
            const el = await fixture(`<el-toast max="1"></el-toast>`);
            const entries = ['First', 'Second', 'Third', 'Fourth'].map((text) =>
                el.toast(text, { duration: Infinity }),
            );
            const seen = [];

            for (const entry of entries) {
                await shown(entry);
                seen.push(texts(el).join());
                await entry.hide();
            }

            expect(seen).toEqual(['First', 'Second', 'Third', 'Fourth']);
            expect(el.childElementCount).toBe(0);
            expect(isShown(el)).toBe(false);
        });

        it('gives a place free only when a toast is gone, not when it starts to leave', async () => {
            const wrapper = await fixture(
                `<div data-fixture style="--el-duration-md: 200ms"><el-toast max="1"></el-toast></div>`,
            );
            const el = wrapper.firstElementChild;
            const first = el.toast('First', { duration: Infinity });
            const second = el.toast('Second', { duration: Infinity });
            await shown(first);

            const gone = first.hide();
            await rendered();
            expect(first.open).toBe(false);
            expect(texts(el)).toEqual(['First']);
            expect(second.isConnected).toBe(false);
            // A toast that comes now has to wait as well.
            const third = el.toast('Third', { duration: Infinity });
            expect(texts(el)).toEqual(['First']);
            expect(third.isConnected).toBe(false);

            await gone;
            expect(texts(el)).toEqual(['Second']);
        });

        it('gives the place of a toast that the page takes out itself to the next one', async () => {
            const el = await fixture(`<el-toast max="1"></el-toast>`);
            const first = el.toast('First', { duration: Infinity });
            const second = el.toast('Second', { duration: Infinity });
            await shown(first);

            first.remove();
            await shown(second);

            expect(texts(el)).toEqual(['Second']);
            expect(isShown(el)).toBe(true);
        });

        it('shows the toasts that wait when max goes up', async () => {
            const el = await fixture(`<el-toast max="1"></el-toast>`);
            const entries = ['First', 'Second', 'Third'].map((text) => el.toast(text, { duration: Infinity }));
            await shown(entries[0]);
            expect(texts(el)).toEqual(['First']);

            el.max = 3;
            await Promise.all([shown(entries[1]), shown(entries[2])]);

            expect(texts(el)).toEqual(['First', 'Second', 'Third']);
        });

        it('has no limit by default, and for a max that is no number of at least 1', async () => {
            for (const attributes of ['', 'max="0"', 'max="-2"', 'max="some"']) {
                const el = await fixture(`<el-toast ${attributes}></el-toast>`);
                const entries = ['First', 'Second', 'Third', 'Fourth'].map((text) =>
                    el.toast(text, { duration: Infinity }),
                );
                await Promise.all(entries.map(shown));

                expect(texts(el), attributes).toEqual(['First', 'Second', 'Third', 'Fourth']);
                el.remove();
            }
        });
    });

    describe('placement', () => {
        it('is at the top end by default, and says so on the host', async () => {
            const [el, entry] = await regionWith('', 'Saved.');

            expect(el.placement).toBe('top-end');
            expect(el.getAttribute('placement')).toBe('top-end');
            expect(rect(entry)).toMatchObject({ top: 16, right: 16 });
        });

        it('puts the toasts at the edge and the corner that placement names', async () => {
            const places = {
                'top-start': { top: 16, left: 16 },
                top: { top: 16, centre: 0 },
                'top-end': { top: 16, right: 16 },
                'bottom-start': { bottom: 16, left: 16 },
                bottom: { bottom: 16, centre: 0 },
                'bottom-end': { bottom: 16, right: 16 },
            };

            for (const [placement, place] of Object.entries(places)) {
                const [el, entry] = await regionWith(`placement="${placement}"`, 'Saved.');
                expect(rect(entry), placement).toMatchObject(place);
                el.remove();
            }
        });

        it('is in its place on a page that resets the margin and the box of every element', async () => {
            await fixture(
                `<style data-fixture>* { margin: 0; padding: 0; border: 0 solid; box-sizing: border-box; }</style>`,
            );
            const places = {
                'top-start': { top: 16, left: 16 },
                top: { top: 16, centre: 0 },
                'bottom-end': { bottom: 16, right: 16 },
                bottom: { bottom: 16, centre: 0 },
            };

            for (const [placement, place] of Object.entries(places)) {
                const [el, entry] = await regionWith(`placement="${placement}"`, 'Saved.');
                expect(rect(entry), placement).toMatchObject(place);
                el.remove();
            }
        });

        it('follows a placement that is set from a script', async () => {
            const [el, entry] = await regionWith('', 'Saved.');

            el.placement = 'bottom-start';
            await rendered();

            expect(el.getAttribute('placement')).toBe('bottom-start');
            expect(rect(entry)).toMatchObject({ bottom: 16, left: 16 });
        });

        it('turns start and end with the reading direction', async () => {
            const [start, atStart] = await regionWith('placement="top-start" dir="rtl"', 'Saved.');
            expect(rect(atStart)).toMatchObject({ top: 16, right: 16 });
            start.remove();

            const [, atEnd] = await regionWith('placement="bottom-end" dir="rtl"', 'Saved.');
            expect(rect(atEnd)).toMatchObject({ bottom: 16, left: 16 });
        });

        it('has the first toast at the edge, and the next ones towards the middle of the viewport', async () => {
            const [top, ...below] = await regionWith('placement="top"', 'First', 'Second', 'Third');
            const tops = below.map((entry) => entry.getBoundingClientRect().top);
            expect(rect(below[0]).top).toBe(16);
            expect(tops).toEqual([...tops].sort((a, b) => a - b));
            expect(below[1].getBoundingClientRect().top - below[0].getBoundingClientRect().bottom).toBe(8);
            top.remove();

            const [, ...above] = await regionWith('placement="bottom"', 'First', 'Second', 'Third');
            const bottoms = above.map((entry) => entry.getBoundingClientRect().bottom);
            expect(rect(above[0]).bottom).toBe(16);
            expect(bottoms).toEqual([...bottoms].sort((a, b) => b - a));
            expect(above[0].getBoundingClientRect().top - above[1].getBoundingClientRect().bottom).toBe(8);
        });

        it('lines toasts of different widths up at the side they are at', async () => {
            const long = 'A message that is long enough to make its toast wider than the other one is.';
            const sides = { 'top-start': 'left', 'bottom-end': 'right', top: 'centre' };

            for (const [placement, side] of Object.entries(sides)) {
                const [el, short, wide] = await regionWith(`placement="${placement}"`, 'Short', long);
                expect(sizeOf(wide).width, placement).toBeGreaterThan(sizeOf(short).width);
                expect(rect(short)[side], placement).toBe(rect(wide)[side]);
                el.remove();
            }
        });

        it('takes the distance from the edges and the gap from the tokens', async () => {
            const [scale, first, second] = await regionWith(
                'placement="bottom-start" style="--el-space-4: 24px; --el-space-2: 20px"',
                'First',
                'Second',
            );
            expect(rect(first)).toMatchObject({ bottom: 24, left: 24 });
            expect(first.getBoundingClientRect().top - second.getBoundingClientRect().bottom).toBe(20);
            scale.remove();

            const [, own] = await regionWith('style="--el-space-4: 24px; --el-toast-inset: 40px"', 'Saved.');
            expect(rect(own)).toMatchObject({ top: 40, right: 40 });
        });

        it('is never wider than the viewport between its two distances', async () => {
            const long =
                'A message that is long enough to need more than one line in a toast of any width, at whatever edge of the viewport the toast is shown, on a phone and on a wide screen alike.';

            for (const placement of ['top-start', 'top', 'top-end']) {
                // What is left of the viewport is narrower than a notification likes to be.
                const [el, entry] = await regionWith(
                    `placement="${placement}" style="--el-toast-inset: ${(innerWidth - 300) / 2}px"`,
                    long,
                );
                expect(sizeOf(el).width, placement).toBe(300);
                expect(sizeOf(entry).width, placement).toBe(300);
                expect(Math.abs(rect(entry).centre), placement).toBeLessThan(0.2);
                el.remove();
            }
        });
    });

    describe('the function', () => {
        it('adds a region at the end of the page when there is none, and shows the toast there', async () => {
            expect(document.querySelector('el-toast')).toBeNull();
            const page = await fixture(`<main data-fixture>Page</main>`);

            const entry = toast('Saved.', { variant: 'success', duration: Infinity });
            await shown(entry);
            const el = document.querySelector('el-toast');

            // After the content of the page: the close buttons come last in the tab order.
            expect(el).toBe(document.body.lastElementChild);
            expect(page.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
            expect(entry.parentElement).toBe(el);
            expect(entry.variant).toBe('success');
            expect(el.placement).toBe('top-end');
            expect(isShown(el)).toBe(true);
            expect(rect(entry)).toMatchObject({ top: 16, right: 16 });
        });

        it('uses the first region of the page, and adds no other', async () => {
            const first = await fixture(`<el-toast placement="bottom"></el-toast>`);
            const second = await fixture(`<el-toast></el-toast>`);

            const one = toast('First', { duration: Infinity });
            const two = toast('Second', { duration: Infinity });
            await Promise.all([shown(one), shown(two)]);

            expect(texts(first)).toEqual(['First', 'Second']);
            expect(second.childElementCount).toBe(0);
            expect(document.querySelectorAll('el-toast').length).toBe(2);
        });

        it('keeps the region it has added for the next toast', async () => {
            const one = toast('First', { duration: Infinity });
            await shown(one);
            await one.hide();
            const two = toast('Second', { duration: Infinity });
            await shown(two);

            expect(document.querySelectorAll('el-toast').length).toBe(1);
            expect(texts(document.querySelector('el-toast'))).toEqual(['Second']);
        });
    });

    describe('toasts of the page', () => {
        it('shows itself for a notification that is in its markup', async () => {
            const el = await fixture(`
                <el-toast>
                    <el-notification open="true" closable="true">From the page</el-notification>
                </el-toast>
            `);
            await rendered();
            const entry = el.firstElementChild;

            expect(isShown(el)).toBe(true);
            expect(rect(entry)).toMatchObject({ top: 16, right: 16 });

            await entry.hide();
            expect(entry.isConnected).toBe(false);
            expect(isShown(el)).toBe(false);
        });

        it('follows a notification that the page puts in and takes out itself', async () => {
            const el = await fixture(`<el-toast></el-toast>`);
            const note = document.createElement('el-notification');
            note.textContent = 'From a script';

            el.append(note);
            await note.show();
            expect(isShown(el)).toBe(true);

            note.remove();
            await rendered();
            expect(isShown(el)).toBe(false);
        });

        it('counts a notification of the page as a place that is taken', async () => {
            const el = await fixture(`
                <el-toast max="1">
                    <el-notification open="true">From the page</el-notification>
                </el-toast>
            `);
            await rendered();
            const waiting = el.toast('Waits', { duration: Infinity });
            await rendered();
            expect(waiting.isConnected).toBe(false);

            await el.firstElementChild.hide();
            await shown(waiting);
            expect(texts(el)).toEqual(['Waits']);
        });
    });

    describe('in a dialog', () => {
        it('takes clicks as a region inside of a modal dialog', async () => {
            const dialog = await fixture(`<dialog><p>Dialog</p><el-toast></el-toast></dialog>`);
            dialog.showModal();
            const el = dialog.querySelector('el-toast');

            const entry = el.toast('Not saved.', { duration: Infinity });
            await shown(entry);
            const gone = hidden(entry);
            await userEvent.click(entry.shadowRoot.querySelector('[part~="close-button"]'));
            await gone;

            expect(entry.isConnected).toBe(false);
            expect(dialog.open).toBe(true);
            dialog.close();
        });
    });

    describe('server-side rendering', () => {
        it('renders the stack with its landmark on the server', async () => {
            const el = await fixture(`<el-toast label="Meldungen"></el-toast>`);
            // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
            const markup = el
                .template()
                .toString()
                .replace(/<!--[\s\S]*?-->/g, '')
                .trim();

            expect(markup).toMatch(
                /^<div part="base" class="stack" role="region"\s+aria-label="Meldungen"\s*><slot><\/slot><\/div>$/,
            );
        });

        it('takes over a server-rendered region with its toast as it is', async () => {
            const source = document.createElement('el-toast');
            Object.assign(source, source.properties());
            const wrapper = document.createElement('div');
            wrapper.dataset.fixture = '';
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(`
                <el-toast placement="bottom-end">
                    <template shadowrootmode="open">${source.template().toString()}</template>
                    <el-notification open="true">From the server</el-notification>
                </el-toast>
            `);
            const el = wrapper.querySelector('el-toast');
            const server = { base: base(el), entry: el.firstElementChild };
            await rendered();
            await rendered();

            expect(base(el)).toBe(server.base);
            expect(el.firstElementChild).toBe(server.entry);
            expect(isShown(el)).toBe(true);
            expect(server.entry.open).toBe(true);
            expect(rect(server.entry)).toMatchObject({ bottom: 16, right: 16 });
        });
    });

    it('has no accessibility violations', async () => {
        const page = await fixture(`<main data-fixture><h1>Page</h1></main>`);
        const [el] = await regionWith('', 'Saved.');
        const entries = [
            el.toast('Not saved.', { variant: 'danger', duration: Infinity }),
            el.toast('Almost full.', { variant: 'warning', duration: Infinity, closable: false }),
        ];
        await Promise.all(entries.map(shown));

        const results = await axe.run(document.body);
        expect(results.violations).toEqual([]);
        page.remove();
    });
});
