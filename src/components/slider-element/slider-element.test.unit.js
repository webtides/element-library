/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import SliderElement, { define } from './slider-element.js';
define();

describe('Unit | SliderElement', () => {
    it('can be created without errors', async () => {
        const el = new SliderElement();
    });
});
