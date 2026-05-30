import { describe, it } from 'vitest';
import Sticky, { define } from './sticky.js';
define();

describe('Unit | Sticky', () => {
    it('can be created without errors', async () => {
        const el = new Sticky();
    });
});
