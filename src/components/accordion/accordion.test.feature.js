import { describe, it, expect } from 'vite-plus/test';
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

    it('does not throw when it is removed while the collapse animation is pending', async () => {
        const errors = [];
        const onError = (event) => {
            event.preventDefault();
            errors.push(event.message);
        };
        window.addEventListener('error', onError);

        const el = await fixture(`
            <el-accordion open="true">
                <div slot="header">Accordion Header</div>
                <div slot="content">Accordion content.</div>
            </el-accordion>
        `);
        await nextFrame();

        // collapse() schedules two animation frames; the element is gone before they run.
        el.collapse();
        el.remove();
        await nextFrame();
        await nextFrame();
        await nextFrame();

        window.removeEventListener('error', onError);
        expect(errors).toEqual([]);
    });
});
