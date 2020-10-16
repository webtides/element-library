/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/mobile-accordion-element';
define();

describe('Feature | MobileAccordionElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<mobile-accordion-element></mobile-accordion-element>`);
        await nextFrame();
    });
});

