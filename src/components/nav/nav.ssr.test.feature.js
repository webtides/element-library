import { describe, it, expect } from 'vite-plus/test';
import { accessibleName, accessibleRole, nextFrame, useSafeAreaInsets } from '../../test-helpers.js';
import Nav, { define } from './nav.js';
import NavItem, { define as defineNavItem } from '../nav-item/nav-item.js';
import AppFrame, { define as defineAppFrame } from '../app-frame/app-frame.js';
import navStyle from './nav.style.js';
import itemStyle from '../nav-item/nav-item.style.js';
import frameStyle from '../app-frame/app-frame.style.js';

// These tests cover the time before the bar, its destinations and the frame are defined, so the
// elements must not be registered up front. Subclasses under other tags are only used to call
// `template()`, which gives the same markup the SSR renderer writes into a Declarative Shadow DOM.
// A server does not run the lifecycle, and neither do these: they are never connected.
customElements.define('el-nav-ssr-source', class extends Nav {});
customElements.define('el-nav-item-ssr-source', class extends NavItem {});
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

const icon = `<svg slot="icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>`;
const item = (name, current = false) =>
    serverRender(
        'el-nav-item',
        itemStyle,
        { id: name.toLowerCase(), href: `#${name.toLowerCase()}`, ...(current ? { current: 'true' } : {}) },
        { href: `#${name.toLowerCase()}`, current },
        `${icon}${name}`,
    );
const serverNav = (attributes = { label: 'Main' }) =>
    serverRender(
        'el-nav',
        navStyle,
        attributes,
        {
            label: attributes.label ?? '',
            ...(attributes.layout ? { layout: attributes.layout } : {}),
            ...(attributes.labels ? { labels: attributes.labels !== 'false' } : {}),
        },
        `${item('Inbox', true)}${item('Today')}${item('Upcoming')}${item('Done')}`,
    );
/** A frame with the destinations in its navigation, which are a bar where it is narrow. */
const serverFrameOnce = (nav) =>
    serverRender(
        'el-app-frame',
        frameStyle,
        { 'narrow-navigation': 'bar' },
        { narrowNavigation: 'bar' },
        `<main id="main"><p>Content</p></main>${nav.replace('<el-nav ', '<el-nav slot="navigation" ')}`,
        'position: relative; height: 600px',
    );
const serverFrame = (nav) =>
    serverRender(
        'el-app-frame',
        frameStyle,
        {},
        {},
        `<main id="main"><p>Content</p></main>${nav.replace('<el-nav ', '<el-nav slot="footer" ')}`,
        'position: relative; height: 600px',
    );

function mount(html, { width = 400, height = 0 } = {}) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-border-width: 1px; --el-control-height: 40px;
        --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-font-size-xs: 12px; --el-font-size-md: 16px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(90, 90, 90);
        --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
        width: ${width}px; ${height ? `height: ${height}px;` : ''}
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

/** Where the bar and its destinations are, and how each destination is painted. */
function look(wrapper) {
    const el = wrapper.querySelector('el-nav');
    return {
        parts: ['base', 'list'].map((name) => [name, box(wrapper, part(el, name))]),
        items: [...el.querySelectorAll('el-nav-item')].map((entry) => {
            const link = getComputedStyle(part(entry, 'link'));
            const shape = getComputedStyle(part(entry, 'icon'));
            return {
                id: entry.id,
                link: box(wrapper, part(entry, 'link')),
                icon: box(wrapper, part(entry, 'icon')),
                label: box(wrapper, part(entry, 'label')),
                paint: [link.color, link.fontWeight, shape.backgroundColor, shape.borderTopWidth],
            };
        }),
    };
}

