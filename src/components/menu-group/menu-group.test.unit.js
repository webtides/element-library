import { describe, it, expect } from 'vite-plus/test';
import MenuGroup, { define } from './menu-group.js';
define();

describe('Unit | MenuGroup', () => {
    it('can be created without errors', async () => {
        const el = new MenuGroup();
        expect(el).toBeInstanceOf(MenuGroup);
    });

    it('has no heading by default', async () => {
        const el = new MenuGroup();
        expect(el.properties()).toEqual({ label: '' });
    });
});
