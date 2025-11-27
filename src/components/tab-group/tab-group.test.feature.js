/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './tab-group.js';
define();

describe('Feature | TabGroup', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tab-group></el-tab-group>`);
        await nextFrame();
    });
});
