import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { fixture, nextFrame, aTimeout, oneEvent, accessibleDescription, accessibleRole } from '../../test-helpers.js';
import { define } from './tooltip.js';
import { define as defineButton } from '../button/button.js';
import { define as definePopover } from '../popover/popover.js';
define();
defineButton();
definePopover();

// A later fixture would lie on top of an earlier one for the real pointer, so every test takes its
// fixture out of the page again.
const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

let fixtures = 0;

// A place for the pointer that is neither an anchor nor a tooltip.
const away = document.createElement('div');
away.style.cssText = 'position: fixed; top: 0; left: 0; width: 20px; height: 20px';
document.body.append(away);

/**
 * A button of 100 × 30px at a fixed place in the viewport, and a tooltip for it that opens without
 * a delay. `before` is a button that comes before the anchor for the keyboard.
 * @param {object} [options]
 * @param {string} [options.attrs] - Attributes of the tooltip.
 * @param {(id: string) => string} [options.anchor] - The markup of another anchor, with that id.
 */
async function tooltipFixture({
    attrs = 'show-delay="0"',
    top = 300,
    left = 150,
    text = 'Saves the document',
    anchor,
    wrap = (content) => content,
} = {}) {
    // The pointer is where the test before left it, and that is where the next anchor appears: the
    // browser would tell the new anchor that the pointer has entered it.
    await userEvent.hover(away);

    const id = `tooltip-anchor-${++fixtures}`;
    const button = `<button id="${id}" style="width: 100px; height: 30px; margin: 0; padding: 0; border: 0">Save</button>`;
    const wrapper = await fixture(`
        <div style="position: fixed; top: ${top}px; left: ${left}px; --el-border-width: 1px; --el-space-1: 4px; --el-space-2: 8px">
            <button class="before" style="position: fixed; top: 0; left: 40px">Before</button>
            ${wrap(`${anchor ? anchor(id) : button}<el-tooltip for="${id}" ${attrs}>${text}</el-tooltip>`)}
        </div>
    `);
    wrappers.push(wrapper);

    const el = wrapper.querySelector('el-tooltip');
    return {
        wrapper,
        el,
        anchor: wrapper.querySelector(`#${id}`),
        away,
        before: wrapper.querySelector('.before'),
        body: el.shadowRoot.querySelector('[part="body"]'),
    };
}

/** Two frames: one for the watcher and the platform, one for the place Floating UI computes. */
const settled = async () => {
    await nextFrame();
    await nextFrame();
};

const isShown = (el) => el.matches(':popover-open');
const untilShown = async (el, timeout = 1000) => {
    await expect.poll(() => isShown(el), { timeout }).toBe(true);
    await settled();
};
const untilHidden = (el, timeout = 1000) => expect.poll(() => isShown(el), { timeout }).toBe(false);

const rect = (element) => element.getBoundingClientRect();
const centreX = (element) => rect(element).left + rect(element).width / 2;
const centreY = (element) => rect(element).top + rect(element).height / 2;

