import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleName,
    accessibleRole,
    fixture,
    forcePseudoClasses,
    nextFrame,
    oneEvent,
    sizeOf,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './segmented-field.js';
import { define as defineButton } from '../button/button.js';
define();
defineButton();

// A theme: a radius of 6px, borders of 1px, a control height of 40px, and colours that can be told apart.
const theme = `
    --el-radius-md: 6px; --el-border-width: 1px; --el-control-height: 40px;
    --el-space-1: 4px; --el-space-2: 8px; --el-space-3: 12px; --el-space-4: 16px; --el-space-5: 24px;
    --el-font-size-sm: 14px; --el-font-size-md: 16px;
    --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10); --el-color-border: rgb(150, 150, 150);
    --el-color-accent: rgb(0, 0, 200); --el-focus-ring-width: 2px;
    font: 16px/24px sans-serif; color: rgb(10, 10, 10); background: rgb(255, 255, 255);
`;
const days = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
];
// The options are an attribute, so they are there when the field connects. Every field has a name
// of its own: radios of one name that are in no form are one group for the browser, across the
// fields of the page, and the arrow keys would go from one field to the next.
let fields = 0;
const field = async (attributes = '', options = days, style = theme, width = 600) => {
    const wrapper = await fixture(`
        <div style="${style} width: ${width}px">
            <el-segmented-field name="view-${++fields}" label="Calendar" options='${JSON.stringify(options)}' ${attributes}></el-segmented-field>
        </div>
    `);
    await nextFrame();
    return wrapper.firstElementChild;
};
const radios = (el) => [...el.querySelectorAll('input[type="radio"]')];
const segments = (el) => [...el.querySelectorAll('.segment')];
const checked = (el) =>
    radios(el)
        .filter((radio) => radio.checked)
        .map((radio) => radio.value);
// The ring of the chosen option: what its segment generates in front of its content.
const ringOf = (segment) => {
    const { content, borderTopWidth, borderTopStyle, borderTopColor } = getComputedStyle(segment, '::before');
    return content === 'none' ? 'none' : `${borderTopWidth} ${borderTopStyle} ${borderTopColor}`;
};
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const rendered = async () => {
    await nextFrame();
    await nextFrame();
};

