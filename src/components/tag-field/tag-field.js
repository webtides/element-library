import { html, defineElement, optionalAttribute } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import { define as defineTag } from '../tag/tag.js';
import { focusLeft } from '../../utils/focus.js';
import style from './tag-field.style.js';

/**
 * What the bubble of the browser says when a required field has no entry and no `errorMessage`.
 * The browser has no text of its own for it: the input is not what is required, the list is.
 */
const REQUIRED_MESSAGE = 'Add at least one entry.';

/**
 * A list of short texts the user writes: keywords, skills, recipients. A text input that turns
 * what is entered into entries, each an `el-tag` with a remove button, and submits them under one
 * name. Extends `FormField` and inherits its label / help / error / required surface.
 *
 * Enter adds the text of the input as an entry, and so does a comma, typed or pasted. Text that is
 * still in the input when its form is submitted becomes an entry as well.
 *
 * @element el-tag-field
 *
 * @fires {CustomEvent<string[]>} input-change - Fired when the entries change. `detail` is the
 *   list of the entries. Bubbles.
 *
 * @cssstate touched - Set once the user has left the field, or the browser has refused a submit
 *   because of it. Inherits `valid` and `invalid` from `FormField`.
 *
 * @property {string[]} value - The entries, in the order they were added. As an attribute it is
 *   JSON: `value='["TypeScript", "Svelte"]'`.
 * @property {boolean} required - Whether the list needs at least one entry.
 * @property {'small'|'medium'|'large'} size - Size of the input and of the tags. Default
 *   `'medium'`. Reflected to the `size` attribute. On the input it shows once the control is
 *   decorated (`styles/native.css`).
 * @property {string} placeholder - Placeholder text shown while the input is empty.
 * @property {string} removeLabel - The word the remove button of an entry is named with, in front
 *   of the entry: "Remove TypeScript". Default `'Remove'`.
 * @property {string} addedLabel - What a screen reader hears in front of an entry that was added:
 *   "Added TypeScript". Default `'Added'`.
 * @property {string} removedLabel - What a screen reader hears in front of an entry that was
 *   removed: "Removed TypeScript". Default `'Removed'`.
 * @property {string} status - What the field last told a screen reader. Set by the field.
 */
export default class TagField extends FormField {
    /**
     * Where the field listens for the submit of its form, see `afterUpdate()`.
     * @private
     */
    _submitRoot = undefined;

    constructor(options) {
        super({
            shadowRender: false,
            styles: [style],
            ...options,
            // The value of this field is a list, so the attribute is parsed, as element-js does for
            // any other. The size module selects the host by the `size` attribute.
            propertyOptions: { value: {}, size: { reflect: true }, ...options?.propertyOptions },
        });
    }

    properties() {
        return {
            ...super.properties(),
            value: [],
            size: 'medium',
            placeholder: '',
            removeLabel: 'Remove',
            addedLabel: 'Added',
            removedLabel: 'Removed',
            status: '',
        };
    }

    /**
     * As an input field, a required field without an entry is not marked as not valid before the
     * user has been in it: `styles/native.css` paints the border of such an input in the danger
     * colour. An error the page renders the field with (`valid="false"`) shows from the start.
     */
    connected() {
        // The entries are rendered as el-tag, also where the page has registered the field alone.
        defineTag();
        super.connected();
    }

    afterUpdate() {
        this._syncControl();
        super.afterUpdate();

        // `submit` passes the root of its tree on the way to the form, the document or a shadow
        // root: there the field hears it before every listener of the page on the form.
        if (!this._submitRoot) {
            this._submitRoot = this.getRootNode();
            this._submitRoot.addEventListener('submit', this._onFormSubmit, true);
        }
    }

    disconnected() {
        super.disconnected();
        this._submitRoot?.removeEventListener('submit', this._onFormSubmit, true);
        this._submitRoot = undefined;
    }

    /**
     * The form of the field is being submitted. Text that is still in the input becomes an entry:
     * nothing that was typed is lost on the way to the submit button.
     *
     * Not earlier, when the user leaves the field. A new entry makes the field higher, and what is
     * below it moves: the submit button would move away under the pointer that is pressing it, and
     * the click would be lost.
     *
     * The form data is put together right after this event, and a listener of the page can read it
     * in the same event. The hidden input of every entry has to be there by then, and element-js
     * renders a frame after a change: so the field is rendered here and now, also for an entry that
     * was added or removed a moment ago.
     * @private
     * @param {SubmitEvent} event
     */
    _onFormSubmit = (event) => {
        const control = this.$refs.input;
        if (!control || event.target !== control.form || this.disabled) return;
        this._addFromInput();
        this.update();
    };

    events() {
        return {
            '[ref=input]': {
                keydown: (event) => this._onKeydown(event),
                input: (event) => this._onInput(event),
                focus: () => this.onFocus(),
                invalid: (event) => this._onInvalid(event.target),
            },
            // On the field itself: the remove buttons are in the shadow roots of the tags, and what
            // comes out of them arrives here.
            this: {
                focusout: (event) => this._onFocusOut(event),
                'tag-remove': (event) => this._onRemove(event),
            },
        };
    }

    onFocus() {
        this.valid = this._computeValid();
    }

    onBlur() {
        this.touched = true;
        this.valid = this._computeValid();
    }

    /**
     * Enter adds the text of the input and does not submit the form. In the empty input it is left
     * to the browser, which submits the form, as in any text input.
     * @private
     * @param {KeyboardEvent} event
     */
    _onKeydown(event) {
        if (event.key !== 'Enter' || event.isComposing) return;
        if (this.$refs.input.value.trim() === '') return;

        event.preventDefault();
        this._addFromInput();
    }

