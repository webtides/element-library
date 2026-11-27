import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { accessibleDescription, aTimeout, fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './input-field.js';
define();

const TEXT_ENTRY = {
    autocomplete: 'one-time-code',
    inputmode: 'numeric',
    enterkeyhint: 'done',
    autocapitalize: 'none',
    autocorrect: 'off',
    spellcheck: 'false',
};
const textEntryMarkup = Object.entries(TEXT_ENTRY)
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ');
const textEntryOn = (control) =>
    Object.fromEntries(
        Object.keys(TEXT_ENTRY)
            .filter((name) => control.hasAttribute(name))
            .map((name) => [name, control.getAttribute(name)]),
    );

// The markup the SSR renderer writes: it assigns the parsed attributes as properties and
// stringifies the template, without connecting the element.
function serverMarkup(properties) {
    const source = document.createElement('el-input-field');
    Object.assign(source, source.properties(), properties);
    return source.template().toString();
}
function serverControl(properties) {
    const wrapper = document.createElement('div');
    wrapper.setHTMLUnsafe(serverMarkup(properties));
    return wrapper.querySelector('input');
}

describe('Feature | InputField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-input-field></el-input-field>`);
        await nextFrame();
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-input-field name="hidden-field" label="Hidden" hidden></el-input-field>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    it('stacks the label, the help message, the control and the error message', async () => {
        const el = await fixture(`
            <el-input-field
                name="stacked-field"
                label="Email address"
                help-message="We only use it to sign you in."
                error-message="Please enter your email address."
                valid="false"
                touched="true"
            ></el-input-field>
        `);
        const tops = ['label', '.help-message', '.field', '.error-message'].map(
            (selector) => el.querySelector(selector).getBoundingClientRect().top,
        );
        expect(tops).toEqual([...tops].sort((a, b) => a - b));
        expect(new Set(tops).size).toBe(4);
    });

    it('has no detectable a11y violations when rendered with a label', async () => {
        const el = await fixture(`
            <el-input-field name="email" label="Email address"></el-input-field>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });

    it('announces its error message and has no a11y violations in the error state', async () => {
        const el = await fixture(`
            <el-input-field
                name="email"
                label="Email address"
                error-message="Enter an email address"
                valid="false"
            ></el-input-field>
        `);
        await nextFrame();
        const message = el.querySelector('.error-message');

        expect(message.textContent).toBe('Enter an email address');
        expect(message.getAttribute('role')).toBe('alert');
        expect(el.querySelector('input').getAttribute('aria-describedby').split(' ')).toContain(message.id);
        const results = await axe.run(el);
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });

    it('describes the input by the help message alone while there is no error', async () => {
        const el = await fixture(`
            <el-input-field name="email" label="Email address" error-message="Enter an email address"></el-input-field>
        `);
        await nextFrame();

        expect(el.querySelector('.error-message')).toBeNull();
        expect(el.querySelector('input').getAttribute('aria-describedby')).toBe(el.querySelector('.help-message').id);
    });

    it('passes the text entry attributes on to the input', async () => {
        const el = await fixture(`<el-input-field name="code" ${textEntryMarkup}></el-input-field>`);
        await nextFrame();

        expect(textEntryOn(el.querySelector('input'))).toEqual(TEXT_ENTRY);
    });

    it('renders no text entry attribute that is not set', async () => {
        const el = await fixture(`<el-input-field name="code"></el-input-field>`);
        await nextFrame();

        expect(textEntryOn(el.querySelector('input'))).toEqual({});
    });

    it('follows a text entry attribute that is added, changed or removed later', async () => {
        const el = await fixture(`<el-input-field name="code" autocomplete="username"></el-input-field>`);
        await nextFrame();
        const input = el.querySelector('input');

        el.setAttribute('inputmode', 'email');
        el.setAttribute('spellcheck', 'false');
        el.setAttribute('autocomplete', 'email');
        await nextFrame();
        await nextFrame();
        expect(textEntryOn(input)).toEqual({ autocomplete: 'email', inputmode: 'email', spellcheck: 'false' });

        el.removeAttribute('inputmode');
        el.removeAttribute('spellcheck');
        await nextFrame();
        await nextFrame();
        expect(textEntryOn(input)).toEqual({ autocomplete: 'email' });
    });

    it('mirrors an attribute that element-js writes back empty after it was removed', async () => {
        const el = await fixture(`<el-input-field name="code" autocomplete="username"></el-input-field>`);
        await nextFrame();

        // element-js reflects a property that came from an attribute, and reflects `null` as an
        // empty attribute. Removing such an attribute therefore leaves it empty on the element.
        el.removeAttribute('autocomplete');
        await nextFrame();
        await nextFrame();

        expect(el.getAttribute('autocomplete')).toBe('');
        expect(textEntryOn(el.querySelector('input'))).toEqual({ autocomplete: '' });
    });

    it('follows a text entry property that is set later', async () => {
        const el = await fixture(`<el-input-field name="code"></el-input-field>`);
        await nextFrame();

        el.enterkeyhint = 'next';
        el.spellcheck = false;
        await nextFrame();
        await nextFrame();

        expect(textEntryOn(el.querySelector('input'))).toEqual({ enterkeyhint: 'next', spellcheck: 'false' });
    });

    it('writes the text entry attributes into the server-rendered markup', () => {
        expect(textEntryOn(serverControl({ name: 'code', ...TEXT_ENTRY, spellcheck: false }))).toEqual(TEXT_ENTRY);
        expect(textEntryOn(serverControl({ name: 'code' }))).toEqual({});
    });

    describe('the length of its text', () => {
        const lengthsOn = (control) => [control.getAttribute('maxlength'), control.getAttribute('minlength')];
        const frames = async () => {
            await nextFrame();
            await nextFrame();
        };

        it('passes maxlength and minlength on to the input, in the page and in server-rendered markup', async () => {
            const el = await fixture(
                `<el-input-field name="length-name" label="Name" maxlength="100" minlength="2"></el-input-field>`,
            );
            await frames();

            expect(lengthsOn(el.querySelector('input'))).toEqual(['100', '2']);
            // The SSR renderer hands the attributes over as numbers.
            expect(lengthsOn(serverControl({ name: 'length-name', maxlength: 100, minlength: 2 }))).toEqual([
                '100',
                '2',
            ]);
        });

        it('renders neither of them while it is not set, in the page and in server-rendered markup', async () => {
            const el = await fixture(`<el-input-field name="length-none" label="Name"></el-input-field>`);
            await frames();

            for (const control of [el.querySelector('input'), serverControl({ name: 'length-none' })]) {
                expect(control.hasAttribute('maxlength')).toBe(false);
                expect(control.hasAttribute('minlength')).toBe(false);
            }
            expect([el.maxlength, el.minlength]).toEqual([null, null]);
        });

        it('has one of them without the other', async () => {
            const el = await fixture(`<el-input-field name="length-one" label="Name" maxlength="20"></el-input-field>`);
            await frames();

            expect(lengthsOn(el.querySelector('input'))).toEqual(['20', null]);
            expect(lengthsOn(serverControl({ name: 'length-one', minlength: 3 }))).toEqual([null, '3']);
        });

        it('keeps them when the field renders again, follows a new one, and takes one off that is not set any more', async () => {
            const el = await fixture(
                `<el-input-field name="length-again" label="Name" maxlength="100" minlength="2"></el-input-field>`,
            );
            await frames();
            const input = el.querySelector('input');

            el.label = 'Your name';
            el.helpMessage = 'As on your passport';
            await frames();
            expect(el.querySelector('input')).toBe(input);
            expect(lengthsOn(input)).toEqual(['100', '2']);

            el.setAttribute('maxlength', '50');
            el.minlength = null;
            await frames();
            await aTimeout(20);
            expect(lengthsOn(input)).toEqual(['50', null]);
            expect(input.hasAttribute('minlength')).toBe(false);

            // Taken off the field: element-js leaves the attribute there, empty. The input has none.
            el.removeAttribute('maxlength');
            await frames();
            await aTimeout(20);
            expect(input.hasAttribute('maxlength')).toBe(false);
        });

        it('takes no more characters than maxlength while the user types, and its value is what the input has', async () => {
            const el = await fixture(`<el-input-field name="length-max" label="Code" maxlength="5"></el-input-field>`);
            await frames();
            const input = el.querySelector('input');
            const changes = [];
            el.addEventListener('input-change', (event) => changes.push(event.detail));

            await userEvent.click(input);
            await userEvent.keyboard('abcdefgh');
            await frames();

            expect(input.value).toBe('abcde');
            expect(el.value).toBe('abcde');
            expect(changes.at(-1)).toBe('abcde');
            expect(el.valid).toBe(true);
        });

        it('is not valid while a text the user has typed is shorter than minlength, and shows its error message', async () => {
            const el = await fixture(
                `<el-input-field name="length-min" label="Name" minlength="3" error-message="At least 3 characters"></el-input-field>`,
            );
            await frames();
            const input = el.querySelector('input');

            await userEvent.click(input);
            await userEvent.keyboard('ab');
            await userEvent.keyboard('{Tab}');
            await frames();

            // The validity of the control itself, as for required and for pattern.
            expect(input.validity.tooShort).toBe(true);
            expect(el.valid).toBe(false);
            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(el.querySelector('.error-message').textContent).toBe('At least 3 characters');
            expect(input.getAttribute('aria-describedby')).toContain(el.querySelector('.error-message').id);

            await userEvent.click(input);
            await userEvent.keyboard('c');
            await frames();

            expect(el.valid).toBe(true);
            expect(input.getAttribute('aria-invalid')).toBe('false');
        });

        it('keeps a form from being submitted while the text is too short', async () => {
            const form = await fixture(`
                <form>
                    <el-input-field name="length-form" label="Name" minlength="3"></el-input-field>
                    <button type="submit">Save</button>
                </form>
            `);
            await frames();
            let submitted = 0;
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submitted++;
            });

            await userEvent.click(form.querySelector('input'));
            await userEvent.keyboard('ab{Enter}');
            await frames();
            expect(submitted).toBe(0);

            await userEvent.keyboard('c{Enter}');
            await frames();
            expect(submitted).toBe(1);
            form.remove();
        });

        it('keeps the server-rendered input and its lengths when the element starts', async () => {
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(
                `<el-input-field name="length-ssr" maxlength="100" minlength="2">${serverMarkup({ name: 'length-ssr', maxlength: 100, minlength: 2 })}</el-input-field>`,
            );
            const el = wrapper.querySelector('el-input-field');
            const serverInput = el.querySelector('input');
            expect(lengthsOn(serverInput)).toEqual(['100', '2']);
            await frames();

            expect(el.querySelector('input')).toBe(serverInput);
            expect(lengthsOn(serverInput)).toEqual(['100', '2']);
            wrapper.remove();
        });
    });

    describe('content in its control', () => {
        const frames = async () => {
            await nextFrame();
            await nextFrame();
        };
        const icon = `<svg slot="start" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" /></svg>`;
        const field = async (name, children, attributes = '') => {
            const el = await fixture(
                `<el-input-field name="${name}" label="Price" ${attributes}>${children}</el-input-field>`,
            );
            await frames();
            return el;
        };
        const controlOf = (el) => el.querySelector(':scope > .field > .control');
        const box = (node) => node.getBoundingClientRect();
        // The markup of a server for a field with children: the template of an element that has
        // not started, turned into a string.
        const serverField = (name, children, attributes = '', properties = {}) => {
            const source = document.createElement('el-input-field');
            source.innerHTML = children;
            Object.assign(source, source.properties(), { name, label: 'Price', ...properties });
            return `<el-input-field name="${name}" label="Price" ${attributes}>${source.template().toString()}</el-input-field>`;
        };

        it('is its input alone, as before, without content and without the button that clears it', async () => {
            const el = await field('content-none', '');

            expect(controlOf(el)).toBe(null);
            expect(el.querySelector(':scope > .field > input')).not.toBe(null);
            expect(el.querySelector('.control-clear')).toBe(null);
        });

        it('takes an element for the start and one for the end into its control, around the input', async () => {
            const el = await field(
                'content-both',
                `<span slot="start" id="content-both-start">https://</span><span slot="end" id="content-both-end">.example</span>`,
            );
            const control = controlOf(el);
            const [start, input, end] = [
                el.querySelector('#content-both-start'),
                el.querySelector('input'),
                el.querySelector('#content-both-end'),
            ];

            expect(start.parentElement).toBe(control.querySelector('.control-start'));
            expect(end.parentElement).toBe(control.querySelector('.control-end'));
            expect(input.parentElement).toBe(control);
            // In a row, in the order of the reading direction, and the input under none of them.
            expect(box(start).right).toBeLessThanOrEqual(box(input).left);
            expect(box(input).right).toBeLessThanOrEqual(box(end).left);
            expect(box(start).left).toBeGreaterThanOrEqual(box(control).left);
            expect(box(end).right).toBeLessThanOrEqual(box(control).right);
            expect(box(input).width).toBeGreaterThan(40);
        });

        it('has one of the two without the other, and no room for the one that is not there', async () => {
            const el = await field('content-end', `<span slot="end">kg</span>`);
            const control = controlOf(el);

            expect(control.querySelector('.control-start').hidden).toBe(true);
            expect(box(control.querySelector('.control-start')).width).toBe(0);
            expect(control.querySelector('.control-end').hidden).toBe(false);
            expect(box(el.querySelector('input')).left).toBe(box(control).left);
        });

        it('moves the elements of the page and does not copy them, and leaves them and the input where they are when it renders again', async () => {
            const start = document.createElement('span');
            start.slot = 'start';
            start.textContent = '€';
            const el = document.createElement('el-input-field');
            el.setAttribute('name', 'content-same');
            el.setAttribute('label', 'Price');
            el.append(start);
            document.body.append(el);
            await frames();
            const input = el.querySelector('input');
            expect(start.parentElement).toBe(el.querySelector('.control-start'));

            el.label = 'Amount';
            el.helpMessage = 'Without tax';
            el.value = '12';
            await frames();

            expect(el.querySelector('[slot="start"]')).toBe(start);
            expect(el.querySelectorAll('[slot="start"]').length).toBe(1);
            expect(el.querySelector('input')).toBe(input);
            el.remove();
        });

        it('takes in an element that comes later with its next render, and gives up the place of one that has gone', async () => {
            const el = await field('content-later', `<span slot="end">kg</span>`);
            el.insertAdjacentHTML('beforeend', `<span slot="start" id="content-later-start">ca.</span>`);

            el.requestUpdate();
            await frames();
            expect(el.querySelector('#content-later-start').parentElement).toBe(el.querySelector('.control-start'));
            expect(el.querySelector('.control-start').hidden).toBe(false);

            el.querySelector('[slot="end"]').remove();
            el.requestUpdate();
            await frames();
            expect(el.querySelector('.control-end').hidden).toBe(true);
        });

        it('follows the reading direction: the start is at the right in a right-to-left page', async () => {
            const wrapper = await fixture(`
                <div dir="rtl">
                    <el-input-field name="content-rtl" label="Price">
                        <span slot="start" id="content-rtl-start">€</span><span slot="end" id="content-rtl-end">kg</span>
                    </el-input-field>
                </div>
            `);
            await frames();
            const [start, input, end] = ['#content-rtl-start', 'input', '#content-rtl-end'].map((selector) =>
                box(wrapper.querySelector(selector)),
            );

            expect(start.left).toBeGreaterThanOrEqual(input.right);
            expect(end.right).toBeLessThanOrEqual(input.left);
        });

        it('puts the focus into the input for a click on a text or on an icon in the control', async () => {
            const el = await field('content-click', `${icon}<span slot="end" id="content-click-end">kg</span>`);
            const input = el.querySelector('input');

            await userEvent.click(el.querySelector('#content-click-end'));
            expect(document.activeElement).toBe(input);

            input.blur();
            await userEvent.click(el.querySelector('svg[slot="start"]'));
            expect(document.activeElement).toBe(input);
        });

        it('leaves a button in the control its click and its stop of the Tab key', async () => {
            const el = await field(
                'content-button',
                `<button slot="end" type="button" id="content-button-copy">Copy</button>`,
                'value="abc"',
            );
            const [input, button] = [el.querySelector('input'), el.querySelector('#content-button-copy')];
            let clicks = 0;
            button.addEventListener('click', () => clicks++);

            await userEvent.click(button);
            expect(clicks).toBe(1);
            expect(document.activeElement).toBe(button);

            input.focus();
            await userEvent.keyboard('{Tab}');
            expect(document.activeElement).toBe(button);
            await userEvent.keyboard('{Enter}');
            expect(clicks).toBe(2);
        });

        it('describes the input with a text in its control, and with no icon and no button', async () => {
            const unit = await field(
                'content-unit',
                `${icon}<span slot="end">Euro</span>`,
                'help-message="Without tax"',
            );
            const input = unit.querySelector('input');

            // The unit first, then the messages of the field.
            expect(await accessibleDescription(input)).toBe('Euro Without tax');
            expect(input.getAttribute('aria-describedby').split(' ')).toEqual([
                unit.querySelector('.control-end').id,
                unit.querySelector('.help-message').id,
            ]);

            const button = await field(
                'content-described',
                `<button slot="end" type="button">Copy</button>`,
                'help-message="Your key"',
            );
            expect(await accessibleDescription(button.querySelector('input'))).toBe('Your key');
        });

        it('keeps the mark of its validity beside the control, not in it and not on the content at the end', async () => {
            const el = await field(
                'content-mark',
                `<span slot="end" id="content-mark-end">kg</span>`,
                'required="true"',
            );
            const input = el.querySelector('input');
            input.focus();
            input.blur();
            await frames();
            const mark = el.querySelector('.validity');

            expect(mark.parentElement).toBe(el.querySelector(':scope > .field'));
            expect(box(mark).left).toBeGreaterThanOrEqual(box(controlOf(el)).right);
            expect(box(el.querySelector('#content-mark-end')).right).toBeLessThanOrEqual(box(mark).left);
        });

        describe('the button that clears it', () => {
            const clearOf = (el) => el.querySelector('.control-clear');

            it('shows while the field has a value, empties it, reports that and leaves the focus in the input', async () => {
                const el = await field('clear-typed', '', 'clearable="true"');
                const input = el.querySelector('input');
                const changes = [];
                el.addEventListener('input-change', (event) => changes.push(event.detail));
                expect(clearOf(el).hidden).toBe(true);
                expect(box(clearOf(el)).width).toBe(0);

                await userEvent.click(input);
                await userEvent.keyboard('abc');
                await frames();
                expect(clearOf(el).hidden).toBe(false);
                expect(box(clearOf(el)).right).toBeLessThanOrEqual(box(controlOf(el)).right);
                expect(box(input).right).toBeLessThanOrEqual(box(clearOf(el)).left);

                await userEvent.click(clearOf(el));
                await frames();

                expect(input.value).toBe('');
                expect(el.value).toBe('');
                expect(changes.at(-1)).toBe('');
                expect(document.activeElement).toBe(input);
                expect(clearOf(el).hidden).toBe(true);
            });

            it('shows for a value the page has given the field, and is a button with a name the page can set', async () => {
                const el = await field('clear-named', '', 'clearable="true" value="Berlin"');
                const named = await field('clear-leeren', '', 'clearable="true" value="Bern" clear-label="Leeren"');

                expect(clearOf(el).hidden).toBe(false);
                expect(clearOf(el).localName).toBe('button');
                expect(clearOf(el).getAttribute('type')).toBe('button');
                expect(clearOf(el).getAttribute('aria-label')).toBe('Clear');
                expect(clearOf(named).getAttribute('aria-label')).toBe('Leeren');
            });

            it('is reached with the Tab key after the input, and clears with the keyboard', async () => {
                const el = await field('clear-keys', '', 'clearable="true" value="Berlin"');
                const input = el.querySelector('input');

                input.focus();
                await userEvent.keyboard('{Tab}');
                expect(document.activeElement).toBe(clearOf(el));
                await userEvent.keyboard('{Enter}');
                await frames();

                expect(el.value).toBe('');
                expect(document.activeElement).toBe(input);
            });

            it('is not there while the field is disabled, and not where the page has not asked for it', async () => {
                const disabled = await field('clear-disabled', '', 'clearable="true" value="Berlin" disabled="true"');
                const plain = await field('clear-plain', `<span slot="end">kg</span>`, 'value="12"');
                const off = await field('clear-off', '', 'clearable="false" value="12"');

                expect(clearOf(disabled).hidden).toBe(true);
                expect(clearOf(plain).hidden).toBe(true);
                expect(off.querySelector('.control')).toBe(null);
            });

            it('stands in front of the content at the end', async () => {
                const el = await field(
                    'clear-end',
                    `<span slot="end" id="clear-end-unit">kg</span>`,
                    'clearable="true" value="12"',
                );

                expect(box(clearOf(el)).right).toBeLessThanOrEqual(box(el.querySelector('#clear-end-unit')).left);
            });

            describe('on a touch screen', () => {
                useTouchScreen();

                it('is at least as large as a finger needs', async () => {
                    const wrapper = await fixture(`
                        <div style="--el-touch-target: 44px">
                            <el-input-field name="clear-touch" label="City" clearable="true" value="Berlin"></el-input-field>
                        </div>
                    `);
                    await frames();
                    const { width, height } = box(clearOf(wrapper.querySelector('el-input-field')));

                    expect(width).toBeGreaterThanOrEqual(44);
                    expect(height).toBeGreaterThanOrEqual(44);
                });
            });
        });

        it('has the content in its place in server-rendered markup, with the description of the input', () => {
            const wrapper = document.createElement('div');
            wrapper.setHTMLUnsafe(
                serverField('content-ssr-markup', `${icon}<span slot="end">Euro</span>`, '', {
                    helpMessage: 'Without tax',
                }),
            );
            const control = wrapper.querySelector('.control');
            const input = control.querySelector('input');

            expect(control.querySelector('.control-start > svg[slot="start"]')).not.toBe(null);
            expect(control.querySelector('.control-end > [slot="end"]').textContent).toBe('Euro');
            expect([...control.children].map((child) => child.className.split(' ').at(-1) || child.localName)).toEqual([
                'control-start',
                'input',
                'control-clear',
                'control-end',
            ]);
            expect(input.getAttribute('aria-describedby').split(' ')[0]).toBe(control.querySelector('.control-end').id);
            // A field without content is its input alone on a server as well.
            wrapper.setHTMLUnsafe(serverField('content-ssr-none', ''));
            expect(wrapper.querySelector('.control')).toBe(null);
            expect(wrapper.querySelector('.field > input')).not.toBe(null);
        });

        it('keeps the server-rendered control, its input and its content when the element starts, and nothing moves', async () => {
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(
                serverField(
                    'content-ssr-start',
                    `${icon}<span slot="end" id="content-ssr-unit">Euro</span>`,
                    'clearable="true"',
                    { clearable: true },
                ),
            );
            const el = wrapper.querySelector('el-input-field');
            const server = {
                control: el.querySelector('.control'),
                input: el.querySelector('input'),
                unit: el.querySelector('#content-ssr-unit'),
                icon: el.querySelector('svg[slot="start"]'),
            };
            const look = () =>
                Object.values(server).map((node) => {
                    const { left, top, width, height } = box(node);
                    return [left, top, width, height];
                });
            const before = look();
            const seen = [];
            for (let frame = 0; frame < 6; frame++) {
                await nextFrame();
                seen.push(look());
            }

            expect(el.matches(':state(connected)')).toBe(true);
            expect(el.querySelector('.control')).toBe(server.control);
            expect(el.querySelector('input')).toBe(server.input);
            expect(el.querySelector('#content-ssr-unit')).toBe(server.unit);
            expect(el.querySelector('svg[slot="start"]')).toBe(server.icon);
            expect(el.querySelectorAll('[slot]').length).toBe(2);
            for (const after of seen) expect(after).toEqual(before);
            // And the control works from there.
            await userEvent.click(server.unit);
            expect(document.activeElement).toBe(server.input);
            wrapper.remove();
        });

        it('has the button that clears it in server-rendered markup for a field with a value, and the button works once the element has started', async () => {
            const wrapper = document.createElement('div');
            document.body.append(wrapper);
            wrapper.setHTMLUnsafe(
                serverField('content-ssr-clear', '', 'clearable="true" value="Berlin"', {
                    clearable: true,
                    value: 'Berlin',
                }),
            );
            const el = wrapper.querySelector('el-input-field');
            const clear = el.querySelector('.control-clear');
            expect(clear.hidden).toBe(false);
            await frames();

            expect(el.querySelector('.control-clear')).toBe(clear);
            await userEvent.click(clear);
            await frames();

            expect(el.value).toBe('');
            expect(clear.hidden).toBe(true);
            wrapper.remove();
        });

        it('passes axe with content at both ends, with a button in it and with the button that clears it', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-input-field name="content-axe-search" label="Search" clearable="true" value="tea">${icon}</el-input-field>
                    <el-input-field name="content-axe-price" label="Price" help-message="Without tax"><span slot="end">Euro</span></el-input-field>
                    <el-input-field name="content-axe-key" label="Key" value="abc"><button slot="end" type="button">Copy</button></el-input-field>
                </div>
            `);
            await frames();

            const results = await axe.run(wrapper);

            expect(results.violations).toEqual([]);
        });
    });

    // The template has a place for the list of a combobox field and for the limits of a date field.
    it('has no attribute for a list, a limit or a step, in the page and in server-rendered markup', async () => {
        const el = await fixture(`<el-input-field name="plain-control" label="Name" type="number"></el-input-field>`);
        await nextFrame();

        for (const control of [el.querySelector('input'), serverControl({ name: 'plain-control' })]) {
            for (const name of ['list', 'min', 'max', 'step']) {
                expect([name, control.hasAttribute(name)]).toEqual([name, false]);
            }
        }
    });

    it('keeps the server-rendered input and its text entry attributes when the element starts', async () => {
        const wrapper = document.createElement('div');
        document.body.append(wrapper);
        wrapper.setHTMLUnsafe(
            `<el-input-field name="code" ${textEntryMarkup}>${serverMarkup({ name: 'code', ...TEXT_ENTRY, spellcheck: false })}</el-input-field>`,
        );
        const el = wrapper.querySelector('el-input-field');
        const serverInput = el.querySelector('input');
        await nextFrame();
        await nextFrame();

        expect(el.querySelector('input')).toBe(serverInput);
        expect(textEntryOn(serverInput)).toEqual(TEXT_ENTRY);

        el.setAttribute('enterkeyhint', 'go');
        await nextFrame();
        await nextFrame();
        expect(textEntryOn(serverInput)).toEqual({ ...TEXT_ENTRY, enterkeyhint: 'go' });
    });

    // The SSR renderer parses the attributes itself (0.4.0) and renders "1.50" as the number 1.5.
    // The element takes the attribute as text and corrects the input when it starts.
    it('puts the text of its value attribute into server-rendered markup that has the parsed number', async () => {
        const wrapper = document.createElement('div');
        document.body.append(wrapper);
        wrapper.setHTMLUnsafe(
            `<el-input-field name="ssr-price" value="1.50">${serverMarkup({ name: 'ssr-price', value: 1.5 })}</el-input-field>`,
        );
        const el = wrapper.querySelector('el-input-field');
        const serverInput = el.querySelector('input');
        expect(serverInput.value).toBe('1.5');
        await nextFrame();
        await nextFrame();

        expect(el.querySelector('input')).toBe(serverInput);
        expect(serverInput.value).toBe('1.50');
        expect(el.value).toBe('1.50');
    });

    describe('with the cross of a field that is not valid', () => {
        // Text that is no address, typed with real keys. Once the field was left it is touched and
        // not valid, and renders the cross.
        const withCross = async (name, attributes = '') => {
            const form = await fixture(`
                <form><el-input-field name="${name}" type="email" label="Mail" ${attributes}></el-input-field></form>
            `);
            const el = form.firstElementChild;
            const input = el.querySelector('input');
            await userEvent.click(input);
            await userEvent.keyboard('abc');
            input.blur();
            await nextFrame();
            await nextFrame();
            const changes = [];
            el.addEventListener('input-change', (event) => changes.push(event.detail));
            return { form, el, input, changes };
        };
        const state = ({ form, el, input }) => ({
            control: input.value,
            value: el.value,
            submitted: new FormData(form).get(el.name),
            valid: el.valid,
            touched: el.touched,
        });
        const clear = async ({ el }, how) => {
            if (how === 'a click on the cross') await userEvent.click(el.querySelector('[data-clear-input]'));
            else el.clearInput();
            await nextFrame();
            await nextFrame();
        };

        for (const how of ['a click on the cross', 'clearInput()']) {
            it(`empties the control and the value of the field, and reports it, with ${how}`, async () => {
                const field = await withCross(`cross-${how.length}`);
                expect(state(field)).toEqual({
                    control: 'abc',
                    value: 'abc',
                    submitted: 'abc',
                    valid: false,
                    touched: true,
                });

                await clear(field, how);

                // No address is required, so the empty field is valid.
                expect(state(field)).toEqual({ control: '', value: '', submitted: '', valid: true, touched: false });
                expect(field.changes).toEqual(['']);
                expect(document.activeElement).toBe(field.input);
            });
        }

        it('leaves a required field not valid, and without its mark', async () => {
            const field = await withCross('cross-required', 'required="true"');

            await clear(field, 'a click on the cross');

            expect(state(field)).toEqual({ control: '', value: '', submitted: '', valid: false, touched: false });
            expect(field.el.querySelector('.validity')).toBeNull();
        });
    });

    describe('with text that goes into the middle of its value', () => {
        const caret = (input) => [input.selectionStart, input.selectionEnd];
        const withCaretAfterHello = async (name) => {
            const el = await fixture(
                `<el-input-field name="${name}" label="Greeting" value="Hello world"></el-input-field>`,
            );
            await nextFrame();
            const input = el.querySelector('input');
            input.focus();
            input.setSelectionRange(5, 5);
            return { el, input };
        };

        it('keeps the caret where it is while keys are typed', async () => {
            const { el, input } = await withCaretAfterHello('caret-keys');

            await userEvent.keyboard('XY');
            await nextFrame();
            await nextFrame();

            expect(input.value).toBe('HelloXY world');
            expect(el.value).toBe('HelloXY world');
            expect(caret(input)).toEqual([7, 7]);
        });

        it('keeps the caret where it is when two characters come within one frame', async () => {
            const { el, input } = await withCaretAfterHello('caret-frame');

            // Fast typing, a key that repeats, a script that types: the field has seen the second
            // character before it has rendered for the first.
            for (const character of ['X', 'Y']) {
                input.setRangeText(character, input.selectionStart, input.selectionEnd, 'end');
                input.dispatchEvent(new InputEvent('input', { bubbles: true }));
                input.dispatchEvent(new KeyboardEvent('keyup', { key: character, bubbles: true }));
            }
            await nextFrame();
            await nextFrame();

            expect(input.value).toBe('HelloXY world');
            expect(el.value).toBe('HelloXY world');
            expect(caret(input)).toEqual([7, 7]);
        });

        it('keeps text that no key brought when the field renders for another reason', async () => {
            const { el, input } = await withCaretAfterHello('caret-render');

            // A paste with the mouse: the input has the text, and the field does not know it yet.
            input.setRangeText(', dear', 5, 5, 'end');
            input.dispatchEvent(new InputEvent('input', { bubbles: true }));
            el.label = 'Salutation';
            await nextFrame();
            await nextFrame();

            expect(el.querySelector('label').textContent.trim()).toBe('Salutation');
            expect(input.value).toBe('Hello, dear world');
            expect(caret(input)).toEqual([11, 11]);
        });
    });

    // The control for a date or a time drops what the user has entered so far when its value is
    // written, with the same text as well. A field without a value used to take the empty control as
    // the value '' after the first key, and the next render wrote that to the control: the key was
    // gone. Typed in one go there is no render between two keys, and nothing shows.
    describe('with a control for a date or a time', () => {
        const changesOf = (el) => {
            const changes = [];
            el.addEventListener('input-change', (event) => changes.push(event.detail));
            return changes;
        };
        // Key by key, with a render between two keys: the pace of a person. The keys go to the parts
        // of the control in the order of the language of the browser, month, day and year here.
        const typeSlowly = async (el, keys) => {
            el.querySelector('input').focus();
            for (const key of keys) {
                await userEvent.keyboard(key);
                await nextFrame();
                await nextFrame();
            }
        };

        it('keeps every key of a date that is typed key by key', async () => {
            const el = await fixture(`<el-input-field name="slow-date" label="Birthday" type="date"></el-input-field>`);

            await typeSlowly(el, '11152026');

            expect([el.querySelector('input').value, el.value]).toEqual(['2026-11-15', '2026-11-15']);
        });

        it('keeps every key of a time that is typed key by key', async () => {
            const el = await fixture(`<el-input-field name="slow-time" label="Pick-up" type="time"></el-input-field>`);

            // Without its first key the hour would be 1, and the second 1 the start of the minutes.
            await typeSlowly(el, '1130P');

            expect([el.querySelector('input').value, el.value]).toEqual(['23:30', '23:30']);
        });

        it('has no value, and reports none, while a date is half entered', async () => {
            const el = await fixture(`<el-input-field name="half-date" label="Birthday" type="date"></el-input-field>`);
            const changes = changesOf(el);

            await typeSlowly(el, '1115');

            expect([el.querySelector('input').value, el.value]).toEqual(['', null]);
            expect(el.querySelector('input').hasAttribute('value')).toBe(false);
            expect(changes).toEqual([]);
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(`<form><el-input-field name="${name}" label="Email" ${attributes}></el-input-field></form>`);

        // The field goes back a task after the event, and its control with the render after that.
        const reset = async (form) => {
            form.reset();
            await aTimeout(0);
            await nextFrame();
            await nextFrame();
        };

        it('submits its value under its name', async () => {
            const form = await inForm('form-value', 'value="ada@example.com"');
            expect(data(form)).toEqual({ 'form-value': 'ada@example.com' });
        });

        it('submits a value that a script sets, and one that the user types', async () => {
            const form = await inForm('form-change', 'value="ada@example.com"');
            const el = form.firstElementChild;

            el.value = 'grace@example.com';
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'grace@example.com' });

            const control = el.querySelector('input');
            control.value = 'joan@example.com';
            control.dispatchEvent(new Event('change', { bubbles: true }));
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'joan@example.com' });
            expect(el.value).toBe('joan@example.com');
        });

        it('shows and submits a value that a script sets after the user has typed', async () => {
            const form = await inForm('form-after-typing', 'value="first"');
            const el = form.firstElementChild;
            const control = el.querySelector('input');
            control.focus();
            control.setSelectionRange(5, 5);
            await userEvent.keyboard('x');
            await nextFrame();
            await nextFrame();
            expect([control.value, el.value]).toEqual(['firstx', 'firstx']);

            // The value attribute of the input is its default, which the browser no longer shows now.
            el.value = 'outside';
            await nextFrame();
            await nextFrame();

            expect(control.value).toBe('outside');
            expect(data(form)).toEqual({ 'form-after-typing': 'outside' });
            expect(el.value).toBe('outside');

            // And the user goes on from there.
            await userEvent.keyboard('!');
            await nextFrame();
            await nextFrame();
            expect([control.value, el.value]).toEqual(['outside!', 'outside!']);
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="ada@example.com" disabled="true"');
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and empty', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.firstElementChild.value = 'ada@example.com';
            await nextFrame();
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });

        it('goes back to the state it was rendered with when the form is reset', async () => {
            const form = await inForm(
                'form-reset',
                'value="ada@example.com" required="true" error-message="Enter an email address"',
            );
            const el = form.firstElementChild;
            const control = el.querySelector('input');
            const state = () => ({
                control: control.value,
                value: el.value,
                submitted: new FormData(form).get('form-reset'),
                touched: el.touched,
                valid: el.valid,
                message: el.querySelector('.error-message')?.textContent.trim() ?? null,
            });
            // A field that is rendered with a value is touched from the start.
            const rendered = {
                control: 'ada@example.com',
                value: 'ada@example.com',
                submitted: 'ada@example.com',
                touched: true,
                valid: true,
                message: null,
            };
            expect(state()).toEqual(rendered);

            await userEvent.click(control);
            control.select();
            await userEvent.keyboard('{Backspace}');
            control.blur();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({
                control: '',
                value: '',
                submitted: '',
                touched: true,
                valid: false,
                message: 'Enter an email address',
            });

            await reset(form);

            expect(state()).toEqual(rendered);
        });

        it('is empty and not touched after a reset when it was rendered so', async () => {
            const form = await inForm('form-reset-empty', 'required="true" error-message="Enter an email address"');
            const el = form.firstElementChild;
            const control = el.querySelector('input');
            const state = () => ({
                control: control.value,
                value: el.value,
                touched: el.touched,
                valid: el.valid,
                message: el.querySelector('.error-message')?.textContent.trim() ?? null,
            });
            const rendered = { control: '', value: null, touched: false, valid: true, message: null };
            expect(state()).toEqual(rendered);

            await userEvent.click(control);
            await userEvent.keyboard('grace');
            control.blur();
            await nextFrame();
            await nextFrame();
            expect(state()).toEqual({ control: 'grace', value: 'grace', touched: true, valid: true, message: null });

            await reset(form);

            expect(state()).toEqual(rendered);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        const touchedField = async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-input-field name="email" label="Email"></el-input-field></div>
            `);
            const el = wrapper.querySelector('el-input-field');
            el.touched = true;
            await nextFrame();
            await nextFrame();
            return el;
        };

        it('makes the input at least --el-touch-target high', async () => {
            const el = await touchedField();
            expect(sizeOf(el.querySelector('input')).height).toBeGreaterThanOrEqual(44);
        });

        it('makes the clear cross at least --el-touch-target in both directions', async () => {
            const el = await touchedField();
            el.valid = false;
            await nextFrame();
            await nextFrame();
            const { width, height } = sizeOf(el.querySelector('[data-clear-input]'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });

        it('keeps the width of the input when the validity changes', async () => {
            const el = await touchedField();
            // As a theme does: the input takes the room that the mark beside it leaves.
            el.querySelector('input').style.width = '100%';
            const whileValid = sizeOf(el.querySelector('input')).width;
            el.valid = false;
            await nextFrame();
            await nextFrame();
            expect(sizeOf(el.querySelector('input')).width).toBe(whileValid);
        });
    });
});
