import { describe, it, expect } from 'vite-plus/test';
import axe from 'axe-core';
import { accessibleDescription, fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
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
        const label = el.shadowRoot.querySelector('[part="label"]');
        const input = el.shadowRoot.querySelector('[part="input"]');

        expect(label.textContent.trim()).toBe('Quantity');
        expect(input.labels[0]).toBe(label);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('renders no label when there is none', async () => {
        const el = await fixture(`<el-amount-field name="quantity"></el-amount-field>`);
        await nextFrame();

        expect(el.shadowRoot.querySelector('label')).toBeNull();
    });

    // The form field takes its value as text. This one counts.
    it('takes its value as a number, from the attribute as well, and counts on from it', async () => {
        const el = await fixture(`<el-amount-field name="quantity" label="Quantity" value="3"></el-amount-field>`);
        const input = el.shadowRoot.querySelector('[part="input"]');
        expect(el.value).toBe(3);

        el.shadowRoot.querySelector('[part~="plus"]').click();
        await nextFrame();
        await nextFrame();
        expect(el.value).toBe(4);
        expect(input.value).toBe('4');

        el.setAttribute('value', '1.50');
        await nextFrame();
        await nextFrame();
        el.shadowRoot.querySelector('[part~="minus"]').click();
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
        const partOf = (el, part) => el.shadowRoot.querySelector(`[part="${part}"]`);
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
                const missing = describedBy(el).filter((id) => !el.shadowRoot.getElementById(id));
                expect([el.name, missing]).toEqual([el.name, []]);
            }
        });

        // The rows of the column that are rendered, from top to bottom.
        const rowsOf = (el) =>
            ['label', 'help-message', 'wrapper', 'error-message']
                .map((part) => partOf(el, part))
                .filter((row) => row?.getClientRects().length)
                .map((row) => ({ part: row.getAttribute('part'), rect: row.getBoundingClientRect() }))
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
            const rows = ['label', 'help-message', 'wrapper', 'error-message'];

            expect(columnOf(themed)).toEqual({ rows, above: 0, gaps: [6, 6, 6], below: 0 });
            expect(columnOf(plain)).toEqual({ rows, above: 0, gaps: [4, 4, 4], below: 0 });
        });

        it('leaves no gap for a help message without a text', async () => {
            const el = await fixture(withTexts('no-help', ''));
            await frames();

            // The element is still there, for the aria-describedby of the input.
            expect(partOf(el, 'help-message').textContent).toBe('');
            expect(columnOf(el)).toEqual({ rows: ['label', 'wrapper'], above: 0, gaps: [4], below: 0 });
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

    it('keeps the width of its buttons on a fine pointer', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px"><el-amount-field name="quantity"></el-amount-field></div>
        `);
        const plus = wrapper.querySelector('el-amount-field').shadowRoot.querySelector('[part~="plus"]');
        expect(sizeOf(plus).width).toBeLessThan(44);
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the buttons and the input at least --el-touch-target', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-amount-field name="quantity"></el-amount-field></div>
            `);
            const root = wrapper.querySelector('el-amount-field').shadowRoot;
            for (const button of root.querySelectorAll('[part~="button"]')) {
                const { width, height } = sizeOf(button);
                expect(Math.min(width, height), button.getAttribute('part')).toBeGreaterThanOrEqual(44);
            }
            expect(sizeOf(root.querySelector('[part="input"]')).height).toBeGreaterThanOrEqual(44);
        });
    });
});
