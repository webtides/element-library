import { describe, it, expect } from 'vite-plus/test';
import Tree, { define } from './tree.js';
define();

describe('Unit | Tree', () => {
    it('can be created without errors', async () => {
        const el = new Tree();
    });

    it('has no name by default', async () => {
        const el = new Tree();
        expect(el.properties()).toEqual({ label: '' });
    });
});
