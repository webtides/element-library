/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './tab-panel.js';
define();

describe('Feature | TabPanel', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-panel></el-tab-panel>`);
        await nextFrame();
    });
});
