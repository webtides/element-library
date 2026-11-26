import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { fixture, fixtureSync, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
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

    it('never shows the content of a closed accordion while it starts', async () => {
        // The transition of the height is 300 ms: a collapse on start would be seen in these frames.
        const wrapper = fixtureSync(`
            <div style="--el-duration-md: 300ms">
                <el-accordion>
                    <div slot="header">Accordion Header</div>
                    <div slot="content">Accordion content.</div>
                </el-accordion>
            </div>
        `);
        const el = wrapper.querySelector('el-accordion');
        const heights = [];
        for (let frame = 0; frame < 30; frame++) {
            const content = el.shadowRoot?.querySelector('[part~="content"]');
            if (content) heights.push(content.getBoundingClientRect().height);
            await nextFrame();
        }

        expect(heights.length).toBeGreaterThan(20);
        expect([...new Set(heights)]).toEqual([0]);
    });

    it('opens and closes with a click on the header, and says so', async () => {
        const el = await fixture(`
            <el-accordion style="--el-duration-md: 0s">
                <div slot="header">Accordion Header</div>
                <div slot="content">Accordion content.</div>
            </el-accordion>
        `);
        const content = el.shadowRoot.querySelector('[part~="content"]');
        const toggles = [];
        el.addEventListener('AccordionToggle', (event) => toggles.push(event.detail.open));

        el.shadowRoot.querySelector('[part~="title"]').click();
        await nextFrame();
        await nextFrame();
        await nextFrame();

        expect(el.getAttribute('open')).toBe('true');
        expect(el.matches(':state(open)')).toBe(true);
        expect(content.getBoundingClientRect().height).toBe(content.scrollHeight);
        expect(content.scrollHeight).toBeGreaterThan(0);

        el.shadowRoot.querySelector('[part~="title"]').click();
        await nextFrame();
        await nextFrame();
        await nextFrame();
        await nextFrame();

        expect(el.getAttribute('open')).toBe('false');
        expect(el.matches(':state(open)')).toBe(false);
        expect(content.getBoundingClientRect().height).toBe(0);
        expect(toggles).toEqual([true, false]);
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

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the header at least --el-touch-target high', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-accordion>
                        <div slot="header">Header</div>
                        <div slot="content">Content</div>
                    </el-accordion>
                </div>
            `);
            const title = wrapper.querySelector('el-accordion').shadowRoot.querySelector('[part~="title"]');
            expect(sizeOf(title).height).toBeGreaterThanOrEqual(44);
        });
    });
});
