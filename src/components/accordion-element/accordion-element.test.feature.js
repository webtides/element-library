/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './accordion-element.js';
define();

describe('Feature | AccordionElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion-element></el-accordion-element>`);
        await nextFrame();
    });
});
