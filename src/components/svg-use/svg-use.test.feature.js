/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './svg-use.js';
define();

describe('Feature | SvgUse', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-svg-use></el-svg-use>`);
        await nextFrame();
    });
});
