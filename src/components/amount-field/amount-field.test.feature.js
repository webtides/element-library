/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '../../test-helpers.js';
import { define } from './amount-field.js';
define();

describe('Feature | AmountField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-amount-field></el-amount-field>`);
        await nextFrame();
    });
});
