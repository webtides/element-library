import { describe, it, expect } from 'vite-plus/test';
import Toolbar, { define } from './toolbar.js';
define();

describe('Unit | Toolbar', () => {
    it('can be created without errors', async () => {
        const el = new Toolbar();
    });

    it('has no name, controls of the medium size and plain buttons by default', async () => {
        const el = new Toolbar();
        expect(el.properties()).toEqual({ label: '', size: 'medium', appearance: 'plain' });
    });

    it('defines the tooltip it shows the names of its icon buttons with', async () => {
        expect(customElements.get('el-tooltip')).toBeDefined();
    });
});
