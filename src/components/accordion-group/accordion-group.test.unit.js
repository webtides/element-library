/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import AccordionGroup, { define } from './accordion-group.js';
define();

describe('Unit | AccordionGroup', () => {
    it('can be created without errors', async () => {
        const el = new AccordionGroup();
    });
});
