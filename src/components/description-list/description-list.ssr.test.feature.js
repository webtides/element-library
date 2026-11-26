import { describe, it, expect } from 'vite-plus/test';
import { accessibleRole, nextFrame } from '../../test-helpers.js';
import DescriptionList, { define } from './description-list.js';
import style from './description-list.style.js';

// These tests cover the time before `el-description-list` is defined, so the element must not be
// registered up front. A subclass under another tag is only used to call `template()`, which gives
// the same markup the SSR renderer puts into the Declarative Shadow DOM.
customElements.define('el-description-list-ssr-source', class extends DescriptionList {});

function serverRender() {
    const source = document.createElement('el-description-list-ssr-source');
    const shadow = `<template shadowrootmode="open"><style>${style}</style>${source.template().toString()}</template>`;
    return `
        <el-description-list>
            ${shadow}
            <dt>Plan</dt>
            <dd>Team, 12 seats</dd>
            <dd data-action><a href="#plan" aria-label="Change the plan">Change</a></dd>
            <dt>Address of the invoice</dt>
            <dd>12 Garden Road<br />1017 Amsterdam</dd>
            <dt>Created</dt>
            <dd>12 March 2026</dd>
        </el-description-list>
    `;
}

function mount(width) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255); width: ${width}px;
        --el-space-3: 12px; --el-space-4: 16px; --el-border-width: 1px; --el-color-border: rgb(200, 200, 200);
        --el-color-fg: rgb(10, 10, 10); --el-color-fg-muted: rgb(100, 100, 100); --el-font-size-sm: 14px;
    `;
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(serverRender());
    return wrapper.querySelector('el-description-list');
}

/** Where every name, value and action is, how it is painted, and the lines between the rows. */
function look(el) {
    const box = (node) => {
        const { left, top, width, height } = node.getBoundingClientRect();
        return [left, top, width, height].map((value) => Math.round(value * 10) / 10);
    };
    return [el, ...el.querySelectorAll('dt, dd')].map((node) => {
        const { color, fontSize } = getComputedStyle(node);
        const { content, height, backgroundColor } = getComputedStyle(node, '::before');
        return { tag: node.localName, box: box(node), color, fontSize, line: [content, height, backgroundColor] };
    });
}

// Order matters: the first tests run while `el-description-list` is still undefined.
describe('Feature | DescriptionList | server-rendered', () => {
    it('is a description list before the element is defined', async () => {
        const el = mount(600);

        expect(customElements.get('el-description-list')).toBeUndefined();
        expect(el.shadowRoot.querySelector('dl')).not.toBeNull();
        expect(await accessibleRole(el.querySelector('dt'))).toBe('term');
        expect(await accessibleRole(el.querySelector('dd'))).toBe('definition');
    });

    it('is laid out before the element is defined: side by side from 30rem, one below the other under it', () => {
        const wide = mount(600);
        const narrow = mount(300);
        const top = (node) => node.getBoundingClientRect().top;

        expect(customElements.get('el-description-list')).toBeUndefined();
        expect(top(wide.querySelector('dd'))).toBe(top(wide.querySelector('dt')));
        expect(top(narrow.querySelector('dd'))).toBeGreaterThan(top(narrow.querySelector('dt')));
        expect(getComputedStyle(wide.querySelectorAll('dt')[1], '::before').height).toBe('1px');
    });

    it('looks the same before and after the element takes over', async () => {
        const lists = [mount(600), mount(300)];
        lists[0].scrollIntoView({ block: 'start' });
        const before = lists.map(look);

        define();
        const seen = [];
        for (let frame = 0; frame < 6; frame++) {
            await nextFrame();
            seen.push(lists.map(look));
        }

        expect(lists.every((el) => el.matches(':state(connected)'))).toBe(true);
        for (const after of seen) expect(after).toEqual(before);
    });
});
