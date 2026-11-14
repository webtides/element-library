import { describe, it, expect } from 'vite-plus/test';
import Divider, { define } from './divider.js';
define();

describe('Unit | Divider', () => {
    it('can be created without errors', async () => {
        const el = new Divider();
    });

    it('is horizontal by default', async () => {
        const el = new Divider();
        expect(el.properties()).toEqual({ orientation: 'horizontal' });
    });
});
