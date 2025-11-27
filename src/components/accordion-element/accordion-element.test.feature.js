/* eslint-disable no-unused-expressions */
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './accordion-element.js';
define();

describe('Feature | AccordionElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion-element></el-accordion-element>`);
        await nextFrame();
    });
});
