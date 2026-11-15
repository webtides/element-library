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
import { define } from './tag-field.js';
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
const controlOf = (el) => el.querySelector('input[type="text"]');
const tagsOf = (el) => [...el.querySelectorAll('el-tag')];
const entriesOf = (el) => tagsOf(el).map((tag) => tag.textContent.trim());
const hiddenOf = (el) => [...el.querySelectorAll('input[type="hidden"]')].map((input) => input.value);
const removeButtonOf = (tag) => tag.shadowRoot.querySelector('[part="remove-button"]');
const statusOf = (el) => el.querySelector('[role="status"]').textContent.trim();
const messageOf = (el) => el.querySelector('.error-message')?.textContent.trim() ?? null;
// What `input-change` reports for a field, from now on.
const changesOf = (el) => {
    const changes = [];
    el.addEventListener('input-change', (event) => changes.push(event.detail));
    return changes;
};
const type = async (el, keys) => {
    controlOf(el).focus();
    await userEvent.keyboard(keys);
    await frames();
};
// What the browser does for a paste: the control has the text, then the event.
const paste = async (el, text) => {
    const control = controlOf(el);
    control.focus();
    control.value = text;
    control.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
    await frames();
};
const SKILLS = `value='["TypeScript", "Svelte", "CSS"]'`;

