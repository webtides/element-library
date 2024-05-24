/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/sticky-element';
define();

describe('Feature | StickyElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<sticky-element></sticky-element>`);
        await nextFrame();
    });
});
