import { html, defineElement, classMap } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './textarea-field.style.js';

/**
 * Native `<textarea>` wrapper with label, help text, validation feedback (visual
 * checkmark / cross indicators) and ARIA wiring. Extends `FormField` and inherits its
 * label / help / error / required surface.
 *
 * @element el-textarea-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the textarea's value changes.
 *   `detail` is the new value. Bubbles.
 *
 * @property {string} placeholder - Placeholder text shown while the textarea is empty.
 * @property {number} rows - Number of visible text rows. Forwarded to the underlying
 *   `<textarea>`'s `rows` attribute.
 */
export default class TextareaField extends FormField {
    /**
     * The value the control and the `value` property last agreed on, see `_syncControlValue()`.
     * @private
     */
    _controlValue = undefined;

    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            placeholder: '',
            rows: 3,
        };
    }

    watch() {
        const watchers = super.watch();
        return {
            ...watchers,
            value: (value, oldValue) => {
                this._syncControlValue(value);
                watchers.value(value, oldValue);
            },
        };
    }

    onChange() {
        this._controlValue = this.$refs.input.value;
        super.onChange();
    }

    /**
     * The template renders the value as the text content of the textarea, so that server-rendered
     * markup carries it. Text content is only the default value of a textarea: once the field has
     * been edited, the control no longer shows it. A value set from outside is therefore written to
     * the control as well. A value that came from the control itself is not written back, so text
     * typed between a change and the next render is kept.
     * @private
     * @param {string | null} value
     */
    _syncControlValue(value) {
        const controlValue = value ?? '';
        if (!this.$refs.input || controlValue === this._controlValue) return;
        this._controlValue = controlValue;
        this.$refs.input.value = controlValue;
    }

    /** @private */
    fieldTemplate() {
        const classes = { 'is-valid': !!this.valid, 'is-invalid': !this.valid };
        // The value has to follow the opening tag on the same line: element-js 1.3.1 only renders an
        // interpolation into a textarea when the content between the tags has no line break. The
        // formatter would put one there, so it must not touch this template.
        // oxfmt-ignore
        return html`
            <textarea
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                rows="${this.rows}"
                placeholder="${this.placeholder}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                aria-describedby="${this.name}-help-message"
            >${this.value ?? ''}</textarea>
            ${
                this.touched
                    ? html`
                          <div class="validity ${classMap(classes)}">
                              ${
                                  this.valid
                                      ? html` <span class="valid h-4 w-4">&checkmark;</span> `
                                      : html` <span class="invalid h-4 w-4" data-clear-input>&cross;</span> `
                              }
                          </div>
                      `
                    : ''
            }
        `;
    }
}

export function define() {
    defineElement('el-textarea-field', TextareaField);
}
