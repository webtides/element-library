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
import { define } from './checkbox-group-field.js';
import { define as defineCheckboxField } from '../checkbox-field/checkbox-field.js';
define();
defineCheckboxField();

const frames = async () => {
    await nextFrame();
    await nextFrame();
};
// Options are passed as a JSON attribute so they are present at connect time (the group's initial
// validity is computed in connected()).
const groupFixture = (attrs = '', options = ['News', 'Offers', 'Events']) =>
    fixture(
        `<el-checkbox-group-field name="topics" label="Topics" options='${JSON.stringify(options)}' ${attrs}></el-checkbox-group-field>`,
    );
const boxesOf = (el) => [...el.querySelectorAll('input[type="checkbox"]')];
const checkedOf = (el) =>
    boxesOf(el)
        .filter((box) => box.checked)
        .map((box) => box.value);

describe('Feature | CheckboxGroupField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-checkbox-group-field></el-checkbox-group-field>`);
        await nextFrame();
        expect(el.querySelector('fieldset')).not.toBeNull();
    });

    it('renders one checkbox per option inside a fieldset/legend, all under one name', async () => {
        const el = await groupFixture();
        const boxes = boxesOf(el);

        expect(boxes.map((box) => box.value)).toEqual(['News', 'Offers', 'Events']);
        expect(boxes.every((box) => box.name === 'topics')).toBe(true);
        expect(boxes.every((box) => box.closest('fieldset') === el.querySelector('fieldset'))).toBe(true);
        expect(el.querySelector('legend').textContent.trim()).toBe('Topics');
        expect(el.value).toEqual([]);
    });

    describe('the value', () => {
        it('is the list of the checked values, in the order of the options, and input-change reports it', async () => {
            const el = await groupFixture();
            const [news, , events] = boxesOf(el);

            let changed = oneEvent(el, 'input-change');
            events.click();
            expect((await changed).detail).toEqual(['Events']);

            changed = oneEvent(el, 'input-change');
            news.click();
            // News was checked later and is the first option.
            expect((await changed).detail).toEqual(['News', 'Events']);
            expect(el.value).toEqual(['News', 'Events']);

            changed = oneEvent(el, 'input-change');
            events.click();
            expect((await changed).detail).toEqual(['News']);
        });

        it('checks the options of a value attribute, which is JSON', async () => {
            const el = await groupFixture(`value='["Offers", "Events"]'`);
            await frames();

            expect(el.value).toEqual(['Offers', 'Events']);
            expect(checkedOf(el)).toEqual(['Offers', 'Events']);
        });

        it('takes a value attribute that is no list as a list of one', async () => {
            const el = await groupFixture(`value="Offers"`);
            await frames();
            expect(checkedOf(el)).toEqual(['Offers']);
        });

        it('checks the option whose value is that text, also where it reads as a number', async () => {
            const el = await groupFixture(`value='["1.50", "12345678901234567890"]'`, [
                '0.50',
                '1.50',
                '12345678901234567890',
            ]);
            await frames();
            expect(checkedOf(el)).toEqual(['1.50', '12345678901234567890']);
        });

        it('checks and unchecks for a value that a script sets, also after the user has changed the checkboxes', async () => {
            const el = await groupFixture(`value='["News"]'`);
            const [news, offers, events] = boxesOf(el);

            el.value = ['Offers'];
            await frames();
            expect(checkedOf(el)).toEqual(['Offers']);

            // The user checks and unchecks all three. After that the browser no longer follows
            // the checked attribute of any of them.
            for (const box of [news, offers, events, news, offers, events]) box.click();
            await frames();
            expect(el.value).toEqual(['Offers']);

            el.value = ['News', 'Events'];
            await frames();

            expect(checkedOf(el)).toEqual(['News', 'Events']);
        });

        it('ignores a value that no option has', async () => {
            const el = await groupFixture(`value='["Offers", "Jobs"]'`);
            await frames();
            expect(checkedOf(el)).toEqual(['Offers']);
        });
    });

    describe('the options', () => {
        it('takes objects with a value, a label and a disabled flag', async () => {
            const el = await groupFixture('', [
                { value: 'a', label: 'Alpha' },
                { value: 'b', label: 'Beta', disabled: true },
            ]);
            const [a, b] = boxesOf(el);

            expect([a.value, b.value]).toEqual(['a', 'b']);
            expect([a.disabled, b.disabled]).toEqual([false, true]);
            expect([...el.querySelectorAll('.option-label')].map((label) => label.textContent.trim())).toEqual([
                'Alpha',
                'Beta',
            ]);
        });

        it('disables every checkbox while the field is disabled', async () => {
            const el = await groupFixture('disabled="true"');
            expect(boxesOf(el).every((box) => box.disabled)).toBe(true);
        });

        it('renders options that arrive later, with the checked ones of its value', async () => {
            const el = await fixture(
                `<el-checkbox-group-field name="later" label="Topics" value='["b"]'></el-checkbox-group-field>`,
            );
            expect(boxesOf(el)).toHaveLength(0);

            el.options = ['a', 'b'];
            await frames();

            expect(checkedOf(el)).toEqual(['b']);
        });
    });

    describe('when it is required', () => {
        it('is not valid while nothing is checked, and valid once an option is', async () => {
            const el = await groupFixture('required="true"');
            // The state reflects validity immediately; the message stays hidden until touched.
            expect(el.matches(':state(invalid)')).toBe(true);
            expect(el.querySelector('fieldset').getAttribute('aria-invalid')).toBe('true');

            boxesOf(el)[1].click();
            await frames();
            expect(el.matches(':state(valid)')).toBe(true);
            expect(el.querySelector('fieldset').getAttribute('aria-invalid')).toBe('false');

            boxesOf(el)[1].click();
            await frames();
            expect(el.matches(':state(invalid)')).toBe(true);
        });

        it('is valid from the start with a checked option', async () => {
            const el = await groupFixture(`required="true" value='["News"]'`);
            expect(el.matches(':state(valid)')).toBe(true);
        });

        it('does not ask every checkbox to be checked', async () => {
            const el = await groupFixture(`required="true" value='["News"]'`);
            await frames();
            expect(boxesOf(el).some((box) => box.required)).toBe(false);
            expect(boxesOf(el).every((box) => box.validity.valid)).toBe(true);
        });

        it('shows its error message once the user has left the group without a choice', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-checkbox-group-field name="left" label="Topics" required="true" error-message="Pick a topic" options='["News", "Offers"]'></el-checkbox-group-field>
                    <button>After</button>
                </div>
            `);
            const el = wrapper.firstElementChild;
            const messageOf = () => el.querySelector('.error-message')?.textContent.trim() ?? null;

            boxesOf(el)[0].focus();
            await userEvent.keyboard('{Tab}');
            await frames();
            // The focus is on the second checkbox: the user is still in the group.
            expect(document.activeElement).toBe(boxesOf(el)[1]);
            expect([el.touched, messageOf()]).toEqual([false, null]);

            await userEvent.keyboard('{Tab}');
            await frames();
            expect(document.activeElement).toBe(wrapper.querySelector('button'));
            expect([el.touched, messageOf()]).toEqual([true, 'Pick a topic']);

            boxesOf(el)[1].click();
            await frames();
            expect(messageOf()).toBe(null);
        });

        it('does not count a click on another option as leaving the group', async () => {
            const el = await groupFixture('required="true" error-message="Pick a topic"');
            const labels = el.querySelectorAll('.option');
            boxesOf(el)[0].focus();

            // The label is the hit area: the pointer goes down on it while the focus is still on
            // the first checkbox, which loses it.
            await userEvent.click(labels[2]);
            await frames();

            expect(el.value).toEqual(['Events']);
            expect(el.touched).toBe(false);
        });

        it('keeps the error it was rendered with, from a check of the page', async () => {
            const el = await groupFixture(`value='["News"]' valid="false" error-message="News is sold out"`);
            await frames();

            expect(el.touched).toBe(true);
            expect(el.querySelector('.error-message').textContent.trim()).toBe('News is sold out');
            expect(el.querySelector('fieldset').getAttribute('aria-invalid')).toBe('true');
        });
    });

    describe('for a screen reader', () => {
        it('is a group named by its legend, with checkboxes named by their labels alone', async () => {
            const el = await groupFixture(`value='["Offers"]' help-message="As often as you like"`);
            await frames();
            const fieldset = el.querySelector('fieldset');

            expect(await accessibleRole(fieldset)).toBe('group');
            expect(await accessibleName(fieldset)).toBe('Topics');
            expect(await accessibleDescription(fieldset)).toBe('As often as you like');
            const names = [];
            for (const box of boxesOf(el)) names.push(await accessibleName(box));
            // The check mark of the box is no part of the name, checked or not.
            expect(names).toEqual(['News', 'Offers', 'Events']);
            expect(
                [...el.querySelectorAll('.checkbox-indicator')].every(
                    (box) => box.getAttribute('aria-hidden') === 'true',
                ),
            ).toBe(true);
        });

        it('names its messages on the group and on every checkbox', async () => {
            const el = await groupFixture(
                'required="true" valid="false" touched="true" help-message="As often as you like" error-message="Pick a topic"',
            );
            await frames();
            const message = el.querySelector('.error-message');

            expect(message.getAttribute('role')).toBe('alert');
            expect(await accessibleDescription(el.querySelector('fieldset'))).toBe('As often as you like Pick a topic');
            expect(await accessibleDescription(boxesOf(el)[0])).toBe('As often as you like Pick a topic');
        });

        it('has no detectable a11y violations', async () => {
            const el = await groupFixture(`value='["Offers"]'`);
            await frames();
            const results = await axe.run(el);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });

        it('has no a11y violations in the error state and while it is disabled', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-checkbox-group-field name="axe-error" label="Topics" required="true" valid="false" touched="true" error-message="Pick a topic" options='["News", "Offers"]'></el-checkbox-group-field>
                    <el-checkbox-group-field name="axe-disabled" label="Days" disabled="true" options='["Mon", "Tue"]' value='["Mon"]'></el-checkbox-group-field>
                </div>
            `);
            await frames();
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    describe('the box of an option', () => {
        const TOKENS =
            '--el-space-4: 20px; --el-border-width: 2px; --el-color-border: rgb(100, 100, 100); --el-radius-sm: 3px; --el-color-bg: rgb(250, 250, 250); --el-color-accent: rgb(1, 2, 3)';
        const boxLook = (box) => {
            const style = getComputedStyle(box);
            return {
                size: sizeOf(box),
                border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`,
                radius: style.borderTopLeftRadius,
                background: style.backgroundColor,
            };
        };
        const markLook = (mark, pseudo) => {
            const { opacity, color } = getComputedStyle(mark, pseudo);
            return { opacity, color };
        };
        // The box and its mark, in a group and in a single el-checkbox-field, not checked and checked.
        const boxes = async (tokens) => {
            const wrapper = await fixture(`
                <div style="color: rgb(10, 20, 30); ${tokens}">
                    <el-checkbox-group-field name="box-group" label="Topics" options='["off", "on"]' value='["on"]'></el-checkbox-group-field>
                    <el-checkbox-field name="box-off" label="off"></el-checkbox-field>
                    <el-checkbox-field name="box-on" label="on" checked="true"></el-checkbox-field>
                </div>
            `);
            await frames();
            const [off, on] = wrapper.querySelectorAll('.checkbox-indicator');
            const [singleOff, singleOn] = wrapper.querySelectorAll('.checked-indicator');
            return {
                group: [boxLook(off), boxLook(on), markLook(off, '::after'), markLook(on, '::after')],
                single: [
                    boxLook(singleOff),
                    boxLook(singleOn),
                    markLook(singleOff.querySelector('.checked')),
                    markLook(singleOn.querySelector('.checked')),
                ],
            };
        };

        it('has the look of the box of el-checkbox-field with the tokens of a theme', async () => {
            const { group, single } = await boxes(TOKENS);

            expect(group[0]).toEqual({
                // --el-space-4 and the border on both sides
                size: { width: 24, height: 24 },
                border: '2px solid rgb(100, 100, 100)',
                radius: '3px',
                background: 'rgb(250, 250, 250)',
            });
            expect(group[1]).toEqual({ ...group[0], border: '2px solid rgb(1, 2, 3)', background: 'rgb(1, 2, 3)' });
            // The mark: not seen while the box is not checked, in the colour of the page on the filled box.
            expect(group[2].opacity).toBe('0');
            expect(group[3]).toEqual({ opacity: '1', color: 'rgb(250, 250, 250)' });
            expect(group).toEqual(single);
        });

        it('has it without a theme as well: a box in the colour of the text', async () => {
            const { group, single } = await boxes('');

            expect(group[0].border).toBe('1px solid rgb(10, 20, 30)');
            expect(group[1].background).toBe('rgb(10, 20, 30)');
            expect(group[3].opacity).toBe('1');
            expect(group).toEqual(single);
        });

        it('shows keyboard focus on the box, and fades it while the option is disabled', async () => {
            const el = await groupFixture('', ['a', { value: 'b', label: 'b', disabled: true }]);
            const [a, b] = boxesOf(el);

            await forcePseudoClasses(a, ['focus-visible']);

            expect(getComputedStyle(a.nextElementSibling).outlineStyle).toBe('solid');
            expect(getComputedStyle(b.nextElementSibling).opacity).toBe('0.5');
            expect(getComputedStyle(b.closest('.option')).cursor).toBe('not-allowed');
        });

        it('ignores --el-touch-target on a fine pointer', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-checkbox-group-field name="fine" label="Topics" options='["a", "b"]'></el-checkbox-group-field></div>`,
            );
            await frames();
            expect(sizeOf(wrapper.querySelector('.option')).height).toBeLessThan(44);
        });
    });

    describe('a colour or an icon in front of the label of an option', () => {
        const SYMBOLS = `
            <svg width="0" height="0" style="position: absolute" aria-hidden="true">
                <symbol id="checkbox-option-tag" viewBox="0 0 24 24"><path d="M4 4h8l8 8-8 8-8-8z" /></symbol>
            </svg>
        `;
        const OPTIONS = [
            { value: 'work', label: 'Work', color: 'rgb(200, 30, 30)' },
            { value: 'home', label: 'Home', color: '#1e5fc8', icon: '#checkbox-option-tag' },
            { value: 'later', label: 'Later', icon: '#checkbox-option-tag' },
            { value: 'none', label: 'None' },
            'Plain',
        ];
        const decorated = async (attributes = '') => {
            const wrapper = await fixture(`
                <div style="font: 16px/24px sans-serif">
                    ${SYMBOLS}
                    <el-checkbox-group-field name="checkbox-decorated" label="Tags" options='${JSON.stringify(OPTIONS)}' ${attributes}></el-checkbox-group-field>
                </div>
            `);
            await nextFrame();
            await nextFrame();
            return wrapper.querySelector('el-checkbox-group-field');
        };
        const optionOf = (el, index) => el.querySelectorAll('.option')[index];
        const box = (node) => node.getBoundingClientRect();

        it('shows a dot in the colour an option names, between its box and its label', async () => {
            const el = await decorated();
            const option = optionOf(el, 0);
            const dot = option.querySelector('.option-color');

            expect(getComputedStyle(dot).backgroundColor).toBe('rgb(200, 30, 30)');
            expect([box(dot).width, box(dot).height]).toEqual([12, 12]);
            expect(getComputedStyle(dot).borderTopLeftRadius).toBe('50%');
            expect(box(option.querySelector('.checkbox-indicator')).right).toBeLessThanOrEqual(box(dot).left);
            expect(box(dot).right).toBeLessThanOrEqual(box(option.querySelector('.option-label')).left);
            expect(getComputedStyle(optionOf(el, 1).querySelector('.option-color')).backgroundColor).toBe(
                'rgb(30, 95, 200)',
            );
        });

        it('shows an icon of the page there, in the colour of the text, and both where an option has both', async () => {
            const el = await decorated();
            const icon = optionOf(el, 2).querySelector('svg.option-icon');
            const both = optionOf(el, 1);

            expect(icon.querySelector('use').getAttribute('href')).toBe('#checkbox-option-tag');
            expect([box(icon).width, box(icon).height]).toEqual([20, 20]);
            expect(getComputedStyle(icon).fill).toBe(getComputedStyle(optionOf(el, 2)).color);
            expect(box(icon).right).toBeLessThanOrEqual(box(optionOf(el, 2).querySelector('.option-label')).left);
            // The colour first, then the icon.
            expect(box(both.querySelector('.option-color')).right).toBeLessThanOrEqual(
                box(both.querySelector('.option-icon')).left,
            );
        });

        it('takes both for decorations: the name of an option stays its label', async () => {
            const el = await decorated();

            for (const [index, name] of ['Work', 'Home', 'Later', 'None', 'Plain'].entries()) {
                expect(await accessibleName(optionOf(el, index).querySelector('input')), name).toBe(name);
            }
            for (const start of el.querySelectorAll('.option-start')) {
                expect(start.getAttribute('aria-hidden')).toBe('true');
            }
        });

        it('has nothing in front of the label of an option that names neither, as before', async () => {
            const el = await decorated();

            expect(el.querySelectorAll('.option-start').length).toBe(3);
            for (const index of [3, 4]) {
                expect([...optionOf(el, index).children].map((child) => child.className || child.localName)).toEqual([
                    'input',
                    'checkbox-indicator',
                    'option-label',
                ]);
            }
        });

        it('takes the options as a property as well, and follows new ones', async () => {
            const el = await fixture(
                `<el-checkbox-group-field name="checkbox-property" label="Tags"></el-checkbox-group-field>`,
            );
            el.options = OPTIONS;
            await nextFrame();
            await nextFrame();
            expect(getComputedStyle(optionOf(el, 0).querySelector('.option-color')).backgroundColor).toBe(
                'rgb(200, 30, 30)',
            );
            expect(optionOf(el, 2).querySelector('use').getAttribute('href')).toBe('#checkbox-option-tag');

            el.options = [{ value: 'work', label: 'Work', color: 'rgb(0, 120, 60)' }, 'Plain'];
            await nextFrame();
            await nextFrame();
            expect(getComputedStyle(optionOf(el, 0).querySelector('.option-color')).backgroundColor).toBe(
                'rgb(0, 120, 60)',
            );
            expect(el.querySelectorAll('.option-start').length).toBe(1);
        });

        it('has the colour and the icon in server-rendered markup', () => {
            const source = document.createElement('el-checkbox-group-field');
            Object.assign(source, source.properties(), { name: 'checkbox-ssr', label: 'Tags', options: OPTIONS });
            const wrapper = document.createElement('div');
            wrapper.setHTMLUnsafe(source.template().toString());
            const starts = [...wrapper.querySelectorAll('.option')].map((option) =>
                option.querySelector('.option-start'),
            );

            expect(starts.map((start) => !!start)).toEqual([true, true, true, false, false]);
            expect(starts[0].querySelector('.option-color').getAttribute('style')).toContain('rgb(200, 30, 30)');
            expect(starts[1].querySelector('.option-color').getAttribute('style')).toContain('#1e5fc8');
            expect(starts[1].querySelector('use').getAttribute('href')).toBe('#checkbox-option-tag');
            expect(starts[0].getAttribute('aria-hidden')).toBe('true');
        });

        it('checks an option for a click on its colour or on its icon, as for one on its label', async () => {
            const el = await decorated();

            await userEvent.click(optionOf(el, 0).querySelector('.option-color'));
            expect(optionOf(el, 0).querySelector('input').checked).toBe(true);
            await userEvent.click(optionOf(el, 2).querySelector('.option-icon'));
            expect(optionOf(el, 2).querySelector('input').checked).toBe(true);
        });

        it('passes axe with options that have a colour, an icon or both', async () => {
            const el = await decorated();

            const results = await axe.run(el);

            expect(results.violations).toEqual([]);
        });

        describe('where the user forces colours', () => {
            useForcedColors();

            it('keeps the colour of the dot: it is what the user finds the option by', async () => {
                const el = await decorated();

                expect(matchMedia('(forced-colors: active)').matches).toBe(true);
                expect(getComputedStyle(optionOf(el, 0).querySelector('.option-color')).backgroundColor).toBe(
                    'rgb(200, 30, 30)',
                );
            });
        });
    });

    describe('in a native form', () => {
        const all = (form, name) => new FormData(form).getAll(name);
        const inForm = async (name, attributes = '') => {
            const form = await fixture(
                `<form><el-checkbox-group-field name="${name}" label="Topics" options='["news", "offers", "events"]' ${attributes}></el-checkbox-group-field><button>Send</button></form>`,
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

        it('submits every checked option under its name, and nothing while none is checked', async () => {
            const checked = await inForm('form-value', `value='["news", "events"]'`);
            expect(all(checked, 'form-value')).toEqual(['news', 'events']);

            const none = await inForm('form-none');
            expect([...new FormData(none).keys()]).toEqual([]);
        });

        it('submits what a script sets, and what the user checks', async () => {
            const form = await inForm('form-change', `value='["news"]'`);
            const el = form.firstElementChild;

            el.value = ['offers'];
            await frames();
            expect(all(form, 'form-change')).toEqual(['offers']);

            form.querySelector('input[value="events"]').click();
            await frames();
            expect(all(form, 'form-change')).toEqual(['offers', 'events']);
            expect(el.value).toEqual(['offers', 'events']);
        });

        it('is left out while it is disabled, and leaves out a disabled option', async () => {
            const disabled = await inForm('form-disabled', `value='["news"]' disabled="true"`);
            expect(all(disabled, 'form-disabled')).toEqual([]);

            const form = await fixture(
                `<form><el-checkbox-group-field name="form-option-disabled" label="Topics" value='["a", "b"]' options='[{"value": "a"}, {"value": "b", "disabled": true}]'></el-checkbox-group-field></form>`,
            );
            await frames();
            expect(all(form, 'form-option-disabled')).toEqual(['a']);
        });

        it('keeps the form from being submitted while it is required and nothing is checked', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.querySelector('input[value="offers"]').click();
            await frames();
            expect(form.checkValidity()).toBe(true);

            form.querySelector('input[value="offers"]').click();
            await frames();
            expect(form.checkValidity()).toBe(false);
        });

        it('shows its error message when the browser refuses the submit, in the bubble as well', async () => {
            const form = await inForm('form-refused', 'required="true" error-message="Pick a topic"');
            const el = form.firstElementChild;
            const submits = [];
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits.push(event);
            });

            await userEvent.click(form.querySelector('button'));
            await frames();

            expect(submits).toHaveLength(0);
            expect([el.touched, el.valid]).toEqual([true, false]);
            expect(el.querySelector('.error-message').textContent.trim()).toBe('Pick a topic');
            // The first checkbox carries the validity of the group: the browser focuses it and
            // shows its bubble there, with the text of the field.
            const [first, second] = form.querySelectorAll('input');
            expect(document.activeElement).toBe(first);
            expect([first.validationMessage, second.validationMessage]).toEqual(['Pick a topic', '']);

            second.click();
            await frames();
            await userEvent.click(form.querySelector('button'));
            expect(submits).toHaveLength(1);
        });

        it('lets the first option that is not disabled carry the validity of the group', async () => {
            const form = await fixture(
                `<form><el-checkbox-group-field name="form-carrier" label="Topics" required="true" options='[{"value": "a", "disabled": true}, {"value": "b"}]'></el-checkbox-group-field></form>`,
            );
            await frames();
            const [a, b] = form.querySelectorAll('input');

            expect(form.checkValidity()).toBe(false);
            expect([a.validationMessage, b.validationMessage === '']).toEqual(['', false]);
        });

        it('goes back to the options it was rendered with when the form is reset', async () => {
            const form = await inForm('form-reset', `value='["offers"]' required="true" error-message="Pick a topic"`);
            const el = form.firstElementChild;
            const state = () => ({
                controls: checkedOf(el),
                value: el.value,
                submitted: all(form, 'form-reset'),
                touched: el.touched,
                valid: el.valid,
            });
            const rendered = {
                controls: ['offers'],
                value: ['offers'],
                submitted: ['offers'],
                touched: false,
                valid: true,
            };
            expect(state()).toEqual(rendered);

            const [news, offers] = boxesOf(el);
            news.focus();
            news.click();
            offers.click();
            news.blur();
            await frames();
            expect(state()).toEqual({
                controls: ['news'],
                value: ['news'],
                submitted: ['news'],
                touched: true,
                valid: true,
            });

            await reset(form);

            expect(state()).toEqual(rendered);
        });

        it('has nothing checked after a reset when it was rendered so', async () => {
            const form = await inForm('form-reset-none', 'required="true" error-message="Pick a topic"');
            const el = form.firstElementChild;
            const state = () => ({
                controls: checkedOf(el),
                value: el.value,
                touched: el.touched,
                valid: el.valid,
                message: el.querySelector('.error-message')?.textContent.trim() ?? null,
            });
            const rendered = { controls: [], value: [], touched: false, valid: false, message: null };
            expect(state()).toEqual(rendered);

            const events = form.querySelector('input[value="events"]');
            events.focus();
            events.click();
            events.blur();
            await frames();
            expect(state()).toEqual({
                controls: ['events'],
                value: ['events'],
                touched: true,
                valid: true,
                message: null,
            });

            await reset(form);

            expect(state()).toEqual(rendered);
            expect(form.checkValidity()).toBe(false);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the label of every option, which is its hit area, at least --el-touch-target in both directions', async () => {
            const wrapper = await fixture(
                `<div style="--el-touch-target: 44px"><el-checkbox-group-field name="touch" label="Topics" options='["a", "b"]'></el-checkbox-group-field></div>`,
            );
            await frames();
            const labels = [...wrapper.querySelectorAll('.option')];
            expect(labels).toHaveLength(2);
            for (const label of labels) {
                const { width, height } = sizeOf(label);
                expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
            }
        });
    });
});
