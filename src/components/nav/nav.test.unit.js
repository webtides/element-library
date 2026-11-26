import { describe, it, expect } from 'vite-plus/test';
import Nav, { define } from './nav.js';
define();

describe('Unit | Nav', () => {
    it('can be created without errors', async () => {
        const el = new Nav();
    });

    it('has no name, takes its layout from where it is and shows its texts by default', async () => {
        const el = new Nav();
        expect(el.properties()).toEqual({ label: '', layout: 'auto', labels: true });
    });

    it('defines the tooltip it shows the names of destinations with an icon alone with', async () => {
        expect(customElements.get('el-tooltip')).toBeDefined();
    });
});
