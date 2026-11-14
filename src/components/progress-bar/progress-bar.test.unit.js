import { describe, it, expect } from 'vite-plus/test';
import ProgressBar, { define } from './progress-bar.js';
define();

describe('Unit | ProgressBar', () => {
    it('can be created without errors', async () => {
        const el = new ProgressBar();
    });

    it('is at 0 of 100, has a value and is named "Progress" by default', async () => {
        const el = new ProgressBar();
        expect(el.properties()).toEqual({ value: 0, max: 100, indeterminate: false, label: 'Progress' });
    });
});