// Order matters: the first tests run while the elements are still undefined.
describe('Feature | Nav | server-rendered', () => {
    useSafeAreaInsets({ top: 47, right: 20, bottom: 34, left: 10 });

    it('is a navigation with links in equal parts before any element is defined', async () => {
        const wrapper = mount(serverNav());
        const el = wrapper.querySelector('el-nav');
        const inbox = el.querySelector('#inbox');

        expect(customElements.get('el-nav')).toBeUndefined();
        expect(customElements.get('el-nav-item')).toBeUndefined();
        expect(await accessibleRole(part(el, 'base'))).toBe('navigation');
        expect(await accessibleName(part(el, 'base'))).toBe('Main');
        expect(await accessibleRole(part(inbox, 'link'))).toBe('link');
        expect(part(inbox, 'link').getAttribute('href')).toBe('#inbox');
        expect(part(inbox, 'link').getAttribute('aria-current')).toBe('page');
        expect(part(el.querySelector('#today'), 'link').hasAttribute('aria-current')).toBe(false);
        // Alone the bar keeps the home indicator and the sides clear itself: 370px for four.
        expect([...el.querySelectorAll('el-nav-item')].map((entry) => box(wrapper, entry)[2])).toEqual([
            92.5, 92.5, 92.5, 92.5,
        ]);
        // The current destination is marked by the stylesheet alone.
        expect(getComputedStyle(part(inbox, 'link')).fontWeight).toBe('600');
        expect(getComputedStyle(part(inbox, 'icon')).backgroundColor).toBe('rgb(230, 230, 230)');
    });

    it('has no name in its markup while the page gives none', () => {
        const wrapper = mount(serverNav({}));
        expect(part(wrapper.querySelector('el-nav'), 'base').hasAttribute('aria-label')).toBe(false);
    });

    it('reaches the lower edge in the footer of a frame, before any element is defined', () => {
        const wrapper = mount(serverFrame(serverNav()));
        const el = wrapper.querySelector('el-nav');

        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(box(wrapper, part(el, 'base'))).toEqual([0, 600 - 34 - 56, 400, 56 + 34]);
        expect(box(wrapper, part(el, 'list'))).toEqual([10, 600 - 34 - 56, 370, 56]);
        // The region draws the line, the bar leaves its own out.
        expect(getComputedStyle(part(el, 'base')).borderTopWidth).toBe('0px');
    });

    it('is a rail before any element is defined, where the page says so', () => {
        const wrapper = mount(serverNav({ label: 'Main', layout: 'rail' }), { height: 400 });
        const el = wrapper.querySelector('el-nav');

        expect(customElements.get('el-nav')).toBeUndefined();
        // Alone it keeps the top, the side and the lower edge of the screen clear itself.
        expect(box(wrapper, part(el, 'base'))).toEqual([0, 0, 10 + 80 + 1, 400]);
        expect([...el.querySelectorAll('el-nav-item')].map((entry) => box(wrapper, entry))).toEqual([
            [10, 47, 80, 56],
            [10, 103, 80, 56],
            [10, 159, 80, 56],
            [10, 215, 80, 56],
        ]);
        expect(getComputedStyle(part(el, 'base')).borderRightWidth).toBe('1px');
    });

    it('is a bar where a frame is narrow and a rail where it is wide, before any element is defined', () => {
        const narrow = mount(serverFrameOnce(serverNav()));
        const wide = mount(serverFrameOnce(serverNav()), { width: 1000 });
        const tops = (wrapper) =>
            [...wrapper.querySelectorAll('el-nav-item')].map((entry) => Math.round(box(wrapper, entry)[1]));

        expect(customElements.get('el-app-frame')).toBeUndefined();
        expect(customElements.get('el-nav')).toBeUndefined();
        // Narrow: one row at the lower edge, above the home indicator.
        expect(tops(narrow)).toEqual([510, 510, 510, 510]);
        expect(box(narrow, part(narrow.querySelector('el-nav'), 'base'))).toEqual([0, 510, 400, 90]);
        // Wide: below each other at the side, below the room of the status bar.
        expect(tops(wide)).toEqual([47, 103, 159, 215]);
        expect(box(wide, part(wide.querySelector('el-nav'), 'base'))).toEqual([0, 47, 90, 600 - 47 - 34]);
    });

    it('hides the texts of destinations with an icon alone, and has no tooltip, before the script', async () => {
        const wrapper = mount(serverNav({ label: 'Main', layout: 'rail', labels: 'false' }), { height: 400 });
        const el = wrapper.querySelector('el-nav');
        const today = el.querySelector('#today');

        expect(customElements.get('el-nav')).toBeUndefined();
        expect(part(today, 'label').getBoundingClientRect().width).toBe(1);
        expect(await accessibleName(part(today, 'link'))).toBe('Today');
        expect(el.shadowRoot.querySelector('el-tooltip')).toBeNull();
    });

    it('looks the same before and after the elements take over', async () => {
        const wrappers = [
            mount(serverNav()),
            mount(serverFrame(serverNav())),
            mount(serverNav({ label: 'Main', layout: 'rail' }), { height: 400 }),
            mount(serverNav({ label: 'Main', layout: 'rail', labels: 'false' }), { height: 400 }),
            mount(serverFrameOnce(serverNav())),
            mount(serverFrameOnce(serverNav()), { width: 1000 }),
        ];
        const before = wrappers.map(look);

        define();
        defineNavItem();
        defineAppFrame();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(wrappers.map(look));
        }

        expect(wrappers.every((wrapper) => wrapper.querySelector('el-nav').matches(':state(connected)'))).toBe(true);
        expect(wrappers[0].querySelector('el-nav-item').matches(':state(connected)')).toBe(true);
        for (const after of seen) expect(after).toEqual(before);
        // The script has brought the tooltips of the destinations with an icon alone, and no other.
        const tooltipsOf = (wrapper) =>
            wrapper.querySelector('el-nav').shadowRoot.querySelectorAll('el-tooltip').length;
        expect(wrappers.map(tooltipsOf)).toEqual([0, 0, 0, 4, 0, 0]);
    });
});
