import { describe, it, expect } from 'vite-plus/test';
import ButtonGroup, { define } from './button-group.js';
define();

describe('Unit | ButtonGroup', () => {
    it('can be created without errors', async () => {
        const el = new ButtonGroup();
    });

    it('has no name by default', async () => {
        const el = new ButtonGroup();
        expect(el.properties()).toEqual({ label: '' });
    });
});
