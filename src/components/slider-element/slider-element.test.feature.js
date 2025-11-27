/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import { define } from './slider-element.js';
define();

describe('Feature | SliderElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-slider-element></el-slider-element>`);
        await nextFrame();
    });
});
