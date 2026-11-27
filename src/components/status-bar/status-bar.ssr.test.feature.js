import { describe, it, expect } from 'vite-plus/test';
import { nextFrame, useSafeAreaInsets } from '../../test-helpers.js';
import StatusBar, { define } from './status-bar.js';
import AppFrame, { define as defineAppFrame } from '../app-frame/app-frame.js';
import barStyle from './status-bar.style.js';
import frameStyle from '../app-frame/app-frame.style.js';

// These tests cover the time before the bar and the frame are defined, so the elements must not be
// registered up front. Subclasses under other tags are only used to call `template()`, which gives
// the same markup the SSR renderer writes into a Declarative Shadow DOM. A server does not run the
// lifecycle, and neither do these: they are never connected.
customElements.define('el-status-bar-ssr-source', class extends StatusBar {});
customElements.define('el-app-frame-ssr-source', class extends AppFrame {});

const attributesOf = (attributes) =>
    Object.entries(attributes)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');

/** An element as a server renders it: its template in a Declarative Shadow DOM, then its children. */
function serverRender(tag, style, attributes, properties, children, hostStyle = '') {
    const source = document.createElement(`${tag}-ssr-source`);
    for (const [name, value] of Object.entries(attributes)) source.setAttribute(name, value);
    source.innerHTML = children;
    Object.assign(source, source.properties(), properties);
    const template = source.template().toString();

    return `<${tag} ${attributesOf(attributes)} style="${hostStyle}"><template shadowrootmode="open"><style>${style}</style>${template}</template>${children}</${tag}>`;
}

const entries = `
    <span id="connection">Connected to the server in Frankfurt</span>
    <span id="count">128 entries, 3 of them selected</span>
    <span slot="end" id="version">v1.4.2</span>
`;

const serverBar = (children = entries) => serverRender('el-status-bar', barStyle, {}, {}, children);

const serverFrame = (bar) =>
    serverRender(
        'el-app-frame',
        frameStyle,
        {},
        {},
        `<main id="main"><p>Content</p></main><footer slot="footer">${bar}</footer>`,
        'position: relative; height: 600px',
    );

function mount(html, width = 400) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-border-width: 1px; --el-control-height: 40px;
        --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-font-size-sm: 14px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255); width: ${width}px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper;
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const box = (origin, node) => {
    const from = origin.getBoundingClientRect();
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left - from.left, top - from.top, width, height].map((value) => Math.round(value * 10) / 10);
};

/** Where the parts of a bar and the entries of the page are, and how the surface is painted. */
function look(wrapper) {
    const el = wrapper.querySelector('el-status-bar');
    const { backgroundColor, borderTopWidth } = getComputedStyle(part(el, 'base'));
    return {
        parts: ['base', 'row', 'start', 'end'].map((name) => [name, box(wrapper, part(el, name))]),
        page: [...el.querySelectorAll('span')].map((entry) => [entry.id, box(wrapper, entry)]),
        paint: [backgroundColor, borderTopWidth],
    };
}

// Order matters: the first tests run while the elements are still undefined.
describe('Feature | StatusBar | server-rendered', () => {
    useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

    it('is one row that keeps its height, with the end whole, before the element is defined', () => {
        const wrapper = mount(serverBar(), 240);
        const el = wrapper.querySelector('el-status-bar');

        expect(customElements.get('el-status-bar')).toBeUndefined();
        expect(box(wrapper, part(el, 'base'))).toEqual([0, 0, 240, 29]);
        expect(part(el, 'start').scrollWidth).toBeGreaterThan(part(el, 'start').clientWidth);
        expect(part(el, 'end').scrollWidth).toBe(part(el, 'end').clientWidth);
        const version = box(wrapper, el.querySelector('#version'));
        expect(Math.round(version[0] + version[2])).toBe(240 - 12);
    });

    it('leaves an empty end out, before the element is defined', () => {
        const wrapper = mount(serverBar('<span id="connection">Connected</span>'));
        const el = wrapper.querySelector('el-status-bar');

        expect(customElements.get('el-status-bar')).toBeUndefined();
        expect(part(el, 'end').hidden).toBe(true);
        expect(box(wrapper, part(el, 'start'))).toEqual([0, 1, 400, 28]);
    });

    it('reaches the lower edge of the screen in the footer of a frame, before any element is defined', () => {
        const wrapper = mount(serverFrame(serverBar()));
        const el = wrapper.querySelector('el-status-bar');

        expect(customElements.get('el-status-bar')).toBeUndefined();
        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(box(wrapper, part(el, 'base'))).toEqual([0, 600 - 34 - 28, 400, 28 + 34]);
        expect(box(wrapper, part(el, 'row'))).toEqual([10, 600 - 34 - 28, 370, 28]);
        // The region draws the line, the bar leaves its own out.
        expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('0px');
    });

    it('looks the same before and after the elements take over', async () => {
        const wrappers = [
            mount(serverBar(), 240),
            mount(serverBar('<span id="connection">Connected</span>')),
            mount(serverFrame(serverBar())),
        ];
        const before = wrappers.map(look);

        define();
        defineAppFrame();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(wrappers.map(look));
        }

        expect(wrappers.every((wrapper) => wrapper.querySelector('el-status-bar').matches(':state(connected)'))).toBe(
            true,
        );
        for (const after of seen) expect(after).toEqual(before);
    });
});
