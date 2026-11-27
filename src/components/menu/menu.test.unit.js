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
