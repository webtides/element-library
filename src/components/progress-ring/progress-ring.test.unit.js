import { describe, it, expect } from 'vite-plus/test';
import ProgressRing, { define } from './progress-ring.js';
define();

describe('Unit | ProgressRing', () => {
    it('can be created without errors', async () => {
        const el = new ProgressRing();
    });

    it('is at 0 of 100 and named "Progress" by default', async () => {
        const el = new ProgressRing();
        expect(el.properties()).toEqual({ value: 0, max: 100, label: 'Progress' });
    });
});
