import { describe, it, expect } from 'vite-plus/test';
import Breadcrumb, { define } from './breadcrumb.js';
define();

describe('Unit | Breadcrumb', () => {
    it('can be created without errors', async () => {
        const el = new Breadcrumb();
    });

    it('is named "Breadcrumb" by default', async () => {
        const el = new Breadcrumb();
        expect(el.properties()).toEqual({ label: 'Breadcrumb' });
    });
});
