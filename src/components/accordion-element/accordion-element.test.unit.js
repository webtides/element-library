import { describe, it } from 'vitest';
import AccordionElement, { define } from './accordion-element.js';
define();

describe('Unit | AccordionElement', () => {
    it('can be created without errors', async () => {
        const el = new AccordionElement();
    });
});
