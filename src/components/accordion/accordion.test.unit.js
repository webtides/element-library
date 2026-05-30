import { describe, it } from 'vitest';
import Accordion, { define } from './accordion.js';
define();

describe('Unit | Accordion', () => {
    it('can be created without errors', async () => {
        const el = new Accordion();
    });
});
