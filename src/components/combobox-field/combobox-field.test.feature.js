import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import {
    accessibleDescription,
    accessibleName,
    accessibleRole,
    aTimeout,
    fixture,
    nextFrame,
    sizeOf,
    useTouchScreen,
} from '../../test-helpers.js';
import { define } from './combobox-field.js';
define();

const frames = async () => {
    await nextFrame();
    await nextFrame();
};
// After a reset: the field goes back a task after the event, and its control with the render after that.
const settled = async () => {
    await aTimeout(0);
    await frames();
};
const controlOf = (el) => el.querySelector('input');
const listOf = (el) => el.querySelector('datalist');
const offered = (el) => [...listOf(el).options].map((option) => option.value);
// What `input-change` reports for a field, from now on.
const changesOf = (el) => {
    const changes = [];
    el.addEventListener('input-change', (event) => changes.push(event.detail));
    return changes;
};
// What the browser does when the user picks a suggestion: the control has its value, then the
// event. No key is pressed that the field would hear. The list itself is drawn by the browser
// outside of the page, where a test does not reach it.
const pick = async (el, value) => {
    const control = controlOf(el);
    control.value = value;
    control.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText' }));
    await frames();
};
const type = async (el, keys) => {
    controlOf(el).focus();
    await userEvent.keyboard(keys);
    await frames();
};
const CITIES = `options='["Berlin", "Bern", "Bremen"]'`;

