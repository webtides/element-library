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
import { define } from './color-field.js';
define();

const frames = async () => {
    await nextFrame();
    await nextFrame();
};
const controlOf = (el) => el.querySelector('input[type="color"]');
// What `input-change` reports for a field, from now on.
const changesOf = (el) => {
    const changes = [];
    el.addEventListener('input-change', (event) => changes.push(event.detail));
    return changes;
};
// What the browser does when the user picks a colour in its picker: the control has the value, then
// the event.
const pick = (control, value) => {
    control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('Feature | ColorField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-color-field></el-color-field>`);
        await nextFrame();
        expect(controlOf(el)).not.toBeNull();
    });

    describe('the value', () => {
        it('gives the colour to the control', async () => {
            const el = await fixture(`<el-color-field name="given" label="Accent" value="#2563eb"></el-color-field>`);
            await frames();

            expect(controlOf(el).value).toBe('#2563eb');
            expect(el.value).toBe('#2563eb');
        });

        it('takes over the value of the control without one, black, and reports no change', async () => {
            const wrapper = await fixture(`<div></div>`);
            const changes = changesOf(wrapper);
            wrapper.innerHTML = `<el-color-field name="none" label="Ink"></el-color-field>`;
            await frames();
            await frames();
            const el = wrapper.firstElementChild;

            expect([controlOf(el).value, el.value]).toEqual(['#000000', '#000000']);
            expect(changes).toEqual([]);
        });

        it('takes over the format of the control, and black for a text that is no colour', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-color-field name="upper" label="Accent" value="#2563EB"></el-color-field>
                    <el-color-field name="nonsense" label="Accent" value="nonsense"></el-color-field>
                </div>
            `);
            await frames();
            await frames();
            const [upper, nonsense] = wrapper.children;

            expect([controlOf(upper).value, upper.value]).toEqual(['#2563eb', '#2563eb']);
            expect([controlOf(nonsense).value, nonsense.value]).toEqual(['#000000', '#000000']);
        });

        it('is not touched for having a value, and is touched once the control was left', async () => {
            const el = await fixture(
                `<el-color-field name="untouched" label="Accent" value="#2563eb"></el-color-field>`,
            );
            await frames();
            expect(el.touched).toBe(false);
            expect(el.matches(':state(touched)')).toBe(false);

            controlOf(el).focus();
            controlOf(el).blur();
            await frames();

            expect(el.touched).toBe(true);
            expect(el.matches(':state(touched)')).toBe(true);
        });
    });

    describe('when the value changes', () => {
        it('follows the picker while the user goes through it, and reports every value once', async () => {
            const el = await fixture(`<el-color-field name="picks" label="Accent" value="#2563eb"></el-color-field>`);
            const control = controlOf(el);
            const changes = changesOf(el);

            pick(control, '#2563ec');
            pick(control, '#2563ed');
            await frames();
            pick(control, '#16a34a');
            await frames();
            // The picker is closed: the browser fires `change` with the value the control already has.
            control.dispatchEvent(new Event('change', { bubbles: true }));
            await frames();

            expect(el.value).toBe('#16a34a');
            expect(changes.at(-1)).toBe('#16a34a');
            expect(changes.filter((value) => value === '#16a34a')).toHaveLength(1);
            expect(new Set(changes).size).toBe(changes.length);
        });

        it('gives a value that a script sets to the control, also after the user has picked a colour', async () => {
            const el = await fixture(`<el-color-field name="script" label="Accent" value="#2563eb"></el-color-field>`);
            const control = controlOf(el);
            const changes = changesOf(el);

            el.value = '#16a34a';
            await frames();
            expect(control.value).toBe('#16a34a');

            pick(control, '#dc2626');
            await frames();
            el.value = '#f59e0b';
            await frames();

            expect(control.value).toBe('#f59e0b');
            expect(el.value).toBe('#f59e0b');
            expect(changes).toEqual(['#16a34a', '#dc2626', '#f59e0b']);
        });

        it('takes over what the control makes of a value from a script', async () => {
            const el = await fixture(`<el-color-field name="kept" label="Accent" value="#2563eb"></el-color-field>`);
            const changes = changesOf(el);

            el.value = '#DC2626';
            await frames();
            await frames();
            expect([controlOf(el).value, el.value]).toEqual(['#dc2626', '#dc2626']);

            el.value = 'nonsense';
            await frames();
            await frames();
            expect([controlOf(el).value, el.value]).toEqual(['#000000', '#000000']);
            expect(changes).toEqual(['#dc2626', '#000000']);
        });

        it('is black for a value that is taken away', async () => {
            const el = await fixture(`<el-color-field name="taken" label="Accent" value="#2563eb"></el-color-field>`);

            el.value = null;
            await frames();
            await frames();

            expect([controlOf(el).value, el.value]).toEqual(['#000000', '#000000']);
        });
    });

    describe('with show-value', () => {
        const shown = (el) => el.querySelector('.value')?.textContent.trim() ?? null;

        it('shows no value by default', async () => {
            const el = await fixture(
                `<el-color-field name="hidden-value" label="Accent" value="#2563eb"></el-color-field>`,
            );
            expect(el.querySelector('.value')).toBeNull();
        });

        it('shows the value beside the control and follows the picker', async () => {
            const el = await fixture(
                `<el-color-field name="shown" label="Accent" value="#2563eb" show-value="true"></el-color-field>`,
            );
            await frames();
            const control = controlOf(el);
            expect(shown(el)).toBe('#2563eb');
            // In the row of the control, after it.
            expect(el.querySelector('.value').parentElement).toBe(control.parentElement);
            expect(el.querySelector('.value').getBoundingClientRect().left).toBeGreaterThanOrEqual(
                control.getBoundingClientRect().right,
            );

            pick(control, '#16a34a');
            await frames();
            expect(shown(el)).toBe('#16a34a');
        });

        it('shows the value the field took over from the control', async () => {
            const el = await fixture(
                `<el-color-field name="shown-none" label="Ink" show-value="true"></el-color-field>`,
            );
            await frames();
            await frames();
            expect(shown(el)).toBe('#000000');
        });

        it('hides the shown value from a screen reader, which reads it from the control', async () => {
            const el = await fixture(
                `<el-color-field name="shown-aria" label="Accent" value="#2563eb" show-value="true"></el-color-field>`,
            );
            await frames();
            expect(el.querySelector('.value').getAttribute('aria-hidden')).toBe('true');
            expect(await accessibleName(controlOf(el))).toBe('Accent');
        });
    });

    describe('with colours to pick from', () => {
        const listOf = (el) => el.querySelector('datalist');
        const offered = (el) => [...listOf(el).options].map((option) => option.value);

        it('has no list without options', async () => {
            const el = await fixture(`<el-color-field name="no-list" label="Accent"></el-color-field>`);
            await frames();

            expect(listOf(el)).toBeNull();
            expect(controlOf(el).hasAttribute('list')).toBe(false);
            expect(controlOf(el).list).toBeNull();
        });

        it('offers the colours of options in the list of the control', async () => {
            const el = await fixture(
                `<el-color-field name="list" label="Accent" options='["#2563eb", "#16a34a", {"value": "#dc2626", "label": "Danger"}]'></el-color-field>`,
            );
            await frames();

            expect(controlOf(el).list).toBe(listOf(el));
            expect(offered(el)).toEqual(['#2563eb', '#16a34a', '#dc2626']);
            expect([...listOf(el).options].map((option) => option.getAttribute('label'))).toEqual([
                null,
                null,
                'Danger',
            ]);
        });

        it('follows options that change, and drops the list with the last one', async () => {
            const el = await fixture(`<el-color-field name="list-later" label="Accent"></el-color-field>`);

            el.options = ['#2563eb', '#16a34a'];
            await frames();
            expect(controlOf(el).list).toBe(listOf(el));
            expect(offered(el)).toEqual(['#2563eb', '#16a34a']);

            el.options = ['#dc2626'];
            await frames();
            expect(offered(el)).toEqual(['#dc2626']);

            el.options = [];
            await frames();
            expect(listOf(el)).toBeNull();
            expect(controlOf(el).hasAttribute('list')).toBe(false);
        });

        // The picker is open while the value changes, and every value renders the field: a list
        // that is written again then is one the browser has to read again.
        it('leaves the list alone while the user goes through the picker', async () => {
            const el = await fixture(
                `<el-color-field name="list-quiet" label="Accent" show-value="true" options='["#2563eb", {"value": "#dc2626", "label": "Danger"}]'></el-color-field>`,
            );
            await frames();
            const records = [];
            const observer = new MutationObserver((list) => records.push(...list));
            observer.observe(listOf(el), { subtree: true, childList: true, attributes: true, characterData: true });
            const listAttribute = new MutationObserver((list) => records.push(...list));
            listAttribute.observe(controlOf(el), { attributes: true, attributeFilter: ['list'] });

            pick(controlOf(el), '#16a34a');
            await frames();
            pick(controlOf(el), '#16a34b');
            await frames();
            records.push(...observer.takeRecords(), ...listAttribute.takeRecords());
            observer.disconnect();
            listAttribute.disconnect();

            expect(el.querySelector('.value').textContent.trim()).toBe('#16a34b');
            expect(records.map((record) => [record.type, record.attributeName])).toEqual([]);
        });

        it('has a list of its own in every field', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-color-field name="list-a" label="First" options='["#2563eb"]'></el-color-field>
                    <el-color-field name="list-b" label="Second" options='["#dc2626"]'></el-color-field>
                </div>
            `);
            await frames();
            const [first, second] = wrapper.children;

            expect(listOf(first).id).not.toBe(listOf(second).id);
            expect([offered(first), offered(second)]).toEqual([['#2563eb'], ['#dc2626']]);
            expect(controlOf(second).list).toBe(listOf(second));
        });

        it('leaves the value alone: an offer is not a limit', async () => {
            const el = await fixture(
                `<el-color-field name="list-free" label="Accent" value="#123456" options='["#2563eb"]'></el-color-field>`,
            );
            await frames();
            await frames();
            expect([controlOf(el).value, el.value]).toEqual(['#123456', '#123456']);
        });
    });

    describe('before the script has run', () => {
        // The markup the SSR renderer writes: it assigns the properties and stringifies the template,
        // without connecting the element.
        const serverString = (properties) => {
            const source = document.createElement('el-color-field');
            Object.assign(source, source.properties(), properties);
            return source.template().toString();
        };
        const serverMarkup = (properties) => {
            const wrapper = document.createElement('div');
            wrapper.setHTMLUnsafe(serverString(properties));
            return wrapper;
        };

        it('has the colour, the shown value and the colours to pick from in the markup', async () => {
            const markup = serverMarkup({ name: 'brand', value: '#2563eb', showValue: true, options: ['#16a34a'] });
            const control = markup.querySelector('input');

            expect([control.type, control.name, control.value]).toEqual(['color', 'brand', '#2563eb']);
            expect(markup.querySelector('.value').textContent.trim()).toBe('#2563eb');
            expect(control.getAttribute('list')).toBe(markup.querySelector('datalist').id);
            expect([...markup.querySelector('datalist').options].map((option) => option.value)).toEqual(['#16a34a']);
        });

        it('has neither a list nor the attribute without options', async () => {
            const markup = serverMarkup({ value: '#2563eb' });
            expect(markup.querySelector('datalist')).toBeNull();
            expect(markup.querySelector('input').hasAttribute('list')).toBe(false);
        });

        it('keeps the server-rendered control, its colour and its list when the element starts', async () => {
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(
                `<el-color-field name="ssr-brand" value="#2563eb" options='["#16a34a"]'>${serverString({ name: 'ssr-brand', value: '#2563eb', options: ['#16a34a'] })}</el-color-field>`,
            );
            const el = wrapper.querySelector('el-color-field');
            const control = controlOf(el);
            const list = el.querySelector('datalist');
            const changes = changesOf(el);
            await frames();
            await frames();

            expect(controlOf(el)).toBe(control);
            expect(el.querySelector('datalist')).toBe(list);
            expect(control.list).toBe(list);
            expect([control.value, el.value]).toEqual(['#2563eb', '#2563eb']);
            expect(changes).toEqual([]);
            wrapper.remove();
        });
    });

    describe('for a screen reader', () => {
        it('is named by its label and described by its messages', async () => {
            const el = await fixture(`
                <el-color-field
                    name="described"
                    label="Text colour"
                    help-message="Of the body text"
                    error-message="Too light"
                    value="#e5e7eb"
                ></el-color-field>
            `);
            await frames();
            const control = controlOf(el);

            expect(await accessibleName(control)).toBe('Text colour');
            expect(await accessibleDescription(control)).toBe('Of the body text');
            expect(control.getAttribute('aria-invalid')).toBe('false');
            expect(el.querySelector('.error-message')).toBeNull();

            // A colour is never invalid for the browser: the page says so, after its own check.
            el.valid = false;
            el.touched = true;
            await frames();

            expect(control.getAttribute('aria-invalid')).toBe('true');
            expect(el.querySelector('.error-message').getAttribute('role')).toBe('alert');
            expect(await accessibleDescription(control)).toBe('Of the body text Too light');
        });

        it('shows the error message it was rendered with', async () => {
            const el = await fixture(
                `<el-color-field name="rendered-error" label="Text colour" value="#e5e7eb" valid="false" error-message="Too light"></el-color-field>`,
            );
            await frames();
            expect(el.touched).toBe(true);
            expect(el.querySelector('.error-message').textContent.trim()).toBe('Too light');
        });

        it('can be reached and left with the keyboard', async () => {
            const wrapper = await fixture(`
                <div>
                    <button>Before</button>
                    <el-color-field name="keyboard" label="Accent" value="#2563eb" options='["#16a34a"]' show-value="true"></el-color-field>
                    <button>After</button>
                </div>
            `);
            await frames();
            const [before, after] = wrapper.querySelectorAll('button');

            before.focus();
            await userEvent.keyboard('{Tab}');
            expect(document.activeElement).toBe(controlOf(wrapper));
            await userEvent.keyboard('{Tab}');
            expect(document.activeElement).toBe(after);
        });

        it('has no detectable a11y violations, with and without its messages, the shown value and a list', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-color-field name="axe-plain" label="Accent" value="#2563eb"></el-color-field>
                    <el-color-field name="axe-shown" label="Ink" help-message="Of the text" value="#111827" show-value="true"></el-color-field>
                    <el-color-field name="axe-list" label="Label" value="#16a34a" options='["#2563eb", "#16a34a"]'></el-color-field>
                    <el-color-field name="axe-error" label="Text" value="#e5e7eb" valid="false" error-message="Too light"></el-color-field>
                    <el-color-field name="axe-disabled" label="Border" value="#d1d5db" disabled="true"></el-color-field>
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
                `<form><el-color-field name="${name}" label="Accent" ${attributes}></el-color-field></form>`,
            );
            await frames();
            await frames();
            return form;
        };
        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await frames();
            await frames();
        };

        it('submits its value under its name: the rendered one, and the one of the control without one', async () => {
            expect(data(await inForm('form-value', 'value="#2563eb"'))).toEqual({ 'form-value': '#2563eb' });
            expect(data(await inForm('form-none'))).toEqual({ 'form-none': '#000000' });
        });

        it('submits a colour that the user picks, and one that a script sets', async () => {
            const form = await inForm('form-change', 'value="#2563eb"');
            const el = form.firstElementChild;

            pick(controlOf(el), '#16a34a');
            await frames();
            expect(data(form)).toEqual({ 'form-change': '#16a34a' });

            el.value = '#dc2626';
            await frames();
            expect(data(form)).toEqual({ 'form-change': '#dc2626' });
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="#2563eb" disabled="true"');
            expect(controlOf(form).disabled).toBe(true);
            expect(data(form)).toEqual({});
        });

        it('never keeps the form from being submitted: the control always has a value', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(true);
        });

        it('goes back to the value it was rendered with when the form is reset', async () => {
            const form = await inForm('form-reset', 'value="#2563eb" show-value="true"');
            const el = form.firstElementChild;
            const state = () => ({
                control: controlOf(el).value,
                value: el.value,
                shown: el.querySelector('.value').textContent.trim(),
                submitted: new FormData(form).get('form-reset'),
                touched: el.touched,
            });
            const rendered = {
                control: '#2563eb',
                value: '#2563eb',
                shown: '#2563eb',
                submitted: '#2563eb',
                touched: false,
            };
            expect(state()).toEqual(rendered);

            controlOf(el).focus();
            pick(controlOf(el), '#dc2626');
            controlOf(el).blur();
            await frames();
            expect(state()).toEqual({
                control: '#dc2626',
                value: '#dc2626',
                shown: '#dc2626',
                submitted: '#dc2626',
                touched: true,
            });
            const changes = changesOf(el);

            await reset(form);

            expect(state()).toEqual(rendered);
            expect(changes).toEqual(['#2563eb']);
        });

        it('goes back to black after a reset when it was rendered without a value', async () => {
            const form = await inForm('form-reset-none');
            const el = form.firstElementChild;
            expect([controlOf(el).value, el.value]).toEqual(['#000000', '#000000']);

            pick(controlOf(el), '#dc2626');
            await frames();
            expect(el.value).toBe('#dc2626');

            await reset(form);

            expect([controlOf(el).value, el.value]).toEqual(['#000000', '#000000']);
            expect(data(form)).toEqual({ 'form-reset-none': '#000000' });
        });
    });

    describe('the size of the control', () => {
        it('keeps the look and the size of the browser, in every size', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px; --el-control-height: 40px; --el-color-border: rgb(1, 2, 3)">
                    <input type="color" />
                    <el-color-field name="size-browser" label="Accent"></el-color-field>
                    <el-color-field name="size-browser-large" label="Accent" size="large"></el-color-field>
                </div>
            `);
            await frames();
            const [native, medium, large] = wrapper.querySelectorAll('input');

            for (const control of [medium, large]) {
                expect(sizeOf(control)).toEqual(sizeOf(native));
                expect(getComputedStyle(control).borderTopColor).toBe(getComputedStyle(native).borderTopColor);
            }
        });

        it('reflects the size to the attribute', async () => {
            const el = await fixture(`<el-color-field name="size-reflect" label="Accent"></el-color-field>`);
            expect(el.getAttribute('size')).toBe('medium');

            el.size = 'large';
            await frames();
            expect(el.getAttribute('size')).toBe('large');
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            it('is at least --el-touch-target high', async () => {
                const wrapper = await fixture(
                    `<div style="--el-touch-target: 44px"><el-color-field name="size-touch" label="Accent"></el-color-field></div>`,
                );
                await frames();
                expect(sizeOf(controlOf(wrapper)).height).toBeGreaterThanOrEqual(44);
            });

            it('keeps its height without --el-touch-target', async () => {
                const wrapper = await fixture(
                    `<div><input type="color" /><el-color-field name="size-touch-plain" label="Accent"></el-color-field></div>`,
                );
                await frames();
                const [native, control] = wrapper.querySelectorAll('input');
                expect(sizeOf(control).height).toBe(sizeOf(native).height);
            });
        });
    });
});
