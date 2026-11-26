import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import { accessibleName, accessibleRole, nextFrame } from '../../test-helpers.js';
import List, { define } from './list.js';
import ListItem, { define as defineItem } from '../list-item/list-item.js';
import listStyle from './list.style.js';
import itemStyle from '../list-item/list-item.style.js';

// These tests cover the time before `el-list` and `el-list-item` are defined, so the elements must
// not be registered up front. Subclasses under other tags are only used to call `template()`,
// which gives the same markup the SSR renderer puts into the Declarative Shadow DOM.
customElements.define('el-list-ssr-source', class extends List {});
customElements.define('el-list-item-ssr-source', class extends ListItem {});

function shadowOf(tag, style, properties) {
    const source = document.createElement(tag);
    Object.assign(source, source.properties(), properties);
    return `<template shadowrootmode="open"><style>${style}</style>${source.template().toString()}</template>`;
}

const item = (attributes, properties, content) =>
    `<el-list-item ${attributes}>${shadowOf('el-list-item-ssr-source', itemStyle, properties)}${content}</el-list-item>`;

function serverRender() {
    return `
        <el-list label="Messages" appearance="outlined" density="compact">
            ${shadowOf('el-list-ssr-source', listStyle, { label: 'Messages', appearance: 'outlined', density: 'compact' })}
            ${item(
                'href="#ada" mark="Unread"',
                { href: '#ada', mark: 'Unread' },
                `<span slot="start" style="display:block;width:40px;height:40px"></span>
                 Ada Lovelace
                 <span slot="description">The notes are ready</span>
                 <span slot="end">09:12</span>
                 <button slot="action" type="button">More</button>`,
            )}
            ${item(
                'href="#grace" current="true" truncate="true"',
                { href: '#grace', current: true, truncate: true },
                `<span slot="start" style="display:block;width:16px;height:16px"></span>
                 Grace Hopper found the moth in relay 70 and wrote it into the log of the machine
                 <span slot="description">Found it</span>`,
            )}
            ${item('current="true"', { current: true }, `Alan Turing<span slot="end">Yesterday</span>`)}
        </el-list>
    `;
}

function mount(html) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255); width: 400px;
        --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px;
        --el-border-width: 1px; --el-color-border: rgb(200, 200, 200);
        --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(100, 100, 100);
        --el-color-accent: rgb(0, 0, 200); --el-radius-lg: 12px; --el-font-size-sm: 14px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-list');
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);

/** Where everything is and how it is painted: the list, its rows, their parts and what is slotted. */
function look(el) {
    const box = (node) => {
        if (!node) return null;
        const { left, top, width, height } = node.getBoundingClientRect();
        return [left, top, width, height].map((value) => Math.round(value * 10) / 10);
    };
    const paint = (node, pseudo) => {
        const { backgroundColor, color, fontWeight, borderTopWidth, borderInlineStartWidth, content } =
            getComputedStyle(node, pseudo);
        return { backgroundColor, color, fontWeight, borderTopWidth, borderInlineStartWidth, content };
    };
    return {
        list: [box(part(el, 'base')), paint(part(el, 'base')), getComputedStyle(part(el, 'base')).borderRadius],
        rows: [...el.querySelectorAll('el-list-item')].map((row) => ({
            host: box(row),
            parts: ['base', 'mark', 'start', 'text', 'title', 'description', 'end', 'action'].map((name) =>
                box(part(row, name)),
            ),
            slotted: [...row.children].map(box),
            base: paint(part(row, 'base')),
            bar: paint(part(row, 'base'), '::before'),
            title: paint(part(row, 'title')),
            link: [part(row, 'title').tagName, part(row, 'title').getAttribute('href')],
            current: [part(row, 'base').getAttribute('aria-current'), part(row, 'title').getAttribute('aria-current')],
        })),
    };
}

// Order matters: the first tests run while the two elements are still undefined.
describe('Feature | List | server-rendered', () => {
    it('is a list of rows with their links before the elements are defined', async () => {
        const el = mount(serverRender());
        const [ada, grace, alan] = el.querySelectorAll('el-list-item');

        expect(customElements.get('el-list')).toBeUndefined();
        expect(customElements.get('el-list-item')).toBeUndefined();
        expect(await accessibleRole(part(el, 'base'))).toBe('list');
        expect(await accessibleName(part(el, 'base'))).toBe('Messages');
        expect(await accessibleRole(part(ada, 'base'))).toBe('listitem');
        expect(await accessibleRole(part(ada, 'title'))).toBe('link');
        expect(await accessibleName(part(ada, 'title'))).toBe('Unread Ada Lovelace');
        expect(part(grace, 'title').getAttribute('aria-current')).toBe('page');
        expect(part(alan, 'base').getAttribute('aria-current')).toBe('true');
    });

    it('has links that work before the elements are defined, with the whole row as their target', async () => {
        const el = mount(serverRender());
        const ada = el.querySelector('el-list-item');
        ada.scrollIntoView({ block: 'center' });
        const row = ada.getBoundingClientRect();
        const end = ada.querySelector('[slot="end"]').getBoundingClientRect();
        history.replaceState(null, '', location.pathname + location.search);

        expect(customElements.get('el-list-item')).toBeUndefined();
        expect(ada.shadowRoot.elementFromPoint(row.left + 3, row.bottom - 3)).toBe(part(ada, 'title'));

        await userEvent.click(ada, {
            position: { x: end.left + end.width / 2 - row.left, y: end.top + end.height / 2 - row.top },
        });
        expect(location.hash).toBe('#ada');

        // And the control at its end is a target of its own.
        history.replaceState(null, '', location.pathname + location.search);
        let clicks = 0;
        ada.querySelector('button').addEventListener('click', () => clicks++);
        await userEvent.click(ada.querySelector('button'));
        expect(clicks).toBe(1);
        expect(location.hash).toBe('');
    });

    it('looks the same before and after the elements take over', async () => {
        const el = mount(serverRender());
        el.scrollIntoView({ block: 'start' });
        const before = look(el);

        // The rows are laid out: side by side with their starts on one line, cut and marked.
        expect(before.rows.map((row) => row.parts[4][0])).toEqual(Array(3).fill(before.rows[0].parts[4][0]));
        expect(before.rows[0].parts[1]).not.toBeNull();
        expect(before.rows[1].bar.borderInlineStartWidth).toBe('3px');
        expect(before.rows[1].parts[4][3]).toBe(24);
        expect(before.list[1].backgroundColor).toBe('rgb(255, 255, 255)');

        define();
        defineItem();
        const seen = [];
        for (let frame = 0; frame < 6; frame++) {
            await nextFrame();
            seen.push(look(el));
        }

        expect(el.matches(':state(connected)')).toBe(true);
        expect([...el.querySelectorAll('el-list-item')].every((row) => row.matches(':state(connected)'))).toBe(true);
        for (const after of seen) expect(after).toEqual(before);
    });
});
