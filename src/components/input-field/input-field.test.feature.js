/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './input-field.js';
define();

describe('Feature | InputField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-input-field></el-input-field>`);
        await nextFrame();
    });
});
