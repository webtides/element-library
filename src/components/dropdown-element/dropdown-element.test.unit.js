import { describe, it } from 'vitest';
import DropdownElement, { define } from './dropdown-element.js';
define();

describe('Unit | DropdownElement', () => {
    it('can be created without errors', async () => {
        const el = new DropdownElement();
    });
});
