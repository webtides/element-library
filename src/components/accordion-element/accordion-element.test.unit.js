/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import AccordionElement, { define } from './accordion-element.js';
define();

describe('Unit | AccordionElement', () => {
    it('can be created without errors', async () => {
        const el = new AccordionElement();
    });
});