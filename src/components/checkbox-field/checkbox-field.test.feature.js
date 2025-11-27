/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './checkbox-field.js';
define();

describe('Feature | CheckboxField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-checkbox-field></el-checkbox-field>`);
        await nextFrame();
    });
});