describe('Feature | SegmentedField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-segmented-field></el-segmented-field>`);
        await nextFrame();
    });

    describe('one choice', () => {
        it('has one option chosen at a time', async () => {
            const el = await field('value="week"');
            expect(checked(el)).toEqual(['week']);

            await userEvent.click(segments(el)[2]);
            await rendered();
            expect(checked(el)).toEqual(['month']);
            expect(el.value).toBe('month');
        });

        it('has none chosen without a value', async () => {
            const el = await field();
            expect(checked(el)).toEqual([]);
            expect(segments(el).map(ringOf)).toEqual(['none', 'none', 'none']);
        });

        it('reports the value with input-change', async () => {
            const el = await field('value="day"');
            const changed = oneEvent(el, 'input-change');

            await userEvent.click(segments(el)[1]);
            expect((await changed).detail).toBe('week');
        });

        it('takes a value that a script sets, also after the user has chosen', async () => {
            const el = await field('value="day"');
            await userEvent.click(segments(el)[1]);
            await rendered();

            el.value = 'month';
            await rendered();
            expect(checked(el)).toEqual(['month']);
            expect(segments(el).map((segment) => ringOf(segment) !== 'none')).toEqual([false, false, true]);
        });

        it('takes options that are plain strings', async () => {
            const el = await field('value="Week"', ['Day', 'Week', 'Month']);

            expect(radios(el).map((radio) => radio.value)).toEqual(['Day', 'Week', 'Month']);
            expect(segments(el).map((segment) => segment.textContent.trim())).toEqual(['Day', 'Week', 'Month']);
            expect(checked(el)).toEqual(['Week']);
        });
    });

    describe('the chosen option', () => {
        it('has a ring in the colour of its text and a tint, the others have neither', async () => {
            const el = await field('value="week"');
            const [day, week] = segments(el);

            expect(ringOf(week)).toBe('2px solid rgb(10, 10, 10)');
            expect(getComputedStyle(week).backgroundColor).not.toBe(TRANSPARENT);
            expect(ringOf(day)).toBe('none');
            expect(getComputedStyle(day).backgroundColor).toBe(TRANSPARENT);
            // The ring does not change the size of the option.
            expect(sizeOf(week).height).toBe(sizeOf(day).height);
        });

        it('shows without a theme, in a light and in a dark scheme', async () => {
            for (const style of [
                'color-scheme: light; color: rgb(0, 0, 0); background: rgb(255, 255, 255);',
                'color-scheme: dark; color: rgb(255, 255, 255); background: rgb(18, 18, 18);',
            ]) {
                const el = await field('value="week"', days, style);
                const week = segments(el)[1];
                const text = getComputedStyle(week).color;

                expect(ringOf(week), style).toBe(`2px solid ${text}`);
                expect(text, style).toBe(getComputedStyle(el.parentElement).color);
                // And every option has a border in that colour: the row can be seen.
                expect(getComputedStyle(segments(el)[0]).borderTopColor, style).toBe(text);
            }
        });

        describe('where the user forces colours', () => {
            useForcedColors();

            it('keeps the ring, and makes it wider', async () => {
                const el = await field('value="week"');
                const [day, week] = segments(el);

                expect(matchMedia('(forced-colors: active)').matches).toBe(true);
                expect(ringOf(day)).toBe('none');
                expect(ringOf(week)).toBe(`3px solid ${getComputedStyle(week).color}`);
            });
        });
    });

    describe('for the keyboard and assistive technology', () => {
        it('is a group with the name of the label, and its options are radios of one name', async () => {
            const el = await field('value="week"');
            const group = el.querySelector('fieldset');

            expect(await accessibleRole(group)).toBe('group');
            expect(await accessibleName(group)).toBe('Calendar');
            for (const radio of radios(el)) expect(await accessibleRole(radio)).toBe('radio');
            expect(await Promise.all(radios(el).map(accessibleName))).toEqual(['Day', 'Week', 'Month']);
            // One name: the browser counts them as one set, "2 of 3".
            expect(new Set(radios(el).map((radio) => radio.name))).toEqual(new Set([el.name]));
        });

        it('is one tab stop: the chosen option', async () => {
            const el = await field('value="week"');
            const before = document.createElement('button');
            const after = document.createElement('button');
            el.before(before);
            el.after(after);
            before.focus();

            await userEvent.tab();
            expect(document.activeElement).toBe(radios(el)[1]);
            await userEvent.tab();
            expect(document.activeElement).toBe(after);
        });

        it('moves the choice with the arrow keys, and around the ends', async () => {
            const el = await field('value="week"');
            radios(el)[1].focus();

            await userEvent.keyboard('{ArrowRight}');
            await rendered();
            expect(checked(el)).toEqual(['month']);
            expect(el.value).toBe('month');

            await userEvent.keyboard('{ArrowRight}');
            await rendered();
            expect(checked(el)).toEqual(['day']);

            await userEvent.keyboard('{ArrowLeft}');
            await rendered();
            expect(checked(el)).toEqual(['month']);
            expect(document.activeElement).toBe(radios(el)[2]);
        });

        it('shows the keyboard focus on the option, over its neighbours', async () => {
            const el = await field('value="week"');
            const before = document.createElement('button');
            el.before(before);
            before.focus();
            await userEvent.tab();

            const week = segments(el)[1];
            expect(getComputedStyle(week).outlineStyle).toBe('solid');
            expect(getComputedStyle(week).outlineWidth).toBe('2px');
            expect(getComputedStyle(week).outlineColor).toBe('rgb(0, 0, 200)');
            // The ring is outside of the option, where the neighbours are. The option lies over them.
            expect(getComputedStyle(week.parentElement).zIndex).toBe('1');
            expect(getComputedStyle(segments(el)[0].parentElement).zIndex).toBe('auto');
        });

        it('has no detectable a11y violations', async () => {
            const el = await field('value="week" help-message="What the calendar shows."');
            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('an option that shows an icon', () => {
        const sprite = `
            <svg width="0" height="0" style="position:absolute" aria-hidden="true">
                <symbol id="segmented-test-list" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" /></symbol>
            </svg>
        `;
        const layouts = [
            { value: 'list', label: 'List', icon: '#segmented-test-list' },
            { value: 'grid', label: 'Grid', icon: '#segmented-test-list' },
        ];

        it('shows the icon in the place of its label, which is its name and its tooltip', async () => {
            const el = await field('value="list"', layouts);
            el.insertAdjacentHTML('beforebegin', sprite);
            const [list] = segments(el);
            const icon = list.querySelector('svg');
            const name = list.querySelector('.segment-name');

            expect(icon.getAttribute('aria-hidden')).toBe('true');
            expect(icon.querySelector('use').getAttribute('href')).toBe('#segmented-test-list');
            expect(sizeOf(icon)).toEqual({ width: 20, height: 20 });
            // The name is there for assistive technology, and takes no room.
            expect(await accessibleName(radios(el)[0])).toBe('List');
            expect(sizeOf(name)).toEqual({ width: 1, height: 1 });
            expect(list.parentElement.getAttribute('title')).toBe('List');
        });

        it('has no tooltip on an option that shows its label', async () => {
            const el = await field('value="day"');
            expect(segments(el)[0].parentElement.hasAttribute('title')).toBe(false);
        });

        it('has no detectable a11y violations', async () => {
            const el = await field('value="list"', layouts);
            el.insertAdjacentHTML('beforebegin', sprite);
            const results = await axe.run(el.parentElement);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('the row', () => {
        // The radii of a segment, in the order of the corners: top left, top right, bottom right, bottom left.
        const corners = (segment) => {
            const style = getComputedStyle(segment);
            return [
                style.borderTopLeftRadius,
                style.borderTopRightRadius,
                style.borderBottomRightRadius,
                style.borderBottomLeftRadius,
            ];
        };

        it('has round corners at its two ends only', async () => {
            const el = await field('value="week"');

            expect(segments(el).map(corners)).toEqual([
                ['6px', '0px', '0px', '6px'],
                ['0px', '0px', '0px', '0px'],
                ['0px', '6px', '6px', '0px'],
            ]);
            // The ring of the chosen option has the corners of its segment.
            const ring = getComputedStyle(segments(el)[1], '::before');
            expect([ring.borderTopLeftRadius, ring.borderTopRightRadius]).toEqual(['0px', '0px']);
        });

        it('has them at the other ends in a text that runs from right to left', async () => {
            const el = await field('value="week" dir="rtl"');
            const [first, , last] = segments(el);

            expect(first.getBoundingClientRect().left).toBeGreaterThan(last.getBoundingClientRect().left);
            expect(corners(first)).toEqual(['0px', '6px', '6px', '0px']);
            expect(corners(last)).toEqual(['6px', '0px', '0px', '6px']);
        });

        it('joins its options: two neighbours share one line', async () => {
            const el = await field('value="week"');
            const boxes = segments(el).map((segment) => segment.getBoundingClientRect());

            expect(boxes[1].left).toBe(boxes[0].right - 1);
            expect(boxes[2].left).toBe(boxes[1].right - 1);
            expect(new Set(boxes.map((box) => box.top)).size).toBe(1);
            expect(new Set(boxes.map((box) => box.height)).size).toBe(1);
            expect(getComputedStyle(segments(el)[0]).borderTopColor).toBe('rgb(150, 150, 150)');
        });

        it('is as wide as its options, not as its place', async () => {
            const el = await field('value="week"');
            const row = el.querySelector('.options');
            expect(sizeOf(row).width).toBeLessThan(300);
        });

        it('is never wider than its place: the options share the width, and a label breaks', async () => {
            const el = await field(
                'value="mentions"',
                [
                    { value: 'all', label: 'Every message' },
                    { value: 'mentions', label: 'Mentions only' },
                    { value: 'none', label: 'Nothing at all' },
                ],
                theme,
                240,
            );
            const row = el.querySelector('.options');

            expect(sizeOf(row).width).toBe(240);
            expect(el.parentElement.scrollWidth).toBe(240);
            expect(sizeOf(segments(el)[0]).height).toBeGreaterThan(40);
            // All options are as high as the highest.
            expect(new Set(segments(el).map((segment) => sizeOf(segment).height)).size).toBe(1);
        });
    });

    describe('sizes', () => {
        it('has the three sizes of a control, each as high as an el-button of that size', async () => {
            const heights = {};
            for (const size of ['small', 'medium', 'large']) {
                const el = await field(`value="week" size="${size}"`);
                el.insertAdjacentHTML('afterend', `<el-button size="${size}" appearance="outlined">Day</el-button>`);
                await rendered();
                const button = el.nextElementSibling.shadowRoot.querySelector('[part="base"]');
                heights[size] = [sizeOf(segments(el)[0]).height, getComputedStyle(segments(el)[0]).fontSize];

                expect(sizeOf(segments(el)[0]).height, size).toBe(sizeOf(button).height);
                expect(sizeOf(segments(el)[0]).width, size).toBe(sizeOf(button).width);
            }

            expect(heights).toEqual({ small: [32, '14px'], medium: [42, '16px'], large: [53, '18px'] });
        });

        it('is medium by default, and writes the size onto itself', async () => {
            const el = await field('value="week"');
            expect(el.getAttribute('size')).toBe('medium');

            el.size = 'small';
            await rendered();
            expect(el.getAttribute('size')).toBe('small');
            expect(sizeOf(segments(el)[0]).height).toBe(32);
        });
    });

    describe('disabled', () => {
        it('disables one option, which the arrow keys skip', async () => {
            const el = await field('value="day"', [
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week', disabled: true },
                { value: 'month', label: 'Month' },
            ]);
            const [, week] = radios(el);

            expect(week.disabled).toBe(true);
            expect(getComputedStyle(segments(el)[1]).opacity).toBe('0.5');
            expect(getComputedStyle(week.parentElement).cursor).toBe('not-allowed');

            radios(el)[0].focus();
            await userEvent.keyboard('{ArrowRight}');
            await rendered();
            expect(checked(el)).toEqual(['month']);
        });

        it('disables the whole field', async () => {
            const el = await field('value="week" disabled="true"');

            expect(radios(el).every((radio) => radio.disabled)).toBe(true);
            // The chosen option still shows which one it is.
            expect(ringOf(segments(el)[1])).not.toBe('none');
        });

        it('does not answer to the pointer', async () => {
            const el = await field('value="day" disabled="true"');
            const segment = segments(el)[1];

            await forcePseudoClasses(segment.parentElement, ['hover', 'active']);
            expect(getComputedStyle(segment).backgroundColor).toBe(TRANSPARENT);
        });
    });

    describe('as a field', () => {
        it('has the label as the legend of its group, a help message and an error message', async () => {
            const el = await field(
                'required="true" help-message="What the calendar shows." error-message="Please choose one."',
            );
            const group = el.querySelector('fieldset');
            const help = el.querySelector('.help-message');

            expect(el.querySelector('legend').textContent.trim()).toBe('Calendar');
            expect(help.textContent.trim()).toBe('What the calendar shows.');
            expect(group.getAttribute('aria-describedby').split(' ')).toContain(help.id);
            expect(el.matches(':state(invalid)')).toBe(true);
            // The error shows once the user has left the group.
            expect(el.matches(':state(touched)')).toBe(false);

            radios(el)[0].focus();
            radios(el)[0].blur();
            await rendered();
            expect(el.matches(':state(touched)')).toBe(true);
            const error = el.querySelector('.error-message');
            expect(error.textContent.trim()).toBe('Please choose one.');
            expect(getComputedStyle(error).display).not.toBe('none');
        });
    });

    describe('a label that is not shown', () => {
        it('takes no room and is still the name of the group, without a class of the page', async () => {
            const shown = await field('value="week"');
            const hidden = await field('value="week" label-screen-reader-only="true"');
            const legend = hidden.querySelector('legend');

            expect(legend.classList.contains('sr-only')).toBe(true);
            expect(sizeOf(legend)).toEqual({ width: 1, height: 1 });
            expect(await accessibleName(hidden.querySelector('fieldset'))).toBe('Calendar');
            // The field is as high as its row of options.
            expect(sizeOf(hidden).height).toBe(sizeOf(segments(hidden)[0]).height);
            expect(sizeOf(shown).height).toBeGreaterThan(sizeOf(hidden).height);
        });
    });

    describe('in a native form', () => {
        const inForm = async (attributes = '') => {
            const form = await fixture(`
                <form style="${theme}">
                    <el-segmented-field name="view" label="Calendar" options='${JSON.stringify(days)}' ${attributes}></el-segmented-field>
                    <button type="reset">Reset</button>
                </form>
            `);
            await nextFrame();
            return { form, el: form.querySelector('el-segmented-field') };
        };

        it('submits the chosen option under its name, and nothing while none is chosen', async () => {
            const chosen = await inForm('value="week"');
            const none = await inForm();

            expect(new FormData(chosen.form).get('view')).toBe('week');
            expect(new FormData(none.form).has('view')).toBe(false);
        });

        it('submits the option the user picks', async () => {
            const { form, el } = await inForm('value="week"');
            await userEvent.click(segments(el)[0]);

            expect(new FormData(form).get('view')).toBe('day');
        });

        it('keeps the form from being submitted while it is required and nothing is chosen', async () => {
            const { form, el } = await inForm('required="true"');
            expect(form.checkValidity()).toBe(false);

            await userEvent.click(segments(el)[2]);
            await rendered();
            expect(form.checkValidity()).toBe(true);
        });

        it('goes back to the option it was rendered with when the form is reset', async () => {
            const { form, el } = await inForm('value="week"');
            await userEvent.click(segments(el)[0]);
            await rendered();
            expect(el.value).toBe('day');

            form.reset();
            await rendered();
            expect(el.value).toBe('week');
            expect(checked(el)).toEqual(['week']);
            expect(ringOf(segments(el)[1])).not.toBe('none');
            expect(ringOf(segments(el)[0])).toBe('none');
        });

        it('is left out while it is disabled', async () => {
            const { form } = await inForm('value="week" disabled="true"');
            expect(new FormData(form).has('view')).toBe(false);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes every option at least --el-touch-target high and wide, in every size', async () => {
            for (const size of ['small', 'medium', 'large']) {
                const el = await field(`value="b" size="${size}"`, ['a', 'b'], `${theme} --el-touch-target: 44px;`);

                for (const segment of segments(el)) {
                    const { width, height } = sizeOf(segment);
                    expect(Math.min(width, height), size).toBeGreaterThanOrEqual(44);
                    expect(sizeOf(segment.parentElement), size).toEqual({ width, height });
                }
            }
        });
    });
});
