import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleName, accessibleRole, fixture, nextFrame, sizeOf } from '../../test-helpers.js';
import { define } from './button-group.js';
import { define as defineButton } from '../button/button.js';
import { define as definePopover } from '../popover/popover.js';
define();
defineButton();
definePopover();

const base = (el) => el.shadowRoot.querySelector('[part="base"]');
const control = (button) => button.shadowRoot.querySelector('[part="base"]');
// The radii of a button, in the order of the corners: top left, top right, bottom right, bottom left.
const corners = (button) => {
    const style = getComputedStyle(control(button));
    return [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
    ];
};
const ROUND = '6px';
// The border colours of a button: at the left, and on the three other sides if they are one colour.
const borders = (button) => {
    const style = getComputedStyle(control(button));
    const others = new Set([style.borderTopColor, style.borderRightColor, style.borderBottomColor]);
    return { left: style.borderLeftColor, others: others.size === 1 ? [...others][0] : [...others] };
};
// A group in a place with a theme: a radius of 6px, borders of 1px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-border-width: 1px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(0, 0, 0);
    --el-color-bg-muted: rgb(200, 200, 200); --el-color-border: rgb(100, 100, 100);
    --el-color-accent: rgb(0, 0, 255);
    font: 16px/24px sans-serif; color: rgb(0, 0, 0); background: rgb(255, 255, 255);
`;
const groupOf = async (buttons, style = '', attributes = '') => {
    const wrapper = await fixture(
        `<div style="${theme} ${style}"><el-button-group ${attributes}>${buttons}</el-button-group></div>`,
    );
    return wrapper.firstElementChild;
};
const three = `
    <el-button>Left</el-button>
    <el-button>Centre</el-button>
    <el-button>Right</el-button>
