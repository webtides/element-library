/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import SliderElement, { define } from './slider-element.js';
define();

describe('Unit | SliderElement', () => {
    it('can be created without errors', async () => {
        const el = new SliderElement();
    });
});
