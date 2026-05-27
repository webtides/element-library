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

    /** @private */
    fieldTemplate() {
        const classes = { 'is-valid': !!this.valid, 'is-invalid': !this.valid };
        return html`
            <textarea
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                rows="${this.rows}"
                placeholder="${this.placeholder}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                aria-describedby="${this.name}-help"
                .value="${this.value ?? ''}"
            ></textarea>
            ${this.touched
                ? html`
                      <div class="validity ${classMap(classes)}">
                          ${this.valid
                              ? html` <span class="valid h-4 w-4">&checkmark;</span> `
                              : html` <span class="invalid h-4 w-4" data-clear-input>&cross;</span> `}
                      </div>
                  `
                : ''}
        `;
    }
}

export function define() {
    defineElement('el-textarea-field', TextareaField);
}