describe('Feature | TagField', () => {
    it('can connect without errors', async () => {
        const el = await fixture(`<el-tag-field></el-tag-field>`);
        await nextFrame();
        expect(controlOf(el)).not.toBeNull();
    });

    describe('the value', () => {
        it('is an empty list by default: an input and no list of entries', async () => {
            const el = await fixture(`<el-tag-field name="none" label="Skills"></el-tag-field>`);

            expect(el.value).toEqual([]);
            expect(el.querySelector('.tags')).toBeNull();
            expect(hiddenOf(el)).toEqual([]);
            // The input itself is not submitted.
            expect(controlOf(el).hasAttribute('name')).toBe(false);
        });

        it('renders a tag and a hidden input for every entry of the attribute, in their order', async () => {
            const el = await fixture(`<el-tag-field name="skills" label="Skills" ${SKILLS}></el-tag-field>`);
            await frames();

            expect(el.value).toEqual(['TypeScript', 'Svelte', 'CSS']);
            expect(entriesOf(el)).toEqual(['TypeScript', 'Svelte', 'CSS']);
            expect(hiddenOf(el)).toEqual(['TypeScript', 'Svelte', 'CSS']);
            expect(el.querySelectorAll('input[type="hidden"][name="skills"]')).toHaveLength(3);
        });

        it('follows a list that a script sets, and reports it', async () => {
            const el = await fixture(`<el-tag-field name="script" label="Skills" ${SKILLS}></el-tag-field>`);
            const changes = changesOf(el);

            el.value = ['HTML'];
            await frames();

            expect(entriesOf(el)).toEqual(['HTML']);
            expect(hiddenOf(el)).toEqual(['HTML']);
            expect(changes).toEqual([['HTML']]);

            el.value = [];
            await frames();
            expect(el.querySelector('.tags')).toBeNull();
            expect(hiddenOf(el)).toEqual([]);
        });

        it('takes an attribute that is no list as one entry', async () => {
            const el = await fixture(`<el-tag-field name="single" label="Skills" value="Svelte"></el-tag-field>`);
            await frames();

            expect(entriesOf(el)).toEqual(['Svelte']);
            expect(hiddenOf(el)).toEqual(['Svelte']);
        });
    });

    describe('when the user adds entries', () => {
        it('adds the text of the input with Enter, empties the input and keeps the focus in it', async () => {
            const el = await fixture(`<el-tag-field name="enter" label="Skills"></el-tag-field>`);
            const changes = changesOf(el);

            await type(el, 'TypeScript{Enter}');
            await type(el, 'Svelte{Enter}');

            expect(el.value).toEqual(['TypeScript', 'Svelte']);
            expect(entriesOf(el)).toEqual(['TypeScript', 'Svelte']);
            expect(hiddenOf(el)).toEqual(['TypeScript', 'Svelte']);
            expect(controlOf(el).value).toBe('');
            expect(document.activeElement).toBe(controlOf(el));
            expect(changes).toEqual([['TypeScript'], ['TypeScript', 'Svelte']]);
        });

        it('adds the text in front of a comma that is typed, and goes on with what follows', async () => {
            const el = await fixture(`<el-tag-field name="comma" label="Skills"></el-tag-field>`);

            await type(el, 'TypeScript,Sv');

            expect(el.value).toEqual(['TypeScript']);
            expect(controlOf(el).value).toBe('Sv');

            await type(el, 'elte,');
            expect(el.value).toEqual(['TypeScript', 'Svelte']);
            expect(controlOf(el).value).toBe('');
        });

        it('adds every entry of a list that is pasted', async () => {
            const el = await fixture(`<el-tag-field name="pasted" label="Skills"></el-tag-field>`);
            const changes = changesOf(el);

            await paste(el, 'TypeScript, Svelte ,CSS');

            expect(el.value).toEqual(['TypeScript', 'Svelte', 'CSS']);
            expect(controlOf(el).value).toBe('');
            expect(changes).toEqual([['TypeScript', 'Svelte', 'CSS']]);
        });

        it('trims an entry, and adds neither an empty one nor one the list already has', async () => {
            const el = await fixture(`<el-tag-field name="clean" label="Skills" value='["Svelte"]'></el-tag-field>`);
            const changes = changesOf(el);

            await type(el, '  CSS  {Enter}');
            expect(el.value).toEqual(['Svelte', 'CSS']);

            await type(el, 'Svelte{Enter}');
            await paste(el, ' , CSS,,');

            expect(el.value).toEqual(['Svelte', 'CSS']);
            expect(controlOf(el).value).toBe('');
            expect(changes).toEqual([['Svelte', 'CSS']]);
        });

        it('keeps the text in the input when the user leaves the field, which is touched then', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-tag-field name="left" label="Skills"></el-tag-field>
                    <button>Next</button>
                </div>
            `);
            const el = wrapper.querySelector('el-tag-field');
            const height = sizeOf(el).height;

            await type(el, 'TypeScript');
            expect(el.touched).toBe(false);

            await userEvent.tab();
            await frames();

            expect(document.activeElement).toBe(wrapper.querySelector('button'));
            expect(el.value).toEqual([]);
            expect(controlOf(el).value).toBe('TypeScript');
            expect(el.touched).toBe(true);
            // Nothing below the field has moved.
            expect(sizeOf(el).height).toBe(height);
        });

        it('is not touched while the focus moves inside the field, to a remove button', async () => {
            const el = await fixture(`<el-tag-field name="inside" label="Skills" value='["Svelte"]'></el-tag-field>`);
            await frames();

            await type(el, 'Type');
            await userEvent.tab();
            await frames();

            expect(tagsOf(el)[0].matches(':focus-within')).toBe(true);
            expect(controlOf(el).value).toBe('Type');
            expect(el.touched).toBe(false);
        });
    });

    describe('when the user removes an entry', () => {
        it('takes away the entry whose remove button is clicked', async () => {
            const el = await fixture(`<el-tag-field name="click" label="Skills" ${SKILLS}></el-tag-field>`);
            await frames();
            const changes = changesOf(el);

            await userEvent.click(removeButtonOf(tagsOf(el)[1]));
            await frames();

            expect(el.value).toEqual(['TypeScript', 'CSS']);
            expect(entriesOf(el)).toEqual(['TypeScript', 'CSS']);
            expect(hiddenOf(el)).toEqual(['TypeScript', 'CSS']);
            expect(changes).toEqual([['TypeScript', 'CSS']]);
        });

        it('moves the focus to the entry that takes its place, and to the input after the last one', async () => {
            const el = await fixture(`<el-tag-field name="keys" label="Skills" ${SKILLS}></el-tag-field>`);
            await frames();
            const focused = () => {
                const tag = tagsOf(el).find((one) => one.matches(':focus-within'));
                return tag ? tag.textContent.trim() : document.activeElement === controlOf(el) ? 'input' : null;
            };

            removeButtonOf(tagsOf(el)[1]).focus();
            await userEvent.keyboard('{Enter}');
            await frames();
            await frames();
            // Svelte is gone, CSS has its place.
            expect(el.value).toEqual(['TypeScript', 'CSS']);
            expect(focused()).toBe('CSS');

            await userEvent.keyboard('{Enter}');
            await frames();
            await frames();
            // CSS was the last entry: the one in front of it.
            expect(el.value).toEqual(['TypeScript']);
            expect(focused()).toBe('TypeScript');

            await userEvent.keyboard('{Enter}');
            await frames();
            await frames();
            expect(el.value).toEqual([]);
            expect(focused()).toBe('input');
        });

        it('has no remove buttons while it is disabled', async () => {
            const el = await fixture(
                `<el-tag-field name="locked" label="Skills" ${SKILLS} disabled="true"></el-tag-field>`,
            );
            await frames();

            expect(entriesOf(el)).toEqual(['TypeScript', 'Svelte', 'CSS']);
            expect(tagsOf(el).map((tag) => removeButtonOf(tag))).toEqual([null, null, null]);
            expect(controlOf(el).disabled).toBe(true);
        });
    });

    describe('for a screen reader', () => {
        it('is a text field named by its label and described by its messages', async () => {
            const el = await fixture(`
                <el-tag-field name="named" label="Skills" help-message="Press Enter after each one" error-message="Add a skill" required="true"></el-tag-field>
            `);
            const control = controlOf(el);

            expect(await accessibleRole(control)).toBe('textbox');
            expect(await accessibleName(control)).toBe('Skills');
            expect(await accessibleDescription(control)).toBe('Press Enter after each one');
            expect(control.getAttribute('aria-required')).toBe('true');

            el.touched = true;
            el.valid = false;
            await frames();

            expect(await accessibleDescription(control)).toBe('Press Enter after each one Add a skill');
            expect(control.getAttribute('aria-invalid')).toBe('true');
            expect(el.querySelector('.error-message').getAttribute('role')).toBe('alert');
        });

        it('has the entries as a list with the name of the field, after the input', async () => {
            const el = await fixture(`<el-tag-field name="list" label="Skills" ${SKILLS}></el-tag-field>`);
            await frames();
            const list = el.querySelector('.tags');

            expect(await accessibleRole(list)).toBe('list');
            expect(await accessibleName(list)).toBe('Skills');
            expect(list.querySelectorAll(':scope > li')).toHaveLength(3);
            expect(controlOf(el).compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        });

        it('names every remove button with its entry, in the words of the page', async () => {
            const el = await fixture(`
                <el-tag-field name="buttons" label="Skills" ${SKILLS} remove-label="Entfernen"></el-tag-field>
            `);
            await frames();

            const names = [];
            for (const tag of tagsOf(el)) names.push(await accessibleName(removeButtonOf(tag)));
            expect(names).toEqual(['Entfernen TypeScript', 'Entfernen Svelte', 'Entfernen CSS']);
        });

        it('says what was added and what was removed', async () => {
            const el = await fixture(`<el-tag-field name="said" label="Skills"></el-tag-field>`);
            expect(statusOf(el)).toBe('');

            await type(el, 'TypeScript{Enter}');
            expect(statusOf(el)).toBe('Added TypeScript');

            await paste(el, 'Svelte, CSS');
            expect(statusOf(el)).toBe('Added Svelte, CSS');

            await userEvent.click(removeButtonOf(tagsOf(el)[0]));
            await frames();
            expect(statusOf(el)).toBe('Removed TypeScript');
        });

        it('says it in the words of the page', async () => {
            const el = await fixture(`
                <el-tag-field name="said-de" label="Skills" added-label="Hinzugefügt:" removed-label="Entfernt:"></el-tag-field>
            `);

            await type(el, 'Svelte{Enter}');
            expect(statusOf(el)).toBe('Hinzugefügt: Svelte');

            await userEvent.click(removeButtonOf(tagsOf(el)[0]));
            await frames();
            expect(statusOf(el)).toBe('Entfernt: Svelte');
        });

        it('shows the error message it was rendered with', async () => {
            const el = await fixture(`
                <el-tag-field name="refused" label="Skills" ${SKILLS} valid="false" error-message="No more than two skills"></el-tag-field>
            `);
            await frames();

            expect(el.touched).toBe(true);
            expect(messageOf(el)).toBe('No more than two skills');
            expect(controlOf(el).getAttribute('aria-invalid')).toBe('true');
        });

        it('has no detectable a11y violations, with and without entries and messages', async () => {
            const wrapper = await fixture(`
                <div>
                    <el-tag-field name="axe-plain" label="Skills"></el-tag-field>
                    <el-tag-field name="axe-entries" label="Skills" ${SKILLS} help-message="Press Enter after each one"></el-tag-field>
                    <el-tag-field name="axe-error" label="Skills" required="true" valid="false" touched="true" error-message="Add a skill"></el-tag-field>
                    <el-tag-field name="axe-disabled" label="Skills" ${SKILLS} disabled="true"></el-tag-field>
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
            return { form, submits, el: form.querySelector('el-tag-field') };
        };

        it('submits every entry under its name', async () => {
            const { form, el } = await formWith(`<el-tag-field name="skills" label="Skills" ${SKILLS}></el-tag-field>`);
            await frames();
            expect(new FormData(form).getAll('skills')).toEqual(['TypeScript', 'Svelte', 'CSS']);

            await type(el, 'HTML{Enter}');
            await userEvent.click(removeButtonOf(tagsOf(el)[0]));
            await frames();

            expect(new FormData(form).getAll('skills')).toEqual(['Svelte', 'CSS', 'HTML']);
            // Nothing but the entries: the input has no name.
            expect([...new FormData(form).keys()]).toEqual(['skills', 'skills', 'skills']);
        });

        it('is left out while it is disabled', async () => {
            const { form } = await formWith(
                `<el-tag-field name="off" label="Skills" ${SKILLS} disabled="true"></el-tag-field>`,
            );
            await frames();

            expect(new FormData(form).has('off')).toBe(false);
        });

        it('adds an entry with Enter and does not submit the form; Enter in the empty input submits it', async () => {
            const { submits, el } = await formWith(`<el-tag-field name="enter-form" label="Skills"></el-tag-field>`);

            await type(el, 'Svelte{Enter}');
            expect(submits).toHaveLength(0);
            expect(el.value).toEqual(['Svelte']);

            await type(el, '{Enter}');
            expect(submits).toHaveLength(1);
            expect(submits[0].getAll('enter-form')).toEqual(['Svelte']);
        });

        it('submits the text that is still in the input as an entry, and has it as one from then on', async () => {
            const { form, submits, el } = await formWith(
                `<el-tag-field name="pending" label="Skills" value='["Svelte"]'></el-tag-field>`,
            );
            await frames();
            const changes = changesOf(el);

            await type(el, ' CSS ');
            await userEvent.click(form.querySelector('button[type="submit"]'));
            await frames();

            // The listener of the page read the form data in the submit event.
            expect(submits).toHaveLength(1);
            expect(submits[0].getAll('pending')).toEqual(['Svelte', 'CSS']);
            expect(el.value).toEqual(['Svelte', 'CSS']);
            expect(entriesOf(el)).toEqual(['Svelte', 'CSS']);
            expect(controlOf(el).value).toBe('');
            expect(changes).toEqual([['Svelte', 'CSS']]);
        });

        it('submits that text for a submit from a script and for Enter in another field', async () => {
            const { form, submits, el } = await formWith(`
                <el-tag-field name="pending-other" label="Skills"></el-tag-field>
                <input name="city" aria-label="City" value="Berlin" />
            `);
            await frames();

            await type(el, 'CSS');
            form.requestSubmit();
            await frames();
            expect(submits[0].getAll('pending-other')).toEqual(['CSS']);

            await type(el, 'HTML');
            form.querySelector('[name="city"]').focus();
            await userEvent.keyboard('{Enter}');
            await frames();
            expect(submits[1].getAll('pending-other')).toEqual(['CSS', 'HTML']);
        });

        // element-js renders a frame after a change. A submit can come sooner.
        it('submits an entry that was added in the same moment, in a required field as well', async () => {
            const { form, submits, el } = await formWith(
                `<el-tag-field name="at-once" label="Skills" required="true"></el-tag-field>`,
            );
            await frames();
            const control = controlOf(el);

            control.focus();
            control.value = 'Svelte';
            control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
            form.requestSubmit();

            expect(submits).toHaveLength(1);
            expect(submits[0].getAll('at-once')).toEqual(['Svelte']);
        });

        it('makes no entry of that text while a script only reads the form data', async () => {
            const { form, el } = await formWith(`<el-tag-field name="read" label="Skills"></el-tag-field>`);

            await type(el, 'CS');
            const read = new FormData(form).getAll('read');
            await frames();

            expect(read).toEqual([]);
            expect(el.value).toEqual([]);
            expect(controlOf(el).value).toBe('CS');
        });

        it('keeps that text in the input when the browser refuses the submit for another field', async () => {
            const { form, submits, el } = await formWith(`
                <el-tag-field name="refused-other" label="Skills"></el-tag-field>
                <input name="city" aria-label="City" required />
            `);

            await type(el, 'CSS');
            form.requestSubmit();
            await frames();

            expect(submits).toHaveLength(0);
            expect(el.value).toEqual([]);
            expect(controlOf(el).value).toBe('CSS');
        });

        // The list of entries appears below the input. Had it appeared when the input lost the focus,
        // the button would have moved away under the pointer, and the click would have been lost.
        it('submits a required field whose only entry is still text in the input', async () => {
            const { form, submits, el } = await formWith(
                `<el-tag-field name="pending-required" label="Skills" required="true" error-message="Add a skill"></el-tag-field>`,
            );
            await frames();

            await type(el, 'CSS');
            await userEvent.click(form.querySelector('button[type="submit"]'));
            await frames();

            expect(submits).toHaveLength(1);
            expect(submits[0].getAll('pending-required')).toEqual(['CSS']);
            expect(messageOf(el)).toBe(null);
        });

        it('goes back to the list it was rendered with when the form is reset', async () => {
            const { form, el } = await formWith(
                `<el-tag-field name="back" label="Skills" value='["Svelte"]'></el-tag-field>`,
            );
            await frames();
            await type(el, 'CSS{Enter}');
            await type(el, 'HT');
            expect(el.value).toEqual(['Svelte', 'CSS']);

            form.reset();
            await settled();
            await frames();

            expect(el.value).toEqual(['Svelte']);
            expect(entriesOf(el)).toEqual(['Svelte']);
            expect(hiddenOf(el)).toEqual(['Svelte']);
            expect(controlOf(el).value).toBe('');
            expect(el.touched).toBe(false);
        });
    });

    describe('when it is required', () => {
        const requiredForm = async (name, attributes = '') => {
            const form = await fixture(`
                <form>
                    <el-tag-field name="${name}" label="Skills" required="true" error-message="Add a skill" ${attributes}></el-tag-field>
                    <button type="submit">Send</button>
                </form>
            `);
            const submits = [];
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submits.push(new FormData(form));
            });
            await frames();
            return { form, submits, el: form.querySelector('el-tag-field') };
        };

        it('is not marked before the user has been in it, as an input field, and is not valid then', async () => {
            const { el } = await requiredForm('needed');

            expect(el.matches(':state(invalid)')).toBe(false);
            expect(el.touched).toBe(false);
            expect(messageOf(el)).toBe(null);
            // The browser knows already: it would refuse to submit the form.
            expect(controlOf(el).validity.valid).toBe(false);

            controlOf(el).focus();
            await userEvent.tab();
            await frames();

            expect([el.touched, el.valid]).toEqual([true, false]);
            expect(el.matches(':state(invalid)')).toBe(true);
            expect(messageOf(el)).toBe('Add a skill');
        });

        it('keeps the form from being submitted, with its message in the bubble of the browser', async () => {
            const { form, submits, el } = await requiredForm('refused-submit');

            form.requestSubmit();
            await frames();

            expect(submits).toHaveLength(0);
            expect(controlOf(el).validationMessage).toBe('Add a skill');
            expect([el.touched, el.valid]).toEqual([true, false]);
            expect(messageOf(el)).toBe('Add a skill');
        });

        it('is valid with an entry, and not valid again once the last one is removed', async () => {
            const { form, submits, el } = await requiredForm('filled');

            await type(el, 'Svelte{Enter}');
            expect(el.valid).toBe(true);
            expect(controlOf(el).validity.valid).toBe(true);
            form.requestSubmit();
            await frames();
            expect(submits).toHaveLength(1);

            await userEvent.click(removeButtonOf(tagsOf(el)[0]));
            await frames();
            expect(el.valid).toBe(false);
            expect(controlOf(el).validity.valid).toBe(false);
        });

        it('is valid while there is text in the input, which becomes an entry with the submit', async () => {
            const { el } = await requiredForm('typed');

            await type(el, 'C');
            expect(el.valid).toBe(true);
            expect(controlOf(el).validity.valid).toBe(true);

            await type(el, '{Backspace}');
            expect(el.valid).toBe(false);
            expect(controlOf(el).validity.valid).toBe(false);

            await type(el, '   ');
            expect(el.valid).toBe(false);
        });

        it('is valid from the start with a rendered entry', async () => {
            const { el } = await requiredForm('rendered', `value='["Svelte"]'`);

            expect(el.valid).toBe(true);
            expect(controlOf(el).validity.valid).toBe(true);
        });
    });

    describe('the layout', () => {
        it('has the entries below the input, in rows that wrap', async () => {
            const wrapper = await fixture(`
                <div style="width: 200px">
                    <el-tag-field name="wraps" label="Skills" value='["TypeScript", "Svelte", "Cascading Style Sheets", "HTML"]'></el-tag-field>
                </div>
            `);
            await frames();
            const el = wrapper.querySelector('el-tag-field');
            const input = controlOf(el).getBoundingClientRect();
            const tags = tagsOf(el).map((tag) => tag.getBoundingClientRect());

            for (const tag of tags) {
                expect(tag.top).toBeGreaterThanOrEqual(input.bottom);
                expect(tag.right).toBeLessThanOrEqual(wrapper.getBoundingClientRect().right);
            }
            // More than one row.
            expect(new Set(tags.map((tag) => Math.round(tag.top))).size).toBeGreaterThan(1);
        });

        it('cuts an entry off that is longer than the field', async () => {
            const wrapper = await fixture(`
                <div style="width: 160px">
                    <el-tag-field name="long" label="Skills" value='["An entry that is far too long for a field of this width"]'></el-tag-field>
                </div>
            `);
            await frames();
            const [tag] = tagsOf(wrapper);

            expect(sizeOf(tag).width).toBeLessThanOrEqual(160);
            expect(wrapper.scrollWidth).toBeLessThanOrEqual(160);
        });

        it('gives its size to the tags', async () => {
            const el = await fixture(
                `<el-tag-field name="sized" label="Skills" size="small" ${SKILLS}></el-tag-field>`,
            );
            await frames();
            expect(tagsOf(el).map((tag) => tag.getAttribute('size'))).toEqual(['small', 'small', 'small']);

            el.size = 'large';
            await frames();
            await frames();
            expect(tagsOf(el).map((tag) => tag.getAttribute('size'))).toEqual(['large', 'large', 'large']);
        });

        it('keeps what a screen reader is told off the screen', async () => {
            const el = await fixture(`<el-tag-field name="status" label="Skills"></el-tag-field>`);
            const before = sizeOf(el).height;

            await type(el, 'Svelte{Enter}');
            await userEvent.click(removeButtonOf(tagsOf(el)[0]));
            await frames();

            expect(statusOf(el)).toBe('Removed Svelte');
            expect(sizeOf(el.querySelector('[role="status"]'))).toEqual({ width: 1, height: 1 });
            expect(sizeOf(el).height).toBe(before);
        });

        describe('on a touch screen', () => {
            useTouchScreen();

            it('has an input and remove buttons that are at least --el-touch-target high', async () => {
                const el = await fixture(
                    `<el-tag-field name="touch" label="Skills" ${SKILLS} style="--el-touch-target: 44px"></el-tag-field>`,
                );
                await frames();

                expect(sizeOf(controlOf(el)).height).toBeGreaterThanOrEqual(44);
                for (const tag of tagsOf(el)) {
                    expect(sizeOf(removeButtonOf(tag)).height).toBeGreaterThanOrEqual(44);
                    expect(sizeOf(removeButtonOf(tag)).width).toBeGreaterThanOrEqual(44);
                }
            });
        });
    });
});