`;

describe('Feature | ButtonGroup', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-button-group></el-button-group>`);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a group, named by its label', async () => {
            const el = await groupOf(three, '', 'label="Text alignment"');

            expect(await accessibleRole(base(el))).toBe('group');
            expect(await accessibleName(base(el))).toBe('Text alignment');

            el.label = 'Ausrichtung';
            await nextFrame();
            expect(await accessibleName(base(el))).toBe('Ausrichtung');
        });

        it('has no name without a label, and no empty one', async () => {
            const el = await groupOf(three);

            expect(base(el).getAttribute('role')).toBe('group');
            expect(base(el).hasAttribute('aria-label')).toBe(false);

            el.label = 'Text alignment';
            await nextFrame();
            el.label = '';
            await nextFrame();
            expect(base(el).hasAttribute('aria-label')).toBe(false);
        });

        it('leaves every button a tab stop of its own', async () => {
            const el = await groupOf(three);
            const stops = [...el.children].map((button) => control(button));

            expect(stops.map((stop) => stop.tabIndex)).toEqual([0, 0, 0]);
            stops[1].focus();
            expect(el.children[1].shadowRoot.activeElement).toBe(stops[1]);
        });

        it('has no detectable a11y violations', async () => {
            const el = await groupOf(
                `
                    <el-button variant="brand">Save</el-button>
                    <el-button variant="brand" aria-label="More ways to save">▾</el-button>
                `,
                '',
                'label="Save"',
            );
            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('the row', () => {
        it('lets the buttons touch: a button lies on the border of the one in front of it', async () => {
            const el = await groupOf(three);
            const [left, centre, right] = [...el.children].map((button) => button.getBoundingClientRect());

            expect(centre.left).toBe(left.right - 1);
            expect(right.left).toBe(centre.right - 1);
            expect(new Set([left.top, centre.top, right.top]).size).toBe(1);
            // The group is as wide as its buttons, less the two borders they share.
            expect(sizeOf(el).width).toBe(Math.round((left.width + centre.width + right.width - 2) * 10) / 10);
        });

        it('overlaps by the border width of the theme', async () => {
            const el = await groupOf(three, '--el-border-width: 3px;');
            const [left, centre] = [...el.children].map((button) => button.getBoundingClientRect());

            expect(centre.left).toBe(left.right - 3);
        });

        it('stands in a line of text, on the middle of it', async () => {
            const el = await groupOf(three);

            expect(getComputedStyle(el).display).toBe('inline-block');
            expect(getComputedStyle(el).verticalAlign).toBe('middle');
        });

        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(`<el-button-group hidden>${three}</el-button-group>`);
            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('corners', () => {
        it('rounds the outer corners of the row only', async () => {
            const el = await groupOf(three);
            const [left, centre, right] = el.children;

            expect(corners(left)).toEqual([ROUND, '0px', '0px', ROUND]);
            expect(corners(centre)).toEqual(['0px', '0px', '0px', '0px']);
            expect(corners(right)).toEqual(['0px', ROUND, ROUND, '0px']);
        });

        it('rounds them the other way round in a text that runs from right to left', async () => {
            const wrapper = await fixture(
                `<div dir="rtl" style="${theme}"><el-button-group>${three}</el-button-group></div>`,
            );
            const [first, centre, last] = wrapper.firstElementChild.children;

            // The first button stands at the right.
            expect(first.getBoundingClientRect().left).toBeGreaterThan(last.getBoundingClientRect().left);
            expect(corners(first)).toEqual(['0px', ROUND, ROUND, '0px']);
            expect(corners(centre)).toEqual(['0px', '0px', '0px', '0px']);
            expect(corners(last)).toEqual([ROUND, '0px', '0px', ROUND]);
        });

        it('leaves a button that is alone in its group as it is', async () => {
            const el = await groupOf(`<el-button>Alone</el-button>`);
            expect(corners(el.firstElementChild)).toEqual([ROUND, ROUND, ROUND, ROUND]);
        });

        it('keeps the shape of a pill at the outer ends', async () => {
            const el = await groupOf(`
                <el-button pill="true">Back</el-button>
                <el-button pill="true">Forward</el-button>
            `);
            const [back, forward] = el.children;

            expect(corners(back)).toEqual(['999px', '0px', '0px', '999px']);
            expect(corners(forward)).toEqual(['0px', '999px', '999px', '0px']);
        });

        it('follows a button that is added or taken away, without a script of the group', async () => {
            const el = await groupOf(three);
            const [left, centre, right] = el.children;

            right.remove();
            expect(corners(centre)).toEqual(['0px', ROUND, ROUND, '0px']);

            el.prepend(right);
            await nextFrame();
            expect(corners(right)).toEqual([ROUND, '0px', '0px', ROUND]);
            expect(corners(left)).toEqual(['0px', '0px', '0px', '0px']);
        });
    });

    describe('the line between two neighbours', () => {
        it('is a quarter of the text colour on the fill, for a filled button with a neighbour in front', async () => {
            const el = await groupOf(`
                <el-button variant="brand">Save</el-button>
                <el-button variant="brand">Save as</el-button>
                <el-button>Cancel</el-button>
            `);
            const [save, saveAs, cancel] = el.children;

            // The first one has the border of its fill on all four sides.
            expect(borders(save)).toEqual({ left: 'rgb(0, 0, 255)', others: 'rgb(0, 0, 255)' });
            // White text on the accent colour, black text on the muted background.
            expect(borders(saveAs)).toEqual({ left: 'color(srgb 1 1 1 / 0.25)', others: 'rgb(0, 0, 255)' });
            expect(borders(cancel)).toEqual({ left: 'color(srgb 0 0 0 / 0.25)', others: 'rgb(100, 100, 100)' });
            // The line is painted on the fill of the button itself.
            expect(getComputedStyle(control(saveAs)).backgroundClip).toBe('border-box');
        });

        it('stands at the right of a button in a text that runs from right to left', async () => {
            const wrapper = await fixture(`
                <div dir="rtl" style="${theme}">
                    <el-button-group>
                        <el-button variant="brand">Save</el-button>
                        <el-button variant="brand">Save as</el-button>
                    </el-button-group>
                </div>
            `);
            const style = getComputedStyle(control(wrapper.firstElementChild.lastElementChild));

            expect(style.borderRightColor).toBe('color(srgb 1 1 1 / 0.25)');
            expect(style.borderLeftColor).toBe('rgb(0, 0, 255)');
        });

        it('is the border the two share, for outlined buttons', async () => {
            const el = await groupOf(`
                <el-button appearance="outlined">Day</el-button>
                <el-button appearance="outlined">Week</el-button>
                <el-button appearance="outlined" variant="brand">Month</el-button>
            `);
            const [, week, month] = el.children;

            expect(borders(week)).toEqual({ left: 'rgb(100, 100, 100)', others: 'rgb(100, 100, 100)' });
            expect(borders(month)).toEqual({ left: 'rgb(0, 0, 255)', others: 'rgb(0, 0, 255)' });
        });

        it('is not there for plain buttons, which have no border', async () => {
            const el = await groupOf(`
                <el-button appearance="plain">Day</el-button>
                <el-button appearance="plain">Week</el-button>
            `);

            expect(borders(el.lastElementChild)).toEqual({ left: 'rgba(0, 0, 0, 0)', others: 'rgba(0, 0, 0, 0)' });
        });
    });

    describe('focus', () => {
        it('lifts the button with the focus over its neighbours, so they do not cover its ring', async () => {
            const el = await groupOf(three);
            const [left, centre, right] = el.children;
            const levels = () => [left, centre, right].map((button) => getComputedStyle(button).zIndex);

            expect(levels()).toEqual(['auto', 'auto', 'auto']);

            centre.focus();
            expect(levels()).toEqual(['auto', '1', 'auto']);

            right.focus();
            expect(levels()).toEqual(['auto', 'auto', '1']);
        });
    });

    describe('a button inside of a slotted element', () => {
        const withPopover = `
            <el-button variant="brand">Save</el-button>
            <el-popover>
                <el-button slot="anchor" variant="brand" caret="true" aria-label="More ways to save"></el-button>
                <el-button id="in-panel" variant="brand">Save as a copy</el-button>
            </el-popover>
        `;

        it('is joined as that element is: the anchor of a popover', async () => {
            const el = await groupOf(withPopover);
            const save = el.firstElementChild;
            const anchor = el.querySelector('[slot="anchor"]');

            expect(corners(save)).toEqual([ROUND, '0px', '0px', ROUND]);
            expect(corners(anchor)).toEqual(['0px', ROUND, ROUND, '0px']);
            expect(borders(anchor)).toEqual({ left: 'color(srgb 1 1 1 / 0.25)', others: 'rgb(0, 0, 255)' });
            expect(anchor.getBoundingClientRect().left).toBe(save.getBoundingClientRect().right - 1);
        });

        it('is not joined in the panel of that popover, which is not part of the row', async () => {
            const el = await groupOf(withPopover);
            const inPanel = el.querySelector('#in-panel');

            expect(corners(inPanel)).toEqual([ROUND, ROUND, ROUND, ROUND]);
            expect(borders(inPanel)).toEqual({ left: 'rgb(0, 0, 255)', others: 'rgb(0, 0, 255)' });
        });
    });

    describe('a button outside of a group', () => {
        it('has the radius of the theme on all four corners and one border colour', async () => {
            const wrapper = await fixture(`
                <div style="${theme}">
                    <el-button variant="brand">Save</el-button>
                    <el-button>Cancel</el-button>
                    <el-button pill="true">Pill</el-button>
                    <el-button circle="true" aria-label="Add">+</el-button>
                </div>
            `);
            const [save, cancel, pill, circle] = wrapper.children;

            expect(getComputedStyle(control(save)).borderRadius).toBe('6px');
            expect(getComputedStyle(control(pill)).borderRadius).toBe('999px');
            expect(getComputedStyle(control(circle)).borderRadius).toBe('50%');
            expect(getComputedStyle(control(save)).borderColor).toBe('rgb(0, 0, 255)');
            expect(getComputedStyle(control(cancel)).borderColor).toBe('rgb(100, 100, 100)');
            // No space is taken from in front of it.
            expect(getComputedStyle(cancel).marginLeft).toBe('0px');
        });
    });

    it('is complete in the server-rendered markup, and runs no script on its buttons', async () => {
        const el = await groupOf(three, '', 'label="Text alignment"');
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const markup = el.template().toString();
        expect(markup).toMatch(/\srole=['"]group['"]/);
        expect(markup).toMatch(/\saria-label=['"]Text alignment['"]/);
        expect(markup).toMatch(/<slot><\/slot>/);

        // Nothing was written onto the buttons to join them.
        for (const button of el.children) {
            expect(button.getAttributeNames().sort()).toEqual(['appearance', 'size', 'variant']);
            expect(button.getAttribute('style')).toBe(null);
        }
    });
});