describe('Feature | Tooltip', () => {
    it('can connect without errors, closed, as a popover that only a script opens', async () => {
        const { el } = await tooltipFixture();

        expect(isShown(el)).toBe(false);
        expect(getComputedStyle(el).display).toBe('none');
        expect(el.getAttribute('popover')).toBe('manual');
        expect(el.open).toBe(false);
        // A reflected property writes its default onto the element as well.
        expect(el.getAttribute('open')).toBe('false');
    });

    describe('the anchor', () => {
        it('is described by the tooltip, also while that is closed', async () => {
            const { el, anchor } = await tooltipFixture();

            expect(el.id).toMatch(/^el-tooltip-\d+$/);
            expect(anchor.getAttribute('aria-describedby')).toBe(el.id);
            expect(isShown(el)).toBe(false);
            expect(await accessibleDescription(anchor)).toBe('Saves the document');
        });

        it('is described by a tooltip that has an id of its own, by that id', async () => {
            const { el, anchor } = await tooltipFixture({ attrs: 'id="save-hint"' });

            expect(el.id).toBe('save-hint');
            expect(anchor.getAttribute('aria-describedby')).toBe('save-hint');
        });

        it('keeps what else it is described by', async () => {
            const { wrapper, el, anchor } = await tooltipFixture({
                anchor: (id) => `<button id="${id}" aria-describedby="tooltip-other-hint">Save</button>
                    <span id="tooltip-other-hint">Twice a day.</span>`,
            });
            expect(anchor.getAttribute('aria-describedby')).toBe(`tooltip-other-hint ${el.id}`);
            expect(await accessibleDescription(anchor)).toBe('Twice a day. Saves the document');

            el.remove();
            expect(anchor.getAttribute('aria-describedby')).toBe('tooltip-other-hint');

            wrapper.append(el);
            await settled();
            expect(anchor.getAttribute('aria-describedby')).toBe(`tooltip-other-hint ${el.id}`);
        });

        it('loses the description with the tooltip', async () => {
            const { el, anchor } = await tooltipFixture();

            el.remove();
            expect(anchor.hasAttribute('aria-describedby')).toBe(false);
        });

        it('is another element after for has changed', async () => {
            const { wrapper, el, anchor, before } = await tooltipFixture();
            before.id = 'tooltip-second-anchor';

            el.for = 'tooltip-second-anchor';
            await settled();
            expect(anchor.hasAttribute('aria-describedby')).toBe(false);
            expect(before.getAttribute('aria-describedby')).toBe(el.id);

            // The pointer on the old anchor no longer opens it, the one on the new anchor does.
            await userEvent.hover(anchor);
            await aTimeout(100);
            expect(isShown(el)).toBe(false);
            await userEvent.hover(before);
            await untilShown(el);
            expect(rect(el).top).toBeGreaterThan(rect(before).bottom);
            expect(wrapper.contains(el)).toBe(true);
        });

        it('closes the tooltip when for changes while it is open', async () => {
            const { el, anchor, before } = await tooltipFixture();
            before.id = 'tooltip-moved-anchor';
            await userEvent.hover(anchor);
            await untilShown(el);

            el.for = 'tooltip-moved-anchor';
            await untilHidden(el);
            expect(el.open).toBe(false);
            expect(before.getAttribute('aria-describedby')).toBe(el.id);

            // The pointer still rests on the old anchor, which no longer counts.
            await aTimeout(150);
            expect(isShown(el)).toBe(false);
        });

        it('can be an el-button: the control inside it is described', async () => {
            const { el, anchor } = await tooltipFixture({ anchor: (id) => `<el-button id="${id}">Save</el-button>` });
            await settled();
            const control = anchor.shadowRoot.querySelector('button');

            expect(anchor.getAttribute('aria-describedby')).toBe(el.id);
            expect(await accessibleDescription(control)).toBe('Saves the document');

            await userEvent.hover(anchor);
            await untilShown(el);
            expect(rect(anchor).top - rect(el).bottom).toBeCloseTo(8, 1);
        });

        it('can have more than one tooltip', async () => {
            const { wrapper, el, anchor } = await tooltipFixture();
            const second = document.createElement('el-tooltip');
            second.setAttribute('for', anchor.id);
            second.setAttribute('placement', 'bottom');
            second.setAttribute('show-delay', '0');
            second.textContent = 'Ctrl+S';
            wrapper.append(second);
            await settled();

            expect(anchor.getAttribute('aria-describedby')).toBe(`${el.id} ${second.id}`);
            expect(await accessibleDescription(anchor)).toBe('Saves the document Ctrl+S');

            await userEvent.hover(anchor);
            await untilShown(el);
            await untilShown(second);
            expect(rect(second).top).toBeGreaterThan(rect(anchor).bottom);
        });

        it('can be the anchor of a popover as well', async () => {
            const { wrapper, el, anchor } = await tooltipFixture({
                anchor: (id) =>
                    `<el-popover><button slot="anchor" id="${id}" style="width: 100px; height: 30px; margin: 0; padding: 0; border: 0">Options</button>Panel</el-popover>`,
            });
            const panel = wrapper.querySelector('el-popover').shadowRoot.querySelector('[part="panel"]');
            expect(anchor.getAttribute('aria-describedby')).toBe(el.id);
            expect(anchor.getAttribute('aria-expanded')).toBe('false');

            await userEvent.hover(anchor);
            await untilShown(el);
            await userEvent.click(anchor);
            await expect.poll(() => panel.matches(':popover-open')).toBe(true);

            // The tooltip is above the anchor, the panel below it, and both are shown.
            expect(isShown(el)).toBe(true);
            expect(anchor.getAttribute('aria-expanded')).toBe('true');
            expect(rect(el).bottom).toBeLessThan(rect(anchor).top);
            expect(rect(panel).top).toBeGreaterThan(rect(anchor).bottom);
        });

        it('can come into the page after the tooltip', async () => {
            const { wrapper, el, anchor } = await tooltipFixture();
            const late = anchor.cloneNode(true);
            late.id = 'tooltip-late-anchor';

            el.for = 'tooltip-late-anchor';
            await settled();
            el.show();
            await settled();
            // No anchor, nothing to be placed at.
            expect(el.open).toBe(false);
            expect(isShown(el)).toBe(false);

            wrapper.append(late);
            el.show();
            await untilShown(el);
            expect(late.getAttribute('aria-describedby')).toBe(el.id);
            expect(centreX(el)).toBeCloseTo(centreX(late), 0);
        });
    });

    describe('with the pointer', () => {
        it('opens while the pointer is on the anchor and closes when it leaves', async () => {
            const { el, anchor, away } = await tooltipFixture();

            await userEvent.hover(anchor);
            await untilShown(el);
            expect(el.open).toBe(true);
            expect(el.getAttribute('open')).toBe('true');
            expect(el.matches(':state(open)')).toBe(true);

            await userEvent.hover(away);
            await untilHidden(el);
            expect(el.open).toBe(false);
            expect(el.matches(':state(open)')).toBe(false);
            expect(getComputedStyle(el).display).toBe('none');
        });

        it('waits for the pointer to rest, 150ms by default', async () => {
            const { el } = await tooltipFixture({ attrs: '' });
            expect(el.showDelay).toBe(150);

            const slow = await tooltipFixture({ attrs: 'show-delay="1000"', top: 400 });
            await userEvent.hover(slow.anchor);
            expect(isShown(slow.el)).toBe(false);
            await untilShown(slow.el, 3000);
        });

        it('does not open for a pointer that only passes', async () => {
            const { el, anchor, away } = await tooltipFixture({ attrs: 'show-delay="1000"' });
            let shows = 0;
            el.addEventListener('tooltip-show', () => shows++);

            await userEvent.hover(anchor);
            await userEvent.hover(away);
            await aTimeout(1300);

            expect(shows).toBe(0);
            expect(isShown(el)).toBe(false);
        });

        it('stays for hide-delay after the pointer has left', async () => {
            const { el, anchor, away } = await tooltipFixture({ attrs: 'show-delay="0" hide-delay="1000"' });
            await userEvent.hover(anchor);
            await untilShown(el);

            await userEvent.hover(away);
            expect(isShown(el)).toBe(true);
            await untilHidden(el, 3000);
        });

        it('stays when the pointer comes back within hide-delay', async () => {
            const { el, anchor, away } = await tooltipFixture({ attrs: 'show-delay="0" hide-delay="1000"' });
            let hides = 0;
            el.addEventListener('tooltip-hide', () => hides++);
            await userEvent.hover(anchor);
            await untilShown(el);

            await userEvent.hover(away);
            await userEvent.hover(anchor);
            await aTimeout(1300);

            expect(hides).toBe(0);
            expect(isShown(el)).toBe(true);
        });

        it('stays while the pointer goes across the gap onto the text, and closes when it leaves the text', async () => {
            const { el, anchor, away } = await tooltipFixture();
            await userEvent.hover(anchor);
            await untilShown(el);
            const { width, height, bottom } = rect(el);
            expect(rect(anchor).top - bottom).toBeCloseTo(8, 1);

            // Into the middle of the gap between the two, which is neither the anchor nor the text.
            await userEvent.hover(el, { position: { x: width / 2, y: height + 4 } });
            await aTimeout(150);
            expect(isShown(el)).toBe(true);

            await userEvent.hover(el);
            await aTimeout(150);
            expect(isShown(el)).toBe(true);

            await userEvent.hover(away);
            await untilHidden(el);
        });

        it('has the way across the gap on the side that faces the anchor, on every side', async () => {
            for (const side of ['top', 'bottom', 'left', 'right']) {
                const { el, anchor, wrapper } = await tooltipFixture({ attrs: `show-delay="0" placement="${side}"` });
                await userEvent.hover(anchor);
                await untilShown(el);
                const { width, height } = rect(el);
                const position = {
                    top: { x: width / 2, y: height + 4 },
                    bottom: { x: width / 2, y: -4 },
                    left: { x: width + 4, y: height / 2 },
                    right: { x: -4, y: height / 2 },
                }[side];

                await userEvent.hover(el, { position });
                await aTimeout(150);
                expect(isShown(el), side).toBe(true);
                wrapper.remove();
            }
        });

        it('does not open for a finger', async () => {
            const { el, anchor } = await tooltipFixture();

            anchor.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'touch' }));
            await aTimeout(150);
            expect(isShown(el)).toBe(false);

            // The same event of a mouse opens it.
            anchor.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
            await untilShown(el);
        });

        it('does not stay for a button that keeps the focus after a click', async () => {
            const { el, anchor, away } = await tooltipFixture();

            await userEvent.click(anchor);
            await untilShown(el);
            expect(document.activeElement).toBe(anchor);

            await userEvent.hover(away);
            await untilHidden(el);
            expect(document.activeElement).toBe(anchor);
        });
    });

    describe('with the keyboard', () => {
        it('opens at once when the anchor gets the focus, and closes when it loses it', async () => {
            const { el, anchor, before } = await tooltipFixture({ attrs: 'show-delay="5000"' });
            before.focus();

            await userEvent.tab();
            expect(document.activeElement).toBe(anchor);
            await untilShown(el);

            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(before);
            await untilHidden(el);
        });

        it('opens for the focus on the control inside an el-button', async () => {
            const { el, anchor, before } = await tooltipFixture({
                attrs: 'show-delay="5000"',
                anchor: (id) => `<el-button id="${id}">Save</el-button>`,
            });
            before.focus();

            await userEvent.tab();
            expect(document.activeElement).toBe(anchor);
            await untilShown(el);
        });

        it('closes with Escape, and stays closed while the pointer is still on the anchor', async () => {
            const { el, anchor, away } = await tooltipFixture();
            await userEvent.hover(anchor);
            await untilShown(el);

            await userEvent.keyboard('{Escape}');
            await untilHidden(el);
            expect(el.open).toBe(false);
            await aTimeout(150);
            expect(isShown(el)).toBe(false);

            // A pointer that comes anew opens it again.
            await userEvent.hover(away);
            await userEvent.hover(anchor);
            await untilShown(el);
        });

        it('stays closed after Escape when the focus moves on and the pointer still rests on the anchor', async () => {
            const { el, anchor, before } = await tooltipFixture();
            before.focus();
            await userEvent.tab();
            await userEvent.hover(anchor);
            await untilShown(el);

            await userEvent.keyboard('{Escape}');
            await untilHidden(el);
            await userEvent.tab({ shift: true });
            expect(document.activeElement).toBe(before);
            await aTimeout(150);

            expect(isShown(el)).toBe(false);
        });

        it('closes with Escape while the anchor keeps the focus', async () => {
            const { el, anchor, before } = await tooltipFixture();
            before.focus();
            await userEvent.tab();
            await untilShown(el);

            await userEvent.keyboard('{Escape}');
            await untilHidden(el);
            expect(document.activeElement).toBe(anchor);
        });

        it('takes the Escape that closes it: a popover around the anchor stays open', async () => {
            const { wrapper, el, anchor } = await tooltipFixture({
                wrap: (content) => `<el-popover><button slot="anchor">Options</button>${content}</el-popover>`,
            });
            const popover = wrapper.querySelector('el-popover');
            const panel = popover.shadowRoot.querySelector('[part="panel"]');
            await userEvent.click(popover.querySelector('[slot="anchor"]'));
            await expect.poll(() => panel.matches(':popover-open')).toBe(true);
            await settled();

            await userEvent.hover(anchor);
            await untilShown(el);
            expect(panel.matches(':popover-open')).toBe(true);

            await userEvent.keyboard('{Escape}');
            await untilHidden(el);
            await aTimeout(100);
            expect(panel.matches(':popover-open')).toBe(true);

            // The next one is for the popover.
            await userEvent.keyboard('{Escape}');
            await expect.poll(() => panel.matches(':popover-open')).toBe(false);
        });

        it('leaves an Escape alone while it is closed', async () => {
            const { el } = await tooltipFixture();
            let prevented;
            const listener = (event) => {
                prevented = event.defaultPrevented;
            };
            document.addEventListener('keydown', listener);

            await userEvent.keyboard('{Escape}');
            document.removeEventListener('keydown', listener);

            expect(prevented).toBe(false);
            expect(isShown(el)).toBe(false);
        });
    });

    describe('from a script', () => {
        it('is open from the start with the open attribute', async () => {
            const { el, anchor } = await tooltipFixture({ attrs: 'open="true"' });
            await untilShown(el);
            expect(el.open).toBe(true);
            expect(rect(anchor).top - rect(el).bottom).toBeCloseTo(8, 1);
        });

        it('opens and closes with show() and hide()', async () => {
            const { el } = await tooltipFixture();

            el.show();
            await untilShown(el);
            expect(el.open).toBe(true);

            el.hide();
            await untilHidden(el);
            expect(el.open).toBe(false);
        });

        it('fires tooltip-show and tooltip-hide, which reach a listener further up', async () => {
            const { wrapper, el } = await tooltipFixture();

            const show = oneEvent(wrapper, 'tooltip-show');
            el.open = true;
            expect((await show).target).toBe(el);

            const hide = oneEvent(wrapper, 'tooltip-hide');
            el.open = false;
            expect((await hide).target).toBe(el);
        });

        it('follows the platform when that opens or closes the popover', async () => {
            const { el, anchor } = await tooltipFixture();

            el.showPopover();
            await expect.poll(() => el.open).toBe(true);
            await settled();
            expect(rect(anchor).top - rect(el).bottom).toBeCloseTo(8, 1);

            el.hidePopover();
            await expect.poll(() => el.open).toBe(false);
            expect(el.matches(':state(open)')).toBe(false);
        });

        it('stays closed without an anchor', async () => {
            const { el } = await tooltipFixture();
            let shows = 0;
            el.addEventListener('tooltip-show', () => shows++);
            let hides = 0;
            el.addEventListener('tooltip-hide', () => hides++);

            el.for = 'tooltip-no-such-element';
            await settled();
            el.show();
            await settled();
            await settled();

            expect(el.open).toBe(false);
            expect(isShown(el)).toBe(false);
            expect({ shows, hides }).toEqual({ shows: 0, hides: 0 });
        });

        it('does not open for the pointer or the focus while it is disabled, and closes when it becomes so', async () => {
            const { el, anchor, before, away } = await tooltipFixture({ attrs: 'show-delay="0" disabled="true"' });

            await userEvent.hover(anchor);
            await aTimeout(150);
            expect(isShown(el)).toBe(false);
            before.focus();
            await userEvent.tab();
            await aTimeout(150);
            expect(isShown(el)).toBe(false);
            // It stays the description of its anchor.
            expect(await accessibleDescription(anchor)).toBe('Saves the document');

            el.disabled = false;
            await userEvent.hover(away);
            await userEvent.hover(anchor);
            await untilShown(el);

            el.disabled = true;
            await untilHidden(el);
            expect(el.open).toBe(false);
        });

        it('closes like any other when a script has opened it and the pointer leaves', async () => {
            const { el, anchor, away } = await tooltipFixture();
            el.show();
            await untilShown(el);

            await userEvent.hover(anchor);
            await userEvent.hover(away);
            await untilHidden(el);
            expect(el.open).toBe(false);
        });

        it('is left to the script while it is disabled: the pointer neither opens nor closes it', async () => {
            const { el, anchor, away } = await tooltipFixture({ attrs: 'show-delay="0" disabled="true"' });
            el.show();
            await untilShown(el);

            await userEvent.hover(anchor);
            await userEvent.hover(away);
            await aTimeout(150);
            expect(isShown(el)).toBe(true);

            el.hide();
            await untilHidden(el);

            // Escape is no pointer and no focus: it still closes it.
            el.show();
            await untilShown(el);
            await userEvent.keyboard('{Escape}');
            await untilHidden(el);
        });
    });

    describe('placement', () => {
        it('is above its anchor, centred, at a distance of 8px, by default', async () => {
            const { el, anchor } = await tooltipFixture({ attrs: 'open="true"' });
            await untilShown(el);

            expect(rect(anchor).top - rect(el).bottom).toBeCloseTo(8, 1);
            expect(centreX(el)).toBeCloseTo(centreX(anchor), 0);
            expect(el.dataset.placement).toBe('top');
        });

        it('is on the side that placement names', async () => {
            for (const side of ['top', 'bottom', 'left', 'right']) {
                const { el, anchor } = await tooltipFixture({ attrs: `open="true" placement="${side}"` });
                await untilShown(el);
                const gap = {
                    top: rect(anchor).top - rect(el).bottom,
                    bottom: rect(el).top - rect(anchor).bottom,
                    left: rect(anchor).left - rect(el).right,
                    right: rect(el).left - rect(anchor).right,
                }[side];

                expect(gap, side).toBeCloseTo(8, 1);
                if (side === 'top' || side === 'bottom') expect(centreX(el), side).toBeCloseTo(centreX(anchor), 0);
                else expect(centreY(el), side).toBeCloseTo(centreY(anchor), 0);
            }
        });

        it('is aligned with the start or the end of the anchor', async () => {
            const start = await tooltipFixture({ attrs: 'open="true" placement="bottom-start"' });
            await untilShown(start.el);
            expect(rect(start.el).left).toBeCloseTo(rect(start.anchor).left, 1);

            const end = await tooltipFixture({ attrs: 'open="true" placement="bottom-end"', left: 300 });
            await untilShown(end.el);
            expect(rect(end.el).right).toBeCloseTo(rect(end.anchor).right, 1);
        });

        it('takes its distance from the attribute, and a new one while it is open', async () => {
            const { el, anchor } = await tooltipFixture({ attrs: 'open="true" distance="20"' });
            await untilShown(el);
            expect(rect(anchor).top - rect(el).bottom).toBeCloseTo(20, 1);

            el.distance = 2;
            await settled();
            await settled();
            expect(rect(anchor).top - rect(el).bottom).toBeCloseTo(2, 1);
        });

        it('goes to the other side when it has no room', async () => {
            const { el, anchor } = await tooltipFixture({ attrs: 'open="true"', top: 10 });
            await untilShown(el);

            expect(el.dataset.placement).toBe('bottom');
            expect(rect(el).top - rect(anchor).bottom).toBeCloseTo(8, 1);
        });

        it('stays inside the viewport, and is never wider than 20rem', async () => {
            const { el } = await tooltipFixture({
                attrs: 'open="true"',
                left: 0,
                text: 'A tooltip with a text that is much longer than a tooltip should ever be, to see where it ends and that it wraps.',
            });
            await untilShown(el);

            expect(rect(el).left).toBeGreaterThanOrEqual(8);
            expect(rect(el).width).toBeLessThanOrEqual(320);
            expect(rect(el).height).toBeGreaterThan(40);
        });

        it('follows its anchor when the page scrolls under it', async () => {
            const wrapper = await fixture(`
                <div style="position: fixed; top: 200px; left: 100px; width: 200px; height: 150px; overflow: auto">
                    <div style="height: 800px; padding-top: 60px">
                        <button id="tooltip-scroll-anchor" style="width: 100px; height: 30px; margin: 0; padding: 0; border: 0">
                            Save
                        </button>
                        <el-tooltip for="tooltip-scroll-anchor" placement="bottom" open="true">Saves the document</el-tooltip>
                    </div>
                </div>
            `);
            wrappers.push(wrapper);
            const el = wrapper.querySelector('el-tooltip');
            const anchor = wrapper.querySelector('button');
            await untilShown(el);
            const before = rect(el).top;
            expect(before - rect(anchor).bottom).toBeCloseTo(8, 1);

            wrapper.scrollTop = 30;
            await settled();
            await settled();

            expect(rect(el).top).toBeCloseTo(before - 30, 1);
            expect(rect(el).top - rect(anchor).bottom).toBeCloseTo(8, 1);
        });

        it('is in the top layer: nothing clips it, and nothing lies on top of it', async () => {
            const wrapper = await fixture(`
                <div style="position: fixed; top: 300px; left: 150px; width: 100px; height: 30px; overflow: hidden">
                    <button id="tooltip-clipped-anchor" style="width: 100px; height: 30px; margin: 0; padding: 0; border: 0">
                        Save
                    </button>
                    <el-tooltip for="tooltip-clipped-anchor" open="true">Saves the document</el-tooltip>
                </div>
            `);
            const cover = await fixture(`<div style="position: fixed; inset: 0; z-index: 2147483647"></div>`);
            wrappers.push(wrapper, cover);
            const el = wrapper.querySelector('el-tooltip');
            await untilShown(el);

            // The tooltip is outside the box that clips its anchor, and under the cover in the page.
            expect(rect(el).bottom).toBeLessThan(rect(wrapper).top);
            expect(document.elementFromPoint(centreX(el), centreY(el))).toBe(el);
        });
    });

    describe('arrow', () => {
        const arrowOf = (el) => el.shadowRoot.querySelector('[part="arrow"]');
        /** How far the tip of the arrow is from the edge of the tooltip. */
        const lengthOf = (arrow) => arrow.offsetWidth * Math.SQRT1_2;

        it('has no arrow by default', async () => {
            const { el } = await tooltipFixture({ attrs: 'open="true"' });
            await untilShown(el);
            expect(arrowOf(el)).toBeNull();
        });

        it('points to the middle of the anchor, with its tip at the distance', async () => {
            const { el, anchor } = await tooltipFixture({ attrs: 'open="true" arrow="true"' });
            await untilShown(el);
            const arrow = arrowOf(el);

            expect(arrow).not.toBeNull();
            expect(centreX(arrow)).toBeCloseTo(centreX(anchor), 0);
            // Its middle is on the lower edge of the tooltip.
            expect(centreY(arrow)).toBeCloseTo(rect(el).bottom, 0);
            expect(rect(anchor).top - rect(el).bottom - lengthOf(arrow)).toBeCloseTo(8, 0);
        });

        it('is on the edge that faces the anchor on every side', async () => {
            for (const side of ['top', 'bottom', 'left', 'right']) {
                const { el, anchor } = await tooltipFixture({ attrs: `open="true" arrow="true" placement="${side}"` });
                await untilShown(el);
                const arrow = arrowOf(el);

                if (side === 'top') expect(centreY(arrow), side).toBeCloseTo(rect(el).bottom, 0);
                if (side === 'bottom') expect(centreY(arrow), side).toBeCloseTo(rect(el).top, 0);
                if (side === 'left') expect(centreX(arrow), side).toBeCloseTo(rect(el).right, 0);
                if (side === 'right') expect(centreX(arrow), side).toBeCloseTo(rect(el).left, 0);
                if (side === 'top' || side === 'bottom') expect(centreX(arrow), side).toBeCloseTo(centreX(anchor), 0);
                else expect(centreY(arrow), side).toBeCloseTo(centreY(anchor), 0);
            }
        });

        it('has the surface of the tooltip', async () => {
            const { el, body } = await tooltipFixture({ attrs: 'open="true" arrow="true"' });
            await untilShown(el);

            expect(getComputedStyle(arrowOf(el)).backgroundColor).toBe(getComputedStyle(body).backgroundColor);
            expect(getComputedStyle(arrowOf(el)).backgroundColor).toBe('rgb(0, 0, 0)');
        });

        it('leaves a way across the gap that reaches the anchor, past the arrow', async () => {
            const { el, anchor } = await tooltipFixture({ attrs: 'show-delay="0" arrow="true"' });
            await userEvent.hover(anchor);
            await untilShown(el);
            const { width, height, bottom } = rect(el);
            const gap = rect(anchor).top - bottom;
            expect(gap).toBeGreaterThan(8);

            // One pixel above the anchor, beside the arrow.
            await userEvent.hover(el, { position: { x: width / 4, y: height + gap - 1 } });
            await aTimeout(150);
            expect(isShown(el)).toBe(true);
        });
    });

    describe('look', () => {
        it('has the colours of the page the other way round, and can be read without a theme', async () => {
            const { el, body } = await tooltipFixture({ attrs: 'open="true"' });
            await untilShown(el);
            const { backgroundColor, color, paddingLeft, paddingTop, borderTopWidth } = getComputedStyle(body);

            expect({ backgroundColor, color }).toEqual({
                backgroundColor: 'rgb(0, 0, 0)',
                color: 'rgb(255, 255, 255)',
            });
            expect({ paddingLeft, paddingTop, borderTopWidth }).toEqual({
                paddingLeft: '8px',
                paddingTop: '4px',
                borderTopWidth: '1px',
            });
        });

        it('takes its colours from the tokens of the text and the background', async () => {
            const { el, body } = await tooltipFixture({
                attrs: 'open="true"',
                wrap: (content) =>
                    `<div style="--el-color-fg: rgb(10, 20, 30); --el-color-bg: rgb(250, 240, 230)">${content}</div>`,
            });
            await untilShown(el);

            expect(getComputedStyle(body).backgroundColor).toBe('rgb(10, 20, 30)');
            expect(getComputedStyle(body).color).toBe('rgb(250, 240, 230)');
        });

        it('is only the box that is placed: the element has no look of its own', async () => {
            const { el } = await tooltipFixture({ attrs: 'open="true"' });
            await untilShown(el);
            const { position, padding, borderTopWidth, backgroundColor, overflow } = getComputedStyle(el);

            expect({ position, padding, borderTopWidth, backgroundColor, overflow }).toEqual({
                position: 'fixed',
                padding: '0px',
                borderTopWidth: '0px',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                overflow: 'visible',
            });
        });

        it('does not take over the look of the text its anchor stands in', async () => {
            const { el, body } = await tooltipFixture({
                attrs: 'open="true"',
                wrap: (content) => `
                    <h2 style="margin: 0; font-style: italic; letter-spacing: 2px; text-align: center; text-transform: uppercase; white-space: nowrap">
                        ${content}
                    </h2>`,
            });
            await untilShown(el);
            const { fontStyle, fontWeight, letterSpacing, textAlign, textTransform, whiteSpace, fontSize } =
                getComputedStyle(body);

            expect({ fontStyle, fontWeight, letterSpacing, textAlign, textTransform, whiteSpace, fontSize }).toEqual({
                fontStyle: 'normal',
                fontWeight: '400',
                letterSpacing: 'normal',
                textAlign: 'start',
                textTransform: 'none',
                whiteSpace: 'normal',
                fontSize: '14px',
            });
        });

        it('keeps its look and its place when the page has a reset that selects every element', async () => {
            const reset = document.createElement('style');
            reset.textContent = `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; box-sizing: border-box; }`;
            document.head.append(reset);
            try {
                // element-js reads a new stylesheet of the page a moment later.
                await settled();
                const { el, anchor, body } = await tooltipFixture({ attrs: 'open="true" arrow="true"' });
                await untilShown(el);
                const arrow = el.shadowRoot.querySelector('[part="arrow"]');
                const { paddingLeft, paddingTop, borderTopWidth } = getComputedStyle(body);

                expect({ paddingLeft, paddingTop, borderTopWidth }).toEqual({
                    paddingLeft: '8px',
                    paddingTop: '4px',
                    borderTopWidth: '1px',
                });
                expect(centreY(arrow)).toBeCloseTo(rect(el).bottom, 0);
                expect(rect(anchor).top - rect(el).bottom - arrow.offsetWidth * Math.SQRT1_2).toBeCloseTo(8, 0);
            } finally {
                reset.remove();
                await settled();
            }
        });
    });

    describe('accessibility', () => {
        it('has the role of a tooltip', async () => {
            const { el } = await tooltipFixture({ attrs: 'open="true"' });
            await untilShown(el);
            expect(await accessibleRole(el)).toBe('tooltip');
        });

        it('has no detectable a11y violations, closed and open', async () => {
            const { wrapper, el } = await tooltipFixture();
            const closed = await axe.run(wrapper);
            expect(closed.violations.map((violation) => violation.id)).toEqual([]);

            el.open = true;
            await untilShown(el);
            const open = await axe.run(wrapper);
            expect(open.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    it('is hidden by the hidden attribute, also while it is open', async () => {
        const { el } = await tooltipFixture({ attrs: 'open="true" hidden' });
        await untilShown(el);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('is closed when it leaves the page, and stays closed when it comes back', async () => {
        const { wrapper, el, anchor } = await tooltipFixture();
        let hides = 0;
        wrapper.addEventListener('tooltip-hide', () => hides++);
        el.addEventListener('tooltip-hide', () => hides++);
        await userEvent.hover(anchor);
        await untilShown(el);

        el.remove();
        await settled();
        expect(el.open).toBe(false);
        expect(hides).toBe(1);

        wrapper.append(el);
        await settled();
        await aTimeout(100);
        expect(el.open).toBe(false);
        expect(isShown(el)).toBe(false);
        expect(anchor.getAttribute('aria-describedby')).toBe(el.id);
    });

    it('has its body and its arrow in the server-rendered markup', async () => {
        const { el } = await tooltipFixture({ attrs: 'arrow="true"' });
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<div[^>]*\spart=['"]body['"]/);
        expect(markup).toMatch(/<slot/);
        expect(markup).toMatch(/<div[^>]*\spart=['"]arrow['"]/);
    });
});
