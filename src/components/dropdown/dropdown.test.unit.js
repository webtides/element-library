import { describe, it } from 'vitest';
import Dropdown, { define } from './dropdown.js';
define();

describe('Unit | Dropdown', () => {
    it('can be created without errors', async () => {
        const el = new Dropdown();
    });
});
