import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { aTimeout, fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './select-field.js';
define();

describe('Feature | SelectField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-select-field></el-select-field>`);
        await nextFrame();
    });

    it('renders the placeholder and options as <option> elements', async () => {
        const el = await fixture(`
            <el-select-field
                name="size"
                label="Size"
                placeholder="Pick one"
                options='["sm", "md", "lg"]'
            ></el-select-field>
        `);
        await nextFrame();

        const options = el.querySelectorAll('select > option');
        expect(options).toHaveLength(4);
        expect(options[0].textContent.trim()).toBe('Pick one');
        expect(options[0].disabled).toBe(true);
        expect([...options].slice(1).map((o) => o.value)).toEqual(['sm', 'md', 'lg']);
    });

    it('has no detectable a11y violations when rendered with a label', async () => {
        const el = await fixture(`
            <el-select-field
                name="country"
                label="Country"
                placeholder="Select a country"
                options='["USA", "Canada", "Mexico"]'
            ></el-select-field>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });

    it('announces its error message and has no a11y violations in the error state', async () => {
        const el = await fixture(`
            <el-select-field
                name="country"
                label="Country"
                options='["USA", "Canada", "Mexico"]'
                error-message="Select a country"
                valid="false"
            ></el-select-field>
        `);
        await nextFrame();
        const message = el.querySelector('.error-message');

        expect(message.getAttribute('role')).toBe('alert');
        expect(el.querySelector('select').getAttribute('aria-describedby').split(' ')).toContain(message.id);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    describe('with a value', () => {
        const frames = async () => {
            await nextFrame();
            await nextFrame();
        };
        const field = (name, attributes) =>
            fixture(`<el-select-field name="${name}" label="Size" ${attributes}></el-select-field>`);
        const sizes = `options='[{ "value": "s", "label": "Small" }, { "value": "m", "label": "Medium" }, { "value": "l", "label": "Large" }]'`;
        // The events of a field from before it is connected: they bubble to the document.
        const changesOf = (name) => {
            const changes = [];
            document.addEventListener('input-change', (event) => {
                if (event.target.name === name) changes.push(event.detail);
            });
            return changes;
        };
        // The markup the SSR renderer writes: it assigns the parsed attributes as properties and
        // stringifies the template, without connecting the element.
        const serverSelect = (properties) => {
            const source = document.createElement('el-select-field');
            Object.assign(source, source.properties(), properties);
            const wrapper = document.createElement('div');
            wrapper.setHTMLUnsafe(source.template().toString());
            return wrapper.querySelector('select');
        };

        it('selects the option of the value it is rendered with', async () => {
            const el = await field('value-rendered', `value="m" ${sizes}`);

            expect(el.querySelector('select').value).toBe('m');
            expect(el.value).toBe('m');
        });

        it('selects the option of a value that is set later', async () => {
            const el = await field('value-later', `value="m" ${sizes}`);

            el.value = 'l';
            await frames();

            expect(el.querySelector('select').value).toBe('l');
        });

        it('selects the option of a value that is set after the user has chosen', async () => {
            const el = await field('value-after-choice', sizes);
            const select = el.querySelector('select');
            await userEvent.selectOptions(select, 'm');
            await frames();
            expect(el.value).toBe('m');

            el.value = 'l';
            await frames();

            expect(select.value).toBe('l');
        });

        it('matches a value that is a number in the markup', async () => {
            const el = await field('value-number', `value="2" options='[1, 2, 3]'`);

            expect(el.querySelector('select').value).toBe('2');
        });

        it('writes selected onto the option of the value in the server-rendered markup', () => {
            const select = serverSelect({ name: 'value-ssr', value: 'm', options: ['s', 'm', 'l'] });

            expect([...select.options].filter((option) => option.hasAttribute('selected')).map((o) => o.value)).toEqual(
                ['m'],
            );
            expect(select.value).toBe('m');
            expect(select.hasAttribute('value')).toBe(false);
        });

        it('lets the value win over an option that is marked as selected', async () => {
            const marked = `options='[{ "value": "s", "selected": true }, { "value": "m" }, { "value": "l" }]'`;
            const el = await field('value-wins', `value="l" ${marked}`);

            expect(el.querySelector('select').value).toBe('l');
            expect(el.value).toBe('l');
            expect(
                serverSelect({
                    name: 'value-wins-ssr',
                    value: 'l',
                    options: [{ value: 's', selected: true }, 'm', 'l'],
                }).value,
            ).toBe('l');
        });

        it('takes over the option that is marked as selected while it has no value', async () => {
            const changes = changesOf('value-marked');
            const el = await field(
                'value-marked',
                `placeholder="Pick a size" options='[{ "value": "s" }, { "value": "m", "selected": true }]'`,
            );
            await frames();

            expect(el.querySelector('select').value).toBe('m');
            expect(el.value).toBe('m');
            // Nobody chose anything.
            expect(changes).toEqual([]);
        });

        it('takes over the first option while it has no value and no option is marked', async () => {
            const changes = changesOf('value-first');
            const el = await field('value-first', sizes);
            await frames();

            expect(el.value).toBe('s');
            expect(changes).toEqual([]);
        });

        it('keeps no value while the placeholder is shown', async () => {
            const el = await field('value-placeholder', `placeholder="Pick a size" ${sizes}`);
            await frames();

            expect(el.querySelector('select').value).toBe('');
            expect(el.value).toBe(null);
        });

        it('reports a value that is set after it took one over', async () => {
            const changes = changesOf('value-reported');
            const el = await field('value-reported', sizes);
            await frames();

            el.value = 'l';
            await frames();
            el.value = 's';
            await frames();

            expect(changes).toEqual(['l', 's']);
        });

        it('goes back to its default when the value is taken away', async () => {
            const withPlaceholder = await field('value-null-placeholder', `placeholder="Pick" ${sizes}`);
            const withMark = await field(
                'value-null-marked',
                `options='[{ "value": "s" }, { "value": "m" }, { "value": "l", "selected": true }]'`,
            );
            const plain = await field('value-null-plain', sizes);
            // Chosen by the user: the browser no longer follows the selected attribute then.
            for (const el of [withPlaceholder, withMark, plain]) {
                await userEvent.selectOptions(el.querySelector('select'), 'm');
            }
            await frames();
            expect([withPlaceholder, withMark, plain].map((el) => el.value)).toEqual(['m', 'm', 'm']);

            for (const el of [withPlaceholder, withMark, plain]) el.value = null;
            await frames();
            await frames();

            expect(withPlaceholder.querySelector('select').value).toBe('');
            expect(withPlaceholder.value).toBe(null);
            expect(withMark.querySelector('select').value).toBe('l');
            expect(withMark.value).toBe('l');
            expect(plain.querySelector('select').value).toBe('s');
            expect(plain.value).toBe('s');
        });

        it('treats an empty value that no option has like no value', async () => {
            const marked = `options='[{ "value": "s" }, { "value": "m", "selected": true }, { "value": "l" }]'`;
            const rendered = await field('value-empty-rendered', `value="" ${marked}`);
            // element-js writes null back as an empty attribute where the value came from one.
            const emptied = await field('value-empty-later', `value="l" placeholder="Pick" ${sizes}`);
            await userEvent.selectOptions(emptied.querySelector('select'), 'm');
            await frames();

            emptied.value = null;
            await frames();
            await frames();

            expect(rendered.querySelector('select').value).toBe('m');
            expect(rendered.value).toBe('m');
            expect(emptied.querySelector('select').value).toBe('');
            expect(emptied.value).toBe('');
        });

        it('selects an option with an empty value for an empty value, not the placeholder', async () => {
            const el = await field(
                'value-empty',
                `value="m" placeholder="Pick" options='[{ "value": "", "label": "Any" }, { "value": "m" }]'`,
            );

            el.value = '';
            await frames();

            expect(el.querySelector('select').selectedOptions[0].textContent.trim()).toBe('Any');
            expect(el.value).toBe('');
        });

        it('keeps a value that has no option, and selects it once its option arrives', async () => {
            const el = await field('value-late-option', `value="xl" ${sizes}`);
            // What the browser selects in a select without a selected option.
            expect(el.querySelector('select').value).toBe('s');
            expect(el.value).toBe('xl');

            el.options = ['s', 'm', 'l', 'xl'];
            await frames();

            expect(el.querySelector('select').value).toBe('xl');
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = `options='["S", "M", "L"]'`) =>
            fixture(`<form><el-select-field name="${name}" label="Size" ${attributes}></el-select-field></form>`);

        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await nextFrame();
            await nextFrame();
        };

        it('submits the option the user picks under its name', async () => {
            const form = await inForm('form-value');
            const el = form.firstElementChild;
            // Like a native select, the first option counts until another one is picked.
            expect(data(form)).toEqual({ 'form-value': 'S' });

            const select = el.querySelector('select');
            select.value = 'L';
            select.dispatchEvent(new Event('change', { bubbles: true }));
            await nextFrame();
            expect(data(form)).toEqual({ 'form-value': 'L' });
            expect(el.value).toBe('L');
        });

        it('submits the option of its value', async () => {
            const form = await inForm('form-of-value', `value="M" options='["S", "M", "L"]'`);
            expect(data(form)).toEqual({ 'form-of-value': 'M' });

            form.firstElementChild.value = 'L';
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-of-value': 'L' });
        });

        it('submits the option that is marked as selected', async () => {
            const form = await inForm(
                'form-selected',
                `options='[{ "value": "s", "label": "Small" }, { "value": "m", "label": "Medium", "selected": true }]'`,
            );
            expect(data(form)).toEqual({ 'form-selected': 'm' });
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', `options='["S", "M", "L"]' disabled="true"`);
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and only the placeholder is selected', async () => {
            const form = await inForm(
                'form-required',
                `options='["S", "M", "L"]' placeholder="Pick a size" required="true"`,
            );
            expect(form.checkValidity()).toBe(false);

            const select = form.querySelector('select');
            select.value = 'M';
            select.dispatchEvent(new Event('change', { bubbles: true }));
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });

        it('goes back to the option it was rendered with when the form is reset', async () => {
            const withValue = await inForm('form-reset-value', `value="M" options='["S", "M", "L"]'`);
            const withMark = await inForm(
                'form-reset-mark',
                `options='[{ "value": "S" }, { "value": "M" }, { "value": "L", "selected": true }]'`,
            );
            const plain = await inForm('form-reset-plain');
            const withPlaceholder = await inForm(
                'form-reset-placeholder',
                `options='["S", "M", "L"]' placeholder="Pick a size" required="true" error-message="Pick a size"`,
            );
            const forms = [withValue, withMark, plain, withPlaceholder];
            const state = (form) => {
                const el = form.firstElementChild;
                return {
                    control: el.querySelector('select').value,
                    value: el.value,
                    submitted: new FormData(form).get(el.name),
                    touched: el.touched,
                    valid: el.valid,
                    message: el.querySelector('.error-message')?.textContent.trim() ?? null,
                };
            };
            const rendered = forms.map(state);
            expect(rendered.map(({ control, value }) => [control, value])).toEqual([
                ['M', 'M'],
                ['L', 'L'],
                ['S', 'S'],
                ['', null],
            ]);
            expect(rendered[3]).toEqual({
                control: '',
                value: null,
                submitted: null,
                touched: false,
                valid: true,
                message: null,
            });

            // The first three get another option. The required one is left with its placeholder.
            await userEvent.selectOptions(withValue.querySelector('select'), 'L');
            await userEvent.selectOptions(withMark.querySelector('select'), 'S');
            await userEvent.selectOptions(plain.querySelector('select'), 'M');
            withPlaceholder.querySelector('select').focus();
            withPlaceholder.querySelector('select').blur();
            await nextFrame();
            await nextFrame();
            expect(forms.map(state).map(({ control, value }) => [control, value])).toEqual([
                ['L', 'L'],
                ['S', 'S'],
                ['M', 'M'],
                ['', null],
            ]);
            expect(state(withPlaceholder)).toMatchObject({ touched: true, valid: false, message: 'Pick a size' });

            for (const form of forms) await reset(form);

            expect(forms.map(state)).toEqual(rendered);
        });

        it('shows the placeholder again after a reset when the user had chosen', async () => {
            const form = await inForm('form-reset-chosen', `options='["S", "M", "L"]' placeholder="Pick a size"`);
            const el = form.firstElementChild;

            await userEvent.selectOptions(el.querySelector('select'), 'M');
            await nextFrame();
            await nextFrame();
            expect([el.querySelector('select').value, el.value]).toEqual(['M', 'M']);

            await reset(form);

            expect([el.querySelector('select').value, el.value]).toEqual(['', null]);
            expect(el.querySelector('select').selectedOptions[0].textContent.trim()).toBe('Pick a size');
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the select at least --el-touch-target high', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-select-field name="size" label="Size" options='["S", "M"]'></el-select-field>
                </div>
            `);
            expect(sizeOf(wrapper.querySelector('select')).height).toBeGreaterThanOrEqual(44);
        });
    });
});
