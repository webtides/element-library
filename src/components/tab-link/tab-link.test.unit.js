import { describe, it } from 'vite-plus/test';
import TabLink, { define } from './tab-link.js';
define();

describe('Unit | TabLink', () => {
    it('can be created without errors', async () => {
        const el = new TabLink();
    });
});
