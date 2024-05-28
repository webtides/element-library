/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './sticky-element.js';
define();

describe('Feature | StickyElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-sticky-element></el-sticky-element>`);
        await nextFrame();
    });
});
