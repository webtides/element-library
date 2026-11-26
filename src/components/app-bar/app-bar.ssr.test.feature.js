import { describe, it, expect } from 'vite-plus/test';
import { accessibleName, accessibleRole, nextFrame, useSafeAreaInsets } from '../../test-helpers.js';
import AppBar, { define } from './app-bar.js';
import AppFrame, { define as defineAppFrame } from '../app-frame/app-frame.js';
import barStyle from './app-bar.style.js';
import frameStyle from '../app-frame/app-frame.style.js';

// These tests cover the time before the bar and the frame are defined, so the elements must not be
// registered up front. Subclasses under other tags are only used to call `template()`, which gives
// the same markup the SSR renderer writes into a Declarative Shadow DOM. A server does not run the
// lifecycle, and neither do these: they are never connected.
customElements.define('el-app-bar-ssr-source', class extends AppBar {});
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

const long = 'The title of a view that is much longer than the bar of a phone is wide';
const buttons = `
    <button slot="start" id="back" type="button" style="width: 40px; height: 40px">←</button>
    <button slot="end" id="more" type="button" style="width: 40px; height: 40px">m</button>
`;

const serverBar = (attributes, properties, title) =>
    serverRender('el-app-bar', barStyle, attributes, properties, `${buttons}${title}`);

const serverFrame = (bar) =>
    serverRender(
        'el-app-frame',
        frameStyle,
        {},
        {},
        `<header slot="header">${bar}</header><main id="main"><p>Content</p></main>`,
        'position: relative; height: 600px',
    );

function mount(html) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-border-width: 1px; --el-control-height: 40px;
        --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-font-size-lg: 18px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255); width: 400px;
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

/** Where the parts of a bar and the buttons of the page are, and how the surface is painted. */
function look(wrapper) {
    const el = wrapper.querySelector('el-app-bar');
    const { backgroundColor, borderBottomWidth } = getComputedStyle(part(el, 'base'));
    return {
        parts: ['base', 'row', 'start', 'title', 'end'].map((name) => [name, box(wrapper, part(el, name))]),
        page: [...el.querySelectorAll('button')].map((button) => [button.id, box(wrapper, button)]),
        paint: [backgroundColor, borderBottomWidth],
    };
}

// Order matters: the first tests run while the elements are still undefined.
describe('Feature | AppBar | server-rendered', () => {
    useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

    it('is one row with a title that is cut, before the element is defined', async () => {
        const wrapper = mount(serverBar({ 'heading-level': '1' }, { headingLevel: 1 }, long));
        const el = wrapper.querySelector('el-app-bar');
        const title = part(el, 'title');

        expect(customElements.get('el-app-bar')).toBeUndefined();
        expect(box(wrapper, part(el, 'base'))).toEqual([0, 0, 400, 57]);
        expect(box(wrapper, el.querySelector('#back'))).toEqual([12, 8, 40, 40]);
        expect(box(wrapper, el.querySelector('#more'))).toEqual([400 - 12 - 40, 8, 40, 40]);
        expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
        // The heading is in the markup, and has the whole title.
        expect(await accessibleRole(title)).toBe('heading');
        expect(title.getAttribute('aria-level')).toBe('1');
        expect(await accessibleName(title)).toBe(long);
    });

    it('is text without a level, and leaves an empty region out, before the element is defined', () => {
        const wrapper = mount(serverRender('el-app-bar', barStyle, {}, {}, 'Inbox'));
        const el = wrapper.querySelector('el-app-bar');

        expect(customElements.get('el-app-bar')).toBeUndefined();
        expect(part(el, 'title').hasAttribute('role')).toBe(false);
        expect(part(el, 'title').hasAttribute('aria-level')).toBe(false);
        expect(part(el, 'start').hidden).toBe(true);
        expect(part(el, 'end').hidden).toBe(true);
    });

    it('reaches under the status bar in the header of a frame, before any element is defined', () => {
        const wrapper = mount(serverFrame(serverBar({}, {}, 'Inbox')));
        const el = wrapper.querySelector('el-app-bar');

        expect(customElements.get('el-app-bar')).toBeUndefined();
        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(box(wrapper, part(el, 'base'))).toEqual([0, 0, 400, 47 + 56]);
        expect(box(wrapper, part(el, 'row'))).toEqual([10, 47, 370, 56]);
        // The region draws the line, the bar leaves its own out.
        expect(getComputedStyle(part(el, 'base')).borderBottomWidth).toBe('0px');
    });

    it('looks the same before and after the elements take over', async () => {
        const wrappers = [
            mount(serverBar({ 'heading-level': '1' }, { headingLevel: 1 }, long)),
            mount(serverBar({}, {}, 'Inbox')),
            mount(serverFrame(serverBar({ 'heading-level': '2' }, { headingLevel: 2 }, 'Inbox'))),
        ];
        const before = wrappers.map(look);

        define();
        defineAppFrame();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(wrappers.map(look));
        }

        expect(wrappers.every((wrapper) => wrapper.querySelector('el-app-bar').matches(':state(connected)'))).toBe(
            true,
        );
        for (const after of seen) expect(after).toEqual(before);
        // The default is on the element now, and says nothing about the look.
        expect(wrappers[0].querySelector('el-app-bar').getAttribute('appearance')).toBe('plain');
    });
});
