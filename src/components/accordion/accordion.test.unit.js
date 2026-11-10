import { describe, it } from 'vite-plus/test';
import Accordion, { define } from './accordion.js';
define();

describe('Unit | Accordion', () => {
    it('can be created without errors', async () => {
        const el = new Accordion();
    });
});
