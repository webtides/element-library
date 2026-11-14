import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleDescription,
    accessibleName,
    accessibleRole,
    aTimeout,
    fixture,
    forcePseudoClasses,
    nextFrame,
    oneEvent,
    sizeOf,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './rating-field.js';
define();

const frames = async () => {
    await nextFrame();
    await nextFrame();
};
const ratingFixture = (attrs = '') =>
    fixture(`<el-rating-field name="stars" label="Your rating" ${attrs}></el-rating-field>`);
const radiosOf = (el) => [...el.querySelectorAll('input[type="radio"]')];
const chosenOf = (el) => el.querySelector('input[type="radio"]:checked')?.value ?? null;
// Which stars are drawn as on: an outline is off, a filled star is on.
const starsOf = (el) =>
    [...el.querySelectorAll('.star')].map((star) => (getComputedStyle(star).fill === 'none' ? '☆' : '★')).join('');

describe('Feature | RatingField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-rating-field></el-rating-field>`);
        await nextFrame();
        expect(el.querySelector('fieldset')).not.toBeNull();
    });

    it('renders one radio per star inside a fieldset/legend, five by default, nothing chosen', async () => {
        const el = await ratingFixture();
        const radios = radiosOf(el);

        expect(radios.map((radio) => radio.value)).toEqual(['1', '2', '3', '4', '5']);
        expect(radios.every((radio) => radio.name === 'stars')).toBe(true);
        expect(el.querySelector('legend').textContent.trim()).toBe('Your rating');
        expect(el.querySelectorAll('.star')).toHaveLength(5);
        expect([el.value, chosenOf(el), starsOf(el)]).toEqual([null, null, '☆☆☆☆☆']);
    });

    it('has as many stars as max says', async () => {
        const el = await ratingFixture('max="10" value="7"');
        await frames();
        expect(starsOf(el)).toBe('★★★★★★★☆☆☆');

        el.max = 3;
        await frames();
        // 7 is no step of the scale any more: nothing is chosen, and nothing would be submitted.
        expect([radiosOf(el).length, starsOf(el), chosenOf(el)]).toEqual([3, '☆☆☆', null]);
    });

    describe('the rating', () => {
        it('fills the stars up to the one of its value', async () => {
            const el = await ratingFixture('value="3"');
            await frames();
            expect([el.value, chosenOf(el), starsOf(el)]).toEqual(['3', '3', '★★★☆☆']);
        });

        it('chooses the star the user clicks, and input-change reports it', async () => {
            const el = await ratingFixture();
            const changed = oneEvent(el, 'input-change');

            // The label around a star is its hit area.
            await userEvent.click(el.querySelectorAll('.option')[3]);
            const event = await changed;
            await frames();
            // The pointer is still over the fourth star, which shows the same as the choice.
            expect([event.detail, el.value, chosenOf(el), starsOf(el)]).toEqual(['4', '4', '4', '★★★★☆']);

            radiosOf(el)[1].click();
            await frames();
            expect([el.value, chosenOf(el)]).toEqual(['2', '2']);
        });

        it('chooses with the arrow keys, as a radio group does', async () => {
            const el = await ratingFixture('value="2"');
            await frames();

            radiosOf(el)[1].focus();
            await userEvent.keyboard('{ArrowRight}{ArrowRight}');
            await frames();
            expect([el.value, starsOf(el)]).toEqual(['4', '★★★★☆']);

            await userEvent.keyboard('{ArrowLeft}');
            await frames();
            expect([el.value, document.activeElement]).toEqual(['3', radiosOf(el)[2]]);
        });

        it('fills the stars for a value that a script sets, also after the user has chosen', async () => {
            const el = await ratingFixture('value="1"');
            const radios = radiosOf(el);

            el.value = '4';
            await frames();
            expect([chosenOf(el), starsOf(el)]).toEqual(['4', '★★★★☆']);

            // The user chooses every star once. After that the browser no longer follows the
            // checked attribute of any of them.
            for (const radio of radios) radio.click();
            await frames();
            expect(el.value).toBe('5');

            el.value = '2';
            await frames();
            expect([chosenOf(el), starsOf(el)]).toEqual(['2', '★★☆☆☆']);

            el.value = null;
            await frames();
            expect([chosenOf(el), starsOf(el)]).toEqual([null, '☆☆☆☆☆']);
        });

        it('chooses nothing for a value that is no step of the scale', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-rating-field name="odd-high" label="Rating" value="9"></el-rating-field>
                    <el-rating-field name="odd-half" label="Rating" value="2.5"></el-rating-field>
                    <el-rating-field name="odd-zero" label="Rating" value="0"></el-rating-field>
                </div>
            `);
            await frames();
            for (const el of wrapper.children) expect([chosenOf(el), starsOf(el)]).toEqual([null, '☆☆☆☆☆']);
        });

        it('disables every star while the field is disabled', async () => {
            const el = await ratingFixture('value="3" disabled="true"');
            await frames();
            expect(radiosOf(el).every((radio) => radio.disabled)).toBe(true);
            expect(starsOf(el)).toBe('★★★☆☆');
        });
    });

    describe('the stars', () => {
        const TOKENS =
            '--el-space-5: 30px; --el-color-fg-muted: rgb(90, 90, 90); --el-color-accent: rgb(1, 2, 3); --el-space-1: 6px';
        const lookOf = (star) => {
            const { color, fill, stroke } = getComputedStyle(star);
            return { color, fill, stroke, size: sizeOf(star) };
        };

        it('are an outline while they are off and filled while they are on, in the colours of the theme', async () => {
            const wrapper = await fixture(
                `<div style="${TOKENS}"><el-rating-field name="look" label="Rating" value="1"></el-rating-field></div>`,
            );
            await frames();
            const [on, off] = wrapper.querySelectorAll('.star');

            expect(lookOf(off)).toEqual({
                color: 'rgb(90, 90, 90)',
                fill: 'none',
                stroke: 'rgb(90, 90, 90)',
                size: { width: 30, height: 30 },
            });
            expect(lookOf(on)).toEqual({
                color: 'rgb(1, 2, 3)',
                fill: 'rgb(1, 2, 3)',
                stroke: 'rgb(1, 2, 3)',
                size: { width: 30, height: 30 },
            });
        });

        it('have the colour of the text without a theme, and still differ in their shape', async () => {
            const wrapper = await fixture(
                `<div style="color: rgb(10, 20, 30); font-size: 16px"><el-rating-field name="look-plain" label="Rating" value="1"></el-rating-field></div>`,
            );
            await frames();
            const [on, off] = wrapper.querySelectorAll('.star');

            expect(lookOf(off)).toEqual({
                color: 'rgb(10, 20, 30)',
                fill: 'none',
                stroke: 'rgb(10, 20, 30)',
                size: { width: 24, height: 24 },
            });
            expect(lookOf(on).fill).toBe('rgb(10, 20, 30)');
        });

        it('take the colour and the size a page sets for them', async () => {
            const wrapper = await fixture(
                `<div style="${TOKENS}; --el-rating-color: rgb(245, 158, 11); --el-rating-size: 40px"><el-rating-field name="look-own" label="Rating" value="1"></el-rating-field></div>`,
            );
            await frames();
            const [on, off] = wrapper.querySelectorAll('.star');

            expect(lookOf(on).fill).toBe('rgb(245, 158, 11)');
            expect(lookOf(off).color).toBe('rgb(90, 90, 90)');
            expect(lookOf(on).size).toEqual({ width: 40, height: 40 });
        });

        it('lie in a row that is one hit area without holes', async () => {
            const wrapper = await fixture(
                `<div style="${TOKENS}"><el-rating-field name="row" label="Rating"></el-rating-field></div>`,
            );
            await frames();
            const rects = [...wrapper.querySelectorAll('.option')].map((option) => option.getBoundingClientRect());

            expect(new Set(rects.map((rect) => rect.top)).size).toBe(1);
            for (let index = 1; index < rects.length; index++) {
                expect(rects[index].left).toBeCloseTo(rects[index - 1].right, 1);
            }
            // A star and the room after it; the last one has none.
            expect(rects.map((rect) => Math.round(rect.width))).toEqual([36, 36, 36, 36, 30]);
        });

        it('show the stars up to the one under the pointer as on, whatever is chosen', async () => {
            // The fourth star is chosen; the pointer is over the second, the fifth and the fourth.
            const shown = [];
            for (const hovered of [2, 5, 4]) {
                const el = await fixture(
                    `<el-rating-field name="hover-${hovered}" label="Rating" value="4"></el-rating-field>`,
                );
                await frames();
                expect(starsOf(el)).toBe('★★★★☆');

                await forcePseudoClasses(el.querySelectorAll('.option')[hovered - 1], ['hover']);

                shown.push(starsOf(el));
                // Nothing was chosen by that.
                expect(el.value).toBe('4');
            }

            expect(shown).toEqual(['★★☆☆☆', '★★★★★', '★★★★☆']);
        });

        it('show no stars under the pointer while the field is disabled', async () => {
            const el = await ratingFixture('value="4" disabled="true"');
            await frames();

            await forcePseudoClasses(el.querySelectorAll('.option')[1], ['hover']);

            expect(starsOf(el)).toBe('★★★★☆');
            expect(getComputedStyle(el.querySelector('.option')).cursor).toBe('not-allowed');
            expect(getComputedStyle(el.querySelector('.star')).opacity).toBe('0.5');
        });

        it('show keyboard focus on the star of the radio', async () => {
            const el = await ratingFixture('value="2"');
            const radio = radiosOf(el)[1];

            await forcePseudoClasses(radio, ['focus-visible']);

            expect(getComputedStyle(radio.nextElementSibling).outlineStyle).toBe('solid');
            expect(getComputedStyle(radiosOf(el)[2].nextElementSibling).outlineStyle).toBe('none');
        });

        it('ignore --el-touch-target on a fine pointer', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px; font-size: 16px"><el-rating-field name="fine" label="Rating"></el-rating-field></div>`,
            );
            await frames();
            expect(sizeOf(wrapper.querySelector('.option')).height).toBeLessThan(44);
        });

        describe('with forced colours', () => {
            useForcedColors();

            it('still differ: an outline and a filled star, in a colour of the system', async () => {
                const el = await ratingFixture('value="1"');
                await frames();
                const [on, off] = el.querySelectorAll('.star');

                expect(getComputedStyle(off).fill).toBe('none');
                expect(getComputedStyle(on).fill).not.toBe('none');
                expect(getComputedStyle(on).fill).toBe(getComputedStyle(on).stroke);
            });
        });
    });

    describe('when it is required', () => {
        it('is not valid while nothing is chosen, and valid once a star is', async () => {
            const el = await ratingFixture('required="true"');
            // The state reflects validity immediately; the message stays hidden until touched.
            expect(el.matches(':state(invalid)')).toBe(true);
            expect(el.querySelector('fieldset').getAttribute('aria-invalid')).toBe('true');
            expect(radiosOf(el).every((radio) => radio.required)).toBe(true);

            radiosOf(el)[2].click();
            await frames();
            expect(el.matches(':state(valid)')).toBe(true);
            expect(el.querySelector('fieldset').getAttribute('aria-invalid')).toBe('false');
        });

        it('shows its error message once the user has left the group without a choice', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-rating-field name="left" label="Rating" required="true" error-message="Rate it"></el-rating-field>
                    <button>After</button>
                </div>
            `);
            const el = wrapper.firstElementChild;
            const messageOf = () => el.querySelector('.error-message')?.textContent.trim() ?? null;

            radiosOf(el)[0].focus();
            await userEvent.keyboard('{Tab}');
            await frames();

            expect(document.activeElement).toBe(wrapper.querySelector('button'));
            expect([el.touched, messageOf()]).toEqual([true, 'Rate it']);
        });

        it('is not touched while the focus moves from star to star, with the keys or the pointer', async () => {
            const el = await ratingFixture('required="true" error-message="Rate it"');
            radiosOf(el)[0].focus();

            await userEvent.keyboard('{ArrowRight}');
            await frames();
            expect([el.value, el.touched]).toEqual(['2', false]);

            await userEvent.click(el.querySelectorAll('.option')[4]);
            await frames();
            expect([el.value, el.touched]).toEqual(['5', false]);
        });

        it('keeps the error it was rendered with, from a check of the page', async () => {
            const el = await ratingFixture('value="1" valid="false" error-message="Tell us why below"');
            await frames();

            expect(el.touched).toBe(true);
            expect(el.querySelector('.error-message').textContent.trim()).toBe('Tell us why below');
            expect(el.querySelector('fieldset').getAttribute('aria-invalid')).toBe('true');
        });
    });

    describe('for a screen reader', () => {
        it('is a group named by its legend, with radios named by their number', async () => {
            const el = await ratingFixture('value="3" help-message="One is poor, five is great"');
            await frames();
            const fieldset = el.querySelector('fieldset');

            expect(await accessibleRole(fieldset)).toBe('group');
            expect(await accessibleName(fieldset)).toBe('Your rating');
            expect(await accessibleDescription(fieldset)).toBe('One is poor, five is great');
            const said = [];
            for (const radio of radiosOf(el)) said.push([await accessibleRole(radio), await accessibleName(radio)]);
            expect(said).toEqual([
                ['radio', '1'],
                ['radio', '2'],
                ['radio', '3'],
                ['radio', '4'],
                ['radio', '5'],
            ]);
            expect([...el.querySelectorAll('.star')].every((star) => star.getAttribute('aria-hidden') === 'true')).toBe(
                true,
            );
        });

        it('names its messages on the group and on every radio', async () => {
            const el = await ratingFixture(
                'required="true" valid="false" touched="true" help-message="One is poor" error-message="Rate it"',
            );
            await frames();
            const message = el.querySelector('.error-message');

            expect(message.getAttribute('role')).toBe('alert');
            expect(await accessibleDescription(el.querySelector('fieldset'))).toBe('One is poor Rate it');
            expect(await accessibleDescription(radiosOf(el)[0])).toBe('One is poor Rate it');
        });

        it('has no detectable a11y violations', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-rating-field name="axe-plain" label="Rating" value="3"></el-rating-field>
                    <el-rating-field name="axe-error" label="Service" required="true" valid="false" touched="true" error-message="Rate it"></el-rating-field>
                    <el-rating-field name="axe-disabled" label="Food" value="2" disabled="true"></el-rating-field>
                </div>
            `);
            await frames();
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = async (name, attributes = '') => {
            const form = await fixture(
                `<form><el-rating-field name="${name}" label="Rating" ${attributes}></el-rating-field><button>Send</button></form>`,
            );
            await frames();
            return form;
        };
        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await frames();
        };

        it('submits the chosen step under its name, and nothing while none is chosen', async () => {
            expect(data(await inForm('form-value', 'value="4"'))).toEqual({ 'form-value': '4' });
            expect(data(await inForm('form-none'))).toEqual({});
        });

        it('submits a step that a script sets, and one that the user picks', async () => {
            const form = await inForm('form-change', 'value="1"');
            const el = form.firstElementChild;

            el.value = '3';
            await frames();
            expect(data(form)).toEqual({ 'form-change': '3' });

            form.querySelector('input[value="5"]').click();
            await frames();
            expect(data(form)).toEqual({ 'form-change': '5' });
        });

        it('is left out while it is disabled', async () => {
            expect(data(await inForm('form-disabled', 'value="4" disabled="true"'))).toEqual({});
        });

        it('keeps the form from being submitted while it is required and nothing is chosen', async () => {
            const form = await inForm('form-required', 'required="true" error-message="Rate it"');
            const el = form.firstElementChild;
            const submits = [];
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits.push(event);
            });
            expect(form.checkValidity()).toBe(false);

            await userEvent.click(form.querySelector('button'));
            await frames();
            expect(submits).toHaveLength(0);
            expect([el.touched, el.valid]).toEqual([true, false]);
            expect(el.querySelector('.error-message').textContent.trim()).toBe('Rate it');

            form.querySelector('input[value="2"]').click();
            await frames();
            expect(form.checkValidity()).toBe(true);
            expect(el.querySelector('.error-message')).toBeNull();
        });

        it('goes back to the rating it was rendered with when the form is reset', async () => {
            const form = await inForm('form-reset', 'value="2" required="true" error-message="Rate it"');
            const el = form.firstElementChild;
            const state = () => ({
                control: chosenOf(el),
                value: el.value,
                stars: starsOf(el),
                submitted: new FormData(form).get('form-reset'),
                touched: el.touched,
                valid: el.valid,
            });
            const rendered = { control: '2', value: '2', stars: '★★☆☆☆', submitted: '2', touched: false, valid: true };
            expect(state()).toEqual(rendered);

            const five = form.querySelector('input[value="5"]');
            five.focus();
            five.click();
            five.blur();
            await frames();
            expect(state()).toEqual({
                control: '5',
                value: '5',
                stars: '★★★★★',
                submitted: '5',
                touched: true,
                valid: true,
            });

            await reset(form);

            expect(state()).toEqual(rendered);
        });

        it('has nothing chosen after a reset when it was rendered so', async () => {
            const form = await inForm('form-reset-none', 'required="true" error-message="Rate it"');
            const el = form.firstElementChild;
            const state = () => ({
                control: chosenOf(el),
                value: el.value,
                stars: starsOf(el),
                touched: el.touched,
                valid: el.valid,
            });
            const rendered = { control: null, value: null, stars: '☆☆☆☆☆', touched: false, valid: false };
            expect(state()).toEqual(rendered);

            const three = form.querySelector('input[value="3"]');
            three.focus();
            three.click();
            three.blur();
            await frames();
            expect(state()).toEqual({ control: '3', value: '3', stars: '★★★☆☆', touched: true, valid: true });

            await reset(form);

            expect(state()).toEqual(rendered);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes every star at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-rating-field name="touch" label="Rating"></el-rating-field></div>`,
            );
            await frames();
            const labels = [...wrapper.querySelectorAll('.option')];
            expect(labels).toHaveLength(5);
            for (const label of labels) {
                const { width, height } = sizeOf(label);
                expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
            }
        });
    });
});
