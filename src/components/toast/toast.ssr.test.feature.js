import { describe, it, expect } from 'vite-plus/test';
import { nextFrame } from '../../test-helpers.js';
import Toast, { define } from './toast.js';
import style from './toast.style.js';
import Notification, { define as defineNotification } from '../notification/notification.js';
import notificationStyle from '../notification/notification.style.js';

// These tests cover the time before `el-toast` and `el-notification` are defined, so the elements
// must not be registered up front. Subclasses under other tags are only used to call `template()`,
// which gives the same markup the SSR renderer puts into the Declarative Shadow DOM.
customElements.define('el-toast-ssr-source', class extends Toast {});
customElements.define('el-notification-ssr-source', class extends Notification {});

function serverRender(attributes = '') {
    const region = document.createElement('el-toast-ssr-source');
    Object.assign(region, region.properties());
    const note = document.createElement('el-notification-ssr-source');
    Object.assign(note, note.properties(), { open: true });
    return `
        <el-toast ${attributes}>
            <template shadowrootmode="open"><style>${style}</style>${region.template().toString()}</template>
            <el-notification open="true">
                <template shadowrootmode="open"><style>${notificationStyle}</style>${note.template().toString()}</template>
                From the server
            </el-notification>
        </el-toast>
    `;
}

function mount(html) {
    const wrapper = document.createElement('div');
    document.body.append(wrapper);
    wrapper.setHTMLUnsafe(html);
    return wrapper.querySelector('el-toast');
}

const place = (element) => {
    const { left, top, right, bottom } = element.getBoundingClientRect();
    return { left, top, right: innerWidth - right, bottom: innerHeight - bottom };
};

// Order matters: the first two tests run while the elements are still undefined.
describe('Feature | Toast | server-rendered', () => {
    it('shows a toast in its place before the elements are defined', () => {
        const el = mount(serverRender());
        const entry = el.firstElementChild;

        expect(customElements.get('el-toast')).toBeUndefined();
        expect(customElements.get('el-notification')).toBeUndefined();
        expect(el.hasAttribute('popover')).toBe(false);
        expect(getComputedStyle(el).position).toBe('fixed');
        expect(getComputedStyle(el).display).toBe('block');
        expect(entry.getBoundingClientRect().height).toBeGreaterThan(0);
        expect(place(entry)).toMatchObject({ top: 16, right: 16 });
        el.parentElement.remove();
    });

    it('is at the edge that placement names before the elements are defined', () => {
        const el = mount(serverRender('placement="bottom-start"'));

        expect(customElements.get('el-toast')).toBeUndefined();
        expect(place(el.firstElementChild)).toMatchObject({ bottom: 16, left: 16 });
        el.parentElement.remove();
    });

    it('goes into the top layer in the same place when the elements arrive, and is seen all the time', async () => {
        const el = mount(serverRender());
        const entry = el.firstElementChild;
        const before = place(entry);

        define();
        defineNotification();
        const seen = [];
        for (let frame = 0; frame < 10; frame++) {
            seen.push(`${getComputedStyle(el).display} ${JSON.stringify(place(entry))}`);
            await nextFrame();
        }

        expect([...new Set(seen)]).toEqual([`block ${JSON.stringify(before)}`]);
        expect(el.getAttribute('popover')).toBe('manual');
        expect(el.matches(':popover-open')).toBe(true);
        expect(el.firstElementChild).toBe(entry);
        expect(entry.open).toBe(true);

        // And it is a toast from there: once it is closed it is gone, and the region with it.
        await entry.hide();
        expect(entry.isConnected).toBe(false);
        expect(el.matches(':popover-open')).toBe(false);
        el.parentElement.remove();
    });
});
