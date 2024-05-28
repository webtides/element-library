/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from './accordion-group.js';
define();

describe('Feature | AccordionGroupe', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion-groupe></el-accordion-groupe>`);
        await nextFrame();
    });
});
