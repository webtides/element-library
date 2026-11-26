import { describe, it, expect } from 'vite-plus/test';
import List, { define } from './list.js';
define();

describe('Unit | List', () => {
    it('can be created without errors', async () => {
        const el = new List();
    });

    it('has no name, the default density and no surface by default', async () => {
        const el = new List();
        expect(el.properties()).toEqual({ label: '', density: 'default', appearance: 'plain' });
    });
});
