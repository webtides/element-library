import { describe, it } from 'vitest';
import TabGroup, { define } from './tab-group.js';
define();

describe('Unit | TabGroup', () => {
    it('can be created without errors', async () => {
        const el = new TabGroup();
    });
});
