import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import { nextFrame } from '../../test-helpers.js';
import Menu, { define } from './menu.js';
import MenuItem, { define as defineMenuItem } from '../menu-item/menu-item.js';
import MenuGroup, { define as defineMenuGroup } from '../menu-group/menu-group.js';
import menuStyle from './menu.style.js';
import itemStyle from '../menu-item/menu-item.style.js';
import groupStyle from '../menu-group/menu-group.style.js';

// These tests cover the time before the menu and its entries are defined, so the elements must
// not be registered up front. Subclasses under other tags are only used to call `template()`,
// which gives the same markup the SSR renderer writes into a Declarative Shadow DOM. A server does
// not run the lifecycle, and neither do these: they are never connected.
customElements.define('el-menu-ssr-source', class extends Menu {});
customElements.define('el-menu-item-ssr-source', class extends MenuItem {});
customElements.define('el-menu-group-ssr-source', class extends MenuGroup {});

const attributesOf = (attributes) =>
    Object.entries(attributes)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');

/** An element as a server renders it: its template in a Declarative Shadow DOM, then its children. */
function serverRender(tag, style, attributes, properties, children) {
    const source = document.createElement(`${tag}-ssr-source`);
    for (const [name, value] of Object.entries(attributes)) source.setAttribute(name, value);
    source.innerHTML = children;
    Object.assign(source, source.properties(), properties);
    const template = source.template().toString();

    return `<${tag} ${attributesOf(attributes)}><template shadowrootmode="open"><style>${style}</style>${template}</template>${children}</${tag}>`;
}

const item = (name, attributes = {}, properties = {}) =>
    serverRender('el-menu-item', itemStyle, { id: name.toLowerCase(), ...attributes }, properties, name);
const serverMenu = () =>
    serverRender(
        'el-menu',
        menuStyle,
        { id: 'server-menu' },
        {},
        `<button slot="trigger" type="button">More</button>${item('Edit', { value: 'edit' }, { value: 'edit' })}${item(
            'Docs',
            { href: '#server-docs' },
            { href: '#server-docs' },
        )}${serverRender(
            'el-menu-group',
            groupStyle,
            { label: 'Danger' },
            { label: 'Danger' },
            item('Delete', { variant: 'danger', disabled: 'true' }, { variant: 'danger', disabled: true }),
        )}`,
    );

function mount(html) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        --el-border-width: 1px; --el-control-height: 40px; --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px;
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
        --el-color-danger: rgb(200, 0, 0);
        font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255); padding: 100px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(`${html}<p class="after">After</p>`);
    return wrapper;
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const box = (node) => {
    const { left, top, width, height } = node.getBoundingClientRect();
    return [left, top, width, height].map((value) => Math.round(value * 10) / 10);
};
const look = (wrapper) => ({
    menu: box(wrapper.querySelector('el-menu')),
    trigger: box(wrapper.querySelector('[slot="trigger"]')),
    after: box(wrapper.querySelector('.after')),
    panel: box(part(wrapper.querySelector('el-menu'), 'panel')),
    entries: [...wrapper.querySelectorAll('el-menu-item')].map(box),
});

// Order matters: the first tests run while the elements are still undefined.
describe('Feature | Menu | server-rendered', () => {
    it('is its button alone before any element is defined: the menu is closed and takes no room', () => {
        const wrapper = mount(serverMenu());
        const el = wrapper.querySelector('el-menu');

        expect(customElements.get('el-menu')).toBeUndefined();
        expect(customElements.get('el-menu-item')).toBeUndefined();
        // The panel is a popover that is not shown, and the entries are in it.
        expect(part(el, 'panel').matches(':popover-open')).toBe(false);
        expect(box(part(el, 'panel')).slice(2)).toEqual([0, 0]);
        expect(wrapper.querySelectorAll('el-menu-item').length).toBe(3);
        for (const entry of wrapper.querySelectorAll('el-menu-item')) expect(box(entry).slice(2)).toEqual([0, 0]);
        // The element is as wide as its button, and one line high.
        expect(box(el)[2]).toBe(box(wrapper.querySelector('[slot="trigger"]'))[2]);
        expect(box(el)[3]).toBe(24);
        wrapper.remove();
    });

    it('takes no room at all without a button: a menu that is opened for the rows of a list', () => {
        const wrapper = mount(
            serverRender(
                'el-menu',
                menuStyle,
                { label: 'Actions' },
                { label: 'Actions' },
                item('Edit') + item('Delete'),
            ),
        );
        const el = wrapper.querySelector('el-menu');

        expect(customElements.get('el-menu')).toBeUndefined();
        expect(part(el, 'panel').getAttribute('aria-label')).toBe('Actions');
        expect(box(part(el, 'panel')).slice(2)).toEqual([0, 0]);
        expect(box(el).slice(2)).toEqual([0, 0]);
        for (const entry of wrapper.querySelectorAll('el-menu-item')) expect(box(entry).slice(2)).toEqual([0, 0]);
        wrapper.remove();
    });

    it('has the roles, the links and the states of its entries in its markup', () => {
        const wrapper = mount(serverMenu());
        const el = wrapper.querySelector('el-menu');
        const base = (id) => part(wrapper.querySelector(id), 'base');

        expect(part(el, 'panel').getAttribute('role')).toBe('menu');
        expect(part(el, 'panel').hasAttribute('aria-label')).toBe(false);
        expect([
            base('#edit').localName,
            base('#edit').getAttribute('role'),
            base('#edit').getAttribute('tabindex'),
        ]).toEqual(['button', 'menuitem', '-1']);
        expect([base('#docs').localName, base('#docs').getAttribute('href')]).toEqual(['a', '#server-docs']);
        expect(base('#delete').getAttribute('aria-disabled')).toBe('true');
        const group = part(wrapper.querySelector('el-menu-group'), 'base');
        expect([group.getAttribute('role'), group.getAttribute('aria-label')]).toEqual(['group', 'Danger']);
        wrapper.remove();
    });

    it('looks the same before and after the elements take over, and works from there', async () => {
        const wrapper = mount(serverMenu());
        const el = wrapper.querySelector('el-menu');
        const trigger = wrapper.querySelector('[slot="trigger"]');
        const server = { panel: part(el, 'panel'), edit: part(wrapper.querySelector('#edit'), 'base') };
        const before = look(wrapper);

        define();
        defineMenuItem();
        defineMenuGroup();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(look(wrapper));
        }

        expect(el.matches(':state(connected)')).toBe(true);
        for (const after of seen) expect(after).toEqual(before);
        // The markup of the server is the one the element works with.
        expect(part(el, 'panel')).toBe(server.panel);
        expect(part(wrapper.querySelector('#edit'), 'base')).toBe(server.edit);
        // The script has told the button what it opens.
        expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');

        const chosen = [];
        el.addEventListener('menu-select', (event) => chosen.push(event.detail.value));
        trigger.focus();
        await userEvent.keyboard('{Enter}');
        await nextFrame();
        expect(part(el, 'panel').matches(':popover-open')).toBe(true);
        expect(getComputedStyle(part(wrapper.querySelector('#delete'), 'base')).color).toBe('rgb(200, 0, 0)');
        await userEvent.keyboard('{Enter}');
        await nextFrame();
        expect(chosen).toEqual(['edit']);
        expect(document.activeElement).toBe(trigger);
        wrapper.remove();
    });
});
