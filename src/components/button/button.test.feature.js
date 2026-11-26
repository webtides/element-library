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
    sizeOf,
    useForcedColors,
    useTouchScreen,
} from '../../test-helpers.js';
import Button, { define } from './button.js';
import { define as defineGroup } from '../button-group/button-group.js';
define();
defineGroup();

describe('Feature | Button', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-button>Click me</el-button>`);
        await nextFrame();
    });

    it('renders a native button by default', async () => {
        const el = await fixture(`<el-button>Click me</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.tagName).toBe('BUTTON');
        expect(control.getAttribute('type')).toBe('button');
    });

    it('renders an anchor when href is set', async () => {
        const el = await fixture(`<el-button href="https://example.com">Go</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.tagName).toBe('A');
        expect(control.getAttribute('href')).toBe('https://example.com');
        expect(control.getAttribute('role')).toBe('button');
    });

    it('reflects the disabled state onto the native button', async () => {
        const el = await fixture(`<el-button disabled="true">Nope</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.disabled).toBe(true);
    });

    it('drops href and disables the anchor while disabled', async () => {
        const el = await fixture(`<el-button href="https://example.com" disabled="true">Go</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(control.hasAttribute('href')).toBe(false);
        expect(control.getAttribute('aria-disabled')).toBe('true');
        expect(control.getAttribute('tabindex')).toBe('-1');
    });

    it('renders a spinner while loading', async () => {
        const el = await fixture(`<el-button loading="true">Saving</el-button>`);
        expect(el.shadowRoot.querySelector('[part="spinner"]')).not.toBeNull();
    });

    it('submits the nearest form when type=submit', async () => {
        const form = await fixture(`<form><el-button type="submit">Send</el-button></form>`);
        let submitted = false;
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            submitted = true;
        });
        const button = form.querySelector('el-button');
        button.shadowRoot.querySelector('[part="base"]').click();
        await nextFrame();
        expect(submitted).toBe(true);
    });

    // For the platform an attribute that is there disables a form-associated element, whatever it
    // says, and the browser keeps every click from it. So the attribute follows the property.
    describe('the disabled attribute', () => {
        const control = (el) => el.shadowRoot.querySelector('[part="base"]');
        const clicksOn = (el) => {
            const clicks = [];
            el.addEventListener('click', (event) => clicks.push(event));
            return clicks;
        };

        for (const [how, markup] of [
            ['disabled="false"', `<el-button disabled="false">Save</el-button>`],
            ['an attribute without a value', `<el-button disabled>Save</el-button>`],
        ]) {
            it(`takes ${how} off the element, which is not disabled`, async () => {
                const el = await fixture(markup);
                const clicks = clicksOn(el);

                expect(el.hasAttribute('disabled')).toBe(false);
                expect(el.disabled).toBe(false);
                expect(el.matches(':disabled')).toBe(false);
                expect(control(el).disabled).toBe(false);

                await userEvent.click(el);
                expect(clicks).toHaveLength(1);
            });
        }

        it('takes disabled="false" off when it is written again', async () => {
            const el = await fixture(`<el-button>Save</el-button>`);
            const clicks = clicksOn(el);

            el.setAttribute('disabled', 'false');
            expect(el.hasAttribute('disabled')).toBe(false);
            await nextFrame();

            await userEvent.click(el);
            expect(clicks).toHaveLength(1);
        });

        it('has the attribute while a script has disabled it, and not after', async () => {
            const el = await fixture(`<el-button>Save</el-button>`);

            el.disabled = true;
            await nextFrame();
            expect(el.getAttribute('disabled')).toBe('true');
            expect(el.matches(':disabled')).toBe(true);
            expect(control(el).disabled).toBe(true);

            // The attribute goes at once, the render follows the report of that.
            el.disabled = false;
            expect(el.hasAttribute('disabled')).toBe(false);
            expect(el.matches(':disabled')).toBe(false);
            await nextFrame();
            await nextFrame();
            expect(el.disabled).toBe(false);
            expect(control(el).disabled).toBe(false);
        });

        it('is enabled by a script after it was rendered with disabled="true"', async () => {
            const el = await fixture(`<el-button disabled="true">Save</el-button>`);
            const clicks = clicksOn(el);
            expect(el.matches(':disabled')).toBe(true);

            el.disabled = false;
            await nextFrame();
            await nextFrame();
            expect(el.hasAttribute('disabled')).toBe(false);
            expect(el.disabled).toBe(false);
            expect(control(el).disabled).toBe(false);

            await userEvent.click(el);
            expect(clicks).toHaveLength(1);
        });

        it('follows the attribute that a script sets and removes', async () => {
            const el = await fixture(`<el-button>Save</el-button>`);

            el.setAttribute('disabled', 'true');
            await nextFrame();
            await nextFrame();
            expect(el.disabled).toBe(true);
            expect(control(el).disabled).toBe(true);

            el.removeAttribute('disabled');
            await nextFrame();
            await nextFrame();
            expect(el.disabled).toBe(false);
            expect(el.hasAttribute('disabled')).toBe(false);
            expect(control(el).disabled).toBe(false);
        });
    });

    describe('in a disabled fieldset', () => {
        const control = (el) => el.shadowRoot.querySelector('[part="base"]');
        const inFieldset = async (buttons, disabled = true) => {
            const form = await fixture(`
                <form>
                    <fieldset ${disabled ? 'disabled' : ''}>
                        <input name="q" />
                        ${buttons}
                    </fieldset>
                </form>
            `);
            const submits = [];
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits.push(event);
            });
            return { form, fieldset: form.querySelector('fieldset'), submits };
        };

        it('is disabled as a native button is, and painted so', async () => {
            const { form } = await inFieldset(`<el-button>Plain</el-button><button type="button">Native</button>`);
            const el = form.querySelector('el-button');

            expect(el.matches(':disabled')).toBe(true);
            expect(control(el).disabled).toBe(true);
            // The look of a disabled button.
            expect(getComputedStyle(control(el)).cursor).toBe('not-allowed');
            // Its own property says what the page has set, as the one of a native button does.
            expect(el.disabled).toBe(false);
            expect(form.querySelector('button').disabled).toBe(false);
            expect(el.hasAttribute('disabled')).toBe(false);
        });

        it('fires no click, does not submit and does not take the focus', async () => {
            const { form, submits } = await inFieldset(`
                <el-button>Plain</el-button>
                <el-button type="submit">Save</el-button>
            `);
            const [plain, submit] = form.querySelectorAll('el-button');
            const clicks = [];
            form.addEventListener('click', (event) => clicks.push(event.target));

            await userEvent.click(plain, { force: true });
            await userEvent.click(submit, { force: true });
            submit.click();
            await aTimeout(0);

            expect(clicks.filter((target) => target.localName === 'el-button')).toEqual([]);
            expect(submits).toHaveLength(0);

            plain.focus();
            expect(plain.shadowRoot.activeElement).toBe(null);
        });

        it('is enabled again with the fieldset', async () => {
            const { form, fieldset, submits } = await inFieldset(`<el-button type="submit">Save</el-button>`);
            const el = form.querySelector('el-button');

            fieldset.disabled = false;
            await nextFrame();
            expect(el.matches(':disabled')).toBe(false);
            expect(control(el).disabled).toBe(false);

            await userEvent.click(el);
            expect(submits).toHaveLength(1);

            fieldset.disabled = true;
            await nextFrame();
            expect(control(el).disabled).toBe(true);
        });

        it('stays disabled by the fieldset when its own disabled goes', async () => {
            const { form, fieldset } = await inFieldset(`<el-button disabled="true">Save</el-button>`);
            const el = form.querySelector('el-button');

            el.disabled = false;
            await nextFrame();
            await nextFrame();
            expect(el.disabled).toBe(false);
            expect(control(el).disabled).toBe(true);

            fieldset.disabled = false;
            await nextFrame();
            expect(control(el).disabled).toBe(false);
        });

        it('stays disabled by its own disabled when the fieldset is enabled', async () => {
            const { form, fieldset } = await inFieldset(`<el-button disabled="true">Save</el-button>`);
            const el = form.querySelector('el-button');

            fieldset.disabled = false;
            await nextFrame();
            expect(el.disabled).toBe(true);
            expect(control(el).disabled).toBe(true);
        });

        it('disables a link button as its own disabled does', async () => {
            const { form } = await inFieldset(`<el-button href="https://example.com">Go</el-button>`);
            const link = control(form.querySelector('el-button'));

            expect(link.hasAttribute('href')).toBe(false);
            expect(link.getAttribute('aria-disabled')).toBe('true');
            expect(link.getAttribute('tabindex')).toBe('-1');
        });
    });

    // A form is submitted with a submit button that belongs to it. The control of the element is in
    // the shadow root and has no form, so a button of the type `submit` submits with a hidden native
    // submit button in its content, in the page. It makes that button when the form is first
    // submitted with it.
    describe('as the submit button of a form', () => {
        const submitterOf = (el) => el.querySelector(':scope > button[type="submit"]');
        const listen = (form) => {
            const submits = [];
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits.push({
                    submitter: event.submitter,
                    data: Object.fromEntries(new FormData(form, event.submitter)),
                });
            });
            return submits;
        };

        it('is the submitter, with its name and value in the data of the form', async () => {
            const form = await fixture(`
                <form>
                    <input name="q" value="1" />
                    <el-button type="submit" name="action" value="save">Save</el-button>
                    <el-button type="submit" name="action" value="delete">Delete</el-button>
                </form>
            `);
            const submits = listen(form);
            const [save, remove] = form.querySelectorAll('el-button');

            await userEvent.click(save);
            await userEvent.click(remove);

            expect(submits.map(({ data }) => data)).toEqual([
                { q: '1', action: 'save' },
                { q: '1', action: 'delete' },
            ]);
            // The submitter is the native button of the element.
            expect(submits[0].submitter).toBe(submitterOf(save));
            expect(submits[0].submitter.closest('el-button')).toBe(save);
            expect(submits[1].submitter.closest('el-button')).toBe(remove);
        });

        it('submits a name and a value that a script sets', async () => {
            const form = await fixture(`<form><el-button type="submit">Save</el-button></form>`);
            const submits = listen(form);
            const el = form.querySelector('el-button');

            el.name = 'action';
            el.value = 'publish';
            await nextFrame();
            await userEvent.click(el);
            expect(submits[0].data).toEqual({ action: 'publish' });

            el.name = '';
            await nextFrame();
            await userEvent.click(el);
            expect(submits[1].data).toEqual({});
        });

        it('submits its value as it is written, text that reads as a number included', async () => {
            const form = await fixture(`
                <form>
                    <el-button type="submit" name="price" value="1.50">One fifty</el-button>
                    <el-button type="submit" name="count" value="0">None</el-button>
                </form>
            `);
            const submits = listen(form);
            const [price, count] = form.querySelectorAll('el-button');
            expect([price.value, count.value]).toEqual(['1.50', '0']);

            await userEvent.click(price);
            await userEvent.click(count);
            // A number that a script sets is submitted as its text.
            count.value = 0;
            await nextFrame();
            await userEvent.click(count);

            expect(submits.map(({ data }) => data)).toEqual([{ price: '1.50' }, { count: '0' }, { count: '0' }]);
        });

        it('submits the form that its form attribute names, from outside of it', async () => {
            const wrapper = await fixture(`
                <div>
                    <form id="button-form-outside"><input name="q" value="1" /></form>
                    <form id="button-form-around">
                        <el-button type="submit" form="button-form-outside" name="action" value="outside">Save</el-button>
                    </form>
                </div>
            `);
            const [named, around] = wrapper.querySelectorAll('form');
            const submits = listen(named);
            const others = listen(around);

            await userEvent.click(wrapper.querySelector('el-button'));

            expect(submits.map(({ data }) => data)).toEqual([{ q: '1', action: 'outside' }]);
            expect(others).toHaveLength(0);
        });

        it('submits a form that is not valid with formnovalidate, and not without', async () => {
            const form = await fixture(`
                <form>
                    <input name="q" required />
                    <el-button type="submit" formnovalidate>Cancel</el-button>
                    <el-button type="submit">Save</el-button>
                </form>
            `);
            const submits = listen(form);
            const [cancel, save] = form.querySelectorAll('el-button');

            await userEvent.click(save);
            expect(submits).toHaveLength(0);

            await userEvent.click(cancel);
            expect(submits).toHaveLength(1);

            // An attribute that comes later counts as well.
            save.setAttribute('formnovalidate', '');
            await nextFrame();
            await userEvent.click(save);
            expect(submits).toHaveLength(2);
        });

        it('hands on what the button says for its submit', async () => {
            const form = await fixture(`
                <form method="post" action="/default">
                    <el-button
                        type="submit"
                        formaction="/other"
                        formmethod="get"
                        formenctype="multipart/form-data"
                        formtarget="_blank"
                        >Save</el-button
                    >
                </form>
            `);
            const submits = listen(form);

            await userEvent.click(form.querySelector('el-button'));
            const { submitter } = submits[0];

            expect(submitter.formAction).toBe(new URL('/other', location.href).href);
            expect(submitter.formMethod).toBe('get');
            expect(submitter.formEnctype).toBe('multipart/form-data');
            expect(submitter.formTarget).toBe('_blank');
        });

        describe('Enter in a field', () => {
            const twoFields = (button) =>
                fixture(`
                    <form>
                        <input name="first" value="1" />
                        <input name="second" value="2" />
                        ${button}
                    </form>
                `);
            const pressEnterIn = async (form) => {
                form.querySelector('input').focus();
                await userEvent.keyboard('{Enter}');
            };

            it('submits a form with several fields, with the button as the submitter', async () => {
                const form = await twoFields(`<el-button type="submit" name="action" value="save">Save</el-button>`);
                const submits = listen(form);

                await pressEnterIn(form);

                expect(submits).toHaveLength(1);
                expect(submits[0].data).toEqual({ first: '1', second: '2', action: 'save' });
                expect(submits[0].submitter.closest('el-button')).toBe(form.querySelector('el-button'));
            });

            it('does not submit while the button is disabled or loading, as with a native button', async () => {
                const form = await twoFields(`<el-button type="submit" disabled="true">Save</el-button>`);
                const submits = listen(form);
                const el = form.querySelector('el-button');

                await pressEnterIn(form);
                expect(submits).toHaveLength(0);

                el.disabled = false;
                el.loading = true;
                await nextFrame();
                await nextFrame();
                await pressEnterIn(form);
                expect(submits).toHaveLength(0);

                el.loading = false;
                await nextFrame();
                await pressEnterIn(form);
                expect(submits).toHaveLength(1);
            });

            it('does not submit for a button of another type', async () => {
                const form = await twoFields(`<el-button>Save</el-button><el-button type="reset">Reset</el-button>`);
                const submits = listen(form);

                await pressEnterIn(form);
                expect(submits).toHaveLength(0);
            });

            it('submits from a field outside of the form, which names the form', async () => {
                const wrapper = await fixture(`
                    <div>
                        <form id="button-form-enter-outside">
                            <input name="first" value="1" />
                            <el-button type="submit" name="action" value="save">Save</el-button>
                        </form>
                        <input name="second" value="2" form="button-form-enter-outside" />
                    </div>
                `);
                const submits = listen(wrapper.querySelector('form'));

                wrapper.querySelector('div > input').focus();
                await userEvent.keyboard('{Enter}');

                expect(submits.map(({ data }) => data)).toEqual([{ first: '1', second: '2', action: 'save' }]);
            });

            // Enter in a textarea is a line break. The browser does not submit, and the button has
            // no reason to change its content.
            it('leaves the content of the button alone for Enter in a textarea, and in another form', async () => {
                const wrapper = await fixture(`
                    <div>
                        <form>
                            <textarea name="text"></textarea>
                            <el-button type="submit">Save</el-button>
                        </form>
                        <form><input name="a" /><input name="b" /></form>
                    </div>
                `);
                const el = wrapper.querySelector('el-button');

                wrapper.querySelector('textarea').focus();
                await userEvent.keyboard('{Enter}');
                wrapper.querySelector('input').focus();
                await userEvent.keyboard('{Enter}');

                expect(wrapper.querySelector('textarea').value).toBe('\n');
                expect(el.children).toHaveLength(0);
            });
        });

        describe('the native submit button', () => {
            // A framework that hydrates a server-rendered page expects the children it rendered,
            // and no other: Svelte gives up the hydration for a child it does not know and renders
            // the page again. The element can have started by then.
            it('is not there until the form is submitted with the button', async () => {
                const form = await fixture(`
                    <form>
                        <input name="a" /><input name="b" />
                        <el-button type="submit" name="action" value="save"><svg slot="prefix"></svg>Save</el-button>
                    </form>
                `);
                const submits = listen(form);
                const el = form.querySelector('el-button');
                const written = [...el.childNodes];
                const sameNodes = (nodes, expected) =>
                    nodes.length === expected.length && nodes.every((node, index) => node === expected[index]);

                // What makes the button render does not make it change its content.
                el.loading = true;
                el.value = 'publish';
                await nextFrame();
                await nextFrame();
                el.loading = false;
                await nextFrame();
                await nextFrame();
                expect(sameNodes([...el.childNodes], written)).toBe(true);
                expect(submitterOf(el)).toBe(null);

                await userEvent.click(el);
                expect(submits.map(({ data }) => data)).toEqual([{ a: '', b: '', action: 'publish' }]);
                expect(sameNodes([...el.childNodes], [...written, submitterOf(el)])).toBe(true);
            });

            it('is one, hidden, and no part of what the button shows or says', async () => {
                const style = document.createElement('style');
                // A reset or a rule of the page for buttons.
                style.textContent = `button { display: inline-block; } [hidden] { display: revert; }`;
                document.head.append(style);

                const form = await fixture(`<form><el-button type="submit">Save</el-button></form>`);
                listen(form);
                const el = form.querySelector('el-button');
                await userEvent.click(el);
                await userEvent.click(el);
                const submitter = submitterOf(el);
                await nextFrame();

                expect(el.querySelectorAll('button')).toHaveLength(1);
                expect(submitter.hidden).toBe(true);
                expect(getComputedStyle(submitter).display).toBe('none');
                expect(await accessibleName(el.shadowRoot.querySelector('[part="base"]'))).toBe('Save');
                expect(el.textContent.trim()).toBe('Save');
                style.remove();

                const results = await axe.run(form);
                expect(results.violations.map((violation) => violation.id)).toEqual([]);
            });

            it('is made for the type submit only, and goes with the type', async () => {
                const form = await fixture(`
                    <form>
                        <input name="a" /><input name="b" />
                        <el-button>Plain</el-button>
                        <el-button type="reset">Reset</el-button>
                        <el-button type="submit" href="https://example.com">Link</el-button>
                        <el-button type="submit">Save</el-button>
                    </form>
                `);
                listen(form);
                const [plain, reset, link, submit] = form.querySelectorAll('el-button');
                const pressEnter = async () => {
                    form.querySelector('input').focus();
                    await userEvent.keyboard('{Enter}');
                };

                await pressEnter();
                expect([plain, reset, link, submit].map((el) => !!submitterOf(el))).toEqual([
                    false,
                    false,
                    false,
                    true,
                ]);

                submit.type = 'button';
                plain.type = 'submit';
                await nextFrame();
                await nextFrame();
                expect([plain, submit].map((el) => !!submitterOf(el))).toEqual([false, false]);

                await pressEnter();
                expect([plain, submit].map((el) => !!submitterOf(el))).toEqual([true, false]);

                plain.href = 'https://example.com';
                await nextFrame();
                await nextFrame();
                expect(!!submitterOf(plain)).toBe(false);
            });

            it('is made again when the page has replaced the content of the button', async () => {
                const form = await fixture(`
                    <form><input name="a" /><input name="b" /><el-button type="submit">Save</el-button></form>
                `);
                const submits = listen(form);
                const el = form.querySelector('el-button');
                await userEvent.click(el);

                el.textContent = 'Saved';
                await nextFrame();
                await nextFrame();
                expect(el.querySelectorAll('button')).toHaveLength(0);

                form.querySelector('input').focus();
                await userEvent.keyboard('{Enter}');
                expect(submits).toHaveLength(2);
                expect(el.querySelectorAll('button')).toHaveLength(1);
            });

            it('is made again for a click, without a render in between', async () => {
                const form = await fixture(
                    `<form><el-button type="submit" name="action" value="save">Save</el-button></form>`,
                );
                const submits = listen(form);
                const el = form.querySelector('el-button');

                el.click();
                el.textContent = 'Saved';
                el.click();

                expect(submits.map(({ data }) => data)).toEqual([{ action: 'save' }, { action: 'save' }]);
            });

            it('takes the one that the page has written, or that was copied with the button', async () => {
                const form = await fixture(`
                    <form>
                        <el-button type="submit" name="action" value="save">Save<button type="submit" hidden></button></el-button>
                    </form>
                `);
                const el = form.querySelector('el-button');
                const written = el.querySelector('button');

                expect(el.querySelectorAll('button')).toHaveLength(1);
                expect(submitterOf(el)).toBe(written);
                expect([written.name, written.value]).toEqual(['action', 'save']);

                const copy = el.cloneNode(true);
                form.append(copy);
                await nextFrame();
                await nextFrame();
                expect(copy.querySelectorAll('button')).toHaveLength(1);
            });
        });

        it('lists the button in the elements of its form', async () => {
            const form = await fixture(`<form><el-button id="button-listed">Plain</el-button></form>`);
            expect([...form.elements]).toContain(form.querySelector('el-button'));
        });
    });

    describe('as the reset button of a form', () => {
        it('resets the nearest form, or the one that its form attribute names', async () => {
            const wrapper = await fixture(`
                <div>
                    <form id="button-form-reset"><input name="q" value="1" /><el-button type="reset">Reset</el-button></form>
                    <el-button type="reset" form="button-form-reset">Reset from outside</el-button>
                </div>
            `);
            const input = wrapper.querySelector('input');
            const [inside, outside] = wrapper.querySelectorAll('el-button');

            input.value = 'changed';
            await userEvent.click(inside);
            expect(input.value).toBe('1');

            input.value = 'changed';
            await userEvent.click(outside);
            expect(input.value).toBe('1');
        });
    });

    // A native button acts once every listener has had the click, and not when one of them has
    // prevented it. The control of the button is in the shadow root, where its own listener is the
    // first to have the click: before the listeners of the page.
    describe('a click that a listener of the page has its say on', () => {
        const inForm = (type) =>
            fixture(`
                <form>
                    <input name="q" value="1" />
                    <el-button type="${type}" name="action" value="go"><span>Go</span></el-button>
                </form>
            `);
        // What a click does to the form: the submits and the resets it starts.
        const watch = (form) => {
            const seen = { submit: 0, reset: 0, data: [] };
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                seen.submit++;
                seen.data.push(Object.fromEntries(new FormData(form, event.submitter)));
            });
            form.addEventListener('reset', () => seen.reset++);
            return seen;
        };
        const prevent = (event) => event.preventDefault();

        for (const type of ['submit', 'reset']) {
            for (const [where, targetOf] of [
                ['on the button', (form) => form.querySelector('el-button')],
                ['on an element in the button', (form) => form.querySelector('span')],
                ['on an element around the button', (form) => form],
                ['on the window', () => window],
            ]) {
                it(`does not ${type} after a listener ${where} has prevented it`, async () => {
                    const form = await inForm(type);
                    const seen = watch(form);
                    const target = targetOf(form);

                    target.addEventListener('click', prevent);
                    try {
                        await userEvent.click(form.querySelector('el-button'));
                        await aTimeout(0);
                        expect(seen[type]).toBe(0);
                    } finally {
                        target.removeEventListener('click', prevent);
                    }

                    // Without the listener the button acts, and once.
                    await userEvent.click(form.querySelector('el-button'));
                    await aTimeout(0);
                    expect(seen[type]).toBe(1);
                });
            }

            // A caller of `click()` reads what it has done right after it, as with a native button.
            it(`does ${type} inside of the click`, async () => {
                const form = await inForm(type);
                const seen = watch(form);

                form.querySelector('el-button').click();

                expect(seen[type]).toBe(1);
                await aTimeout(0);
                expect(seen[type]).toBe(1);
            });

            // A listener that stops the click keeps it from the elements further up, not from the
            // button: a native button acts all the same.
            it(`does ${type} after a listener has stopped the click, and not after it has prevented it as well`, async () => {
                const form = await inForm(type);
                const seen = watch(form);
                const el = form.querySelector('el-button');
                const stop = (event) => event.stopPropagation();

                el.addEventListener('click', stop);
                await userEvent.click(el);
                await aTimeout(0);
                expect(seen[type]).toBe(1);

                el.addEventListener('click', prevent);
                await userEvent.click(el);
                await aTimeout(0);
                expect(seen[type]).toBe(1);
            });
        }

        // The click was taken while the button was not loading. What a listener sets on its way does
        // not take the submit back, or the name and the value out of it.
        it('submits with its name and value when a listener of the click sets loading', async () => {
            const form = await inForm('submit');
            const seen = watch(form);
            const el = form.querySelector('el-button');
            el.addEventListener('click', () => {
                el.loading = true;
            });

            await userEvent.click(el);
            await aTimeout(0);

            expect(seen.data).toEqual([{ q: '1', action: 'go' }]);
        });

        it('leaves no listener behind on the window', async () => {
            const form = await inForm('submit');
            const seen = watch(form);
            const el = form.querySelector('el-button');

            await userEvent.click(el);
            await aTimeout(0);
            // A click that does not come from the button reaches the window as well.
            form.querySelector('input').click();
            window.dispatchEvent(new MouseEvent('click'));

            expect(seen.submit).toBe(1);
        });
    });

    it('leaves unset attributes out of the server-rendered markup', async () => {
        // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
        const controlTag = (el, tag) =>
            el
                .template()
                .toString()
                .match(new RegExp(`<${tag}\\s[^>]*>`))[0];

        const link = await fixture(`<el-button href="/docs">Docs</el-button>`);
        expect(controlTag(link, 'a')).toMatch(/\shref=['"]\/docs['"]/);
        // A stray `download` would make the browser save the target instead of navigating to it.
        expect(controlTag(link, 'a')).not.toMatch(/\s(target|rel|download)=/);

        const button = await fixture(`<el-button>Save</el-button>`);
        expect(controlTag(button, 'button')).not.toMatch(/\s(name|value)=/);
    });

    // The fill writes dark text on --el-color-warning, so the token is a light colour; as the
    // label of the outlined button it would be 3.19 : 1 on white.
    it('keeps the label of an outlined warning button readable in a light and a dark scheme', async () => {
        const schemes = [
            { bg: '#ffffff', fg: '#111827' },
            { bg: '#0f1115', fg: '#f3f4f6' },
        ];
        for (const { bg, fg } of schemes) {
            const wrapper = await fixture(`
                <div style="--el-color-warning: #d97706; --el-color-fg: ${fg}; background: ${bg}; padding: 8px">
                    <el-button variant="warning" appearance="outlined">Careful</el-button>
                    <el-button variant="warning">Careful</el-button>
                </div>
            `);
            const results = await axe.run(wrapper, { runOnly: ['color-contrast'] });

            expect(results.violations, bg).toEqual([]);
            expect(
                results.passes.flatMap((pass) => pass.nodes),
                bg,
            ).toHaveLength(2);
        }
    });

    describe('variant, appearance and size', () => {
        const base = (el) => el.shadowRoot.querySelector('[part="base"]');
        const paint = (el) => {
            const { backgroundColor, borderTopColor, color } = getComputedStyle(base(el));
            return { background: backgroundColor, border: borderTopColor, text: color };
        };
        const TRANSPARENT = 'rgba(0, 0, 0, 0)';
        const tokens = `
            --el-color-bg: rgb(255, 255, 255);
            --el-color-bg-muted: rgb(240, 240, 240);
            --el-color-fg: rgb(10, 10, 10);
            --el-color-border: rgb(200, 200, 200);
            --el-color-accent: rgb(0, 0, 255);
            --el-color-success: rgb(0, 128, 0);
            --el-color-warning: rgb(255, 165, 0);
            --el-color-danger: rgb(255, 0, 0);
        `;

        it('is neutral, filled and medium by default, and says so on the host', async () => {
            const el = await fixture(`<el-button>Save</el-button>`);
            expect(el.getAttribute('variant')).toBe('neutral');
            expect(el.getAttribute('appearance')).toBe('filled');
            expect(el.getAttribute('size')).toBe('medium');
        });

        it('reads one colour token per variant for the fill', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-button>a</el-button>
                    <el-button variant="brand">a</el-button>
                    <el-button variant="success">a</el-button>
                    <el-button variant="warning">a</el-button>
                    <el-button variant="danger">a</el-button>
                </div>
            `);
            const [neutral, brand, success, warning, danger] = [...wrapper.children].map(paint);

            expect(neutral).toEqual({
                background: 'rgb(240, 240, 240)',
                border: 'rgb(200, 200, 200)',
                text: 'rgb(10, 10, 10)',
            });
            expect(brand).toEqual({
                background: 'rgb(0, 0, 255)',
                border: 'rgb(0, 0, 255)',
                text: 'rgb(255, 255, 255)',
            });
            expect(success.background).toBe('rgb(0, 128, 0)');
            expect(warning.background).toBe('rgb(255, 165, 0)');
            expect(danger.background).toBe('rgb(255, 0, 0)');
        });

        it('paints the variant as a fill, as an outline or as text only', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-button variant="danger" appearance="filled">a</el-button>
                    <el-button variant="danger" appearance="outlined">a</el-button>
                    <el-button variant="danger" appearance="plain">a</el-button>
                    <el-button appearance="outlined">a</el-button>
                    <el-button appearance="plain">a</el-button>
                </div>
            `);
            const [filled, outlined, plain, neutralOutlined, neutralPlain] = [...wrapper.children].map(paint);

            expect(filled).toEqual({
                background: 'rgb(255, 0, 0)',
                border: 'rgb(255, 0, 0)',
                text: 'rgb(255, 255, 255)',
            });
            expect(outlined).toEqual({ background: TRANSPARENT, border: 'rgb(255, 0, 0)', text: 'rgb(255, 0, 0)' });
            expect(plain).toEqual({ background: TRANSPARENT, border: TRANSPARENT, text: 'rgb(255, 0, 0)' });
            expect(neutralOutlined).toEqual({
                background: TRANSPARENT,
                border: 'rgb(200, 200, 200)',
                text: 'rgb(10, 10, 10)',
            });
            expect(neutralPlain).toEqual({ background: TRANSPARENT, border: TRANSPARENT, text: 'rgb(10, 10, 10)' });
        });

        it('takes a variant, an appearance and a size set from a script', async () => {
            const wrapper = await fixture(`<div style="${tokens}"><el-button>a</el-button></div>`);
            const el = wrapper.firstElementChild;
            const mediumFontSize = getComputedStyle(base(el)).fontSize;

            el.variant = 'brand';
            el.appearance = 'outlined';
            el.size = 'small';
            await nextFrame();

            expect(el.getAttribute('variant')).toBe('brand');
            expect(el.getAttribute('appearance')).toBe('outlined');
            expect(el.getAttribute('size')).toBe('small');
            expect(paint(el)).toEqual({ background: TRANSPARENT, border: 'rgb(0, 0, 255)', text: 'rgb(0, 0, 255)' });
            expect(mediumFontSize).toBe('16px');
            expect(getComputedStyle(base(el)).fontSize).toBe('14px');
        });

        it('has three sizes', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-button size="small">a</el-button>
                    <el-button size="medium">a</el-button>
                    <el-button size="large">a</el-button>
                    <el-button size="small" circle="true">a</el-button>
                    <el-button size="large" circle="true">a</el-button>
                </div>
            `);
            const [small, medium, large, smallCircle, largeCircle] = [...wrapper.children].map(base);

            expect([small, medium, large].map((control) => getComputedStyle(control).fontSize)).toEqual([
                '14px',
                '16px',
                '18px',
            ]);
            expect(sizeOf(small).height).toBeLessThan(sizeOf(medium).height);
            expect(sizeOf(medium).height).toBeLessThan(sizeOf(large).height);
            // A circle is as wide and high as the control height of its size: 0.8 and 1.25 times 40px.
            expect(sizeOf(smallCircle)).toEqual({ width: 32, height: 32 });
            expect(sizeOf(largeCircle)).toEqual({ width: 50, height: 50 });
        });

        // The values of the API before the shared vocabulary. They are not mapped.
        it('is neutral and filled for a variant it does not know', async () => {
            const wrapper = await fixture(`
                <div style="${tokens}">
                    <el-button variant="primary" outline="true">a</el-button>
                    <el-button>a</el-button>
                </div>
            `);
            const [unknown, neutral] = [...wrapper.children].map(paint);
            expect(unknown).toEqual(neutral);
        });

        // Without a theme nothing says which colours the page has. A fill brings the text on it
        // along, the two are a pair. Text without a fill is the text of the page, or mixed with it.
        describe('without a theme', () => {
            const buttons = ['neutral', 'brand', 'success', 'warning', 'danger']
                .flatMap((variant) =>
                    ['filled', 'outlined', 'plain'].map(
                        (appearance) => `<el-button variant="${variant}" appearance="${appearance}">Status</el-button>`,
                    ),
                )
                .join('');
            // What axe could not read, as the button with its contrast.
            const unread = (results) =>
                results.violations.flatMap((violation) =>
                    violation.nodes.map((node) => `${node.html}: ${node.any[0]?.data?.contrastRatio}`),
                );

            for (const [page, colours] of [
                ['a light page', 'color-scheme: light; background: rgb(255, 255, 255); color: rgb(0, 0, 0)'],
                ['a page in a dark scheme', 'color-scheme: dark; background: Canvas; color: CanvasText'],
                [
                    'a page that paints dark colours and names no scheme',
                    'color-scheme: light; background: rgb(18, 18, 18); color: rgb(255, 255, 255)',
                ],
            ]) {
                it(`can be read in every variant and appearance on ${page}`, async () => {
                    const wrapper = await fixture(`<div style="${colours}; padding: 8px">${buttons}</div>`);
                    const results = await axe.run(wrapper, { runOnly: ['color-contrast'] });

                    expect(unread(results)).toEqual([]);
                    expect(results.passes.flatMap((pass) => pass.nodes)).toHaveLength(15);
                });
            }

            it('has a neutral fill and the text for it by the colour scheme, not by the text of the page', async () => {
                const wrapper = await fixture(`
                    <div style="color: rgb(0, 0, 255)">
                        <el-button style="color-scheme: light">a</el-button>
                        <el-button style="color-scheme: dark">a</el-button>
                    </div>
                `);
                const [light, dark] = [...wrapper.children].map(paint);

                expect(light).toEqual({
                    background: 'rgb(229, 231, 235)',
                    border: TRANSPARENT,
                    text: 'rgb(28, 25, 23)',
                });
                expect(dark).toEqual({
                    background: 'rgb(55, 65, 81)',
                    border: TRANSPARENT,
                    text: 'rgb(243, 244, 246)',
                });
            });
        });
    });

    it('is hidden by the hidden attribute', async () => {
        const el = await fixture(`<el-button hidden>Save</el-button>`);
        expect(getComputedStyle(el).display).toBe('none');
    });

    // The control inside the shadow root is what has the focus and what a screen reader announces.
    describe('ARIA attributes of the element', () => {
        const control = (el) => el.shadowRoot.querySelector('[part="base"]');
        // A changed attribute asks for a render, which is there after two frames.
        const rendered = async () => {
            await nextFrame();
            await nextFrame();
        };

        it('names the control with the aria-label of the element', async () => {
            const el = await fixture(`<el-button circle="true" aria-label="Add">+</el-button>`);
            expect(control(el).getAttribute('aria-label')).toBe('Add');
            expect(await accessibleName(control(el))).toBe('Add');
        });

        it('passes a state on to the control, and every change of it', async () => {
            const el = await fixture(`<el-button aria-expanded="false" aria-haspopup="menu">Options</el-button>`);
            expect(control(el).getAttribute('aria-expanded')).toBe('false');
            expect(control(el).getAttribute('aria-haspopup')).toBe('menu');

            el.setAttribute('aria-expanded', 'true');
            await rendered();
            expect(control(el).getAttribute('aria-expanded')).toBe('true');

            // element-js writes an attribute that was there from the start back as an empty one when
            // it is removed. For the control an empty one is none.
            el.removeAttribute('aria-expanded');
            await rendered();
            expect(control(el).hasAttribute('aria-expanded')).toBe(false);
            expect(control(el).getAttribute('aria-haspopup')).toBe('menu');

            // The ARIA properties of the platform write the attribute, so they arrive as well.
            el.ariaPressed = 'true';
            await rendered();
            expect(control(el).getAttribute('aria-pressed')).toBe('true');

            // An attribute that came later goes for good.
            el.removeAttribute('aria-pressed');
            await rendered();
            expect(el.hasAttribute('aria-pressed')).toBe(false);
            expect(control(el).hasAttribute('aria-pressed')).toBe(false);
        });

        it('passes them on to the link of a link button', async () => {
            const el = await fixture(`<el-button href="/docs" aria-current="page" aria-label="Docs">D</el-button>`);
            expect(control(el).tagName).toBe('A');
            expect(control(el).getAttribute('aria-current')).toBe('page');
            expect(await accessibleName(control(el))).toBe('Docs');
        });

        it('keeps the attributes on the element, where a stylesheet can select them', async () => {
            const el = await fixture(`<el-button aria-pressed="true">Bold</el-button>`);
            expect(el.matches('el-button[aria-pressed="true"]')).toBe(true);
        });

        it('does not pass on what the button sets itself', async () => {
            const el = await fixture(`<el-button aria-busy="true" aria-disabled="true">Save</el-button>`);
            expect(control(el).getAttribute('aria-busy')).toBe('false');
            expect(control(el).hasAttribute('aria-disabled')).toBe(false);
        });

        it('hands the control the elements that the element names by id', async () => {
            const wrapper = await fixture(`
                <div>
                    <span id="aria-name">Remove the draft</span>
                    <el-button aria-labelledby="aria-name" aria-describedby="aria-hint aria-more" aria-controls="aria-panel">
                        x
                    </el-button>
                    <p id="aria-hint">This cannot be undone.</p>
                    <p id="aria-more">The published version stays.</p>
                    <div id="aria-panel"></div>
                </div>
            `);
            const el = wrapper.querySelector('el-button');
            const byId = (id) => wrapper.querySelector(`#${id}`);

            expect(control(el).ariaControlsElements).toEqual([byId('aria-panel')]);
            expect(await accessibleName(control(el))).toBe('Remove the draft');
            expect(await accessibleDescription(control(el))).toBe(
                'This cannot be undone. The published version stays.',
            );

            el.setAttribute('aria-describedby', 'aria-more');
            await rendered();
            expect(await accessibleDescription(control(el))).toBe('The published version stays.');

            el.removeAttribute('aria-describedby');
            el.setAttribute('aria-controls', 'aria-nothing');
            await rendered();
            expect(await accessibleDescription(control(el))).toBe('');
            expect(control(el).ariaControlsElements).toBeNull();
        });

        it('finds those elements in the shadow root the button is used in', async () => {
            const host = await fixture(`<div></div>`);
            const root = host.attachShadow({ mode: 'open' });
            root.innerHTML = `<el-button aria-describedby="hint">Save</el-button><p id="hint">Saves the draft.</p>`;
            await rendered();

            expect(await accessibleDescription(control(root.querySelector('el-button')))).toBe('Saves the draft.');
        });

        it('has them in the server-rendered markup', async () => {
            const el = await fixture(`<el-button circle="true" aria-label="Add" aria-expanded="false">+</el-button>`);
            // `template().toString()` is the markup the SSR renderer puts into the Declarative Shadow DOM.
            const markup = el.template().toString();
            expect(markup).toMatch(/<button\s[^>]*\saria-label=['"]Add['"]/);
            expect(markup).toMatch(/<button\s[^>]*\saria-expanded=['"]false['"]/);
        });

        it('has no detectable a11y violations as an icon button with a name', async () => {
            const wrapper = await fixture(`
                <div><el-button circle="true" aria-label="Add" aria-pressed="false">+</el-button></div>
            `);
            const results = await axe.run(wrapper);
            expect(results.violations.map((violation) => violation.id)).toEqual([]);
            expect(results.passes.find((pass) => pass.id === 'button-name').nodes).toHaveLength(1);
        });
    });

    it('ignores --el-touch-target on a fine pointer', async () => {
        const wrapper = await fixture(`
            <div style="--el-touch-target: 44px"><el-button size="small">OK</el-button></div>
        `);
        const control = wrapper.querySelector('el-button').shadowRoot.querySelector('[part="base"]');
        expect(sizeOf(control).height).toBe(32);
    });

    it('shows a pressed style without a touch screen', async () => {
        const el = await fixture(`<el-button variant="brand">Save</el-button>`);
        const control = el.shadowRoot.querySelector('[part="base"]');
        expect(getComputedStyle(control).filter).toBe('none');

        // The hover style is not checked: it needs a pointer that can hover, and a page does not
        // get one back everywhere after a touch screen test (see useTouchScreen).
        await forcePseudoClasses(control, ['active']);
        expect(getComputedStyle(control).filter).toBe('brightness(0.88)');
    });

    // The ring of a theme is around the button, in the colour the theme gives it. Without a theme
    // nothing says which colours the page has: the ring is inside of the button, in the colour of
    // its label, which can be read on the surface of the button.
    describe('the keyboard focus', () => {
        const control = (el) => el.shadowRoot.querySelector('[part="base"]');
        const TRANSPARENT = 'rgba(0, 0, 0, 0)';
        // What shows the focus: the outline around the control, and the ring inside of it.
        const ringOf = (el) => {
            const { outlineStyle, outlineWidth, outlineColor, outlineOffset } = getComputedStyle(control(el));
            const inside = getComputedStyle(control(el), '::after');
            return {
                around: [outlineStyle, outlineWidth, outlineColor, outlineOffset],
                inside: inside.content === 'none' ? 'none' : inside.boxShadow,
            };
        };
        // Whether nothing shows inside: no ring there, or one whose colour shows nothing, as Chromium writes it.
        const nothingInside = (inside) =>
            inside === 'none' || /^(rgba\(0, 0, 0, 0\)|color\(srgb 0 0 0 \/ 0\)) /.test(inside);
        const buttons = ['neutral', 'brand', 'success', 'warning', 'danger']
            .flatMap((variant) =>
                ['filled', 'outlined', 'plain'].map(
                    (appearance) => `<el-button variant="${variant}" appearance="${appearance}">Status</el-button>`,
                ),
            )
            .join('');
        // Tabs from the button in front through the buttons after it, and reads each while it has the focus.
        const tabThrough = async (wrapper, read) => {
            wrapper.querySelector('button').focus();
            const seen = [];
            for (const el of wrapper.querySelectorAll('el-button')) {
                await userEvent.tab();
                expect(document.activeElement).toBe(el);
                seen.push(read(el));
            }
            return seen;
        };

        for (const [page, colours] of [
            ['a light page', 'color-scheme: light; background: rgb(255, 255, 255); color: rgb(0, 0, 0)'],
            ['a page in a dark scheme', 'color-scheme: dark; background: Canvas; color: CanvasText'],
            [
                'a page that paints dark colours and names no scheme',
                'color-scheme: light; background: rgb(18, 18, 18); color: rgb(255, 255, 255)',
            ],
        ]) {
            it(`shows inside of the button, in the colour of its label, without a theme on ${page}`, async () => {
                const wrapper = await fixture(
                    `<div style="${colours}; padding: 8px"><button>Before</button>${buttons}</div>`,
                );
                const seen = await tabThrough(wrapper, (el) => ({
                    ...ringOf(el),
                    label: getComputedStyle(control(el)).color,
                }));

                expect(seen).toHaveLength(15);
                for (const { around, inside, label } of seen) {
                    expect(around).toEqual(['solid', '2px', TRANSPARENT, '2px']);
                    expect(inside).toBe(`${label} 0px 0px 0px 2px inset`);
                }
            });
        }

        it('is as far inside of the edge as the ring of a theme is outside of it, and follows the shape', async () => {
            const wrapper = await fixture(`
                <div>
                    <button>Before</button>
                    <el-button variant="brand">Save</el-button>
                    <el-button variant="brand" pill="true">Save</el-button>
                    <el-button variant="brand" circle="true">S</el-button>
                </div>
            `);
            const seen = await tabThrough(wrapper, (el) => {
                const outer = control(el).getBoundingClientRect();
                const inside = getComputedStyle(control(el), '::after');
                return {
                    // From the edge of the control to where the ring starts: the border, and as much again.
                    inset: [inside.top, inside.left, inside.bottom, inside.right],
                    size: [parseFloat(inside.width), parseFloat(inside.height)],
                    control: [outer.width - 4, outer.height - 4],
                    radius: inside.borderTopLeftRadius,
                    shape: getComputedStyle(control(el)).borderTopLeftRadius,
                };
            });

            for (const { inset, size, control: expected, radius, shape } of seen) {
                expect(inset).toEqual(['1px', '1px', '1px', '1px']);
                expect(size).toEqual(expected);
                expect(radius).toBe(shape);
            }
            expect(seen.map(({ radius }) => radius)).toEqual(['4px', '999px', '50%']);
        });

        it('shows around the button, with the ring of a theme, and nothing inside', async () => {
            const wrapper = await fixture(`
                <div style="--el-color-focus-ring: rgb(0, 0, 255); --el-focus-ring-width: 3px; --el-focus-ring-offset: 4px">
                    <button>Before</button>${buttons}
                </div>
            `);
            const seen = await tabThrough(wrapper, ringOf);

            expect(seen).toHaveLength(15);
            for (const { around, inside } of seen) {
                expect(around).toEqual(['solid', '3px', 'rgb(0, 0, 255)', '4px']);
                expect(nothingInside(inside)).toBe(true);
            }
        });

        // A page that sets the colour of the ring and nothing else has the ring it had.
        it('shows around the button for a ring colour that is set alone', async () => {
            const wrapper = await fixture(`
                <div style="--el-color-focus-ring: rgb(200, 0, 0)">
                    <button>Before</button><el-button variant="brand">Save</el-button>
                </div>
            `);
            const [{ around, inside }] = await tabThrough(wrapper, ringOf);

            expect(around).toEqual(['solid', '2px', 'rgb(200, 0, 0)', '2px']);
            expect(nothingInside(inside)).toBe(true);
        });

        it('shows on a link as on a button', async () => {
            const wrapper = await fixture(`
                <div><button>Before</button><el-button variant="brand" href="#focus-link">Docs</el-button></div>
            `);
            const [{ around, inside }] = await tabThrough(wrapper, ringOf);

            expect(control(wrapper.querySelector('el-button')).localName).toBe('a');
            expect(around).toEqual(['solid', '2px', TRANSPARENT, '2px']);
            expect(inside).toBe('rgb(255, 255, 255) 0px 0px 0px 2px inset');
        });

        it('shows on the button that has the focus only, and not for a click', async () => {
            const wrapper = await fixture(`
                <div>
                    <button>Before</button>
                    <el-button variant="brand">Save</el-button>
                    <el-button variant="brand">Cancel</el-button>
                </div>
            `);
            const [first, second] = wrapper.querySelectorAll('el-button');
            // Neither the outline nor the ring inside.
            const shown = (el) => ringOf(el).around[0] !== 'none' || ringOf(el).inside !== 'none';

            wrapper.querySelector('button').focus();
            await userEvent.tab();
            expect(document.activeElement).toBe(first);
            expect([shown(first), shown(second)]).toEqual([true, false]);

            await userEvent.click(second);
            expect(document.activeElement).toBe(second);
            expect([shown(first), shown(second)]).toEqual([false, false]);
        });

        // Forced colours take the shadow away and give the outline a colour: one ring, around the button.
        describe('where the user forces colours', () => {
            useForcedColors();

            for (const [name, tokens] of [
                ['without a theme', ''],
                ['with the ring of a theme', '--el-color-focus-ring: rgb(0, 0, 255)'],
            ]) {
                it(`shows around the button and not inside, ${name}`, async () => {
                    const wrapper = await fixture(`
                        <div style="${tokens}"><button>Before</button><el-button variant="brand">Save</el-button></div>
                    `);
                    const [{ around, inside }] = await tabThrough(wrapper, ringOf);

                    expect(around.slice(0, 2)).toEqual(['solid', '2px']);
                    expect(around[2]).not.toBe(TRANSPARENT);
                    expect(inside).toBe('none');
                });
            }
        });
    });

    describe('a toggle button', () => {
        const control = (el) => el.shadowRoot.querySelector('[part="base"]');
        const rendered = async () => {
            await nextFrame();
            await nextFrame();
        };
        // The ring of a pressed button: what its control generates in front of its content.
        const ringOf = (el) => {
            const { content, borderTopWidth, borderTopStyle, borderTopColor } = getComputedStyle(
                control(el),
                '::before',
            );
            return content === 'none' ? 'none' : `${borderTopWidth} ${borderTopStyle} ${borderTopColor}`;
        };
        const variants = ['neutral', 'brand', 'success', 'warning', 'danger'];
        const appearances = ['filled', 'outlined', 'plain'];

        describe('its state', () => {
            it('is not pressed by default, and says so', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);

                expect(el.pressed).toBe(false);
                expect(el.getAttribute('pressed')).toBe('false');
                expect(control(el).getAttribute('aria-pressed')).toBe('false');
            });

            it('takes the state from the attribute', async () => {
                const el = await fixture(`<el-button toggle="true" pressed="true">Bold</el-button>`);

                expect(el.pressed).toBe(true);
                expect(control(el).getAttribute('aria-pressed')).toBe('true');
            });

            it('takes the state from the property, and writes it to the attribute', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);

                el.pressed = true;
                await rendered();
                expect(el.getAttribute('pressed')).toBe('true');
                expect(control(el).getAttribute('aria-pressed')).toBe('true');

                el.setAttribute('pressed', 'false');
                await rendered();
                expect(el.pressed).toBe(false);
                expect(control(el).getAttribute('aria-pressed')).toBe('false');
            });

            it('flips with a click, and with the Space and the Enter key', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);

                await userEvent.click(el);
                await rendered();
                expect(el.pressed).toBe(true);
                expect(el.getAttribute('pressed')).toBe('true');
                expect(control(el).getAttribute('aria-pressed')).toBe('true');

                el.focus();
                await userEvent.keyboard(' ');
                await rendered();
                expect(el.pressed).toBe(false);

                await userEvent.keyboard('{Enter}');
                await rendered();
                expect(el.pressed).toBe(true);
            });

            it('has flipped when click() returns', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);

                el.click();
                expect(el.pressed).toBe(true);
                el.click();
                expect(el.pressed).toBe(false);
            });

            it('does not flip while it is disabled or loading', async () => {
                const disabled = await fixture(`<el-button toggle="true" disabled="true">Bold</el-button>`);
                const loading = await fixture(`<el-button toggle="true" loading="true">Bold</el-button>`);

                disabled.click();
                control(loading).click();
                await rendered();
                expect(disabled.pressed).toBe(false);
                expect(loading.pressed).toBe(false);
            });

            it('becomes a toggle when toggle is set from a script, with the attribute of its state', async () => {
                const el = await fixture(`<el-button>Bold</el-button>`);
                expect(el.hasAttribute('pressed')).toBe(false);

                el.toggle = true;
                await rendered();
                expect(el.getAttribute('pressed')).toBe('false');
                expect(control(el).getAttribute('aria-pressed')).toBe('false');

                el.click();
                await rendered();
                expect(el.getAttribute('pressed')).toBe('true');
            });

            it('is in the markup a server renders', () => {
                const source = document.createElement('el-button');
                Object.assign(source, source.properties(), { toggle: true, pressed: true });
                // The quotes are the ones of the renderer.
                expect(source.template().toString()).toMatch(/aria-pressed=(["'])true\1/);

                Object.assign(source, { pressed: false });
                expect(source.template().toString()).toMatch(/aria-pressed=(["'])false\1/);

                Object.assign(source, { toggle: false });
                expect(source.template().toString()).not.toContain('aria-pressed');
                expect(new Button().properties()).toMatchObject({ toggle: false, pressed: false });
            });
        });

        describe('what the page learns', () => {
            it('fires button-toggle with the new state when a click has flipped it', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);
                const seen = [];
                el.addEventListener('button-toggle', (event) => seen.push([event.detail.pressed, el.pressed]));

                el.click();
                el.click();
                expect(seen).toEqual([
                    [true, true],
                    [false, false],
                ]);
            });

            it('fires nothing when pressed is set from a script', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);
                let fired = 0;
                el.addEventListener('button-toggle', () => fired++);

                el.pressed = true;
                el.setAttribute('pressed', 'false');
                await rendered();
                expect(fired).toBe(0);
            });

            it('does not flip when a click listener of the page prevents the click', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);
                let fired = 0;
                el.addEventListener('button-toggle', () => fired++);
                el.addEventListener('click', (event) => event.preventDefault(), { once: true });

                el.click();
                await aTimeout(20);
                expect(el.pressed).toBe(false);
                expect(fired).toBe(0);

                // The next click is not prevented.
                el.click();
                expect(el.pressed).toBe(true);
                expect(fired).toBe(1);
            });
        });

        describe('for assistive technology', () => {
            it('is announced as a toggle button with its state', async () => {
                const el = await fixture(`<el-button toggle="true">Bold</el-button>`);
                const pressedOf = async () => {
                    const { cdp } = await import('vite-plus/test/browser');
                    const session = cdp();
                    await session.send('DOM.enable');
                    const marker = `toggle-${crypto.randomUUID()}`;
                    control(el).setAttribute('data-test-marker', marker);
                    await session.send('DOM.getDocument', { depth: 0 });
                    const { searchId } = await session.send('DOM.performSearch', {
                        query: marker,
                        includeUserAgentShadowDOM: true,
                    });
                    const { nodeIds } = await session.send('DOM.getSearchResults', {
                        searchId,
                        fromIndex: 0,
                        toIndex: 1,
                    });
                    control(el).removeAttribute('data-test-marker');
                    const { nodes } = await session.send('Accessibility.getPartialAXTree', {
                        nodeId: nodeIds[0],
                        fetchRelatives: false,
                    });
                    return nodes[0].properties.find((property) => property.name === 'pressed')?.value.value;
                };

                expect(await accessibleRole(control(el))).toBe('button');
                expect(await accessibleName(control(el))).toBe('Bold');
                expect(await pressedOf()).toBe('false');

                el.click();
                await rendered();
                expect(await pressedOf()).toBe('true');
            });

            it('has no aria-pressed on a button that is no toggle', async () => {
                const el = await fixture(`<el-button>Save</el-button>`);
                expect(control(el).hasAttribute('aria-pressed')).toBe(false);
                expect(el.hasAttribute('pressed')).toBe(false);

                // `pressed` alone does not make a toggle.
                const pressed = await fixture(`<el-button pressed="true">Save</el-button>`);
                expect(control(pressed).hasAttribute('aria-pressed')).toBe(false);
                pressed.click();
                expect(pressed.pressed).toBe(true);
                expect(ringOf(pressed)).toBe('none');
            });

            it('has no detectable a11y violations, pressed or not', async () => {
                const wrapper = await fixture(`
                    <div style="color: rgb(0, 0, 0); background: rgb(255, 255, 255)">
                        <el-button toggle="true">Bold</el-button>
                        <el-button toggle="true" pressed="true" appearance="outlined">Italic</el-button>
                        <el-button toggle="true" pressed="true" appearance="plain" circle="true" aria-label="Favourite">★</el-button>
                    </div>
                `);
                const results = await axe.run(wrapper);
                expect(results.violations.map((violation) => violation.id)).toEqual([]);
            });
        });

        describe('aria-pressed that the page sets itself', () => {
            it('goes to the control as it is, and no click changes it', async () => {
                const el = await fixture(`<el-button aria-pressed="false">Bold</el-button>`);
                expect(control(el).getAttribute('aria-pressed')).toBe('false');

                el.click();
                await rendered();
                expect(control(el).getAttribute('aria-pressed')).toBe('false');
                expect(el.pressed).toBe(false);

                el.setAttribute('aria-pressed', 'true');
                await rendered();
                expect(control(el).getAttribute('aria-pressed')).toBe('true');
                // And it shows, as the state of a toggle does.
                expect(ringOf(el)).not.toBe('none');
            });

            it('gives way to the state of a toggle', async () => {
                const el = await fixture(`<el-button toggle="true" aria-pressed="true">Bold</el-button>`);
                expect(control(el).getAttribute('aria-pressed')).toBe('false');
            });
        });

        describe('a link', () => {
            it('is no toggle', async () => {
                const el = await fixture(`<el-button toggle="true" href="#target">Go</el-button>`);
                expect(control(el).hasAttribute('aria-pressed')).toBe(false);
                expect(el.hasAttribute('pressed')).toBe(false);
            });
        });

        describe('how it shows', () => {
            const TRANSPARENT = 'rgba(0, 0, 0, 0)';
            const grid = (tokens = '') => `
                <div style="${tokens}">
                    ${variants
                        .flatMap((variant) =>
                            appearances.map(
                                (appearance) => `
                                    <el-button toggle="true" variant="${variant}" appearance="${appearance}">a</el-button>
                                    <el-button toggle="true" pressed="true" variant="${variant}" appearance="${appearance}">a</el-button>
                                `,
                            ),
                        )
                        .join('')}
                </div>
            `;
            const pairs = (wrapper) => {
                const buttons = [...wrapper.querySelectorAll('el-button')];
                return buttons.filter((_, index) => index % 2 === 0).map((off, index) => [off, buttons[index * 2 + 1]]);
            };
            const theme = `
                --el-color-bg: rgb(255, 255, 255); --el-color-fg: rgb(10, 10, 10);
                --el-color-bg-muted: rgb(230, 230, 230); --el-color-border: rgb(150, 150, 150);
                --el-color-accent: rgb(0, 0, 200); --el-color-success: rgb(0, 120, 0);
                --el-color-warning: rgb(240, 160, 0); --el-color-danger: rgb(200, 0, 0);
                color: rgb(10, 10, 10); background: rgb(255, 255, 255);
            `;

            for (const [name, tokens] of [
                ['with a theme', theme],
                [
                    'without a theme, in a light scheme',
                    'color-scheme: light; color: rgb(0, 0, 0); background: rgb(255, 255, 255)',
                ],
                [
                    'without a theme, in a dark scheme',
                    'color-scheme: dark; color: rgb(255, 255, 255); background: rgb(18, 18, 18)',
                ],
            ]) {
                it(`has a ring in the colour of its label in every variant and appearance, ${name}`, async () => {
                    const wrapper = await fixture(grid(tokens));

                    for (const [off, on] of pairs(wrapper)) {
                        const which = `${on.variant} ${on.appearance}`;
                        const label = getComputedStyle(control(on)).color;

                        expect(ringOf(off), which).toBe('none');
                        expect(ringOf(on), which).toBe(`2px solid ${label}`);
                        expect(label, which).not.toBe(TRANSPARENT);
                        // The label can be read on the surface of the button, and so can the ring:
                        // the surface of a pressed button is not another fill than the one of its label.
                        if (on.appearance === 'filled') {
                            expect(getComputedStyle(control(on)).backgroundColor, which).toBe(
                                getComputedStyle(control(off)).backgroundColor,
                            );
                        } else {
                            expect(getComputedStyle(control(off)).backgroundColor, which).toBe(TRANSPARENT);
                            expect(getComputedStyle(control(on)).backgroundColor, which).not.toBe(TRANSPARENT);
                        }
                    }
                });
            }

            it('keeps the size of the button', async () => {
                const wrapper = await fixture(grid(theme));
                for (const [off, on] of pairs(wrapper)) {
                    expect(sizeOf(control(on)), `${on.variant} ${on.appearance}`).toEqual(sizeOf(control(off)));
                }
            });

            it('follows the shape of the button', async () => {
                const wrapper = await fixture(`
                    <div style="--el-radius-md: 6px">
                        <el-button toggle="true" pressed="true">a</el-button>
                        <el-button toggle="true" pressed="true" pill="true">a</el-button>
                        <el-button toggle="true" pressed="true" circle="true">a</el-button>
                    </div>
                `);
                const radius = (el, pseudo) => getComputedStyle(control(el), pseudo).borderTopLeftRadius;

                for (const el of wrapper.querySelectorAll('el-button')) {
                    expect(radius(el, '::before'), el.outerHTML).toBe(radius(el));
                }
            });

            it('gets one step more of the tint under the pointer and when pressed down', async () => {
                const el = await fixture(`<el-button toggle="true" pressed="true" appearance="outlined">a</el-button>`);
                const tint = () => getComputedStyle(control(el)).backgroundColor;
                const resting = tint();

                await forcePseudoClasses(control(el), ['hover']);
                const hovered = tint();
                await forcePseudoClasses(control(el), ['hover', 'active']);
                const down = tint();

                const alpha = (colour) => Number(colour.match(/[\d.]+(?=\)$)/)[0]);
                expect(alpha(hovered)).toBeGreaterThan(alpha(resting));
                expect(alpha(down)).toBeGreaterThan(alpha(hovered));
            });

            describe('in a group', () => {
                it('keeps the joined corners and the lines to its neighbours', async () => {
                    const wrapper = await fixture(`
                        <div style="${theme} --el-radius-md: 6px; --el-border-width: 1px">
                            <el-button-group label="Off">
                                <el-button>a</el-button><el-button>b</el-button><el-button>c</el-button>
                            </el-button-group>
                            <el-button-group label="On">
                                <el-button toggle="true" pressed="true">a</el-button>
                                <el-button toggle="true" pressed="true">b</el-button>
                                <el-button toggle="true" pressed="true">c</el-button>
                            </el-button-group>
                        </div>
                    `);
                    const [off, on] = [...wrapper.querySelectorAll('el-button-group')].map((group) => [
                        ...group.children,
                    ]);
                    const corners = (el, pseudo) => {
                        const style = getComputedStyle(control(el), pseudo);
                        return [
                            style.borderTopLeftRadius,
                            style.borderTopRightRadius,
                            style.borderBottomRightRadius,
                            style.borderBottomLeftRadius,
                        ];
                    };
                    const borders = (el) => {
                        const style = getComputedStyle(control(el));
                        return [style.borderLeftColor, style.borderRightColor, style.borderLeftWidth, style.marginLeft];
                    };

                    on.forEach((button, index) => {
                        // The corners of the button, and the ring has the same.
                        expect(corners(button), index).toEqual(corners(off[index]));
                        expect(corners(button, '::before'), index).toEqual(corners(button));
                        // The line to the neighbour in front, and the place on its border.
                        expect(borders(button), index).toEqual(borders(off[index]));
                        expect(sizeOf(button), index).toEqual(sizeOf(off[index]));
                    });
                    expect(corners(on[1])).toEqual(['0px', '0px', '0px', '0px']);
                    expect(corners(on[0])).toEqual(['6px', '0px', '0px', '6px']);
                });
            });

            describe('where the user forces colours', () => {
                useForcedColors();

                it('keeps the ring, and makes it wider', async () => {
                    const wrapper = await fixture(grid());

                    expect(matchMedia('(forced-colors: active)').matches).toBe(true);
                    for (const [off, on] of pairs(wrapper)) {
                        const which = `${on.variant} ${on.appearance}`;
                        expect(ringOf(off), which).toBe('none');
                        expect(ringOf(on), which).toBe(`3px solid ${getComputedStyle(control(on)).color}`);
                    }
                });
            });
        });

        describe('the keyboard focus without a theme', () => {
            it('shows a second ring inside of the ring of a pressed button', async () => {
                const wrapper = await fixture(`
                    <div>
                        <button>Before</button>
                        <el-button toggle="true">Off</el-button>
                        <el-button toggle="true" pressed="true">On</el-button>
                    </div>
                `);
                const [off, on] = wrapper.querySelectorAll('el-button');
                const focusInset = (el) => getComputedStyle(control(el), '::after').top;

                wrapper.querySelector('button').focus();
                await userEvent.tab();
                expect(off.shadowRoot.activeElement).toBe(control(off));
                const offInset = focusInset(off);
                await userEvent.tab();
                expect(on.shadowRoot.activeElement).toBe(control(on));

                expect(offInset).toBe('1px');
                // Past the ring of the pressed button, which is 2px wide.
                expect(focusInset(on)).toBe('5px');
            });
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('is at least --el-touch-target in both directions, whatever its size and shape', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-button size="small">a</el-button>
                    <el-button>a</el-button>
                    <el-button size="large">a</el-button>
                    <el-button size="small" circle="true">a</el-button>
                    <el-button circle="true">a</el-button>
                    <el-button size="large" circle="true">a</el-button>
                    <el-button size="small" variant="brand" appearance="plain">a</el-button>
                    <el-button size="small" href="#target">a</el-button>
                </div>
            `);
            for (const button of wrapper.querySelectorAll('el-button')) {
                const { width, height } = sizeOf(button.shadowRoot.querySelector('[part="base"]'));
                expect(Math.min(width, height), button.outerHTML).toBeGreaterThanOrEqual(44);
            }
        });

        it('keeps a circle round', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px"><el-button size="small" circle="true">a</el-button></div>
            `);
            const control = wrapper.querySelector('el-button').shadowRoot.querySelector('[part="base"]');
            expect(sizeOf(control)).toEqual({ width: 44, height: 44 });
        });

        it('keeps its size without --el-touch-target', async () => {
            const el = await fixture(`<el-button size="small">OK</el-button>`);
            expect(sizeOf(el.shadowRoot.querySelector('[part="base"]')).height).toBe(32);
        });

        it('shows a pressed style, and no hover style for the :hover that a tap leaves behind', async () => {
            const el = await fixture(`<el-button variant="brand">Save</el-button>`);
            const control = el.shadowRoot.querySelector('[part="base"]');

            // A touch screen keeps :hover on the element that was tapped last.
            await forcePseudoClasses(control, ['hover']);
            expect(control.matches(':hover')).toBe(true);
            expect(getComputedStyle(control).filter).toBe('none');

            await forcePseudoClasses(control, ['hover', 'active']);
            expect(getComputedStyle(control).filter).toBe('brightness(0.88)');
        });
    });
});
