import { html, defineElement, optionalAttribute } from '@webtides/element-js';
import FormField, { FormFieldEvents } from '../form-field/form-field.js';
import style from './file-field.style.js';

/**
 * One or several files for a form. Renders a native `<input type="file">`, so the dialog of the
 * system, a drop onto the control, the keyboard and the form submission are the ones of the
 * browser. Extends `FormField` and inherits its label / help / error / required surface.
 *
 * The files come from the user. A script cannot choose one, the browser does not allow that; it can
 * take the choice away with an empty `value`.
 *
 * @element el-file-field
 *
 * @fires {CustomEvent<string[]>} input-change - Fired when the user has chosen files, and when the
 *   choice was taken away. `detail` is the list of the names; the files are in `files` of the
 *   element. Bubbles.
 *
 * @cssstate touched - Set on the host once the user has left the control for another place of the
 *   page, or the browser has refused a submit because of it. Inherits `valid` and `invalid` from
 *   `FormField`.
 *
 * @property {string[]} value - The names of the chosen files. It follows the control: a script can
 *   set it to an empty list, which takes the choice away, and to nothing else.
 * @property {string} accept - Passed on to the control as its `accept` attribute: the kinds of
 *   files the dialog offers (`'image/*'`, `'.pdf,.docx'`). Empty (the default) offers every file.
 * @property {boolean} multiple - Whether more than one file can be chosen. Default `false`.
 * @property {string | null} capture - Passed on as `capture`: a phone takes the picture or the
 *   recording with its camera (`'user'`, `'environment'`) and does not open its files. `null` (the
 *   default) leaves the attribute out.
 * @property {'small'|'medium'|'large'} size - Size of the control: its height, its padding and its
 *   font size. Default `'medium'`. Reflected to the `size` attribute. It shows once the control is
 *   decorated (`styles/native.css`); a control with the look of the browser keeps its size.
 */
export default class FileField extends FormField {
    /**
     * The names the control had when the field last looked. See `_matchControl()`.
     * @private
     */
    _chosen = [];

    /**
     * The value that `input-change` last reported, or that the field started with. See `watch()`.
     * @private
     */
    _reportedValue = undefined;

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
            accept: '',
            multiple: false,
            capture: null,
            size: 'medium',
        };
    }

    /**
     * The chosen files, as the control has them.
     * @returns {File[]}
     */
    get files() {
        return [...(this.$refs?.input?.files ?? [])];
    }

    afterUpdate() {
        // Before the form field keeps the state for a reset: what the field takes over from the
        // control is part of it.
        this._matchControl();
        if (this._reportedValue === undefined) this._reportedValue = JSON.stringify(this._names());
        super.afterUpdate();
    }

    watch() {
        return {
            ...super.watch(),
            // The watcher runs a frame after the change, once for every change, and the field can
            // have taken another value over from the control by then. So it is the value of now
            // that is reported, and each one once.
            value: () => {
                this._matchControl();
                this._report();
            },
        };
    }

    events() {
        return {
            '[ref=input]': {
                change: () => this.onChange(),
                focus: () => this.onFocus(),
                // The dialog of the system takes the focus from the page, and gives it back. The
                // user has not left the control by that: a required field would show its error
                // message behind the dialog. The field is touched once the focus goes to another
                // place of the page.
                blur: () => document.hasFocus() && this.onBlur(),
                invalid: (event) => this._onInvalid(event.target),
            },
        };
    }

    /**
     * The user has chosen files, or has taken the choice away in the dialog.
     * @returns {void}
     */
    onChange() {
        const control = this.$refs.input;
        this._chosen = this._namesOf(control);
        this.value = this._chosen;
        this.valid = control.validity.valid;
        // Files with the names of the ones before are another choice all the same, and one the
        // watcher does not see: the value has not changed.
        this._report(true);
    }

    /**
     * Fires `input-change` with the value of now, once for every value.
     * @private
     * @param {boolean} [always] - Also when the value is the one that was reported last.
     */
    _report(always = false) {
        const value = JSON.stringify(this._names());
        if (!always && value === this._reportedValue) return;
        this._reportedValue = value;
        this.dispatch(FormFieldEvents.INPUT_CHANGE, this._names());
    }

    /**
     * The value as a list of names. An attribute that is no JSON list gives a single text.
     * @private
     * @returns {string[]}
     */
    _names() {
        if (this.value == null || this.value === '') return [];
        return (Array.isArray(this.value) ? this.value : [this.value]).map(String);
    }

    /**
     * @private
     * @param {HTMLInputElement} control
     * @returns {string[]}
     */
    _namesOf(control) {
        return [...control.files].map((file) => file.name);
    }

    /**
     * Makes `value` say what the control has, after every render and every change of `value`.
     *
     * The browser lets nobody but the user choose a file, so the control is what counts: a value
     * from outside that names other files is put back to the names of the control. The one thing a
     * script can do is take the choice away. An empty value after a choice does that; an empty
     * value from the start does not, the browser can have brought a choice back with the page.
     * @private
     */
    _matchControl() {
        const control = this.$refs.input;
        if (!control) return;

        if (this._names().length === 0 && this._chosen.length > 0 && control.files.length > 0) {
            control.value = '';
        }

        this._chosen = this._namesOf(control);
        if (JSON.stringify(this._names()) !== JSON.stringify(this._chosen)) this.value = this._chosen;
    }

    /** @private */
    fieldTemplate() {
        const capture = this.capture ?? false;

        return html`
            <input
                ref="input"
                type="file"
                id="${this._idOf('input')}"
                name="${this.name}"
                ?multiple="${this.multiple}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                ${optionalAttribute(!!this.accept, 'accept', this.accept)}
                ${optionalAttribute(capture !== false, 'capture', capture)}
                aria-describedby="${this._describedBy()}"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this._idOf('error-message')}"
            />
        `;
    }
}

export function define() {
    defineElement('el-file-field', FileField);
}
