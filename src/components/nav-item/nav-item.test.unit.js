import { describe, it, expect } from 'vite-plus/test';
import NavItem, { define } from './nav-item.js';
define();

describe('Unit | NavItem', () => {
    it('can be created without errors', async () => {
        const el = new NavItem();
    });

    it('leads nowhere and is not the current destination by default', async () => {
        const el = new NavItem();
        expect(el.properties()).toEqual({ href: '', target: '', rel: 'noreferrer noopener', current: false });
    });
});
