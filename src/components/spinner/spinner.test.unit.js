import { describe, it, expect } from 'vite-plus/test';
import Spinner, { define } from './spinner.js';
define();

describe('Unit | Spinner', () => {
    it('can be created without errors', async () => {
        const el = new Spinner();
    });

    it('is medium and named "Loading" by default', async () => {
        const el = new Spinner();
        expect(el.properties()).toEqual({ size: 'medium', label: 'Loading' });
    });
});
