import { describe, it, expect } from 'vite-plus/test';
import { nextFrame } from '../../test-helpers.js';
import Notification, { define } from './notification.js';
import style from './notification.style.js';

// These tests cover the time before `el-notification` is defined, so the element must not be
// registered up front. A subclass under another tag is only used to call `template()`, which gives
// the same markup the SSR renderer puts into the Declarative Shadow DOM.
customElements.define('el-notification-ssr-source', class extends Notification {});

function serverRender(attributes, properties) {
    const source = document.createElement('el-notification-ssr-source');
    Object.assign(source, source.properties(), properties);
    const shadow = `<template shadowrootmode="open"><style>${style}</style>${source.template().toString()}</template>`;
    return `<el-notification ${attributes}>${shadow}Saved</el-notification>`;
}

function mount(html, duration = '0s') {
    const wrapper = document.createElement('div');
    wrapper.style.setProperty('--el-duration-md', duration);
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-notification');
}

const base = (el) => el.shadowRoot.querySelector('[part~="base"]');

// Order matters: the first two tests run while `el-notification` is still undefined.
describe('Feature | Notification | server-rendered', () => {
    it('shows an open notification before the element is defined', () => {
        const el = mount(serverRender('open="true"', { open: true }));

        expect(customElements.get('el-notification')).toBeUndefined();
        expect(getComputedStyle(base(el)).opacity).toBe('1');
        expect(getComputedStyle(base(el)).transform).toBe('none');
    });

    it('keeps a closed notification out of the layout before the element is defined', () => {
        for (const attributes of ['', 'open="false"']) {
            const el = mount(serverRender(attributes, { open: false }));

            expect(customElements.get('el-notification')).toBeUndefined();
            expect(getComputedStyle(base(el)).display, attributes).toBe('none');
            expect(el.getBoundingClientRect().height, attributes).toBe(0);
        }
    });

    it('stays visible while it upgrades, without replaying the enter transition', async () => {
        const el = mount(serverRender('open="true" variant="success"', { open: true, variant: 'success' }), '300ms');
        const serverBase = base(el);

        define();
        const opacities = [];
        for (let frame = 0; frame < 10; frame++) {
            opacities.push(getComputedStyle(base(el)).opacity);
            await nextFrame();
        }

        expect(base(el)).toBe(serverBase);
        expect(el.matches(':state(connected)')).toBe(true);
        expect(base(el).classList.contains('showing')).toBe(true);
        expect([...new Set(opacities)]).toEqual(['1']);
    });

    it('still animates hide() after the upgrade', async () => {
        const el = mount(serverRender('open="true"', { open: true }), '2s');
        await nextFrame();
        await nextFrame();
        await nextFrame();
        expect(getComputedStyle(base(el)).opacity).toBe('1');

        el.open = false;
        await nextFrame();
        await nextFrame();
        await nextFrame();

        const opacity = Number(getComputedStyle(base(el)).opacity);
        expect(opacity).toBeLessThan(1);
        expect(opacity).toBeGreaterThan(0);
    });
});
