/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './sticky-element.js';
define();

describe('Feature | StickyElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-sticky-element></el-sticky-element>`);
        await nextFrame();
    });
});
