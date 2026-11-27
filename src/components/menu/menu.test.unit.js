import { describe, it, expect } from 'vite-plus/test';
import Menu, { define } from './menu.js';
import Events from './menu.events.js';
define();

describe('Unit | Menu', () => {
    it('can be created without errors', async () => {
        const el = new Menu();
        expect(el).toBeInstanceOf(Menu);
    });

    it('is closed, has the name of its button and opens below the start of it by default', async () => {
        const el = new Menu();
        expect(el.properties()).toEqual({ open: false, label: '', placement: 'bottom-start', distance: 4 });
    });

    it('names its events', async () => {
        expect(Events).toEqual({ SHOW: 'menu-show', HIDE: 'menu-hide', SELECT: 'menu-select' });
    });

    it('has a panel that takes the focus of a press and is no stop of the Tab key', async () => {
        const el = document.createElement('el-menu');
        document.body.append(el);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const panel = el.shadowRoot.querySelector('[part~="panel"]');

        expect(panel.getAttribute('tabindex')).toBe('-1');
        expect(panel.getAttribute('role')).toBe('menu');
        el.remove();
    });

    it('stops listening for the keys of the page when it closes, and when it leaves the page', async () => {
        const el = document.createElement('el-menu');
        document.body.append(el);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
        const escape = () => {
            const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            document.body.dispatchEvent(event);
            return event.defaultPrevented;
        };

        el.show();
        await frame();
        await frame();
        expect(escape()).toBe(true);
        await frame();
        await frame();
        expect(el.open).toBe(false);
        // Closed: the key is the one of the page again.
        expect(escape()).toBe(false);

        el.show();
        await frame();
        await frame();
        el.remove();
        expect(escape()).toBe(false);
    });

    it('opens and closes without a button and without entries', async () => {
        const el = document.createElement('el-menu');
        document.body.append(el);
        await new Promise((resolve) => requestAnimationFrame(resolve));

        el.show();
        expect(el.open).toBe(true);
        el.toggle();
        expect(el.open).toBe(false);
        el.remove();
    });
});
