import { describe, it, expect } from 'vite-plus/test';
import EmptyState, { define } from './empty-state.js';
define();

describe('Unit | EmptyState', () => {
    it('can be created without errors', async () => {
        const el = new EmptyState();
    });

    it('has no properties of its own', async () => {
        const el = new EmptyState();
        expect(el.properties()).toEqual({});
    });
});
