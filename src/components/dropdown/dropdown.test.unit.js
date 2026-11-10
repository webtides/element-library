import { describe, it } from 'vite-plus/test';
import Dropdown, { define } from './dropdown.js';
define();

describe('Unit | Dropdown', () => {
    it('can be created without errors', async () => {
        const el = new Dropdown();
    });
});
