import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './accordion.js';
define();

describe('Feature | Accordion', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion></el-accordion>`);
        await nextFrame();
    });

    it('has no detectable a11y violations when rendered with header and content', async () => {
        const el = await fixture(`
            <el-accordion open="false">
                <div slot="header">Accordion Header</div>
                <div slot="content">Accordion content.</div>
            </el-accordion>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });
});
