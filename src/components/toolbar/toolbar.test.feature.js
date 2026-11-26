import { describe, it, expect, afterEach } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleDescription,
    accessibleName,
    accessibleRole,
    fixture,
    nextFrame,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './toolbar.js';
import { define as defineButton } from '../button/button.js';
import { define as defineButtonGroup } from '../button-group/button-group.js';
import { define as defineDivider } from '../divider/divider.js';
import { define as defineSegmentedField } from '../segmented-field/segmented-field.js';
define();
defineButton();
defineButtonGroup();
defineDivider();
defineSegmentedField();

// A later fixture would lie on top of an earlier one for the real pointer, so every test takes its
// fixture out of the page again.
const wrappers = [];
afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.remove();
});

// A theme: a control height of 40px, a radius of 6px, borders of 1px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px;
    --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px; --el-space-5: 24px;
    --el-font-size-sm: 14px; --el-font-size-md: 16px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10);
    --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
    --el-color-accent: rgb(0, 0, 200); --el-color-focus-ring: rgb(0, 0, 200);
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;
let fixtures = 0;
const toolbar = async (content, attributes = 'label="Message"', { width = 700, style = theme } = {}) => {
    const wrapper = await fixture(`
        <div style="${style} width: ${width}px; position: relative; padding-top: 40px; margin-left: 80px">
            <button class="before" type="button">Before</button>
            <el-toolbar ${attributes}>${content}</el-toolbar>
            <button class="after" type="button">After</button>
        </div>
    `);
    wrappers.push(wrapper);
    await nextFrame();
    await nextFrame();
    return wrapper.querySelector('el-toolbar');
};
const part = (el, name) => el.shadowRoot.querySelector(`[part~="${name}"]`);
const control = (button) => button.shadowRoot.querySelector('[part="base"]');
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** What has the focus, as the id of the control or of the element around it. */
const focused = () => {
    let active = document.activeElement;
    const id = active?.id || active?.className;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    return active?.type === 'radio' ? `radio:${active.value}` : id;
};

const fiveControls = () => `
    <el-button id="reply">Reply</el-button>
    <el-button id="forward">Forward</el-button>
    <el-divider orientation="vertical"></el-divider>
    <el-button id="archive" disabled="true">Archive</el-button>
    <el-button-group label="Order">
        <el-button id="up">Up</el-button>
        <el-button id="down">Down</el-button>
    </el-button-group>
    <el-button id="more" slot="end">More</el-button>
`;

