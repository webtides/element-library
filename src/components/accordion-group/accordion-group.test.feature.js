import { describe, it, expect } from 'vitest';
import { fixture, nextFrame } from '../../test-helpers.js';
import { define } from './accordion-group.js';
import { define as defineAccordion } from '../accordion/accordion.js';
define();
defineAccordion();

describe('Feature | AccordionGroup', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-accordion-group></el-accordion-group>`);
        await nextFrame();
    });

    it('closes the previously open accordion when show-multiple is false', async () => {
        const group = await fixture(`
            <el-accordion-group show-multiple="false">
                <el-accordion><div slot="header">One</div><div slot="content">1</div></el-accordion>
                <el-accordion><div slot="header">Two</div><div slot="content">2</div></el-accordion>
            </el-accordion-group>
        `);
        await nextFrame();
        const [first, second] = group.querySelectorAll('el-accordion');

        first.open = true;
        await nextFrame();
        second.open = true;
        await nextFrame();

        expect(first.open).toBe(false);
        expect(second.open).toBe(true);
    });

    it('tracks an accordion that starts open so the next one closes it (single-open)', async () => {
        const group = await fixture(`
            <el-accordion-group show-multiple="false">
                <el-accordion open="true"><div slot="header">One</div><div slot="content">1</div></el-accordion>
                <el-accordion><div slot="header">Two</div><div slot="content">2</div></el-accordion>
            </el-accordion-group>
        `);
        await nextFrame();
        const [first, second] = group.querySelectorAll('el-accordion');

        // first starts open; opening the second should close it
        second.open = true;
        await nextFrame();

        expect(first.open).toBe(false);
        expect(second.open).toBe(true);
    });

    it('keeps multiple accordions open when show-multiple is true', async () => {
        const group = await fixture(`
            <el-accordion-group show-multiple="true">
                <el-accordion><div slot="header">One</div><div slot="content">1</div></el-accordion>
                <el-accordion><div slot="header">Two</div><div slot="content">2</div></el-accordion>
            </el-accordion-group>
        `);
        await nextFrame();
        const [first, second] = group.querySelectorAll('el-accordion');

        first.open = true;
        second.open = true;
        await nextFrame();

        expect(first.open).toBe(true);
        expect(second.open).toBe(true);
    });
});
