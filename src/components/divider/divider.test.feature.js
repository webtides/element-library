import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleRole, fixture, nextFrame, sizeOf, useForcedColors } from '../../test-helpers.js';
import { define } from './divider.js';
define();

const base = (el) => el.shadowRoot.querySelector('[part="base"]');
// A place of 300px with text of 20px, in blue.
const place = `width: 300px; font: 20px/30px sans-serif; color: rgb(0, 0, 255);`;
const placed = async (markup, style = '') => {
    const wrapper = await fixture(`<div style="${place} ${style}">${markup}</div>`);
    return wrapper.children.length === 1 ? wrapper.firstElementChild : [...wrapper.children];
};
// The line: the border at the top of a horizontal divider, at the start of a vertical one.
const line = (el) => {
    const { borderTopWidth, borderTopColor, borderLeftWidth, borderLeftColor } = getComputedStyle(base(el));
    return el.getAttribute('orientation') === 'vertical'
        ? { width: borderLeftWidth, colour: borderLeftColor }
        : { width: borderTopWidth, colour: borderTopColor };
};

describe('Feature | Divider', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-divider></el-divider>`);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a separator, horizontal by default', async () => {
            const el = await fixture(`<el-divider></el-divider>`);

            expect(base(el).tagName).toBe('HR');
            expect(await accessibleRole(base(el))).toBe('separator');
            expect(base(el).getAttribute('aria-orientation')).toBe('horizontal');
            // The role is the one of the hr: the host has none of its own.
            expect(el.hasAttribute('role')).toBe(false);
        });

        it('says so when it is vertical, also when that is set from a script', async () => {
            const el = await fixture(`<el-divider orientation="vertical"></el-divider>`);
            expect(base(el).getAttribute('aria-orientation')).toBe('vertical');

            el.orientation = 'horizontal';
            await nextFrame();
            expect(el.getAttribute('orientation')).toBe('horizontal');
            expect(base(el).getAttribute('aria-orientation')).toBe('horizontal');
        });

        it('is horizontal with an orientation it does not know', async () => {
            const el = await placed(`<el-divider orientation="diagonal"></el-divider>`);

            expect(base(el).getAttribute('aria-orientation')).toBe('horizontal');
            expect(sizeOf(el)).toEqual({ width: 300, height: 1 });
        });

        it('has no detectable a11y violations between two groups of content', async () => {
            const wrapper = await fixture(`
                <div style="${place} background: rgb(255, 255, 255)">
                    <p>Billing address</p>
                    <el-divider></el-divider>
                    <p>Shipping address</p>
                    <div style="display: flex; gap: 8px">
                        <span>Edit</span>
                        <el-divider orientation="vertical"></el-divider>
                        <span>Remove</span>
                    </div>
                </div>
            `);
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('horizontal', () => {
        it('is a line as wide as its container, without a space around it', async () => {
            const el = await placed(`<el-divider></el-divider>`);

            expect(el.getAttribute('orientation')).toBe('horizontal');
            expect(sizeOf(el)).toEqual({ width: 300, height: 1 });
            expect(sizeOf(base(el))).toEqual({ width: 300, height: 1 });
            expect(getComputedStyle(el).margin).toBe('0px');
            expect(getComputedStyle(base(el)).margin).toBe('0px');
        });

        it('takes the margin the page gives it', async () => {
            const wrapper = await fixture(`
                <div style="${place}">
                    <div style="height: 10px"></div>
                    <el-divider style="margin-block: 16px"></el-divider>
                    <div style="height: 10px"></div>
                </div>
            `);
            expect(sizeOf(wrapper)).toEqual({ width: 300, height: 53 });
        });
    });

    describe('vertical', () => {
        it('is as high as the row it stands in, whatever the alignment of the row', async () => {
            const rows = await placed(`
                <div style="display: flex; gap: 8px">
                    <div style="height: 40px">Edit</div>
                    <el-divider orientation="vertical"></el-divider>
                    <div>Remove</div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center">
                    <div style="height: 40px">Edit</div>
                    <el-divider orientation="vertical"></el-divider>
                    <div>Remove</div>
                </div>
            `);

            for (const row of rows) {
                const el = row.querySelector('el-divider');
                expect(sizeOf(el)).toEqual({ width: 1, height: 40 });
                expect(sizeOf(base(el))).toEqual({ width: 1, height: 40 });
            }
        });

        it('is as high as the text in a line of text', async () => {
            const paragraph = await placed(`<p>Imprint <el-divider orientation="vertical"></el-divider> Privacy</p>`);
            const el = paragraph.querySelector('el-divider');

            expect(sizeOf(el)).toEqual({ width: 1, height: 20 });
            expect(sizeOf(base(el))).toEqual({ width: 1, height: 20 });
            // It does not make the line higher.
            expect(sizeOf(paragraph).height).toBe(30);
        });

        it('becomes a horizontal line again from a script', async () => {
            const row = await placed(
                `<div style="display: flex; flex-direction: column"><el-divider orientation="vertical"></el-divider></div>`,
            );
            const el = row.firstElementChild;

            el.orientation = 'horizontal';
            await nextFrame();
            expect(sizeOf(el)).toEqual({ width: 300, height: 1 });
        });
    });

    describe('the line', () => {
        it('is 1px in a fifth of the text colour without a theme', async () => {
            const [horizontal, vertical] = await placed(`
                <el-divider></el-divider>
                <el-divider orientation="vertical"></el-divider>
            `);

            expect(line(horizontal)).toEqual({ width: '1px', colour: 'color(srgb 0 0 1 / 0.2)' });
            expect(line(vertical)).toEqual({ width: '1px', colour: 'color(srgb 0 0 1 / 0.2)' });
        });

        it('has the colour and the width of the borders of the theme', async () => {
            const [horizontal, vertical] = await placed(
                `
                    <el-divider></el-divider>
                    <el-divider orientation="vertical"></el-divider>
                `,
                '--el-color-border: rgb(1, 2, 3); --el-border-width: 3px;',
            );

            expect(line(horizontal)).toEqual({ width: '3px', colour: 'rgb(1, 2, 3)' });
            expect(line(vertical)).toEqual({ width: '3px', colour: 'rgb(1, 2, 3)' });
            expect(sizeOf(horizontal)).toEqual({ width: 300, height: 3 });
            expect(sizeOf(vertical).width).toBe(3);
        });

        it('takes both from its own tokens', async () => {
            const el = await placed(
                `<el-divider style="--el-divider-color: rgb(4, 5, 6); --el-divider-width: 5px"></el-divider>`,
                '--el-color-border: rgb(1, 2, 3); --el-border-width: 3px;',
            );

            expect(line(el)).toEqual({ width: '5px', colour: 'rgb(4, 5, 6)' });
            expect(sizeOf(el)).toEqual({ width: 300, height: 5 });
        });

        it('has no other border, and no fill', async () => {
            const [horizontal, vertical] = await placed(`
                <el-divider></el-divider>
                <el-divider orientation="vertical"></el-divider>
            `);

            const widths = (el) => {
                const { borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth } = getComputedStyle(
                    base(el),
                );
                return [borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth];
            };
            expect(widths(horizontal)).toEqual(['1px', '0px', '0px', '0px']);
            expect(widths(vertical)).toEqual(['0px', '0px', '0px', '1px']);
            expect(getComputedStyle(base(horizontal)).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        });

        it('stands at the start of a vertical divider in a text that runs from right to left', async () => {
            const row = await placed(
                `<div dir="rtl" style="display: flex"><el-divider orientation="vertical" style="--el-divider-width: 4px"></el-divider></div>`,
            );
            const { borderLeftWidth, borderRightWidth } = getComputedStyle(base(row.firstElementChild));

            expect([borderLeftWidth, borderRightWidth]).toEqual(['0px', '4px']);
        });

        describe('when colours are forced', () => {
            useForcedColors();

            it('is repainted in the text colour of the system, a colour of the theme or not', async () => {
                const [plain, themed, text] = await placed(`
                    <el-divider></el-divider>
                    <el-divider style="--el-divider-color: rgb(4, 5, 6)"></el-divider>
                    <span style="color: CanvasText">Text</span>
                `);
                expect(matchMedia('(forced-colors: active)').matches).toBe(true);

                const systemText = getComputedStyle(text).color;
                expect(line(plain)).toEqual({ width: '1px', colour: systemText });
                expect(line(themed)).toEqual({ width: '1px', colour: systemText });
            });
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const [horizontal, vertical] = await placed(`
            <el-divider hidden></el-divider>
            <el-divider orientation="vertical" hidden></el-divider>
        `);
        expect(getComputedStyle(horizontal).display).toBe('none');
        expect(getComputedStyle(vertical).display).toBe('none');
    });

    it('has the line and its orientation in the server-rendered markup', async () => {
        const el = await fixture(`<el-divider orientation="vertical"></el-divider>`);
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/<hr part="base" class="divider"/);
        expect(markup).toMatch(/\saria-orientation=['"]vertical['"]/);
    });
});
