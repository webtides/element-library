import { describe, it } from 'vite-plus/test';
import AccordionGroup, { define } from './accordion-group.js';
define();

describe('Unit | AccordionGroup', () => {
    it('can be created without errors', async () => {
        const el = new AccordionGroup();
    });
});