describe('Feature | Toolbar', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-toolbar></el-toolbar>`);
        wrappers.push(el);
        await nextFrame();
    });

    describe('for assistive technology', () => {
        it('is a toolbar with the name of its label', async () => {
            const el = await toolbar(fiveControls());

            expect(await accessibleRole(part(el, 'base'))).toBe('toolbar');
            expect(await accessibleName(part(el, 'base'))).toBe('Message');
        });

        it('has no name without a label, and takes one that is set later', async () => {
            const el = await toolbar(fiveControls(), '');
            expect(part(el, 'base').hasAttribute('aria-label')).toBe(false);

            el.setAttribute('label', 'Message');
            await rendered();
            expect(await accessibleName(part(el, 'base'))).toBe('Message');
        });

        it('has no detectable a11y violations', async () => {
            const el = await toolbar(`
                ${fiveControls()}
                <el-button circle="true" aria-label="Star" toggle="true">*</el-button>
                <el-segmented-field name="view-${++fixtures}" label="View" label-screen-reader-only="true" value="List" options='["List","Board"]'></el-segmented-field>
            `);

            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('one size', () => {
        const mixed = (name) => `
            <el-button id="plain">Reply</el-button>
            <el-button id="circle" circle="true" aria-label="Star">*</el-button>
            <el-button-group label="Order"><el-button id="grouped">Up</el-button></el-button-group>
            <el-segmented-field name="${name}" label="View" label-screen-reader-only="true" value="List" options='["List","Board"]'></el-segmented-field>
            <el-button id="own-small" size="small">Small</el-button>
            <el-button id="own-medium" size="medium">Medium</el-button>
            <el-button id="own-large" size="large">Large</el-button>
        `;
        const heights = (el) => ({
            plain: sizeOf(control(el.querySelector('#plain'))).height,
            circle: sizeOf(control(el.querySelector('#circle'))),
            grouped: sizeOf(control(el.querySelector('#grouped'))).height,
            segment: sizeOf(el.querySelector('.segment')).height,
            font: getComputedStyle(control(el.querySelector('#plain'))).fontSize,
        });

        it('is the size of the controls that have none of their own, also in a group', async () => {
            const sizes = {};
            for (const size of ['small', 'medium', 'large']) {
                sizes[size] = heights(await toolbar(mixed(`size-${++fixtures}`), `label="Message" size="${size}"`));
            }

            expect(sizes).toEqual({
                small: { plain: 32, circle: { width: 32, height: 32 }, grouped: 32, segment: 32, font: '14px' },
                medium: { plain: 42, circle: { width: 40, height: 40 }, grouped: 42, segment: 42, font: '16px' },
                large: { plain: 53, circle: { width: 50, height: 50 }, grouped: 53, segment: 53, font: '18px' },
            });
        });

        it('is as a control of that size outside of a toolbar', async () => {
            const el = await toolbar(mixed(`size-${++fixtures}`), 'label="Message" size="small"');
            el.insertAdjacentHTML(
                'afterend',
                `<el-button id="reference" size="small" appearance="plain">Reply</el-button>`,
            );
            await rendered();
            const reference = control(el.parentElement.querySelector('#reference'));
            const inToolbar = control(el.querySelector('#plain'));

            expect(sizeOf(inToolbar)).toEqual(sizeOf(reference));
            for (const property of ['paddingTop', 'paddingLeft', 'fontSize', 'minHeight']) {
                expect(getComputedStyle(inToolbar)[property], property).toBe(getComputedStyle(reference)[property]);
            }
        });

        it('leaves a control its own size, the medium one included', async () => {
            for (const size of ['small', 'large']) {
                const el = await toolbar(mixed(`size-${++fixtures}`), `label="Message" size="${size}"`);

                expect(sizeOf(control(el.querySelector('#own-small'))).height, size).toBe(32);
                expect(sizeOf(control(el.querySelector('#own-medium'))).height, size).toBe(42);
                expect(sizeOf(control(el.querySelector('#own-large'))).height, size).toBe(53);
            }
        });

        it('follows a size of the toolbar that changes', async () => {
            const el = await toolbar(mixed(`size-${++fixtures}`), 'label="Message"');
            expect(heights(el).plain).toBe(42);

            el.size = 'small';
            await rendered();
            expect(el.getAttribute('size')).toBe('small');
            expect(heights(el)).toMatchObject({ plain: 32, grouped: 32, segment: 32 });
        });

        it('gives way to a size that a control gets later', async () => {
            const el = await toolbar(mixed(`size-${++fixtures}`), 'label="Message" size="small"');
            const button = el.querySelector('#plain');
            const field = el.querySelector('el-segmented-field');

            button.size = 'large';
            field.setAttribute('size', 'large');
            await rendered();
            expect(sizeOf(control(button)).height).toBe(53);
            expect(sizeOf(field.querySelector('.segment')).height).toBe(53);

            // And back to the default: it is the control's own now.
            button.size = 'medium';
            field.size = 'medium';
            await rendered();
            expect(sizeOf(control(button)).height).toBe(42);
            expect(sizeOf(field.querySelector('.segment')).height).toBe(42);

            // The default from the start, once the page writes the attribute.
            const grouped = el.querySelector('#grouped');
            expect(sizeOf(control(grouped)).height).toBe(32);
            grouped.setAttribute('size', 'medium');
            await rendered();
            expect(sizeOf(control(grouped)).height).toBe(42);
        });

        it('does not write the size onto its controls', async () => {
            const el = await toolbar(mixed(`size-${++fixtures}`), 'label="Message" size="small"');

            expect(el.querySelector('#plain').getAttribute('size')).toBe('medium');
            expect(el.querySelector('#plain').size).toBe('medium');
        });
    });

    describe('one appearance', () => {
        const mixed = `
            <el-button id="neutral">Reply</el-button>
            <el-button id="brand" variant="brand">Send</el-button>
            <el-button-group label="Order"><el-button id="grouped">Up</el-button><el-button id="second">Down</el-button></el-button-group>
            <el-button id="own-filled" variant="brand" appearance="filled">Send</el-button>
            <el-button id="own-outlined" appearance="outlined">Draft</el-button>
        `;
        const paint = (button) => {
            const { backgroundColor, borderTopColor, color } = getComputedStyle(control(button));
            return [backgroundColor, borderTopColor, color];
        };
        const reference = async (el, id, attributes) => {
            el.insertAdjacentHTML('afterend', `<el-button id="${id}" ${attributes}>Reference</el-button>`);
            await rendered();
            return el.parentElement.querySelector(`#${id}`);
        };

        it('is plain by default: no fill, no border, the text colour of the variant', async () => {
            const el = await toolbar(mixed);

            expect(paint(el.querySelector('#neutral'))).toEqual([TRANSPARENT, TRANSPARENT, 'rgb(10, 10, 10)']);
            expect(paint(el.querySelector('#brand'))).toEqual([TRANSPARENT, TRANSPARENT, 'rgb(0, 0, 200)']);
            expect(paint(el.querySelector('#grouped'))).toEqual([TRANSPARENT, TRANSPARENT, 'rgb(10, 10, 10)']);
        });

        it('paints the buttons that have none of their own as buttons of that appearance are painted', async () => {
            for (const appearance of ['plain', 'outlined', 'filled']) {
                const el = await toolbar(mixed, `label="Message" appearance="${appearance}"`);
                const neutral = await reference(el, `ref-neutral-${appearance}`, `appearance="${appearance}"`);
                const brand = await reference(
                    el,
                    `ref-brand-${appearance}`,
                    `variant="brand" appearance="${appearance}"`,
                );

                expect(paint(el.querySelector('#neutral')), appearance).toEqual(paint(neutral));
                expect(paint(el.querySelector('#brand')), appearance).toEqual(paint(brand));
                expect(paint(el.querySelector('#grouped')), appearance).toEqual(paint(neutral));
            }
        });

        it('leaves a button its own appearance, the filled one included', async () => {
            for (const appearance of ['plain', 'outlined']) {
                const el = await toolbar(mixed, `label="Message" appearance="${appearance}"`);

                expect(paint(el.querySelector('#own-filled')), appearance).toEqual([
                    'rgb(0, 0, 200)',
                    'rgb(0, 0, 200)',
                    'rgb(255, 255, 255)',
                ]);
                expect(paint(el.querySelector('#own-outlined')), appearance).toEqual([
                    TRANSPARENT,
                    'rgb(150, 150, 150)',
                    'rgb(10, 10, 10)',
                ]);
            }
        });

        it('keeps the line between two buttons of a group that is filled, and draws none between plain ones', async () => {
            const filled = await toolbar(mixed, 'label="Message" appearance="filled"');
            const plain = await toolbar(mixed, 'label="Message" appearance="plain"');
            const line = (el) => getComputedStyle(control(el.querySelector('#second'))).borderLeftColor;

            expect(line(filled)).not.toBe(TRANSPARENT);
            expect(line(filled)).not.toBe(getComputedStyle(control(filled.querySelector('#second'))).borderTopColor);
            expect(line(plain)).toBe(TRANSPARENT);
        });

        it('follows an appearance of the toolbar that changes, and gives way to one a button gets later', async () => {
            const el = await toolbar(mixed);
            const neutral = el.querySelector('#neutral');

            el.appearance = 'outlined';
            await rendered();
            expect(paint(neutral)).toEqual([TRANSPARENT, 'rgb(150, 150, 150)', 'rgb(10, 10, 10)']);

            // The default as well, once the page writes the attribute.
            neutral.setAttribute('appearance', 'filled');
            await rendered();
            expect(paint(neutral)).toEqual(['rgb(230, 230, 230)', 'rgb(150, 150, 150)', 'rgb(10, 10, 10)']);

            const brand = el.querySelector('#brand');
            brand.appearance = 'plain';
            await rendered();
            expect(paint(brand)).toEqual([TRANSPARENT, TRANSPARENT, 'rgb(0, 0, 200)']);
        });

        it('shows a pressed toggle button with its ring and a tint', async () => {
            const el = await toolbar(
                `<el-button id="off" toggle="true">Off</el-button><el-button id="on" toggle="true" pressed="true">On</el-button>`,
            );
            const on = control(el.querySelector('#on'));

            expect(getComputedStyle(on, '::before').borderTopWidth).toBe('2px');
            expect(getComputedStyle(on).backgroundColor).not.toBe(TRANSPARENT);
            expect(getComputedStyle(control(el.querySelector('#off'))).backgroundColor).toBe(TRANSPARENT);
        });
    });

    describe('layout', () => {
        it('puts its controls into a row with a gap, and the group at the end to the end', async () => {
            const el = await toolbar(fiveControls());
            const box = (id) => el.querySelector(`#${id}`).getBoundingClientRect();
            const bar = el.getBoundingClientRect();

            expect(box('forward').left - box('reply').right).toBe(8);
            expect(box('reply').left).toBe(bar.left);
            expect(Math.round(box('more').right)).toBe(Math.round(bar.right));
            expect(box('more').left).toBeGreaterThan(box('down').right + 100);
            // One line: the controls stand in the middle of it.
            expect(new Set(['reply', 'forward', 'up', 'more'].map((id) => Math.round(box(id).top))).size).toBe(1);
        });

        it('takes no room for a group at the end that it does not have', async () => {
            const el = await toolbar(`<el-button id="reply">Reply</el-button>`);

            expect(part(el, 'end').hidden).toBe(true);
            expect(getComputedStyle(part(el, 'end')).display).toBe('none');

            el.insertAdjacentHTML('beforeend', `<el-button id="more" slot="end">More</el-button>`);
            await rendered();
            await rendered();
            expect(part(el, 'end').hidden).toBe(false);
        });

        it('follows the reading direction', async () => {
            const el = await toolbar(fiveControls(), 'label="Message" dir="rtl"');
            const box = (id) => el.querySelector(`#${id}`).getBoundingClientRect();
            const bar = el.getBoundingClientRect();

            expect(Math.round(box('reply').right)).toBe(Math.round(bar.right));
            expect(box('forward').right).toBeLessThan(box('reply').left);
            expect(Math.round(box('more').left)).toBe(Math.round(bar.left));
        });

        it('shows a divider between two groups, as high as a line of a control', async () => {
            const el = await toolbar(fiveControls());
            const divider = el.querySelector('el-divider');

            expect(sizeOf(divider).height).toBe(24);
            expect(await accessibleRole(divider.shadowRoot.querySelector('hr'))).toBe('separator');
        });

        it('breaks into a second line where its controls do not fit, and is never wider than its place', async () => {
            const el = await toolbar(fiveControls(), 'label="Message"', { width: 220 });
            const box = (id) => el.querySelector(`#${id}`).getBoundingClientRect();

            expect(sizeOf(el).width).toBe(220);
            expect(el.parentElement.scrollWidth).toBe(220);
            expect(box('up').top).toBeGreaterThan(box('reply').top);
            // Every control is shown, inside of the toolbar.
            for (const id of ['reply', 'forward', 'archive', 'up', 'down', 'more']) {
                expect(box(id).width, id).toBeGreaterThan(0);
                expect(box(id).right, id).toBeLessThanOrEqual(el.getBoundingClientRect().right + 0.5);
            }
            // The group at the end still ends the toolbar.
            expect(Math.round(box('more').right)).toBe(Math.round(el.getBoundingClientRect().right));
        });
    });

    describe('the keyboard', () => {
        const press = async (key) => {
            await userEvent.keyboard(key);
            await nextFrame();
        };
        const into = async (el) => {
            el.parentElement.querySelector('.before').focus();
            await userEvent.tab();
        };

        it('is one stop of the Tab key: the first control, and then what follows the toolbar', async () => {
            const el = await toolbar(fiveControls());

            await into(el);
            expect(focused()).toBe('reply');
            await userEvent.tab();
            expect(focused()).toBe('after');
            await userEvent.tab({ shift: true });
            expect(focused()).toBe('reply');
            await userEvent.tab({ shift: true });
            expect(focused()).toBe('before');
        });

        it('moves between its controls with the arrow keys: into a group, to the end, around the ends, past a disabled one', async () => {
            const el = await toolbar(fiveControls());
            await into(el);

            const seen = [];
            for (let step = 0; step < 6; step++) {
                await press('{ArrowRight}');
                seen.push(focused());
            }
            expect(seen).toEqual(['forward', 'up', 'down', 'more', 'reply', 'forward']);

            await press('{ArrowLeft}');
            await press('{ArrowLeft}');
            expect(focused()).toBe('more');
        });

        it('goes to the first and the last control with Home and End', async () => {
            const el = await toolbar(fiveControls());
            await into(el);

            await press('{End}');
            expect(focused()).toBe('more');
            await press('{Home}');
            expect(focused()).toBe('reply');
        });

        it('keeps the keys from scrolling the page', async () => {
            const el = await toolbar(fiveControls());
            await into(el);
            const prevented = [];
            el.addEventListener('keydown', (event) =>
                queueMicrotask(() => prevented.push([event.key, event.defaultPrevented])),
            );

            await press('{ArrowRight}');
            await press('{End}');
            await press('a');
            expect(prevented).toEqual([
                ['ArrowRight', true],
                ['End', true],
                ['a', false],
            ]);
        });

        it('comes back to the control that had the focus last', async () => {
            const el = await toolbar(fiveControls());
            await into(el);
            await press('{ArrowRight}');
            await press('{ArrowRight}');
            expect(focused()).toBe('up');

            await userEvent.tab();
            expect(focused()).toBe('after');
            await userEvent.tab({ shift: true });
            expect(focused()).toBe('up');

            // And from the front as well.
            await userEvent.tab({ shift: true });
            expect(focused()).toBe('before');
            await userEvent.tab();
            expect(focused()).toBe('up');
        });

        it('leaves the focus where a pointer puts it', async () => {
            const el = await toolbar(fiveControls());
            await into(el);
            el.parentElement.querySelector('.after').focus();

            await userEvent.click(el.querySelector('#down'));
            expect(focused()).toBe('down');
            // And goes on from there.
            await press('{ArrowRight}');
            expect(focused()).toBe('more');
        });

        it('moves the other way in a text that runs from right to left', async () => {
            const el = await toolbar(fiveControls(), 'label="Message" dir="rtl"');
            await into(el);

            await press('{ArrowLeft}');
            expect(focused()).toBe('forward');
            await press('{ArrowRight}');
            expect(focused()).toBe('reply');
        });

        it('moves through the options of a segmented field, which Space and the up and down keys choose', async () => {
            const name = `view-${++fixtures}`;
            const el = await toolbar(`
                <el-button id="reply">Reply</el-button>
                <el-segmented-field name="${name}" label="View" label-screen-reader-only="true" value="List" options='["List","Board","Table"]'></el-segmented-field>
                <el-button id="more">More</el-button>
            `);
            const field = el.querySelector('el-segmented-field');
            await into(el);

            await press('{ArrowRight}');
            expect(focused()).toBe('radio:List');
            await press('{ArrowRight}');
            expect(focused()).toBe('radio:Board');
            // The arrow keys of the toolbar move the focus, not the choice.
            expect(field.value).toBe('List');

            await press(' ');
            await rendered();
            expect(field.value).toBe('Board');

            await press('{ArrowDown}');
            await rendered();
            expect(field.value).toBe('Table');
            expect(focused()).toBe('radio:Table');

            await press('{ArrowRight}');
            expect(focused()).toBe('more');
        });

        it('leaves the arrow keys to a control that takes text', async () => {
            const el = await toolbar(`
                <el-button id="reply">Reply</el-button>
                <input id="search" aria-label="Search" value="abc" />
                <el-button id="more">More</el-button>
            `);
            await into(el);
            await press('{ArrowRight}');
            expect(focused()).toBe('search');

            const input = el.querySelector('#search');
            input.setSelectionRange(1, 1);
            await press('{ArrowRight}');
            expect(focused()).toBe('search');
            expect(input.selectionStart).toBe(2);

            // The Tab key leaves the toolbar from there as well.
            await userEvent.tab();
            expect(focused()).toBe('after');
        });

        it('takes in a control that comes later', async () => {
            const el = await toolbar(`<el-button id="reply">Reply</el-button>`);
            el.insertAdjacentHTML('beforeend', `<el-button id="late">Late</el-button>`);
            await rendered();
            await into(el);

            await press('{ArrowRight}');
            expect(focused()).toBe('late');
        });
    });

    describe('a button with an icon alone', () => {
        const icons = `
            <el-button id="reply" circle="true" aria-label="Reply">R</el-button>
            <el-button id="text">Archive</el-button>
            <el-button-group label="Order"><el-button id="up" circle="true" aria-label="Move up">U</el-button></el-button-group>
        `;
        const tooltips = (el) => [...el.shadowRoot.querySelectorAll('el-tooltip')];
        const shown = (el) => tooltips(el).filter((tooltip) => tooltip.matches(':popover-open'));
        const away = async () => {
            await userEvent.hover(document.body, { position: { x: 2, y: 2 } });
        };

        it('is as wide as it is high, in the size of the toolbar', async () => {
            const el = await toolbar(icons, 'label="Message" size="small"');
            expect(sizeOf(control(el.querySelector('#reply')))).toEqual({ width: 32, height: 32 });
        });

        it('has its name for assistive technology, and no description that repeats it', async () => {
            const el = await toolbar(icons);
            const reply = control(el.querySelector('#reply'));

            expect(await accessibleName(reply)).toBe('Reply');
            expect(await accessibleDescription(reply)).toBe('');
            expect(tooltips(el).map((tooltip) => tooltip.getAttribute('aria-hidden'))).toEqual(['true', 'true']);
        });

        it('shows its name as a tooltip for the pointer', async () => {
            const el = await toolbar(icons);
            await away();
            expect(tooltips(el).map((tooltip) => tooltip.textContent.trim())).toEqual(['Reply', 'Move up']);
            expect(shown(el)).toEqual([]);

            await userEvent.hover(el.querySelector('#reply'));
            await expect
                .poll(() => shown(el).map((tooltip) => tooltip.textContent.trim()), { timeout: 2000 })
                .toEqual(['Reply']);

            // Below the button, in the middle of it.
            await rendered();
            const tooltip = shown(el)[0].getBoundingClientRect();
            const button = el.querySelector('#reply').getBoundingClientRect();
            expect(tooltip.top).toBeGreaterThanOrEqual(button.bottom);
            expect(Math.abs(tooltip.left + tooltip.width / 2 - (button.left + button.width / 2))).toBeLessThanOrEqual(
                1,
            );

            await away();
            await expect.poll(() => shown(el).length, { timeout: 2000 }).toBe(0);
        });

        it('shows its name as a tooltip for the keyboard, also of a button in a group', async () => {
            const el = await toolbar(icons);
            await away();
            el.parentElement.querySelector('.before').focus();

            await userEvent.tab();
            await expect
                .poll(() => shown(el).map((tooltip) => tooltip.textContent.trim()), { timeout: 2000 })
                .toEqual(['Reply']);

            await userEvent.keyboard('{End}');
            await expect
                .poll(() => shown(el).map((tooltip) => tooltip.textContent.trim()), { timeout: 2000 })
                .toEqual(['Move up']);
        });

        it('has no tooltip for a button that shows its name', async () => {
            const el = await toolbar(icons);
            await away();

            await userEvent.hover(el.querySelector('#text'));
            await new Promise((resolve) => setTimeout(resolve, 400));
            expect(shown(el)).toEqual([]);
        });

        it('follows a name that changes, and a button that comes or goes', async () => {
            const el = await toolbar(icons);

            el.querySelector('#reply').setAttribute('aria-label', 'Answer');
            await rendered();
            expect(tooltips(el).map((tooltip) => tooltip.textContent.trim())).toEqual(['Answer', 'Move up']);

            el.querySelector('el-button-group').remove();
            el.insertAdjacentHTML('beforeend', `<el-button id="star" circle="true" aria-label="Star">*</el-button>`);
            await rendered();
            await rendered();
            expect(tooltips(el).map((tooltip) => tooltip.textContent.trim())).toEqual(['Answer', 'Star']);
            expect(tooltips(el).map((tooltip) => tooltip.anchor?.id)).toEqual(['reply', 'star']);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('has controls of at least --el-touch-target, in a small toolbar as well', async () => {
            const el = await toolbar(
                `
                    <el-button id="reply">a</el-button>
                    <el-button id="star" circle="true" aria-label="Star">*</el-button>
                    <el-segmented-field name="view-${++fixtures}" label="View" label-screen-reader-only="true" value="a" options='["a","b"]'></el-segmented-field>
                `,
                'label="Message" size="small"',
                { style: `${theme} --el-touch-target: 44px;` },
            );

            for (const id of ['reply', 'star']) {
                const { width, height } = sizeOf(control(el.querySelector(`#${id}`)));
                expect(Math.min(width, height), id).toBeGreaterThanOrEqual(44);
            }
            for (const segment of el.querySelectorAll('.segment')) {
                const { width, height } = sizeOf(segment);
                expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
            }
        });
    });
});
