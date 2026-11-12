import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { fixture, nextFrame, oneEvent } from '../../test-helpers.js';
import { define } from './popover.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

// Popovers close each other, and a later fixture would lie on top of an earlier one, so every test
// takes its fixture out of the page again.
const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

/**
 * A popover with a button of 100 × 30px as its anchor, at a fixed place in the viewport. The panel
 * is 106 × 66px with its padding and border, so that it is centred on whole pixels.
 */
async function popoverFixture({ attrs = '', top = 300, left = 150, content, anchor } = {}) {
    const wrapper = await fixture(`
        <div style="position: fixed; top: ${top}px; left: ${left}px; --el-border-width: 1px; --el-space-3: 12px">
            <el-popover ${attrs}>
                ${anchor ?? `<button slot="anchor" style="width: 100px; height: 30px; margin: 0; padding: 0; border: 0">Options</button>`}
                ${content ?? `<div class="content" style="width: 80px; height: 40px">Panel</div>`}
            </el-popover>
        </div>
    `);
    wrappers.push(wrapper);
    const el = wrapper.querySelector('el-popover');
    return {
        wrapper,
        el,
        anchor: el.querySelector('[slot="anchor"]'),
        panel: el.shadowRoot.querySelector('[part="panel"]'),
    };
}

/** Two frames: one for the watcher and the platform, one for the place Floating UI computes. */
const settled = async () => {
    await nextFrame();
    await nextFrame();
};

const isShown = (panel) => panel.matches(':popover-open');
const rect = (element) => element.getBoundingClientRect();
const centreX = (element) => rect(element).left + rect(element).width / 2;
const centreY = (element) => rect(element).top + rect(element).height / 2;