describe('Feature | ComboboxField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-combobox-field></el-combobox-field>`);
        await nextFrame();
        expect(controlOf(el)).not.toBeNull();
    });

    describe('the suggestions', () => {
        it('are the list of the control', async () => {
            const el = await fixture(`<el-combobox-field name="list" label="City" ${CITIES}></el-combobox-field>`);
            await frames();
            const control = controlOf(el);

            expect(el.querySelectorAll('input')).toHaveLength(1);
            expect(control.type).toBe('text');
            expect(control.list).toBe(listOf(el));
            expect(offered(el)).toEqual(['Berlin', 'Bern', 'Bremen']);
        });

        it('take option objects, with a label beside the value', async () => {
            const el = await fixture(
                `<el-combobox-field name="labels" label="Airport" options='[{"value": "BER", "label": "Berlin"}, {"value": "ZRH"}, "VIE"]'></el-combobox-field>`,
            );
            await frames();

            expect(offered(el)).toEqual(['BER', 'ZRH', 'VIE']);
            expect([...listOf(el).options].map((option) => option.getAttribute('label'))).toEqual([
                'Berlin',
                null,
                null,
            ]);
        });

        it('follow options that change', async () => {
            const el = await fixture(`<el-combobox-field name="later" label="City" ${CITIES}></el-combobox-field>`);
            await frames();
            const control = controlOf(el);

            el.options = ['Vienna', 'Zurich'];
            await frames();

            expect(offered(el)).toEqual(['Vienna', 'Zurich']);
            expect(control.list).toBe(listOf(el));
            // The control is the one it was: what the user has typed stays.
            expect(controlOf(el)).toBe(control);
        });

        // The browser shows the list while the user types. Each key renders the field: a list that
        // is written again then is one the browser has to read again.
        it('are left alone while the user types', async () => {
            const el = await fixture(
                `<el-combobox-field name="quiet" label="Airport" options='["Berlin", {"value": "ZRH", "label": "Zurich"}]'></el-combobox-field>`,
            );
            await frames();
            const options = [...listOf(el).options];
            const records = [];
            const observer = new MutationObserver((list) => records.push(...list));
            observer.observe(listOf(el), { subtree: true, childList: true, attributes: true, characterData: true });
            const listAttribute = new MutationObserver((list) => records.push(...list));
            listAttribute.observe(controlOf(el), { attributes: true, attributeFilter: ['list'] });

            await type(el, 'Be');
            await type(el, 'r');
            records.push(...observer.takeRecords(), ...listAttribute.takeRecords());
            observer.disconnect();
            listAttribute.disconnect();

            expect(el.value).toBe('Ber');
            expect(records.map((record) => [record.type, record.attributeName])).toEqual([]);
            expect([...listOf(el).options]).toEqual(options);
        });

        it('are no list at all without options, and a list again once there are some', async () => {
            const el = await fixture(`<el-combobox-field name="none" label="City"></el-combobox-field>`);
            await frames();
            expect(listOf(el)).toBeNull();
            expect(controlOf(el).hasAttribute('list')).toBe(false);

            el.options = ['Berlin'];
            await frames();
            expect(controlOf(el).list).toBe(listOf(el));
            expect(offered(el)).toEqual(['Berlin']);

            el.options = [];
            await frames();
            expect(listOf(el)).toBeNull();
            expect(controlOf(el).hasAttribute('list')).toBe(false);
        });

        it('are the ones of their field alone, with two fields in a page', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-combobox-field name="first" label="City" ${CITIES}></el-combobox-field>
                    <el-combobox-field name="second" label="Role" options='["Designer", "Developer"]'></el-combobox-field>
                </div>
            `);
            await frames();
            const [first, second] = wrapper.children;

            expect(listOf(first).id).not.toBe(listOf(second).id);
            expect(controlOf(first).list).toBe(listOf(first));
            expect(controlOf(second).list).toBe(listOf(second));
            expect(offered(second)).toEqual(['Designer', 'Developer']);
        });

        it('do not take the room of a control: the list is not shown in the page', async () => {
            const wrapper = await fixture(`
                <div style="width: 300px">
                    <el-combobox-field name="room-with" label="City" ${CITIES}></el-combobox-field>
                    <el-combobox-field name="room-without" label="City"></el-combobox-field>
                </div>
            `);
            await frames();
            const [withList, without] = wrapper.children;

            expect(getComputedStyle(listOf(withList)).display).toBe('none');
            expect(withList.getBoundingClientRect().height).toBe(without.getBoundingClientRect().height);
            expect(controlOf(withList).getBoundingClientRect().width).toBe(
                controlOf(without).getBoundingClientRect().width,
            );
        });
    });

    describe('the value', () => {
        it('follows what is typed, and reports every value once', async () => {
            const el = await fixture(`<el-combobox-field name="typed" label="City" ${CITIES}></el-combobox-field>`);
            const changes = changesOf(el);

            await type(el, 'Be');
            expect(el.value).toBe('Be');
            await type(el, 'r');

            expect(el.value).toBe('Ber');
            expect(changes).toEqual(['B', 'Be', 'Ber']);
        });

        it('takes over a suggestion that is picked, without a key', async () => {
            const el = await fixture(`<el-combobox-field name="picked" label="City" ${CITIES}></el-combobox-field>`);
            const changes = changesOf(el);
            await type(el, 'Be');

            await pick(el, 'Bern');

            expect(el.value).toBe('Bern');
            expect(changes.at(-1)).toBe('Bern');
        });

        it('is free text: a value that is no suggestion is valid and submitted', async () => {
            const form = await fixture(
                `<form><el-combobox-field name="free" label="City" required="true" ${CITIES}></el-combobox-field></form>`,
            );
            const el = form.firstElementChild;

            await type(el, 'Oslo');

            expect(el.value).toBe('Oslo');
            expect(el.valid).toBe(true);
            expect(form.checkValidity()).toBe(true);
            expect(new FormData(form).get('free')).toBe('Oslo');
        });

        it('gives a value that a script sets to the control, also after the user has typed', async () => {
            const el = await fixture(
                `<el-combobox-field name="script" label="City" value="Bern" ${CITIES}></el-combobox-field>`,
            );
            await frames();
            expect(controlOf(el).value).toBe('Bern');

            await type(el, 'x');
            el.value = 'Bremen';
            await frames();

            expect(controlOf(el).value).toBe('Bremen');
            expect(el.value).toBe('Bremen');
        });
    });

    describe('as an input field', () => {
        it('takes the type, the placeholder, the pattern and the attributes for text entry', async () => {
            const el = await fixture(`
                <el-combobox-field name="passed" label="Mail" type="email" placeholder="you@example.com" pattern=".+@example\\.com" autocomplete="off" inputmode="email" ${CITIES}></el-combobox-field>
            `);
            await frames();
            const control = controlOf(el);

            expect(control.type).toBe('email');
            expect(control.placeholder).toBe('you@example.com');
            expect(control.getAttribute('pattern')).toBe('.+@example\\.com');
            expect(control.getAttribute('autocomplete')).toBe('off');
            expect(control.getAttribute('inputmode')).toBe('email');
            expect(control.list).toBe(listOf(el));
        });

        it('shows its error message once a required field was left empty', async () => {
            const el = await fixture(
                `<el-combobox-field name="required" label="City" required="true" error-message="Enter a city" ${CITIES}></el-combobox-field>`,
            );
            await frames();
            expect(el.querySelector('.error-message')).toBeNull();

            controlOf(el).focus();
            controlOf(el).blur();
            await frames();

            expect(el.valid).toBe(false);
            expect(el.querySelector('.error-message').textContent.trim()).toBe('Enter a city');
        });

        it('goes back to the value it was rendered with when the form is reset, and keeps its list', async () => {
            const form = await fixture(
                `<form><el-combobox-field name="back" label="City" value="Bern" ${CITIES}></el-combobox-field></form>`,
            );
            const el = form.firstElementChild;
            await frames();
            await pick(el, 'Bremen');
            expect(new FormData(form).get('back')).toBe('Bremen');

            form.reset();
            await settled();

            expect([controlOf(el).value, el.value, new FormData(form).get('back')]).toEqual(['Bern', 'Bern', 'Bern']);
            expect(offered(el)).toEqual(['Berlin', 'Bern', 'Bremen']);
        });

        it('is left out of the form while it is disabled', async () => {
            const form = await fixture(
                `<form><el-combobox-field name="disabled" label="City" value="Bern" disabled="true" ${CITIES}></el-combobox-field></form>`,
            );
            await frames();
            expect(controlOf(form).disabled).toBe(true);
            expect([...new FormData(form).keys()]).toEqual([]);
        });
    });

    describe('before the script has run', () => {
        // The markup the SSR renderer writes: it assigns the properties and stringifies the template,
        // without connecting the element.
        const serverString = (properties) => {
            const source = document.createElement('el-combobox-field');
            Object.assign(source, source.properties(), properties);
            return source.template().toString();
        };
        const serverMarkup = (properties) => {
            const wrapper = document.createElement('div');
            wrapper.setHTMLUnsafe(serverString(properties));
            return wrapper;
        };

        it('has the suggestions in the markup, as the list of the control', async () => {
            const markup = serverMarkup({ options: ['Berlin', { value: 'ZRH', label: 'Zurich' }] });
            const list = markup.querySelector('datalist');

            expect(markup.querySelector('input').getAttribute('list')).toBe(list.id);
            expect([...list.options].map((option) => [option.value, option.getAttribute('label')])).toEqual([
                ['Berlin', null],
                ['ZRH', 'Zurich'],
            ]);
        });

        it('has neither a list nor the attribute without options', async () => {
            const markup = serverMarkup({});
            expect(markup.querySelector('datalist')).toBeNull();
            expect(markup.querySelector('input').hasAttribute('list')).toBe(false);
        });

        // The server made the ids of the control and of its list from another random part than the
        // element does when it starts: both get the new one, and stay a pair.
        it('keeps the server-rendered control and its list when the element starts', async () => {
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(
                `<el-combobox-field name="ssr-city" value="Bern" ${CITIES}>${serverString({ name: 'ssr-city', value: 'Bern', options: ['Berlin', 'Bern', 'Bremen'] })}</el-combobox-field>`,
            );
            const el = wrapper.querySelector('el-combobox-field');
            const serverControl = controlOf(el);
            const serverList = listOf(el);
            expect(serverControl.list).toBe(serverList);
            await frames();

            expect(controlOf(el)).toBe(serverControl);
            expect(listOf(el)).toBe(serverList);
            expect(serverControl.list).toBe(serverList);
            expect(serverControl.value).toBe('Bern');
            expect(offered(el)).toEqual(['Berlin', 'Bern', 'Bremen']);
            wrapper.remove();
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the control at least --el-touch-target high, in every size', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-combobox-field name="touch-small" label="Small" size="small" ${CITIES}></el-combobox-field>
                    <el-combobox-field name="touch-medium" label="Medium" ${CITIES}></el-combobox-field>
                </div>
            `);
            await frames();
            for (const control of wrapper.querySelectorAll('input')) {
                expect(sizeOf(control).height, control.outerHTML).toBeGreaterThanOrEqual(44);
            }
        });

        it('keeps its height without --el-touch-target', async () => {
            const wrapper = await fixture(
                `<div><input type="text" /><el-combobox-field name="touch-plain" label="City" ${CITIES}></el-combobox-field></div>`,
            );
            await frames();
            const [native, control] = wrapper.querySelectorAll('input');
            expect(sizeOf(control).height).toBe(sizeOf(native).height);
        });
    });

    describe('for a screen reader', () => {
        it('is a combobox named by its label and described by its messages', async () => {
            const el = await fixture(`
                <el-combobox-field name="described" label="City" help-message="Where you live" error-message="Enter a city" required="true" ${CITIES}></el-combobox-field>
            `);
            await frames();
            const control = controlOf(el);

            expect(await accessibleRole(control)).toBe('combobox');
            expect(await accessibleName(control)).toBe('City');
            expect(await accessibleDescription(control)).toBe('Where you live');
            expect(control.getAttribute('aria-invalid')).toBe('false');

            control.focus();
            control.blur();
            await frames();

            expect(control.getAttribute('aria-invalid')).toBe('true');
            expect(el.querySelector('.error-message').getAttribute('role')).toBe('alert');
            expect(await accessibleDescription(control)).toBe('Where you live Enter a city');
        });

        it('is a plain text input without options', async () => {
            const el = await fixture(`<el-combobox-field name="plain" label="City"></el-combobox-field>`);
            await frames();
            expect(await accessibleRole(controlOf(el))).toBe('textbox');
        });

        it('has no detectable a11y violations, with and without options, its messages and disabled', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-combobox-field name="axe-list" label="City" ${CITIES}></el-combobox-field>
                    <el-combobox-field name="axe-labels" label="Airport" help-message="Three letters" options='[{"value": "BER", "label": "Berlin"}]'></el-combobox-field>
                    <el-combobox-field name="axe-plain" label="Street"></el-combobox-field>
                    <el-combobox-field name="axe-error" label="Role" valid="false" touched="true" error-message="Enter a role" ${CITIES}></el-combobox-field>
                    <el-combobox-field name="axe-disabled" label="Country" value="Bern" disabled="true" ${CITIES}></el-combobox-field>
                </div>
            `);
            await frames();
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
        });
    });

    it('takes content of the page into its control, and its input keeps the list of its suggestions', async () => {
        const el = await fixture(`
            <el-combobox-field name="content-combobox" label="City" options='["Berlin", "Bern"]' clearable="true" value="Bern">
                <span slot="start" id="content-combobox-start">DE</span>
            </el-combobox-field>
        `);
        await nextFrame();
        await nextFrame();
        const control = el.querySelector(':scope > .field > .control');
        const input = el.querySelector('input');
        const list = el.querySelector('datalist');

        expect(input.parentElement).toBe(control);
        expect(el.querySelector('#content-combobox-start').parentElement).toBe(control.querySelector('.control-start'));
        expect(input.getAttribute('list')).toBe(list.id);
        expect(input.list).toBe(list);
        expect(list.querySelectorAll('option').length).toBe(2);

        el.querySelector('.control-clear').click();
        await nextFrame();
        await nextFrame();
        expect(el.value).toBe('');
        expect(document.activeElement).toBe(input);
    });
});
