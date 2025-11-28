import { describe, it } from 'vitest';
import AccordionGroup, { define } from './accordion-group.js';
define();

describe('Unit | AccordionGroup', () => {
    it('can be created without errors', async () => {
        const el = new AccordionGroup();
    });
});
