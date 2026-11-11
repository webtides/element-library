import { describe, it, expect } from 'vite-plus/test';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './tab-panel.js';
define();

describe('Feature | TabPanel', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-panel></el-tab-panel>`);
        await nextFrame();
    });

    it('is a tabpanel', async () => {
        const el = await fixture(`<el-tab-panel name="a">Panel</el-tab-panel>`);

        expect(el.getAttribute('role')).toBe('tabpanel');
    });

    it('keeps a role the page gave it', async () => {
        const el = await fixture(`<el-tab-panel name="a" role="region">Panel</el-tab-panel>`);

        expect(el.getAttribute('role')).toBe('region');
    });
});