    /**
     * A comma ends an entry. What is pasted or dropped is a list of entries, all of it. A comma
     * that is typed ends the entry in front of it, and what follows is the start of the next one.
     * The input is read and not the key: an on-screen keyboard does not say which key it was.
     *
     * Text in the input counts for a required field, see `_computeValid()`.
     * @private
     * @param {InputEvent} event
     */
    _onInput(event) {
        const control = this.$refs.input;

        if (control.value.includes(',')) {
            const parts = control.value.split(',');
            const pasted = ['insertFromPaste', 'insertFromDrop'].includes(event.inputType);
            control.value = pasted ? '' : parts.pop().trimStart();
            this._add(parts);
        }

        this.valid = this._computeValid();
        this._syncControl();
    }

    /**
     * The focus has left an element of the field. Once it has left the field, the field is touched.
     * @private
     * @param {FocusEvent} event
     */
    _onFocusOut(event) {
        if (focusLeft(this, event)) this.onBlur();
    }

    /**
     * The remove button of an entry was activated. The entry goes, and the focus with it: to the
     * entry that takes its place, or to the input after the last one was removed.
     * @private
     * @param {Event} event
     */
    _onRemove(event) {
        const tag = event.target;
        const index = Number(tag.dataset?.index);
        const values = this._values();
        if (!(index >= 0 && index < values.length)) return;

        const hadFocus = tag.matches(':focus-within');
        const [removed] = values.splice(index, 1);
        this.value = values;
        this.valid = this._computeValid();
        this._syncControl();
        this.status = `${this.removedLabel} ${removed}`;

        if (!hadFocus) return;
        this.requestUpdate().then(() => {
            const tags = this.querySelectorAll('el-tag');
            const next = tags[Math.min(index, tags.length - 1)];
            const target = next?.shadowRoot?.querySelector('[part="remove-button"]') ?? this.$refs.input;
            target?.focus();
        });
    }

    /**
     * Makes an entry of the text of the input, and empties the input.
     * @private
     * @returns {boolean} Whether there was an entry to add.
     */
    _addFromInput() {
        const control = this.$refs.input;
        if (!control) return false;
        const text = control.value;
        control.value = '';
        return this._add([text]);
    }

    /**
     * Adds entries to the list: trimmed, and neither an empty one nor one the list already has.
     * @private
     * @param {string[]} texts
     * @returns {boolean} Whether there was an entry to add.
     */
    _add(texts) {
        const values = this._values();
        const added = [];
        for (const text of texts) {
            const entry = String(text).trim();
            if (entry === '' || values.includes(entry) || added.includes(entry)) continue;
            added.push(entry);
        }
        if (added.length === 0) return false;

        this.value = [...values, ...added];
        this.valid = this._computeValid();
        this._syncControl();
        this.status = `${this.addedLabel} ${added.join(', ')}`;
        return true;
    }

    /**
     * The entries as a list of texts. An attribute that is no JSON list gives a single text.
     * @private
     * @returns {string[]}
     */
    _values() {
        if (this.value == null || this.value === '') return [];
        return (Array.isArray(this.value) ? this.value : [this.value]).map(String);
    }

    /**
     * Whether the field currently passes validation: required means at least one entry. Text in
     * the input counts as one: it becomes an entry when the form is submitted.
     * @private
     */
    _computeValid() {
        if (!this.required) return true;
        return this._values().length > 0 || (this.$refs?.input?.value ?? '').trim() !== '';
    }

    /**
     * A native input knows no "at least one entry": it is empty most of the time, with or without
     * entries. So the input carries that for the field, as a validity of its own: the browser then
     * refuses to submit the form, focuses the input and shows its bubble there, as it does for every
     * other field that is required and empty.
     *
     * After every render, and at once when the list changes: the form can be submitted before the
     * next render.
     * @private
     */
    _syncControl() {
        const message = this._computeValid() ? '' : this.errorMessage || REQUIRED_MESSAGE;
        this.$refs.input?.setCustomValidity(message);
    }

    /**
     * The input, the entries, what a screen reader is told, and one hidden input for every entry:
     * these are what the form submits, also before the script has run for a list the server
     * rendered.
     * @private
     */
    fieldTemplate() {
        const values = this._values();

        return html`
            <input
                ref="input"
                type="text"
                id="${this._idOf('input')}"
                placeholder="${this.placeholder}"
                enterkeyhint="enter"
                ?disabled="${this.disabled}"
                ${optionalAttribute(!!this.required, 'aria-required', 'true')}
                aria-describedby="${this._describedBy()}"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this._idOf('error-message')}"
            />
            ${this.tagsTemplate(values)}
            <span class="status" role="status">${this.status}</span>
            ${values.map(
                (value) =>
                    html`<input type="hidden" name="${this.name}" value="${value}" ?disabled="${this.disabled}" />`,
            )}
        `;
    }

    /**
     * The entries, as a list that has the name of the field. A field that is disabled has no
     * remove buttons.
     * @private
     * @param {string[]} values
     */
    tagsTemplate(values) {
        if (values.length === 0) return null;

        return html`
            <ul class="tags" role="list" ${optionalAttribute(!!this.label, 'aria-label', this.label)}>
                ${values.map(
                    (value, index) => html`
                        <li>
                            <el-tag
                                size="${this.size}"
                                removable="${this.disabled ? 'false' : 'true'}"
                                remove-label="${this.removeLabel}"
                                data-index="${index}"
                                >${value}</el-tag
                            >
                        </li>
                    `,
                )}
            </ul>
        `;
    }
}

export function define() {
    defineElement('el-tag-field', TagField);
}
