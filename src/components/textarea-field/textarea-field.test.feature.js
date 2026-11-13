import { describe, it, expect } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import axe from 'axe-core';
import { fixture, nextFrame, sizeOf, useTouchScreen } from '../../test-helpers.js';
import { define } from './textarea-field.js';
define();

describe('Feature | TextareaField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-textarea-field></el-textarea-field>`);
        await nextFrame();
    });

    it('renders the value as the content of the textarea', async () => {
        const el = await fixture(`<el-textarea-field name="body" value="Milk"></el-textarea-field>`);
        await nextFrame();
        const textarea = el.querySelector('textarea');

        expect(textarea.value).toBe('Milk');
        expect(textarea.textContent).toBe('Milk');
        expect(textarea.hasAttribute('value')).toBe(false);
    });

    it('renders an empty textarea without a value', async () => {
        const el = await fixture(`<el-textarea-field name="body"></el-textarea-field>`);
        await nextFrame();

        expect(el.querySelector('textarea').value).toBe('');
    });

    it('shows a value set through the property, line breaks and markup characters included', async () => {
        const el = await fixture(`<el-textarea-field name="body" value="Milk"></el-textarea-field>`);
        await nextFrame();

        el.value = 'a <b> & "c"\nline two';
        await nextFrame();
        await nextFrame();

        expect(el.querySelector('textarea').value).toBe('a <b> & "c"\nline two');
    });

    it('points aria-describedby at the help message', async () => {
        const el = await fixture(`
            <el-textarea-field name="body" label="Body" help-message="Up to 500 characters"></el-textarea-field>
        `);
        await nextFrame();
        const describedBy = el.querySelector('textarea').getAttribute('aria-describedby');

        expect(el.querySelector(`#${describedBy}`).textContent).toBe('Up to 500 characters');
    });

    it('has no detectable a11y violations when rendered with a label', async () => {
        const el = await fixture(`
            <el-textarea-field name="message" label="Message" help-message="Up to 500 characters"></el-textarea-field>
        `);
        await nextFrame();
        const results = await axe.run(el);
        expect(results.violations).toEqual([]);
    });

    it('passes the text entry attributes on to the textarea', async () => {
        const el = await fixture(`
            <el-textarea-field
                name="body"
                autocomplete="off"
                inputmode="text"
                enterkeyhint="enter"
                autocapitalize="sentences"
                autocorrect="on"
                spellcheck="true"
            ></el-textarea-field>
        `);
        await nextFrame();
        const textarea = el.querySelector('textarea');

        expect(textarea.getAttribute('autocomplete')).toBe('off');
        expect(textarea.getAttribute('inputmode')).toBe('text');
        expect(textarea.getAttribute('enterkeyhint')).toBe('enter');
        expect(textarea.getAttribute('autocapitalize')).toBe('sentences');
        expect(textarea.getAttribute('autocorrect')).toBe('on');
        expect(textarea.getAttribute('spellcheck')).toBe('true');
    });

    it('renders no text entry attribute that is not set', async () => {
        const el = await fixture(`<el-textarea-field name="body"></el-textarea-field>`);
        await nextFrame();
        const textarea = el.querySelector('textarea');

        for (const name of [
            'autocomplete',
            'inputmode',
            'enterkeyhint',
            'autocapitalize',
            'autocorrect',
            'spellcheck',
        ]) {
            expect(textarea.hasAttribute(name), name).toBe(false);
        }
    });

    describe('with text that arrives without a key going up', () => {
        // A paste with the mouse, dictation, a suggestion of an on-screen keyboard, a script that
        // fills the field: the textarea has the text and fires `input`, and no key is involved.
        const put = (textarea, text) => {
            textarea.focus();
            textarea.value = text;
            textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
        };

        it('keeps it in a required field, which renders right after it got the focus', async () => {
            const el = await fixture(`<el-textarea-field name="arrive-required" required="true"></el-textarea-field>`);
            await nextFrame();
            const textarea = el.querySelector('textarea');

            put(textarea, 'Pasted');
            await nextFrame();
            await nextFrame();

            expect(textarea.value).toBe('Pasted');
            expect(el.valid).toBe(true);
        });

        it('keeps it in a field that renders again for another reason', async () => {
            const el = await fixture(`<el-textarea-field name="arrive-plain" label="Note"></el-textarea-field>`);
            await nextFrame();
            const textarea = el.querySelector('textarea');

            put(textarea, 'Pasted');
            el.label = 'Message';
            await nextFrame();
            await nextFrame();

            expect(el.querySelector('label').textContent.trim()).toBe('Message');
            expect(textarea.value).toBe('Pasted');
        });

        it('takes it as its value and reports it with input-change', async () => {
            const el = await fixture(`<el-textarea-field name="arrive-value"></el-textarea-field>`);
            await nextFrame();
            const changes = [];
            el.addEventListener('input-change', (event) => changes.push(event.detail));

            put(el.querySelector('textarea'), 'Pasted');
            await nextFrame();
            await nextFrame();

            expect(el.value).toBe('Pasted');
            expect(changes).toEqual(['Pasted']);
        });
    });

    describe('with text that goes into the middle of its value', () => {
        const caret = (textarea) => [textarea.selectionStart, textarea.selectionEnd];
        const withCaretAfterHello = async (name) => {
            const el = await fixture(`<el-textarea-field name="${name}" value="Hello world"></el-textarea-field>`);
            await nextFrame();
            const textarea = el.querySelector('textarea');
            textarea.focus();
            textarea.setSelectionRange(5, 5);
            return { el, textarea };
        };

        it('keeps the caret where it is while keys are typed', async () => {
            const { el, textarea } = await withCaretAfterHello('caret-keys');

            await userEvent.keyboard('XY');
            await nextFrame();
            await nextFrame();

            expect(textarea.value).toBe('HelloXY world');
            expect(el.value).toBe('HelloXY world');
            expect(caret(textarea)).toEqual([7, 7]);
        });

        it('keeps the caret where it is when two characters come within one frame', async () => {
            const { el, textarea } = await withCaretAfterHello('caret-frame');

            // Fast typing, a key that repeats, a script that types: the field has seen the second
            // character before it has rendered for the first.
            for (const character of ['X', 'Y']) {
                textarea.setRangeText(character, textarea.selectionStart, textarea.selectionEnd, 'end');
                textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
                textarea.dispatchEvent(new KeyboardEvent('keyup', { key: character, bubbles: true }));
            }
            await nextFrame();
            await nextFrame();

            expect(textarea.value).toBe('HelloXY world');
            expect(el.value).toBe('HelloXY world');
            expect(caret(textarea)).toEqual([7, 7]);
        });

        it('keeps the caret behind text that is pasted', async () => {
            const { el, textarea } = await withCaretAfterHello('caret-paste');

            // A paste with the mouse: no key goes up after it.
            textarea.setRangeText(', dear', 5, 5, 'end');
            textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
            await nextFrame();
            await nextFrame();

            expect(textarea.value).toBe('Hello, dear world');
            expect(el.value).toBe('Hello, dear world');
            expect(caret(textarea)).toEqual([11, 11]);
        });
    });

    describe('with the mark of a touched field', () => {
        // A field is touched once it was left. From then on it renders a check mark or a cross.
        const fieldAboveButton = async (name, attributes = '') => {
            const wrapper = await fixture(`
                <div style="--el-color-success: rgb(1, 2, 3); --el-color-danger: rgb(4, 5, 6)">
                    <el-textarea-field name="${name}" label="Message" ${attributes}></el-textarea-field>
                    <button>Send</button>
                </div>
            `);
            const el = wrapper.querySelector('el-textarea-field');
            return { el, textarea: el.querySelector('textarea'), button: wrapper.querySelector('button') };
        };
        const leave = async (textarea) => {
            textarea.focus();
            textarea.blur();
            await nextFrame();
            await nextFrame();
        };

        for (const [state, mark, attributes] of [
            ['valid', '.valid', ''],
            ['not valid', '.invalid', 'required="true"'],
        ]) {
            it(`is as high after it was left as before, ${state}`, async () => {
                const { el, textarea, button } = await fieldAboveButton(`mark-height${mark}`, attributes);
                // `offsetTop`, not the place in the viewport: the focus can scroll the page.
                const before = { field: sizeOf(el).height, button: button.offsetTop };

                await leave(textarea);

                expect(el.querySelector(`.validity ${mark}`)).not.toBeNull();
                expect({ field: sizeOf(el).height, button: button.offsetTop }).toEqual(before);
            });
        }

        it('has the mark beside the textarea, at its top', async () => {
            const { el, textarea } = await fieldAboveButton('mark-place');
            await leave(textarea);
            const mark = el.querySelector('.validity').getBoundingClientRect();
            const control = textarea.getBoundingClientRect();

            // With a gap between the two.
            expect(mark.left).toBeGreaterThan(control.right);
            expect(mark.top).toBeCloseTo(control.top, 1);
        });

        it('has the mark inside the field when the textarea is as wide as the field', async () => {
            const { el, textarea } = await fieldAboveButton('mark-width');
            // As a theme does: the textarea takes the room that the mark beside it leaves.
            textarea.style.width = '100%';
            await leave(textarea);
            const mark = el.querySelector('.validity').getBoundingClientRect();

            expect(mark.left).toBeGreaterThanOrEqual(textarea.getBoundingClientRect().right);
            expect(mark.right).toBeLessThanOrEqual(el.getBoundingClientRect().right);
        });

        it('paints the mark in the colours of the tokens', async () => {
            const valid = await fieldAboveButton('mark-colour-valid');
            await leave(valid.textarea);
            expect(getComputedStyle(valid.el.querySelector('.validity .valid')).color).toBe('rgb(1, 2, 3)');

            const invalid = await fieldAboveButton('mark-colour-invalid', 'required="true"');
            await leave(invalid.textarea);
            expect(getComputedStyle(invalid.el.querySelector('.validity .invalid')).color).toBe('rgb(4, 5, 6)');
        });
    });

    describe('with the cross of a field that is not valid', () => {
        it('empties the textarea and the value of the field, and takes the same text again', async () => {
            const el = await fixture(`<el-textarea-field name="cross-text" label="Message"></el-textarea-field>`);
            const textarea = el.querySelector('textarea');
            await userEvent.click(textarea);
            await userEvent.keyboard('First draft');
            textarea.blur();
            await nextFrame();
            // As a page marks a field for an error that the server found.
            el.valid = false;
            await nextFrame();
            await nextFrame();
            const changes = [];
            el.addEventListener('input-change', (event) => changes.push(event.detail));

            await userEvent.click(el.querySelector('[data-clear-input]'));
            await nextFrame();
            await nextFrame();

            expect(textarea.value).toBe('');
            expect(el.value).toBe('');
            expect(el.valid).toBe(true);
            expect(changes).toEqual(['']);

            // The field knows that it is empty, so the text it had is a new value.
            el.value = 'First draft';
            await nextFrame();
            await nextFrame();
            expect(textarea.value).toBe('First draft');
        });
    });

    describe('in a native form', () => {
        const data = (form) => Object.fromEntries(new FormData(form));
        const inForm = (name, attributes = '') =>
            fixture(
                `<form><el-textarea-field name="${name}" label="Message" ${attributes}></el-textarea-field></form>`,
            );

        it('submits its value under its name', async () => {
            const form = await inForm('form-value', 'value="First draft"');
            expect(data(form)).toEqual({ 'form-value': 'First draft' });
        });

        it('submits a value that a script sets, and one that the user types', async () => {
            const form = await inForm('form-change', 'value="First draft"');
            const el = form.firstElementChild;

            el.value = 'Second draft';
            await nextFrame();
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'Second draft' });

            const control = el.querySelector('textarea');
            control.value = 'Third draft';
            control.dispatchEvent(new Event('change', { bubbles: true }));
            await nextFrame();
            expect(data(form)).toEqual({ 'form-change': 'Third draft' });
            expect(el.value).toBe('Third draft');
        });

        it('is left out while it is disabled', async () => {
            const form = await inForm('form-disabled', 'value="First draft" disabled="true"');
            expect(data(form)).toEqual({});
        });

        it('keeps the form from being submitted while it is required and empty', async () => {
            const form = await inForm('form-required', 'required="true"');
            expect(form.checkValidity()).toBe(false);

            form.firstElementChild.value = 'First draft';
            await nextFrame();
            await nextFrame();
            expect(form.checkValidity()).toBe(true);
        });
    });

    describe('on a touch screen', () => {
        useTouchScreen();

        it('makes the textarea and the clear cross at least --el-touch-target', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-textarea-field name="note" label="Note" rows="1"></el-textarea-field>
                </div>
            `);
            const el = wrapper.querySelector('el-textarea-field');
            el.touched = true;
            el.valid = false;
            await nextFrame();
            await nextFrame();

            expect(sizeOf(el.querySelector('textarea')).height).toBeGreaterThanOrEqual(44);
            const { width, height } = sizeOf(el.querySelector('[data-clear-input]'));
            expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
        });

        it('keeps the size of the textarea and of the field when the validity changes', async () => {
            const wrapper = await fixture(`
                <div style="--el-touch-target: 44px">
                    <el-textarea-field name="note-validity" label="Note" rows="1"></el-textarea-field>
                </div>
            `);
            const el = wrapper.querySelector('el-textarea-field');
            const textarea = el.querySelector('textarea');
            // As a theme does: the textarea takes the room that the mark beside it leaves.
            textarea.style.width = '100%';
            el.touched = true;
            await nextFrame();
            await nextFrame();
            const whileValid = { textarea: sizeOf(textarea), field: sizeOf(el) };

            el.valid = false;
            await nextFrame();
            await nextFrame();

            expect(el.querySelector('[data-clear-input]')).not.toBeNull();
            expect({ textarea: sizeOf(textarea), field: sizeOf(el) }).toEqual(whileValid);
        });
    });
});
