import { describe, it, expect } from 'vite-plus/test';
import Nav, { define } from './nav.js';
define();

describe('Unit | Nav', () => {
    it('can be created without errors', async () => {
        const el = new Nav();
    });

    it('has no name and is a bar by default', async () => {
        const el = new Nav();
        expect(el.properties()).toEqual({ label: '', layout: 'bar' });
    });
});
