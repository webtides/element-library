import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { accessibleDescription, accessibleName, aTimeout, fixture, nextFrame } from '../../test-helpers.js';
import { define } from './otp-field.js';
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
// What an event reports for a field, from now on.
const detailsOf = (el, name) => {
    const details = [];
    el.addEventListener(name, (event) => details.push(event.detail));
    return details;
};
// What the browser does for a paste, and a phone for the code of an SMS: the control has the text,
// then the event. No key is pressed.
const fill = async (el, text) => {
    const control = controlOf(el);
    control.value = text;
    control.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
    await frames();
};
const type = async (el, keys) => {
    controlOf(el).focus();
    await userEvent.keyboard(keys);
    await frames();
};
const messageOf = (el) => el.querySelector('.error-message')?.textContent.trim() ?? null;

describe('Feature | OtpField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-otp-field></el-otp-field>`);
        await nextFrame();
        expect(controlOf(el)).not.toBeNull();
    });

    describe('the control', () => {
        it('is one text input that a phone can fill in, with a pattern of six digits', async () => {
            const el = await fixture(`<el-otp-field name="plain" label="Code"></el-otp-field>`);
            const control = controlOf(el);

            expect(el.querySelectorAll('input')).toHaveLength(1);
            expect(control.type).toBe('text');
            expect(control.getAttribute('autocomplete')).toBe('one-time-code');
            expect(control.getAttribute('inputmode')).toBe('numeric');
            expect(control.getAttribute('pattern')).toBe('[0-9]{6}');
            // The browser would cut a pasted `123 456` before the field has taken the space out.
            expect(control.hasAttribute('maxlength')).toBe(false);
        });

        it('has a pattern of as many digits as length says, also when that changes', async () => {
            const el = await fixture(`<el-otp-field name="short" label="Code" length="4"></el-otp-field>`);
            expect(controlOf(el).getAttribute('pattern')).toBe('[0-9]{4}');

            el.length = 8;
            await frames();
            expect(controlOf(el).getAttribute('pattern')).toBe('[0-9]{8}');
        });

        it('takes a pattern, an inputmode and an autocomplete of the page', async () => {
            const el = await fixture(`
                <el-otp-field name="letters" label="Backup code" length="8" pattern="[A-Z0-9]{8}" inputmode="text" autocomplete="off"></el-otp-field>
            `);
            const control = controlOf(el);

            expect(control.getAttribute('pattern')).toBe('[A-Z0-9]{8}');
            expect(control.getAttribute('inputmode')).toBe('text');
            expect(control.getAttribute('autocomplete')).toBe('off');
        });
    });

    describe('when the user enters a code', () => {
        it('follows every key, and reports every value once', async () => {
            const el = await fixture(`<el-otp-field name="typed" label="Code"></el-otp-field>`);
            const changes = detailsOf(el, 'input-change');

            await type(el, '12');
            expect(el.value).toBe('12');
            await type(el, '3');

            expect(el.value).toBe('123');
            expect(changes).toEqual(['1', '12', '123']);
        });

        it('takes over a code that is filled in without a key', async () => {
            const el = await fixture(`<el-otp-field name="filled" label="Code"></el-otp-field>`);

            await fill(el, '482913');

            expect(el.value).toBe('482913');
            expect(el.valid).toBe(true);
        });

        it('takes the spaces and the hyphens out of a code that is pasted', async () => {
            const el = await fixture(`<el-otp-field name="pasted" label="Code"></el-otp-field>`);

            for (const [pasted, code] of [
                ['123 456', '123456'],
                ['123-456', '123456'],
                [' 98 76 54 ', '987654'],
            ]) {
                await fill(el, pasted);
                expect([pasted, controlOf(el).value, el.value, el.valid]).toEqual([pasted, code, code, true]);
            }
        });

        it('takes a space out as it is typed', async () => {
            const el = await fixture(`<el-otp-field name="spaced" label="Code"></el-otp-field>`);

            await type(el, '123 456');

            expect(controlOf(el).value).toBe('123456');
            expect(el.value).toBe('123456');
        });

        it('is never longer than a code', async () => {
            const el = await fixture(`<el-otp-field name="long" label="Code" length="4"></el-otp-field>`);

            await type(el, '123456');
            expect([controlOf(el).value, el.value]).toEqual(['1234', '1234']);

            await fill(el, '98 76 54 32');
            expect([controlOf(el).value, el.value]).toEqual(['9876', '9876']);
        });

        it('takes no further key once it is full, wherever the caret is, as an input with maxlength', async () => {
            const el = await fixture(`<el-otp-field name="full" label="Code"></el-otp-field>`);
            const control = controlOf(el);
            await type(el, '123456');

            // In front of the code: the key would push the 6 out.
            control.setSelectionRange(0, 0);
            await userEvent.keyboard('9');
            await frames();
            expect([control.value, el.value]).toEqual(['123456', '123456']);

            // A key that takes the place of a selection fits.
            control.setSelectionRange(0, 2);
            await userEvent.keyboard('9');
            await frames();
            expect([control.value, el.value]).toEqual(['93456', '93456']);
        });

        it('filters no key: a code that does not fit the pattern is not valid, and the field says so', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-otp-field name="wrong" label="Code" error-message="Enter the six digits"></el-otp-field>
                    <button>Next</button>
                </div>
            `);
            const el = wrapper.querySelector('el-otp-field');

            await type(el, '12ab');
            expect(controlOf(el).value).toBe('12ab');
            expect(el.valid).toBe(false);
            expect(messageOf(el)).toBe(null);

            await userEvent.tab();
            await frames();

            expect(el.touched).toBe(true);
            expect(messageOf(el)).toBe('Enter the six digits');
            expect(controlOf(el).getAttribute('aria-invalid')).toBe('true');
        });
    });

    describe('when the code is complete', () => {
        it('says so once, with the code', async () => {
            const el = await fixture(`<el-otp-field name="complete" label="Code"></el-otp-field>`);
            const completes = detailsOf(el, 'input-complete');

            await type(el, '12345');
            expect(completes).toEqual([]);
            await type(el, '6');
            expect(completes).toEqual(['123456']);

            // The keys that follow, and leaving the control, change nothing about the code.
            await type(el, '7');
            controlOf(el).blur();
            await frames();

            expect(el.value).toBe('123456');
            expect(completes).toEqual(['123456']);
        });

        it('says so for a code that is pasted or filled in', async () => {
            const el = await fixture(`<el-otp-field name="complete-paste" label="Code"></el-otp-field>`);
            const completes = detailsOf(el, 'input-complete');

            await fill(el, '123 456');

            expect(completes).toEqual(['123456']);
        });

        it('says so again after the code was changed and completed again', async () => {
            const el = await fixture(`<el-otp-field name="complete-again" label="Code"></el-otp-field>`);
            const completes = detailsOf(el, 'input-complete');

            await type(el, '123456');
            await type(el, '{Backspace}');
            expect(completes).toEqual(['123456']);
            await type(el, '7');

            expect(completes).toEqual(['123456', '123457']);
        });

        it('does not say so for a code of full length that does not fit the pattern', async () => {
            const el = await fixture(`<el-otp-field name="complete-wrong" label="Code"></el-otp-field>`);
            const completes = detailsOf(el, 'input-complete');

            await type(el, '12345a');

            expect(el.value).toBe('12345a');
            expect(completes).toEqual([]);
        });

        it('follows the pattern and the length of the page', async () => {
            const el = await fixture(`
                <el-otp-field name="complete-letters" label="Backup code" length="4" pattern="[A-Z]{4}" inputmode="text"></el-otp-field>
            `);
            const completes = detailsOf(el, 'input-complete');

            await type(el, 'AB-CD');

            expect(el.value).toBe('ABCD');
            expect(completes).toEqual(['ABCD']);
        });

        it('does not say so for a code a script sets, and says so when the user enters it again', async () => {
            const el = await fixture(`<el-otp-field name="complete-script" label="Code"></el-otp-field>`);
            const completes = detailsOf(el, 'input-complete');

            el.value = '123456';
            await frames();
            await frames();
            expect(controlOf(el).value).toBe('123456');
            expect(completes).toEqual([]);

            // A paste behind that code is cut off: the code is the one of the script still.
            await fill(el, '12345699');
            expect(controlOf(el).value).toBe('123456');
            expect(completes).toEqual([]);

            // The code was wrong: the page takes it away, and the user enters it again.
            el.value = '';
            await frames();
            await frames();
            expect(controlOf(el).value).toBe('');
            await type(el, '123456');

            expect(completes).toEqual(['123456']);
        });

        it('says so again after the clear cross of a field that was not valid', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-otp-field name="complete-cleared" label="Code"></el-otp-field>
                    <button>Next</button>
                </div>
            `);
            const el = wrapper.querySelector('el-otp-field');
            const completes = detailsOf(el, 'input-complete');

            await type(el, '123');
            await userEvent.tab();
            await frames();
            await userEvent.click(el.querySelector('[data-clear-input]'));
            await frames();
            expect(el.value).toBe('');

            await type(el, '654321');
            expect(completes).toEqual(['654321']);
        });
    });

    describe('for a screen reader', () => {
        it('is a text field named by its label and described by its messages', async () => {
            const el = await fixture(`
                <el-otp-field name="named" label="Code from the SMS" help-message="Six digits" error-message="Enter the six digits"></el-otp-field>
            `);
            const control = controlOf(el);

            expect(await accessibleName(control)).toBe('Code from the SMS');
            expect(await accessibleDescription(control)).toBe('Six digits');

            el.touched = true;
            el.valid = false;
            await frames();

            expect(await accessibleDescription(control)).toBe('Six digits Enter the six digits');
            expect(control.getAttribute('aria-invalid')).toBe('true');
        });

        it('has no detectable a11y violations, with and without its messages', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-otp-field name="axe-plain" label="Code"></el-otp-field>
                    <el-otp-field name="axe-help" label="Code" help-message="Six digits" value="123456"></el-otp-field>
                    <el-otp-field name="axe-error" label="Code" valid="false" touched="true" error-message="Enter the six digits"></el-otp-field>
                    <el-otp-field name="axe-disabled" label="Code" disabled="true"></el-otp-field>
                </div>
            `);
            await frames();
            const results = await axe.run(wrapper);
            expect(results.violations).toEqual([]);
        });
    });

    describe('in a native form', () => {
        const formWith = async (markup) => {
            const form = await fixture(`<form>${markup}<button type="submit">Send</button></form>`);
            const submits = [];
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits.push(Object.fromEntries(new FormData(form)));
            });
            return { form, submits, el: form.querySelector('el-otp-field') };
        };

        it('submits the code under its name, without the spaces it was pasted with', async () => {
            const { form, submits, el } = await formWith(`<el-otp-field name="code" label="Code"></el-otp-field>`);

            await fill(el, '123 456');
            form.requestSubmit();
            await frames();

            expect(submits).toEqual([{ code: '123456' }]);
        });

        it('lets the page submit the form the moment the code is complete', async () => {
            const { form, submits, el } = await formWith(`<el-otp-field name="auto" label="Code"></el-otp-field>`);
            el.addEventListener('input-complete', () => form.requestSubmit());

            await type(el, '123456');

            expect(submits).toEqual([{ auto: '123456' }]);
        });

        it('keeps the form from being submitted with a code that is too short', async () => {
            const { form, submits, el } = await formWith(
                `<el-otp-field name="short-code" label="Code" required="true" error-message="Enter the six digits"></el-otp-field>`,
            );

            form.requestSubmit();
            await frames();
            expect(submits).toHaveLength(0);
            expect(messageOf(el)).toBe('Enter the six digits');

            await type(el, '123');
            form.requestSubmit();
            await frames();
            expect(submits).toHaveLength(0);

            await type(el, '456');
            form.requestSubmit();
            await frames();
            expect(submits).toEqual([{ 'short-code': '123456' }]);
        });

        it('is empty again after the form was reset', async () => {
            const { form, el } = await formWith(`<el-otp-field name="back" label="Code"></el-otp-field>`);
            const completes = detailsOf(el, 'input-complete');
            await type(el, '123456');

            form.reset();
            await settled();
            await frames();

            expect([controlOf(el).value, el.value, el.touched]).toEqual(['', null, false]);

            await type(el, '123456');
            expect(completes).toEqual(['123456', '123456']);
        });
    });
});
