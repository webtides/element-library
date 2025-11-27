/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import AccordionGroup, { define } from './accordion-group.js';
define();

describe('Unit | AccordionGroup', () => {
    it('can be created without errors', async () => {
        const el = new AccordionGroup();
    });
});