describe('Feature | Popover', () => {
    it('can connect without errors, with its panel closed', async () => {
        const { el, panel } = await popoverFixture();
        expect(panel).not.toBeNull();
        expect(isShown(panel)).toBe(false);
        expect(getComputedStyle(panel).display).toBe('none');
        expect(el.open).toBe(false);
        // A reflected property writes its default onto the element as well.
        expect(el.getAttribute('open')).toBe('false');
    });

    describe('opening and closing', () => {
        it('opens with a click on the anchor and closes with the next one', async () => {
            const { el, anchor, panel } = await popoverFixture();

            anchor.click();
            await settled();
            expect(el.open).toBe(true);
            expect(isShown(panel)).toBe(true);
            expect(el.getAttribute('open')).toBe('true');
            expect(el.matches(':state(open)')).toBe(true);

            anchor.click();
            await settled();
            expect(el.open).toBe(false);
            expect(isShown(panel)).toBe(false);
            expect(el.matches(':state(open)')).toBe(false);
        });

        it('is open from the start with the open attribute', async () => {
            const { el, panel } = await popoverFixture({ attrs: 'open="true"' });
            await settled();
            expect(el.open).toBe(true);
            expect(isShown(panel)).toBe(true);
            expect(el.matches(':state(open)')).toBe(true);
        });

        it('opens and closes with show(), hide() and toggle()', async () => {
            const { el, panel } = await popoverFixture();

            el.show();
            await settled();
            expect(isShown(panel)).toBe(true);

            el.hide();
            await settled();
            expect(isShown(panel)).toBe(false);

            el.toggle();
            await settled();
            expect(isShown(panel)).toBe(true);

            el.toggle();
            await settled();
            expect(isShown(panel)).toBe(false);
        });

        it('fires popover-show and popover-hide, which reach a listener further up', async () => {
            const { wrapper, el } = await popoverFixture();

            const shown = oneEvent(wrapper, 'popover-show');
            el.open = true;
            expect((await shown).target).toBe(el);

            const hidden = oneEvent(wrapper, 'popover-hide');
            el.open = false;
            expect((await hidden).target).toBe(el);
        });

        it('follows the platform when that closes the panel', async () => {
            const { el, anchor, panel } = await popoverFixture({ attrs: 'open="true"' });
            await settled();

            // What a click beside the panel, Escape or another popover that opens do.
            const hidden = oneEvent(el, 'popover-hide');
            panel.hidePopover();
            await hidden;

            expect(el.open).toBe(false);
            expect(el.getAttribute('open')).toBe('false');
            expect(el.matches(':state(open)')).toBe(false);
            expect(anchor.getAttribute('aria-expanded')).toBe('false');
        });

        // The pointer goes down on the anchor, the platform closes the panel when it is released
        // beside the panel, and then the click arrives. The panel reports its closing in a task of
        // its own, which may run before the click or after it.
        it('stays closed when a click of the pointer on the anchor closes it, whenever the panel reports that', async () => {
            const pointerDown = () => new PointerEvent('pointerdown', { bubbles: true, composed: true });
            const click = () => new MouseEvent('click', { bubbles: true, composed: true, detail: 1 });

            const after = await popoverFixture({ attrs: 'open="true"' });
            await settled();
            after.anchor.dispatchEvent(pointerDown());
            after.panel.hidePopover();
            expect(after.el.open).toBe(true);
            after.anchor.dispatchEvent(click());
            await settled();
            expect(after.el.open).toBe(false);
            expect(isShown(after.panel)).toBe(false);

            const before = await popoverFixture({ attrs: 'open="true"' });
            await settled();
            before.anchor.dispatchEvent(pointerDown());
            const reported = oneEvent(before.panel, 'toggle');
            before.panel.hidePopover();
            await reported;
            expect(before.el.open).toBe(false);
            before.anchor.dispatchEvent(click());
            await settled();
            expect(before.el.open).toBe(false);
            expect(isShown(before.panel)).toBe(false);
        });

        it('closes with Escape and with a click beside it', async () => {
            const { el, anchor, panel } = await popoverFixture();

            await userEvent.click(anchor);
            await settled();
            expect(isShown(panel)).toBe(true);

            await userEvent.keyboard('{Escape}');
            await settled();
            expect(isShown(panel)).toBe(false);
            expect(el.open).toBe(false);

            await userEvent.click(anchor);
            await settled();
            expect(isShown(panel)).toBe(true);

            await userEvent.click(document.body, { position: { x: 5, y: 5 } });
            await settled();
            expect(isShown(panel)).toBe(false);
            expect(el.open).toBe(false);

            // And a real click on the anchor of an open panel closes it for good.
            await userEvent.click(anchor);
            await settled();
            await userEvent.click(anchor);
            await settled();
            expect(isShown(panel)).toBe(false);
            expect(el.open).toBe(false);
        });

        it('closes when another popover opens', async () => {
            const first = await popoverFixture({ attrs: 'open="true"' });
            const second = await popoverFixture({ top: 100 });
            await settled();
            expect(isShown(first.panel)).toBe(true);

            const hidden = oneEvent(first.el, 'popover-hide');
            second.el.open = true;
            await hidden;

            expect(first.el.open).toBe(false);
            expect(isShown(second.panel)).toBe(true);
        });

        it('stays open when a popover inside its panel opens', async () => {
            const outer = await popoverFixture({
                attrs: 'open="true"',
                content: `
                    <el-popover class="inner" placement="right">
                        <button slot="anchor">More</button>
                        <div style="width: 60px; height: 20px">Inner</div>
                    </el-popover>
                `,
            });
            await settled();
            const inner = outer.el.querySelector('.inner');

            inner.querySelector('button').click();
            await settled();
            await settled();

            expect(inner.open).toBe(true);
            expect(outer.el.open).toBe(true);
            expect(isShown(outer.panel)).toBe(true);

            // Escape closes the innermost one first.
            await userEvent.keyboard('{Escape}');
            await settled();
            expect(inner.open).toBe(false);
            expect(outer.el.open).toBe(true);
        });

        it('works with an el-button as its anchor', async () => {
            const { el, anchor, panel } = await popoverFixture({
                anchor: `<el-button slot="anchor">Options</el-button>`,
            });

            const control = anchor.shadowRoot.querySelector('button');
            // The button passes aria-expanded on to its control, which a screen reader announces.
            expect(control.getAttribute('aria-expanded')).toBe('false');

            control.click();
            await settled();
            await settled();
            expect(el.open).toBe(true);
            expect(isShown(panel)).toBe(true);
            expect(control.getAttribute('aria-expanded')).toBe('true');
        });
    });

    describe('placement', () => {
        it('is below its anchor, centred, at a distance of 8px, by default', async () => {
            const { el, anchor, panel } = await popoverFixture();
            el.open = true;
            await settled();

            expect(rect(panel).top - rect(anchor).bottom).toBe(8);
            expect(centreX(panel)).toBe(centreX(anchor));
            expect(panel.dataset.placement).toBe('bottom');
        });

        it('is on the side that placement names', async () => {
            const gaps = {
                top: (anchor, panel) => rect(anchor).top - rect(panel).bottom,
                bottom: (anchor, panel) => rect(panel).top - rect(anchor).bottom,
                left: (anchor, panel) => rect(anchor).left - rect(panel).right,
                right: (anchor, panel) => rect(panel).left - rect(anchor).right,
            };
            for (const [side, gap] of Object.entries(gaps)) {
                const { el, anchor, panel } = await popoverFixture({ attrs: `placement="${side}"` });
                el.open = true;
                await settled();

                expect(gap(anchor, panel), side).toBe(8);
                expect(panel.dataset.placement, side).toBe(side);
                if (side === 'top' || side === 'bottom') expect(centreX(panel), side).toBe(centreX(anchor));
                else expect(centreY(panel), side).toBe(centreY(anchor));
            }
        });

        it('is aligned with the start or the end of the anchor', async () => {
            const start = await popoverFixture({ attrs: 'placement="bottom-start"' });
            start.el.open = true;
            await settled();
            expect(rect(start.panel).left).toBe(rect(start.anchor).left);

            const end = await popoverFixture({ attrs: 'placement="bottom-end"' });
            end.el.open = true;
            await settled();
            expect(rect(end.panel).right).toBe(rect(end.anchor).right);

            const side = await popoverFixture({ attrs: 'placement="right-start"' });
            side.el.open = true;
            await settled();
            expect(rect(side.panel).top).toBe(rect(side.anchor).top);
        });

        it('takes its distance from the attribute, and a new one while it is open', async () => {
            const { el, anchor, panel } = await popoverFixture({ attrs: 'distance="20"' });
            el.open = true;
            await settled();
            expect(rect(panel).top - rect(anchor).bottom).toBe(20);

            el.distance = 0;
            await settled();
            expect(rect(panel).top - rect(anchor).bottom).toBe(0);

            el.placement = 'top';
            await settled();
            expect(rect(anchor).top - rect(panel).bottom).toBe(0);
        });

        it('goes to the other side when it has no room', async () => {
            const { el, anchor, panel } = await popoverFixture({ top: innerHeight - 50 });
            el.open = true;
            await settled();

            expect(rect(anchor).top - rect(panel).bottom).toBe(8);
            expect(panel.dataset.placement).toBe('top');
        });

        it('stays inside the viewport', async () => {
            const { el, panel } = await popoverFixture({
                left: 0,
                content: `<div style="width: 240px; height: 40px">A wide panel</div>`,
            });
            el.open = true;
            await settled();

            // Centred on the anchor it would start 83px left of the viewport.
            expect(rect(panel).left).toBe(8);
        });

        it('is never wider than the viewport', async () => {
            const { el, panel } = await popoverFixture({
                content: `<div>${'A long text that goes on and on. '.repeat(10)}</div>`,
            });
            el.open = true;
            await settled();

            expect(rect(panel).width).toBeLessThanOrEqual(320);
            expect(rect(panel).left).toBeGreaterThanOrEqual(8);
            expect(rect(panel).right).toBeLessThanOrEqual(innerWidth - 8);
        });

        it('follows its anchor when the page scrolls under it', async () => {
            const wrapper = await fixture(`
                <div style="position: fixed; top: 100px; left: 100px; width: 200px; height: 150px; overflow: auto">
                    <div style="height: 800px; padding-top: 60px">
                        <el-popover open="true">
                            <button slot="anchor" style="width: 100px; height: 30px; margin: 0; padding: 0; border: 0">
                                Options
                            </button>
                            <div style="width: 80px; height: 40px">Panel</div>
                        </el-popover>
                    </div>
                </div>
            `);
            wrappers.push(wrapper);
            const el = wrapper.querySelector('el-popover');
            const anchor = el.querySelector('button');
            const panel = el.shadowRoot.querySelector('[part="panel"]');
            await settled();
            const before = rect(panel).top;
            expect(before - rect(anchor).bottom).toBe(8);

            wrapper.scrollTop = 30;
            await settled();
            await settled();

            expect(rect(panel).top).toBe(before - 30);
            expect(rect(panel).top - rect(anchor).bottom).toBe(8);
        });

        it('is in the top layer: nothing clips it, and nothing lies on top of it', async () => {
            const wrapper = await fixture(`
                <div style="position: fixed; top: 300px; left: 150px; width: 100px; height: 30px; overflow: hidden">
                    <el-popover open="true">
                        <button slot="anchor" style="width: 100px; height: 30px; margin: 0; padding: 0; border: 0">
                            Options
                        </button>
                        <div class="content" style="width: 80px; height: 40px">Panel</div>
                    </el-popover>
                </div>
            `);
            const cover = await fixture(`<div style="position: fixed; inset: 0; z-index: 2147483647"></div>`);
            wrappers.push(wrapper, cover);
            const el = wrapper.querySelector('el-popover');
            const panel = el.shadowRoot.querySelector('[part="panel"]');
            await settled();

            // The panel is outside the box that clips its popover, and under the cover in the page.
            expect(rect(panel).top).toBeGreaterThan(rect(wrapper).bottom);
            expect(document.elementFromPoint(centreX(panel), centreY(panel))).toBe(el.querySelector('.content'));
        });
    });

    describe('arrow', () => {
        const arrowOf = (el) => el.shadowRoot.querySelector('[part="arrow"]');
        // Half of the diagonal of the square of 12px sticks out.
        const ARROW_LENGTH = 12 * Math.SQRT1_2;

        it('has no arrow by default', async () => {
            const { el } = await popoverFixture({ attrs: 'open="true"' });
            await settled();
            expect(arrowOf(el)).toBeNull();
        });

        it('points to the middle of the anchor, with its tip at the distance', async () => {
            const { el, anchor, panel } = await popoverFixture({ attrs: 'arrow="true" open="true"' });
            await settled();
            const arrow = arrowOf(el);

            expect(arrow).not.toBeNull();
            expect(rect(panel).top - rect(anchor).bottom).toBeCloseTo(8 + ARROW_LENGTH, 1);
            expect(centreX(arrow)).toBeCloseTo(centreX(anchor), 0);
            // Its middle is on the edge of the panel that faces the anchor.
            expect(centreY(arrow)).toBeCloseTo(rect(panel).top, 0);
        });

        it('is on the edge that faces the anchor on every side, also after the panel changed sides', async () => {
            for (const side of ['top', 'left', 'right']) {
                const { el, anchor, panel } = await popoverFixture({ attrs: `arrow="true" placement="${side}"` });
                el.open = true;
                await settled();
                const arrow = arrowOf(el);

                if (side === 'top') expect(centreY(arrow), side).toBeCloseTo(rect(panel).bottom, 0);
                if (side === 'left') expect(centreX(arrow), side).toBeCloseTo(rect(panel).right, 0);
                if (side === 'right') expect(centreX(arrow), side).toBeCloseTo(rect(panel).left, 0);
                if (side === 'top') expect(centreX(arrow), side).toBeCloseTo(centreX(anchor), 0);
                else expect(centreY(arrow), side).toBeCloseTo(centreY(anchor), 0);
            }

            const flipped = await popoverFixture({ attrs: 'arrow="true"', top: innerHeight - 50 });
            flipped.el.open = true;
            await settled();
            expect(flipped.panel.dataset.placement).toBe('top');
            expect(centreY(arrowOf(flipped.el))).toBeCloseTo(rect(flipped.panel).bottom, 0);
        });

        it('stays on the anchor when the panel is pushed along the edge of the viewport', async () => {
            const { el, anchor } = await popoverFixture({
                attrs: 'arrow="true"',
                left: 0,
                content: `<div style="width: 240px; height: 40px">A wide panel</div>`,
            });
            el.open = true;
            await settled();

            expect(centreX(arrowOf(el))).toBeCloseTo(centreX(anchor), 0);
        });

        it('gets and loses its arrow while it is open', async () => {
            const { el, anchor, panel } = await popoverFixture({ attrs: 'open="true"' });
            await settled();

            el.arrow = true;
            await settled();
            expect(arrowOf(el)).not.toBeNull();
            expect(isShown(panel)).toBe(true);
            expect(rect(panel).top - rect(anchor).bottom).toBeCloseTo(8 + ARROW_LENGTH, 1);

            el.arrow = false;
            await settled();
            expect(arrowOf(el)).toBeNull();
            expect(rect(panel).top - rect(anchor).bottom).toBe(8);
        });

        it('has the surface and the border of the panel, on its two outer sides only', async () => {
            const { el, panel } = await popoverFixture({ attrs: 'arrow="true" open="true"' });
            panel.style.setProperty('--el-color-bg', 'rgb(250, 250, 250)');
            panel.style.setProperty('--el-color-border', 'rgb(100, 100, 100)');
            await settled();
            const { backgroundColor, borderTopColor, borderLeftColor, borderRightColor, borderBottomColor } =
                getComputedStyle(arrowOf(el));

            expect(backgroundColor).toBe('rgb(250, 250, 250)');
            expect([borderTopColor, borderLeftColor]).toEqual(['rgb(100, 100, 100)', 'rgb(100, 100, 100)']);
            expect([borderRightColor, borderBottomColor]).toEqual(['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']);
        });
    });

    describe('accessibility', () => {
        it('tells on the anchor whether the panel is open', async () => {
            const { el, anchor } = await popoverFixture();
            expect(anchor.getAttribute('aria-expanded')).toBe('false');

            el.open = true;
            await settled();
            expect(anchor.getAttribute('aria-expanded')).toBe('true');

            el.open = false;
            await settled();
            expect(anchor.getAttribute('aria-expanded')).toBe('false');
        });

        it('tells it on an anchor that comes later', async () => {
            const { el, anchor } = await popoverFixture({ attrs: 'open="true"' });
            await settled();

            const next = document.createElement('button');
            next.slot = 'anchor';
            next.textContent = 'More';
            anchor.replaceWith(next);
            await settled();

            expect(next.getAttribute('aria-expanded')).toBe('true');
        });

        it('tells it only on an anchor that can say so', async () => {
            const expanded = async (anchor) => {
                const { anchor: element } = await popoverFixture({ anchor });
                return element.getAttribute('aria-expanded');
            };

            expect(await expanded(`<a slot="anchor" href="#more">More</a>`)).toBe('false');
            expect(await expanded(`<span slot="anchor" role="button" tabindex="0">More</span>`)).toBe('false');
            // A custom element may pass the attribute on to the control inside it.
            expect(await expanded(`<el-button slot="anchor">More</el-button>`)).toBe('false');
            // On an element without a role the attribute is an error.
            expect(await expanded(`<span slot="anchor">More</span>`)).toBeNull();
        });

        it('has its content right after the anchor for the keyboard', async () => {
            const { el, anchor } = await popoverFixture({
                content: `<a class="content" href="#first">First link</a>`,
            });
            anchor.focus();
            await userEvent.keyboard('{Enter}');
            await settled();
            expect(el.open).toBe(true);

            await userEvent.keyboard('{Tab}');
            expect(document.activeElement).toBe(el.querySelector('.content'));

            // Escape closes the panel and gives the focus back to the anchor.
            await userEvent.keyboard('{Escape}');
            await settled();
            expect(el.open).toBe(false);
            expect(document.activeElement).toBe(anchor);
        });

        it('leaves the focus where a click beside the panel put it', async () => {
            const { wrapper, el, anchor } = await popoverFixture({
                content: `<a class="content" href="#first">First link</a>`,
            });
            const other = document.createElement('button');
            other.textContent = 'Elsewhere';
            other.style.cssText = 'position: fixed; top: 20px; left: 20px';
            wrapper.append(other);

            anchor.focus();
            await userEvent.keyboard('{Enter}');
            await settled();
            await userEvent.keyboard('{Tab}');
            expect(document.activeElement).toBe(el.querySelector('.content'));

            await userEvent.click(other);
            await settled();
            expect(el.open).toBe(false);
            expect(document.activeElement).toBe(other);
        });

        it('has a surface that can be read without a theme', async () => {
            const wrapper = await fixture(`
                <div style="position: fixed; top: 300px; left: 150px">
                    <el-popover open="true"><button slot="anchor">Options</button>Panel</el-popover>
                </div>
            `);
            wrappers.push(wrapper);
            await settled();
            const panel = wrapper.querySelector('el-popover').shadowRoot.querySelector('[part="panel"]');
            const { backgroundColor, color, borderTopStyle } = getComputedStyle(panel);

            expect({ backgroundColor, color, borderTopStyle }).toEqual({
                backgroundColor: 'rgb(255, 255, 255)',
                color: 'rgb(0, 0, 0)',
                borderTopStyle: 'solid',
            });
        });

        it('has no detectable a11y violations, closed and open', async () => {
            const { wrapper, el } = await popoverFixture({
                content: `<p style="margin: 0">Sort by <a href="#date">date</a> or <a href="#name">name</a>.</p>`,
            });
            const closed = await axe.run(wrapper);
            expect(closed.violations.map((violation) => violation.id)).toEqual([]);

            el.open = true;
            await settled();
            const open = await axe.run(wrapper);
            expect(open.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const { el } = await popoverFixture({ attrs: 'hidden' });
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('can be taken out of the page while it is open, and put back', async () => {
        const { wrapper, el, panel } = await popoverFixture({ attrs: 'open="true"' });
        await settled();

        el.remove();
        await settled();
        expect(isShown(panel)).toBe(false);

        wrapper.append(el);
        await settled();
        expect(el.open).toBe(true);
        expect(isShown(el.shadowRoot.querySelector('[part="panel"]'))).toBe(true);
    });

    it('has a closed native popover in the server-rendered markup', async () => {
        const { el } = await popoverFixture({ attrs: 'arrow="true"' });
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<slot[^>]*\sname=['"]anchor['"]/);
        expect(markup).toMatch(/<div[^>]*\spart=['"]panel['"][^>]*\spopover=['"]auto['"]/);
        expect(markup).toMatch(/<div[^>]*\spart=['"]arrow['"]/);
    });
});
