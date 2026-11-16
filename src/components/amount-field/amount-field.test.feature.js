import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleDescription,
    accessibleName,
    aTimeout,
    fixture,
    nextFrame,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './amount-field.js';
define();

describe('Feature | AmountField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-amount-field></el-amount-field>`);
        await nextFrame();
    });

    it('renders its label and names the input by it', async () => {
        const el = await fixture(`<el-amount-field name="quantity" label="Quantity"></el-amount-field>`);
        await nextFrame();
        const label = el.querySelector('label');
        const input = el.querySelector('input');

        expect(label.textContent.trim()).toBe('Quantity');
        expect(input.labels[0]).toBe(label);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('renders no label when there is none', async () => {
        const el = await fixture(`<el-amount-field name="quantity"></el-amount-field>`);
        await nextFrame();

        expect(el.querySelector('label')).toBeNull();
    });

    // The form field takes its value as text. This one counts.
    it('takes its value as a number, from the attribute as well, and counts on from it', async () => {
        const el = await fixture(`<el-amount-field name="quantity" label="Quantity" value="3"></el-amount-field>`);
        const input = el.querySelector('input');
        expect(el.value).toBe(3);

        el.querySelector('.plus').click();
        await nextFrame();
        await nextFrame();
        expect(el.value).toBe(4);
        expect(input.value).toBe('4');

        el.setAttribute('value', '1.50');
        await nextFrame();
        await nextFrame();
        el.querySelector('.minus').click();
        await nextFrame();
        await nextFrame();
        expect(el.value).toBe(0.5);
    });

    describe('with a help message and an error message', () => {
        const frames = async () => {
            await nextFrame();
            await nextFrame();
        };
        const withTexts = (name, attributes = 'help-message="How many people" error-message="At least one"') =>
            `<el-amount-field name="${name}" label="Seats" value="3" ${attributes}></el-amount-field>`;
        // The elements of the field, by the name the tests call them.
        const SELECTORS = {
            label: 'label',
            'help-message': '.help-message',
            stepper: '.stepper',
            'error-message': '.error-message',
            input: 'input',
        };
        const partOf = (el, part) => el.querySelector(SELECTORS[part]);
        const describedBy = (el) => partOf(el, 'input').getAttribute('aria-describedby').split(' ');

        it('renders the help message and names it on the input', async () => {
            const el = await fixture(withTexts('help'));
            await frames();
            const help = partOf(el, 'help-message');

            expect(help.textContent).toBe('How many people');
            expect(describedBy(el)).toEqual([help.id]);
            expect(await accessibleDescription(partOf(el, 'input'))).toBe('How many people');
            // The field is valid, so there is no error to show.
            expect(partOf(el, 'error-message')).toBeNull();
        });

        it('shows the error message as an alert while the field is not valid, and names it then', async () => {
            const el = await fixture(withTexts('error'));
            await frames();

            // The stepper keeps the amount between min and max. What else is wrong with it, the page says.
            el.valid = false;
            await frames();
            const message = partOf(el, 'error-message');

            expect(message.textContent).toBe('At least one');
            expect(message.getAttribute('role')).toBe('alert');
            expect(describedBy(el)).toEqual([partOf(el, 'help-message').id, message.id]);
            expect(await accessibleDescription(partOf(el, 'input'))).toBe('How many people At least one');
            const results = await axe.run(el);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);

            el.valid = true;
            await frames();
            expect(partOf(el, 'error-message')).toBeNull();
            expect(describedBy(el)).toEqual([partOf(el, 'help-message').id]);
        });

        it('says on the input whether it is valid', async () => {
            const el = await fixture(withTexts('says'));
            await frames();
            expect(partOf(el, 'input').getAttribute('aria-invalid')).toBe('false');

            el.valid = false;
            await frames();

            expect(partOf(el, 'input').getAttribute('aria-invalid')).toBe('true');
        });

        it('shows the error message of a field that is rendered as not valid', async () => {
            const el = await fixture(withTexts('rendered', 'error-message="At least one" valid="false"'));
            await frames();

            expect(partOf(el, 'error-message').textContent).toBe('At least one');
        });

        it('describes the input only by elements that exist', async () => {
            const wrapper = await fixture(`
                <div>
                    ${withTexts('exists-both', 'help-message="How many people" error-message="At least one" valid="false"')}
                    ${withTexts('exists-help')} ${withTexts('exists-none', '')}
                </div>
            `);
            await frames();

            for (const el of wrapper.querySelectorAll('el-amount-field')) {
                const missing = describedBy(el).filter((id) => !el.querySelector(`#${id}`));
                expect([el.name, missing]).toEqual([el.name, []]);
            }
        });

        // The rows of the column that are rendered, from top to bottom.
        const rowsOf = (el) =>
            ['label', 'help-message', 'stepper', 'error-message']
                .map((part) => ({ part, row: partOf(el, part) }))
                .filter(({ row }) => row?.getClientRects().length)
                .map(({ part, row }) => ({ part, rect: row.getBoundingClientRect() }))
                .sort((one, other) => one.rect.top - other.rect.top);
        const tenths = (value) => Math.round(value * 10) / 10;
        // The room above the first row and below the last one, and the gaps between the rows.
        const columnOf = (el) => {
            const host = el.getBoundingClientRect();
            const rows = rowsOf(el);
            return {
                rows: rows.map((row) => row.part),
                above: tenths(rows[0].rect.top - host.top),
                gaps: rows.slice(1).map((row, index) => tenths(row.rect.top - rows[index].rect.bottom)),
                below: tenths(host.bottom - rows.at(-1).rect.bottom),
            };
        };
        const notValid = 'help-message="How many people" error-message="At least one" valid="false"';

        it('stacks the label, the help message, the stepper and the error message with one gap', async () => {
            const wrapper = await fixture(`
                <div>
                    <div style="--el-space-1: 6px">${withTexts('column-themed', notValid)}</div>
                    <div>${withTexts('column-plain', notValid)}</div>
                </div>
            `);
            await frames();
            const [themed, plain] = wrapper.querySelectorAll('el-amount-field');
            const rows = ['label', 'help-message', 'stepper', 'error-message'];

            expect(columnOf(themed)).toEqual({ rows, above: 0, gaps: [6, 6, 6], below: 0 });
            expect(columnOf(plain)).toEqual({ rows, above: 0, gaps: [4, 4, 4], below: 0 });
        });

        it('leaves no gap for a help message without a text', async () => {
            const el = await fixture(withTexts('no-help', ''));
            await frames();

            // The element is still there, for the aria-describedby of the input.
            expect(partOf(el, 'help-message').textContent).toBe('');
            expect(columnOf(el)).toEqual({ rows: ['label', 'stepper'], above: 0, gaps: [4], below: 0 });
        });

        it('gives the texts the look of the theme, and the colour of the text without one', async () => {
            const tokens =
                '--el-color-fg: rgb(1, 2, 3); --el-color-fg-muted: rgb(90, 90, 90); --el-color-danger: rgb(200, 0, 0); --el-font-size-sm: 13px';
            const wrapper = await fixture(`
                <div style="color: rgb(10, 20, 30)">
                    <div style="${tokens}">${withTexts('look-themed', notValid)}</div>
                    <div>${withTexts('look-plain', notValid)}</div>
                </div>
            `);
            await frames();
            const [themed, plain] = wrapper.querySelectorAll('el-amount-field');
            const lookOf = (el) =>
                Object.fromEntries(
                    ['label', 'help-message', 'error-message'].map((part) => {
                        const style = getComputedStyle(partOf(el, part));
                        return [part, `${style.color} ${style.fontSize}`];
                    }),
                );

            expect(lookOf(themed)).toEqual({
                label: 'rgb(1, 2, 3) 16px',
                'help-message': 'rgb(90, 90, 90) 13px',
                'error-message': 'rgb(200, 0, 0) 13px',
            });
            expect(lookOf(plain)).toEqual({
                label: 'rgb(10, 20, 30) 16px',
                'help-message': 'rgb(10, 20, 30) 14px',
                'error-message': 'rgb(10, 20, 30) 14px',
            });
        });

        // The field is a flex container, which the hidden attribute alone would not hide.
        it('is hidden by the hidden attribute', async () => {
            const el = await fixture(withTexts('hidden'));
            await frames();
            expect(getComputedStyle(el).display).toBe('flex');

            el.hidden = true;

            expect(getComputedStyle(el).display).toBe('none');
        });
    });

    describe('the stepper', () => {
        it('renders into the page, with the input between its two buttons', async () => {
            const el = await fixture(`<el-amount-field name="quantity" label="Quantity"></el-amount-field>`);

            expect(el.shadowRoot).toBeNull();
            expect(
                [...el.querySelector('.stepper').children].map((child) => child.className || child.localName),
            ).toEqual(['step plus', 'input', 'step minus']);
        });

        it('draws the signs of its buttons from the stylesheet, where a page can set its own', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-amount-field name="signs-default"></el-amount-field>
                    <el-amount-field
                        name="signs-own"
                        style="--el-amount-field-plus: '▲'; --el-amount-field-minus: '▼'"
                    ></el-amount-field>
                </div>
            `);
            const signs = (el) =>
                ['.plus', '.minus'].map((button) => getComputedStyle(el.querySelector(button), '::before').content);
            const [plain, own] = wrapper.children;

            expect(signs(plain)).toEqual(['"+"', '"-"']);
            expect(signs(own)).toEqual(['"▲"', '"▼"']);
        });

        it('names its buttons, in the words of the page as well', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-amount-field name="names-default" label="Seats"></el-amount-field>
                    <el-amount-field name="names-own" label="Plätze" plus-label="Mehr" minus-label="Weniger"></el-amount-field>
                </div>
            `);
            const names = (el) =>
                Promise.all(['.plus', '.minus'].map((button) => accessibleName(el.querySelector(button))));
            const [plain, own] = wrapper.children;

            expect(await names(plain)).toEqual(['Increase', 'Decrease']);
            expect(await names(own)).toEqual(['Mehr', 'Weniger']);
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });

        it('stops at its bounds, and leaves a bound that is not set out of the input', async () => {
            const el = await fixture(`<el-amount-field name="bounds" value="1" min="0" max="2"></el-amount-field>`);
            const [plus, minus] = [el.querySelector('.plus'), el.querySelector('.minus')];
            const input = el.querySelector('input');
            expect([input.getAttribute('min'), input.getAttribute('max')]).toEqual(['0', '2']);

            plus.click();
            await nextFrame();
            await nextFrame();
            expect([el.value, plus.disabled, minus.disabled]).toEqual([2, true, false]);

            el.max = false;
            el.min = false;
            await nextFrame();
            await nextFrame();
            expect([input.hasAttribute('min'), input.hasAttribute('max')]).toEqual([false, false]);
            expect([plus.disabled, minus.disabled]).toEqual([false, false]);
        });

        it('has the same look with a reset of the page for buttons and inputs', async () => {
            const tokens = `
                --el-color-bg: rgb(255, 255, 255); --el-color-bg-muted: rgb(240, 240, 240); --el-color-fg: rgb(10, 10, 10);
                --el-color-border: rgb(200, 200, 200); --el-border-width: 1px; --el-radius-md: 6px;
                --el-space-2: 8px; --el-space-3: 12px;
            `;
            const lookOf = (el) => {
                const look = (selector, properties) => {
                    const style = getComputedStyle(el.querySelector(selector));
                    return properties.map((property) => style[property]);
                };
                return {
                    stepper: look('.stepper', ['borderTopWidth', 'borderTopColor', 'borderTopLeftRadius']),
                    plus: look('.plus', ['backgroundColor', 'color', 'borderTopWidth', 'paddingLeft', 'paddingTop']),
                    input: look('input', ['backgroundColor', 'color', 'borderTopWidth', 'paddingLeft', 'textAlign']),
                };
            };
            const plain = await fixture(
                `<div style="${tokens}"><el-amount-field name="look-plain"></el-amount-field></div>`,
            );
            const before = lookOf(plain.firstElementChild);
            expect(before).toEqual({
                stepper: ['1px', 'rgb(200, 200, 200)', '6px'],
                plus: ['rgb(240, 240, 240)', 'rgb(10, 10, 10)', '0px', '12px', '8px'],
                input: ['rgb(255, 255, 255)', 'rgb(10, 10, 10)', '0px', '12px', 'center'],
            });

            // What a reset says to every button and input, loaded after the styles of the field.
            const reset = document.createElement('style');
            reset.textContent = `
                *, ::before, ::after { border-width: 0; border-style: solid; border-color: rgb(229, 231, 235); }
                button, input { padding: 0; margin: 0; font-size: 100%; color: inherit; }
                button, [type='button'] { background-color: transparent; background-image: none; }
            `;
            document.head.append(reset);
            await nextFrame();
            const after = lookOf(plain.firstElementChild);
            reset.remove();

            expect(after).toEqual(before);
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const frames = async () => {
            await nextFrame();
            await nextFrame();
        };
        const inForm = (name, attributes = '') =>
            fixture(`<form><el-amount-field name="${name}" label="Seats" ${attributes}></el-amount-field></form>`);

        it('submits the value it was rendered with under its name', async () => {
            const form = await inForm('form-rendered', 'value="3"');
            expect(data(form)).toEqual({ 'form-rendered': '3' });
            expect(form.querySelector('input').form).toBe(form);
        });

        it('submits a value that plus and minus have changed, and one that a script sets', async () => {
            const form = await inForm('form-changed', 'value="3"');
            const el = form.firstElementChild;

            await userEvent.click(el.querySelector('.plus'));
            await frames();
            expect(data(form)).toEqual({ 'form-changed': '4' });

            await userEvent.click(el.querySelector('.minus'));
            await userEvent.click(el.querySelector('.minus'));
            await frames();
            expect(data(form)).toEqual({ 'form-changed': '2' });

            el.value = 7;
            await frames();
            expect(data(form)).toEqual({ 'form-changed': '7' });
        });

        it('does not submit the form with its buttons', async () => {
            const form = await inForm('form-buttons', 'value="3"');
            let submits = 0;
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits++;
            });

            await userEvent.click(form.querySelector('.plus'));
            await userEvent.click(form.querySelector('.minus'));
            await aTimeout(0);

            expect(submits).toBe(0);
            expect([...form.querySelectorAll('button')].map((button) => button.type)).toEqual(['button', 'button']);
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="3" disabled="true"');
            expect(data(form)).toEqual({});

            form.firstElementChild.disabled = false;
            await frames();
            expect(data(form)).toEqual({ 'form-disabled': '3' });
        });

        it('is disabled by a disabled fieldset, its buttons included', async () => {
            const form = await fixture(`
                <form>
                    <fieldset disabled><el-amount-field name="form-fieldset" value="3"></el-amount-field></fieldset>
                </form>
            `);
            const el = form.querySelector('el-amount-field');

            await userEvent.click(el.querySelector('.plus'), { force: true });
            await frames();

            expect(el.value).toBe(3);
            expect(data(form)).toEqual({});
        });

        it('goes back to the value it was rendered with when the form is reset', async () => {
            const form = await inForm('form-reset', 'value="3"');
            const el = form.firstElementChild;
            const changes = [];
            el.addEventListener('input-change', (event) => changes.push(event.detail));

            await userEvent.click(el.querySelector('.plus'));
            await userEvent.click(el.querySelector('.plus'));
            await frames();
            expect(data(form)).toEqual({ 'form-reset': '5' });

            // The field goes back a task after the event, and its control with the render after that.
            form.reset();
            await aTimeout(0);
            await frames();

            expect(el.value).toBe(3);
            expect(el.querySelector('input').value).toBe('3');
            expect(data(form)).toEqual({ 'form-reset': '3' });
            expect(changes.at(-1)).toBe(3);
            expect(el.querySelector('.minus').disabled).toBe(false);
        });

        it('has its input, with the name and the value, in the server-rendered markup', async () => {
            const el = (await inForm('form-server', 'value="3" min="1"')).firstElementChild;
            // `template().toString()` is the markup the SSR renderer writes into the element.
            const markup = el.template().toString();
            const input = markup.match(/<input[^>]*>/)[0];

            expect(input).toMatch(/\sname=['"]form-server['"]/);
            expect(input).toMatch(/\svalue=['"]3['"]/);
            expect(input).toMatch(/\smin=['"]1['"]/);
            expect(input).not.toMatch(/\smax=/);
            expect(markup.match(/<button[^>]*>/g).every((button) => /\stype=['"]button['"]/.test(button))).toBe(true);
        });
    });

    it('keeps the width of its buttons on a fine pointer', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px"><el-amount-field name="quantity"></el-amount-field></div>
        `);
        const plus = wrapper.querySelector('el-amount-field .plus');
        expect(sizeOf(plus).width).toBeLessThan(44);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the buttons and the input at least --el-touch-target', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-amount-field name="quantity"></el-amount-field></div>
            `);
            const el = wrapper.querySelector('el-amount-field');
            for (const button of el.querySelectorAll('.step')) {
                const { width, height } = sizeOf(button);
                expect(Math.min(width, height), button.className).toBeGreaterThanOrEqual(44);
            }
            expect(sizeOf(el.querySelector('input')).height).toBeGreaterThanOrEqual(44);
        });
    });
});
