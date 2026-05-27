import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './accordion-element.js';
define();

describe('Feature | AccordionElement', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion-element></el-accordion-element>`);
        await nextFrame();
    });

    it('has no detectable a11y violations when rendered with header and content', async () => {
        const el = await fixture(`
            <el-accordion-element open="false">
                <div slot="header">Accordion Header</div>
                <div slot="content">Accordion content.</div>
            </el-accordion-element>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });
});
