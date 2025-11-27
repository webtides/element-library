/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './tab-panel.js';
define();

describe('Feature | TabPanel', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-panel></el-tab-panel>`);
        await nextFrame();
    });
});
