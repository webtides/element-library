/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './dropdown-element.js';
define();

describe('Feature | DropdownElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-dropdown-element></el-dropdown-element>`);
        await nextFrame();
    });
});
