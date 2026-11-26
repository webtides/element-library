import { describe, it, expect } from 'vite-plus/test';
import { nextFrame } from '../../test-helpers.js';
import AppFrame, { define } from './app-frame.js';
import style from './app-frame.style.js';

// These tests cover the time before the frame is defined, so the element must not be registered up
// front. A subclass under another tag is only used to call `template()`, which gives the same
// markup the SSR renderer writes into a Declarative Shadow DOM. A server does not run the
// lifecycle, and neither does this: the source is never connected.
customElements.define('el-app-frame-ssr-source', class extends AppFrame {});

const attributesOf = (attributes) =>
    Object.entries(attributes)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');

const paragraphs = (count) => Array.from({ length: count }, (_, i) => `<p>Paragraph ${i + 1}</p>`).join('');

const allRegions = `
    <header slot="header" style="display: block; height: 50px">Header</header>
    <nav slot="navigation" aria-label="Main"><a href="#one">One</a></nav>
    <main id="main"><h1>Title</h1>${paragraphs(40)}<a href="#two">A link</a></main>
    <aside slot="aside"><p>Aside</p></aside>
    <footer slot="footer" style="display: block; height: 30px">Footer</footer>
`;

function serverRender(attributes, children) {
    const source = document.createElement('el-app-frame-ssr-source');
    for (const [name, value] of Object.entries(attributes)) source.setAttribute(name, value);
    source.innerHTML = children;
    const properties = {};
    if (attributes['wide-from']) properties.wideFrom = attributes['wide-from'];
    if (attributes['skip-label']) properties.skipLabel = attributes['skip-label'];
    Object.assign(source, source.properties(), properties);
    const template = source.template().toString();

    return `<el-app-frame ${attributesOf(attributes)} style="position: relative; height: 600px"><template shadowrootmode="open"><style>${style}</style>${template}</template>${children}</el-app-frame>`;
}

function mount(html, width) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-border-width: 1px; --el-space-2: 8px; --el-space-3: 12px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255); width: ${width}px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-app-frame');
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const box = (el, node) => {
    const origin = el.getBoundingClientRect();
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left - origin.left, top - origin.top, width, height].map((value) => Math.round(value * 10) / 10);
};

/** Where every region and every element of the page is, and what the lines look like. */
function look(el) {
    const parts = ['base', 'header', 'body', 'navigation', 'content', 'aside', 'footer', 'skip-link'];
    return {
        frame: box(el, el),
        parts: parts.map((name) => [name, box(el, part(el, name)), getComputedStyle(part(el, name)).borderTopWidth]),
        page: [...el.children].map((child) => [child.localName, box(el, child)]),
        scrolls: ['body', 'content'].map((name) => getComputedStyle(part(el, name)).overflowY),
    };
}

// Order matters: the first tests run while the element is still undefined.
describe('Feature | AppFrame | server-rendered', () => {
    it('has its regions in their places before the element is defined, where it is wide', () => {
        const el = mount(serverRender({}, allRegions), 1000);

        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(box(el, part(el, 'header'))).toEqual([0, 0, 1000, 51]);
        expect(box(el, part(el, 'navigation'))).toEqual([0, 51, 257, 518]);
        expect(box(el, part(el, 'content'))).toEqual([257, 51, 422, 518]);
        expect(box(el, part(el, 'aside'))).toEqual([679, 51, 321, 518]);
        expect(box(el, part(el, 'footer'))).toEqual([0, 569, 1000, 31]);
        // The content scrolls, with nothing but the stylesheet.
        expect(getComputedStyle(part(el, 'content')).overflowY).toBe('auto');
        expect(part(el, 'content').scrollHeight).toBeGreaterThan(part(el, 'content').clientHeight);
    });

    it('is one column between the header and the footer before the element is defined, where it is narrow', () => {
        const el = mount(serverRender({}, allRegions), 400);

        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(box(el, part(el, 'header'))).toEqual([0, 0, 400, 51]);
        expect(box(el, part(el, 'body'))).toEqual([0, 51, 400, 518]);
        expect(box(el, part(el, 'footer'))).toEqual([0, 569, 400, 31]);
        expect(getComputedStyle(part(el, 'body')).overflowY).toBe('auto');
    });

    it('takes the step of the page before the element is defined', () => {
        const wide = mount(serverRender({ 'wide-from': '30rem' }, allRegions), 500);
        const narrow = mount(serverRender({ 'wide-from': '80rem' }, allRegions), 1000);
        const unknown = mount(serverRender({ 'wide-from': '50rem' }, allRegions), 800);

        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(getComputedStyle(part(wide, 'body')).display).toBe('contents');
        expect(getComputedStyle(part(narrow, 'body')).display).toBe('block');
        // A step the stylesheet does not know is the default one, on the server as well.
        expect(getComputedStyle(part(unknown, 'body')).display).toBe('contents');
    });

    it('gives an empty region no room, and has a skip link that works, before the element is defined', () => {
        const el = mount(serverRender({ 'skip-label': 'Zum Inhalt' }, `<main id="only"><p>Content</p></main>`), 1000);
        const link = part(el, 'skip-link');

        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(box(el, part(el, 'content'))).toEqual([0, 0, 1000, 600]);
        expect(part(el, 'header').hidden).toBe(true);
        // A link to the main of the page, which the browser follows without a script.
        expect(link.getAttribute('href')).toBe('#only');
        expect(link.textContent.trim()).toBe('Zum Inhalt');
        expect(document.querySelector(link.getAttribute('href'))).toBe(el.querySelector('main'));
    });

    it('looks the same before and after the element takes over', async () => {
        const frames = [
            mount(serverRender({}, allRegions), 1000),
            mount(serverRender({}, allRegions), 400),
            mount(serverRender({ 'wide-from': '30rem' }, allRegions), 500),
            mount(serverRender({}, `<main id="alone"><p>Content</p></main>`), 1000),
        ];
        const before = frames.map(look);

        define();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(frames.map(look));
        }

        expect(frames.every((el) => el.matches(':state(connected)'))).toBe(true);
        for (const after of seen) expect(after).toEqual(before);
        // The script reads what the stylesheet has decided.
        expect(frames.map((el) => el.wide)).toEqual([true, false, true, true]);
    });
});
