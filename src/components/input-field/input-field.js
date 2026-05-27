import { html, defineElement, classMap, when } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './input-field.style.js';

/**
 * Native `<input>` wrapper with label, help text, validation feedback (visual checkmark /
 * cross indicators) and ARIA wiring. Extends `FormField` and inherits its label / help /
 * error / required surface.
 *
 * @element el-input-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the input's value changes.
 *   `detail` is the new value. Bubbles.
 *
 * @property {string} type - Native `type` attribute of the underlying `<input>` (e.g.
 *   `'text'`, `'email'`, `'password'`, `'tel'`, `'url'`).
 * @property {string} placeholder - Placeholder text shown while the input is empty.
 * @property {string | false} pattern - Regular expression used as the input's `pattern`
 *   attribute. When `false`, the field falls back to a permissive `[sS]*` pattern (i.e. no
 *   restriction).
 */
export default class InputField extends FormField {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            type: 'text',
            placeholder: '',
            pattern: false,
        };
    }

    /** @private */
    fieldTemplate() {
        return html`
            <input
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                type="${this.type}"
                value="${this.value}"
                placeholder="${this.placeholder}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                pattern=${this.pattern ? this.pattern : '[sS]*'}
                aria-describedby="${this.name}-help-message"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this.name}-error-message"
            />
            ${when(
                this.touched,
                html`
                    <div class="validity ${classMap({ 'is-valid': !!this.valid, 'is-invalid': !this.valid })}">
                        ${when(
                            this.valid,
                            html` <span class="valid h-4 w-4">&checkmark;</span> `,
                            html` <span class="invalid h-4 w-4" data-clear-input>&cross;</span> `,
                        )}
                    </div>
                `,
            )}
        `;
    }
}

export function define() {
    defineElement('el-input-field', InputField);
}
