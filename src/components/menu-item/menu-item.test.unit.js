import { describe, it, expect } from 'vite-plus/test';
import MenuItem, { define } from './menu-item.js';
define();

describe('Unit | MenuItem', () => {
    it('can be created without errors', async () => {
        const el = new MenuItem();
        expect(el).toBeInstanceOf(MenuItem);
    });

    it('is an action that can be chosen, without a value, by default', async () => {
        const el = new MenuItem();
        expect(el.properties()).toEqual({
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            value: '',
            disabled: false,
            variant: 'neutral',
        });
    });
});
