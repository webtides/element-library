import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import { accessibleName, accessibleRole, nextFrame } from '../../test-helpers.js';
import Tree, { define } from './tree.js';
import TreeItem, { define as defineItem } from '../tree-item/tree-item.js';
import treeStyle from './tree.style.js';
import itemStyle from '../tree-item/tree-item.style.js';

// These tests cover the time before `el-tree` and `el-tree-item` are defined, so the elements must
// not be registered up front. Subclasses under other tags are only used to call `template()`,
// which gives the same markup the SSR renderer puts into the Declarative Shadow DOM. A server does
// not run the lifecycle, and neither do these: they are never connected.
customElements.define('el-tree-ssr-source', class extends Tree {});
customElements.define('el-tree-item-ssr-source', class extends TreeItem {});

const shadow = (style, template) => `<template shadowrootmode="open"><style>${style}</style>${template}</template>`;
const attributesOf = (attributes) =>
    Object.entries(attributes)
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ');

/** An entry as a server renders it: its attributes, its shadow root, and the entries below it. */
function item(attributes, children = '') {
    const source = document.createElement('el-tree-item-ssr-source');
    source.innerHTML = children;
    Object.assign(source, source.properties(), attributes, {
        open: attributes.open === 'true',
        current: attributes.current === 'true',
    });
    return `<el-tree-item ${attributesOf(attributes)}>${shadow(itemStyle, source.template().toString())}${children}</el-tree-item>`;
}

function serverRender() {
    const source = document.createElement('el-tree-ssr-source');
    Object.assign(source, source.properties(), { label: 'Folders' });
    const entries = `
        ${item(
            { id: 'inbox', label: 'Inbox', href: '#inbox', open: 'true' },
            `<span slot="end">12</span>
             ${item(
                 { id: 'work', label: 'Work', href: '#work', open: 'true' },
                 item({ id: 'invoices', label: 'Invoices', href: '#invoices', current: 'true' }),
             )}
             ${item({ id: 'private', label: 'Private', href: '#private' }, item({ id: 'family', label: 'Family', href: '#family' }))}`,
        )}
        ${item({ id: 'drafts', label: 'Drafts', href: '#drafts' })}
        ${item({ id: 'closed', label: 'Closed', href: '#closed', open: 'false' }, item({ id: 'hidden', label: 'Hidden', href: '#hidden' }))}
    `;
    return `<el-tree label="Folders">${shadow(treeStyle, source.template().toString())}${entries}</el-tree>`;
}

function mount(html) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255); width: 300px;
        --el-space-1: 4px; --el-space-2: 8px; --el-space-4: 16px;
        --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(100, 100, 100);
        --el-color-accent: rgb(0, 0, 200); --el-radius-md: 6px; --el-font-size-sm: 14px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-tree');
}

const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const entry = (el, id) => el.querySelector(`#${id}`);

/** Where every entry and every part of its row is, and how the row is painted. */
function look(el) {
    const box = (node) => {
        if (!node) return null;
        const { left, top, width, height } = node.getBoundingClientRect();
        return [left, top, width, height].map((value) => Math.round(value * 10) / 10);
    };
    return [...el.querySelectorAll('el-tree-item')].map((node) => {
        const row = part(node, 'row');
        const { backgroundColor, color } = getComputedStyle(row);
        return {
            id: node.id,
            host: box(node),
            parts: ['row', 'toggle', 'start', 'label', 'end', 'children'].map((name) => box(part(node, name))),
            paint: [backgroundColor, color, getComputedStyle(part(node, 'label')).fontWeight],
            bar: getComputedStyle(row, '::before').content,
            chevron:
                node.shadowRoot.querySelector('.chevron') &&
                getComputedStyle(node.shadowRoot.querySelector('.chevron')).rotate,
            expanded: part(node, 'toggle')?.getAttribute('aria-expanded') ?? null,
        };
    });
}

// Order matters: the first tests run while the two elements are still undefined.
describe('Feature | Tree | server-rendered', () => {
    it('shows its open branches, and no other, before the elements are defined', () => {
        const el = mount(serverRender());
        const height = (id) => entry(el, id).getBoundingClientRect().height;

        expect(customElements.get('el-tree')).toBeUndefined();
        expect(customElements.get('el-tree-item')).toBeUndefined();
        for (const id of ['inbox', 'work', 'invoices', 'private', 'drafts', 'closed'])
            expect(height(id), id).toBeGreaterThan(0);
        for (const id of ['family', 'hidden']) expect(height(id), id).toBe(0);
        // The buttons say the same, and point down where the branch is open.
        expect(part(entry(el, 'inbox'), 'toggle').getAttribute('aria-expanded')).toBe('true');
        expect(part(entry(el, 'private'), 'toggle').getAttribute('aria-expanded')).toBe('false');
        expect(getComputedStyle(entry(el, 'inbox').shadowRoot.querySelector('.chevron')).rotate).toBe('90deg');
        expect(getComputedStyle(entry(el, 'private').shadowRoot.querySelector('.chevron')).rotate).toBe('none');
    });

    it('is a list of lists of links before the elements are defined, with the current one marked', async () => {
        const el = mount(serverRender());

        expect(customElements.get('el-tree-item')).toBeUndefined();
        expect(await accessibleRole(part(el, 'base'))).toBe('list');
        expect(await accessibleName(part(el, 'base'))).toBe('Folders');
        expect(await accessibleRole(part(entry(el, 'work'), 'base'))).toBe('listitem');
        expect(await accessibleRole(part(entry(el, 'work'), 'label'))).toBe('link');
        expect(part(entry(el, 'invoices'), 'label').getAttribute('aria-current')).toBe('page');
        expect(getComputedStyle(part(entry(el, 'invoices'), 'row'), '::before').borderInlineStartWidth).toBe('3px');
    });

    it('has links that work before the elements are defined, with the whole row as their target', async () => {
        const el = mount(serverRender());
        const drafts = entry(el, 'drafts');
        drafts.scrollIntoView({ block: 'center' });
        const box = part(drafts, 'row').getBoundingClientRect();
        history.replaceState(null, '', location.pathname + location.search);

        expect(customElements.get('el-tree-item')).toBeUndefined();
        await userEvent.click(drafts, { position: { x: box.width - 5, y: box.height / 2 } });
        expect(location.hash).toBe('#drafts');
        history.replaceState(null, '', location.pathname + location.search);
    });

    it('looks the same before and after the elements take over', async () => {
        const el = mount(serverRender());
        el.scrollIntoView({ block: 'start' });
        const before = look(el);

        define();
        defineItem();
        const seen = [];
        for (let frame = 0; frame < 8; frame++) {
            await nextFrame();
            seen.push(look(el));
        }

        expect(el.matches(':state(connected)')).toBe(true);
        expect([...el.querySelectorAll('el-tree-item')].every((node) => node.matches(':state(connected)'))).toBe(true);
        for (const after of seen) expect(after).toEqual(before);

        // And a branch opens now.
        await userEvent.click(part(entry(el, 'private'), 'toggle'));
        await nextFrame();
        expect(entry(el, 'family').getBoundingClientRect().height).toBeGreaterThan(0);
    });
});
