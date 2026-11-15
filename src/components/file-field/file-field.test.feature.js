import { describe, it, expect, vi, afterEach } from 'vite-plus/test';
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
import { define } from './file-field.js';
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
const controlOf = (el) => el.querySelector('input[type="file"]');
// What `input-change` reports for a field, from now on.
const changesOf = (el) => {
    const changes = [];
    el.addEventListener('input-change', (event) => changes.push(event.detail));
    return changes;
};
const file = (name, text = name) => new File([text], name, { type: 'text/plain' });
// What the user does in the dialog of the system: the control has the files, then the events.
const choose = async (el, ...files) => {
    await userEvent.upload(controlOf(el), files);
    await frames();
};
const messageOf = (el) => el.querySelector('.error-message')?.textContent.trim() ?? null;

describe('Feature | FileField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-file-field></el-file-field>`);
        await nextFrame();
        expect(controlOf(el)).not.toBeNull();
    });

    describe('the control', () => {
        it('is a native file input without the attributes it was not given', async () => {
            const el = await fixture(`<el-file-field name="plain" label="CV"></el-file-field>`);
            const control = controlOf(el);

            expect(control.name).toBe('plain');
            expect(control.multiple).toBe(false);
            for (const name of ['accept', 'capture', 'value', 'required', 'disabled']) {
                expect([name, control.hasAttribute(name)]).toEqual([name, false]);
            }
        });

        it('gets accept, multiple and capture', async () => {
            const el = await fixture(
                `<el-file-field name="given" label="Pictures" accept="image/*" multiple="true" capture="environment"></el-file-field>`,
            );
            const control = controlOf(el);

            expect(control.getAttribute('accept')).toBe('image/*');
            expect(control.multiple).toBe(true);
            expect(control.getAttribute('capture')).toBe('environment');
        });

        it('follows accept and multiple when they change', async () => {
            const el = await fixture(`<el-file-field name="later" label="CV"></el-file-field>`);

            el.accept = '.pdf';
            el.multiple = true;
            await frames();

            expect(controlOf(el).getAttribute('accept')).toBe('.pdf');
            expect(controlOf(el).multiple).toBe(true);
        });
    });

    describe('when the user chooses', () => {
        it('has the file, says its name, and reports it once', async () => {
            const el = await fixture(`<el-file-field name="one" label="CV"></el-file-field>`);
            const changes = changesOf(el);
            expect(el.files).toEqual([]);
            expect(el.value).toEqual([]);

            await choose(el, file('cv.txt', 'my life'));

            expect(el.files).toHaveLength(1);
            expect(el.files[0]).toBeInstanceOf(File);
            expect(await el.files[0].text()).toBe('my life');
            expect(el.value).toEqual(['cv.txt']);
            expect(changes).toEqual([['cv.txt']]);
        });

        it('has every file of a field that takes several', async () => {
            const el = await fixture(`<el-file-field name="several" label="Receipts" multiple="true"></el-file-field>`);
            const changes = changesOf(el);

            await choose(el, file('a.txt'), file('b.txt'));

            expect(el.files.map((chosen) => chosen.name)).toEqual(['a.txt', 'b.txt']);
            expect(el.value).toEqual(['a.txt', 'b.txt']);
            expect(changes).toEqual([['a.txt', 'b.txt']]);
        });

        it('reports another choice, also one of files with the same names', async () => {
            const el = await fixture(`<el-file-field name="again" label="CV"></el-file-field>`);
            const changes = changesOf(el);

            await choose(el, file('cv.txt', 'first'));
            await choose(el, file('letter.txt'));
            await choose(el, file('letter.txt', 'second'));

            expect(await el.files[0].text()).toBe('second');
            expect(changes).toEqual([['cv.txt'], ['letter.txt'], ['letter.txt']]);
        });

        it('is valid again once a required field has a file', async () => {
            const form = await fixture(`
                <form>
                    <el-file-field name="needed" label="CV" required="true" error-message="Add your CV"></el-file-field>
                </form>
            `);
            const el = form.querySelector('el-file-field');
            form.requestSubmit();
            await frames();
            expect(messageOf(el)).toBe('Add your CV');

            await choose(el, file('cv.txt'));

            expect(el.valid).toBe(true);
            expect(messageOf(el)).toBe(null);
            expect(controlOf(el).getAttribute('aria-invalid')).toBe('false');
        });
    });

    describe('when a script sets the value', () => {
        it('takes the choice away for an empty value, and reports that', async () => {
            const el = await fixture(`<el-file-field name="taken" label="CV"></el-file-field>`);
            await choose(el, file('cv.txt'));
            const changes = changesOf(el);

            el.value = [];
            await frames();
            await frames();

            expect(controlOf(el).files).toHaveLength(0);
            expect(el.files).toEqual([]);
            expect(el.value).toEqual([]);
            expect(changes).toEqual([[]]);
        });

        it('takes the choice away for null as well', async () => {
            const el = await fixture(`<el-file-field name="taken-null" label="CV"></el-file-field>`);
            await choose(el, file('cv.txt'));

            el.value = null;
            await frames();
            await frames();

            expect(controlOf(el).files).toHaveLength(0);
            expect(el.files).toEqual([]);
        });

        it('keeps the files of the control for a value that names others, and reports nothing', async () => {
            const el = await fixture(`<el-file-field name="others" label="CV"></el-file-field>`);
            await choose(el, file('cv.txt'));
            const changes = changesOf(el);

            el.value = ['passwords.txt'];
            await frames();
            await frames();

            expect(el.files.map((chosen) => chosen.name)).toEqual(['cv.txt']);
            expect(el.value).toEqual(['cv.txt']);
            expect(changes).toEqual([]);
        });

        it('has no file for a value it was rendered with or given without a choice', async () => {
            const el = await fixture(`<el-file-field name="rendered" label="CV" value='["cv.txt"]'></el-file-field>`);
            const changes = changesOf(el);
            await frames();
            expect(el.value).toEqual([]);

            el.value = ['cv.txt'];
            await frames();
            await frames();

            expect(el.value).toEqual([]);
            expect(el.files).toEqual([]);
            expect(changes).toEqual([]);
        });
    });

    describe('when the control loses the focus', () => {
        afterEach(() => vi.restoreAllMocks());

        it('is touched once the focus goes to another place of the page', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-file-field name="left" label="CV" required="true" error-message="Add your CV"></el-file-field>
                    <button>Next</button>
                </div>
            `);
            const el = wrapper.querySelector('el-file-field');
            expect(el.touched).toBe(false);

            controlOf(el).focus();
            await userEvent.tab();
            await frames();

            expect(document.activeElement).toBe(wrapper.querySelector('button'));
            expect(el.touched).toBe(true);
            expect(el.matches(':state(touched)')).toBe(true);
            expect(messageOf(el)).toBe('Add your CV');
        });

        // The dialog of the system takes the focus from the page: the control gets a blur, and the
        // document says that it has no focus.
        it('is not touched while the page itself has lost the focus, to the dialog of the system', async () => {
            const el = await fixture(
                `<el-file-field name="dialog" label="CV" required="true" error-message="Add your CV"></el-file-field>`,
            );
            controlOf(el).focus();
            await frames();

            vi.spyOn(document, 'hasFocus').mockReturnValue(false);
            controlOf(el).dispatchEvent(new FocusEvent('blur'));
            await frames();

            expect(el.touched).toBe(false);
            expect(messageOf(el)).toBe(null);
        });
    });

    describe('for a screen reader', () => {
        it('is named by its label and described by its messages', async () => {
            const el = await fixture(`
                <el-file-field name="named" label="Your CV" help-message="PDF, up to 5 MB" error-message="Add your CV" required="true"></el-file-field>
            `);
            const control = controlOf(el);

            expect(await accessibleName(control)).toBe('Your CV');
            expect(await accessibleDescription(control)).toBe('PDF, up to 5 MB');
            expect(control.required).toBe(true);
            expect(control.getAttribute('aria-invalid')).toBe('false');

            el.touched = true;
            el.valid = false;
            await frames();

            expect(await accessibleDescription(control)).toBe('PDF, up to 5 MB Add your CV');
            expect(control.getAttribute('aria-invalid')).toBe('true');
            expect(el.querySelector('.error-message').getAttribute('role')).toBe('alert');
        });

        it('shows the error message it was rendered with, a file the server did not take', async () => {
            const el = await fixture(`
                <el-file-field name="refused" label="Your CV" valid="false" error-message="The file is larger than 5 MB"></el-file-field>
            `);
            await frames();

            expect(el.touched).toBe(true);
            expect(messageOf(el)).toBe('The file is larger than 5 MB');
            expect(controlOf(el).getAttribute('aria-invalid')).toBe('true');
            expect(el.matches(':state(invalid)')).toBe(true);
        });

        it('has no detectable a11y violations, with and without its messages', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-file-field name="axe-plain" label="CV"></el-file-field>
                    <el-file-field name="axe-help" label="CV" help-message="PDF, up to 5 MB" multiple="true"></el-file-field>
                    <el-file-field name="axe-error" label="CV" valid="false" touched="true" error-message="Add your CV"></el-file-field>
                    <el-file-field name="axe-disabled" label="CV" disabled="true"></el-file-field>
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
                submits.push(new FormData(form));
            });
            return { form, submits, el: form.querySelector('el-file-field') };
        };

        it('submits its files under its name', async () => {
            const { form, el } = await formWith(
                `<el-file-field name="receipts" label="Receipts" multiple="true"></el-file-field>`,
            );

            await choose(el, file('a.txt', 'first'), file('b.txt', 'second'));

            const sent = new FormData(form).getAll('receipts');
            expect(sent.map((entry) => entry.name)).toEqual(['a.txt', 'b.txt']);
            expect(await sent[1].text()).toBe('second');
        });

        it('is left out while it is disabled', async () => {
            const { form } = await formWith(`<el-file-field name="off" label="CV" disabled="true"></el-file-field>`);

            expect(controlOf(form).disabled).toBe(true);
            expect(new FormData(form).has('off')).toBe(false);
        });

        it('keeps the form from being submitted while a required field has no file', async () => {
            const { form, submits, el } = await formWith(
                `<el-file-field name="cv" label="CV" required="true" error-message="Add your CV"></el-file-field>`,
            );

            form.requestSubmit();
            await frames();

            expect(submits).toHaveLength(0);
            expect([el.touched, el.valid]).toEqual([true, false]);
            expect(messageOf(el)).toBe('Add your CV');

            await choose(el, file('cv.txt'));
            form.requestSubmit();
            await frames();

            expect(submits).toHaveLength(1);
            expect(submits[0].get('cv').name).toBe('cv.txt');
        });

        it('has no file after the form was reset, and reports that', async () => {
            const { form, el } = await formWith(`<el-file-field name="back" label="CV"></el-file-field>`);
            await choose(el, file('cv.txt'));
            controlOf(el).focus();
            await userEvent.tab();
            await frames();
            expect(el.touched).toBe(true);
            const changes = changesOf(el);

            form.reset();
            await settled();
            await frames();

            expect(controlOf(el).files).toHaveLength(0);
            expect(el.files).toEqual([]);
            expect(el.value).toEqual([]);
            expect(el.touched).toBe(false);
            expect(changes).toEqual([[]]);
        });
    });

    describe('the size of the control', () => {
        it('keeps the look and the size of the browser', async () => {
            const wrapper = await fixture(`
                <div>
                    <input type="file" />
                    <el-file-field name="look" label="CV"></el-file-field>
                </div>
            `);
            const [plain, el] = wrapper.children;
            const look = (control) => {
                const { borderTopWidth, paddingTop, backgroundColor, fontSize } = getComputedStyle(control);
                return { borderTopWidth, paddingTop, backgroundColor, fontSize, height: sizeOf(control).height };
            };

            expect(look(controlOf(el))).toEqual(look(plain));
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            it('is at least --el-touch-target high', async () => {
                const el = await fixture(
                    `<el-file-field name="touch" label="CV" style="--el-touch-target: 44px"></el-file-field>`,
                );
                expect(sizeOf(controlOf(el)).height).toBeGreaterThanOrEqual(44);
            });

            it('keeps its height without --el-touch-target', async () => {
                const wrapper = await fixture(`
                    <div>
                        <input type="file" />
                        <el-file-field name="touch-plain" label="CV"></el-file-field>
                    </div>
                `);
                const [plain, el] = wrapper.children;
                expect(sizeOf(controlOf(el)).height).toBe(sizeOf(plain).height);
            });
        });
    });
});
