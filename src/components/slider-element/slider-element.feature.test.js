/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/slider-element';
define();

describe('Feature | SliderElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<slider-element></slider-element>`);
        await nextFrame();
    });
});
