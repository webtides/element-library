import { describe, it, expect } from 'vite-plus/test';
import Skeleton, { define } from './skeleton.js';
define();

describe('Unit | Skeleton', () => {
    it('can be created without errors', async () => {
        const el = new Skeleton();
    });

    it('has no effect by default', async () => {
        const el = new Skeleton();
        expect(el.properties()).toEqual({ effect: 'none' });
    });
});
