import { describe, it } from 'vitest';
import StickyElement, { define } from './sticky-element.js';
define();

describe('Unit | StickyElement', () => {
    it('can be created without errors', async () => {
        const el = new StickyElement();
    });
});
