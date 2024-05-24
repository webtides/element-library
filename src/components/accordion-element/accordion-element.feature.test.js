/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/accordion-element';
define();

describe('Feature | AccordionElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<accordion-element></accordion-element>`);
        await nextFrame();
    });
});
