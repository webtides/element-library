import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { nextFrame } from '../../test-helpers.js';
import Accordion, { define } from './accordion.js';
import style from './accordion.style.js';

// These tests cover the time before `el-accordion` is defined, so the element must not be
// registered up front. A subclass under another tag is only used to call `template()`, which gives
// the same markup the SSR renderer puts into the Declarative Shadow DOM.
customElements.define('el-accordion-ssr-source', class extends Accordion {});

function serverRender(attributes, properties) {
    const source = document.createElement('el-accordion-ssr-source');
    Object.assign(source, source.properties(), properties);
    const shadow = `<template shadowrootmode="open"><style>${style}</style>${source.template().toString()}</template>`;
    return `
        <el-accordion ${attributes}>
            ${shadow}
            <div slot="header">Shipping</div>
            <div slot="content"><p>Two to three days.</p><a href="#rates">Rates</a></div>
        </el-accordion>
        <p data-below>Below the accordion</p>
    `;
}

function mount(html) {
    const wrapper = document.createElement('div');
    // The tokens of a theme: a border, so that the line under an open header can be seen.
    wrapper.style.cssText =
        '--el-border-width: 1px; --el-color-border: rgb(200, 200, 200); --el-space-3: 12px; --el-duration-md: 300ms';
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return {
        wrapper,
        el: wrapper.querySelector('el-accordion'),
        below: wrapper.querySelector('[data-below]'),
    };
}

const content = (el) => el.shadowRoot.querySelector('[part~="content"]');
const title = (el) => el.shadowRoot.querySelector('[part~="title"]');
const icon = (el) => el.shadowRoot.querySelector('[part~="icon"]');
const height = (node) => node.getBoundingClientRect().height;
const top = (node) => node.getBoundingClientRect().top;

/** What is painted of the accordion and where the content below it starts, frame by frame. */
async function watch({ el, below }, frames) {
    const seen = [];
    for (let frame = 0; frame < frames; frame++) {
        seen.push({ content: height(content(el)), below: top(below) });
        await nextFrame();
    }
    return seen;
}

// Order matters: the first tests run while `el-accordion` is still undefined.
describe('Feature | Accordion | server-rendered', () => {
    it('hides the content of a closed accordion before the element is defined', () => {
        for (const attributes of ['', 'open="false"']) {
            const { el, below } = mount(serverRender(attributes, { open: false }));

            expect(customElements.get('el-accordion')).toBeUndefined();
            expect(height(content(el)), attributes).toBe(0);
            expect(getComputedStyle(content(el)).overflow, attributes).toBe('hidden');
            // The header is all there is: what follows starts right under it.
            expect(height(title(el)), attributes).toBeGreaterThan(0);
            expect(Math.round(top(below) - el.getBoundingClientRect().bottom), attributes).toBeLessThanOrEqual(16);
            expect(Math.round(height(el)), attributes).toBe(Math.round(height(title(el))) + 2);
        }
    });

    it('shows the content of an open accordion before the element is defined', () => {
        const { el } = mount(serverRender('open="true"', { open: true }));

        expect(customElements.get('el-accordion')).toBeUndefined();
        expect(height(content(el))).toBeGreaterThan(0);
        // And it looks open: the line under the header and the turned chevron.
        expect(getComputedStyle(title(el)).borderBottomColor).toBe('rgb(200, 200, 200)');
        expect(getComputedStyle(icon(el)).transform).not.toBe('none');
    });

    // What the readme gives a page that wants its accordions readable where scripting is off,
    // without the media query: a rule of the page for the part wins over the rule of the element.
    it('lets the page show the content of a closed accordion', () => {
        const pageStyle = new CSSStyleSheet();
        pageStyle.replaceSync('.readable el-accordion::part(content) { height: auto; }');
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, pageStyle];
        const { wrapper, el } = mount(serverRender('', { open: false }));
        wrapper.classList.add('readable');

        expect(customElements.get('el-accordion')).toBeUndefined();
        expect(height(content(el))).toBeGreaterThan(0);
        wrapper.remove();
        document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== pageStyle);
    });

    it('moves nothing when a closed accordion starts', async () => {
        const closed = mount(serverRender('', { open: false }));
        const closedByAttribute = mount(serverRender('open="false"', { open: false }));
        const serverContent = content(closed.el);
        const before = [closed, closedByAttribute].map(({ below }) => top(below));

        define();
        // Longer than the transition of the height (300 ms), which a collapse would run.
        const seen = [await watch(closed, 30), await watch(closedByAttribute, 5)];

        expect(closed.el.matches(':state(connected)')).toBe(true);
        expect(content(closed.el)).toBe(serverContent);
        expect([...new Set(seen[0].map((frame) => frame.content))]).toEqual([0]);
        expect([...new Set(seen[0].map((frame) => frame.below))]).toEqual([before[0]]);
        expect([...new Set(seen[1].map((frame) => frame.content))]).toEqual([0]);
        expect([...new Set(seen[1].map((frame) => frame.below))]).toEqual([before[1]]);
        expect(closed.el.matches(':state(open)')).toBe(false);
    });

    it('keeps an open accordion open when it starts', async () => {
        const open = mount(serverRender('open="true"', { open: true }));
        const before = { content: height(content(open.el)), below: top(open.below) };
        const transform = getComputedStyle(icon(open.el)).transform;
        await nextFrame();

        const seen = await watch(open, 30);

        expect(open.el.matches(':state(connected)')).toBe(true);
        expect(open.el.matches(':state(open)')).toBe(true);
        expect(open.el.open).toBe(true);
        expect([...new Set(seen.map((frame) => frame.content))]).toEqual([before.content]);
        expect([...new Set(seen.map((frame) => frame.below))]).toEqual([before.below]);
        expect(getComputedStyle(icon(open.el)).transform).toBe(transform);
    });

    it('opens a server-rendered closed accordion with the transition, and closes it again', async () => {
        const { wrapper, el } = mount(serverRender('', { open: false }));
        // Long enough to be on its way after a few frames, however long a frame takes.
        wrapper.style.setProperty('--el-duration-md', '2s');
        await nextFrame();
        await nextFrame();
        await nextFrame();

        title(el).click();
        await nextFrame();
        await nextFrame();
        await nextFrame();
        await nextFrame();

        expect(el.open).toBe(true);
        expect(el.getAttribute('open')).toBe('true');
        // On its way: more than nothing, less than all of it.
        expect(height(content(el))).toBeGreaterThan(0);
        expect(height(content(el))).toBeLessThan(content(el).scrollHeight);

        // To its end, without the wait. And without a transition from here on.
        for (const animation of content(el).getAnimations()) animation.finish();
        wrapper.style.setProperty('--el-duration-md', '0s');
        await nextFrame();
        expect(height(content(el))).toBe(content(el).scrollHeight);

        el.open = false;
        for (let frame = 0; frame < 6; frame++) await nextFrame();
        expect(height(content(el))).toBe(0);
        expect(el.matches(':state(open)')).toBe(false);
    });

    it('has no detectable a11y violations, closed and open', async () => {
        const closed = mount(serverRender('', { open: false }));
        const open = mount(serverRender('open="true"', { open: true }));
        await nextFrame();
        await nextFrame();

        for (const { el } of [closed, open]) {
            const results = await axe.run(el);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        }
    });
});
