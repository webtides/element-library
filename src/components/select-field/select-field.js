import { html, defineElement, classMap, when } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './select-field.style.js';

/**
 * Native `<select>` wrapper with label, help text, validation feedback and a custom
 * dropdown indicator. Extends `FormField` and inherits its label / help / error /
 * required surface.
 *
 * @element el-select-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the selected value changes.
 *   `detail` is the new value. Bubbles.
 *
 * @property {string} placeholder - Placeholder text rendered as the first disabled `<option>`
 *   when no selection has been made.
 * @property {Array<string | { value: string, label?: string, selected?: boolean }>} options -
 *   Options to render. Accepts plain strings (`['Apple', 'Pear']`) or option objects
 *   (`[{ value, label, selected? }]`). Strings are used as both value and label.
 */
export default class SelectField extends FormField {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            ...super.properties(),
            placeholder: '',
            options: [],
        };
    }

    /** @private */
    fieldTemplate() {
        return html`
            <select
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                value="${this.value}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                aria-describedby="${this.name}-help-message"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this.name}-error-message"
            >
                ${when(this.placeholder, html` <option value="" selected disabled>${this.placeholder}</option> `)}
                ${this.options.map((option) => {
                    const value = option.value ?? option;
                    return html`
                        <option value="${value}" ?selected=${option.selected && !!option.selected}>
                            ${option.label ?? option}
                        </option>
                    `;
                })}
            </select>
            ${this.dropdownIndicatorTemplate()}
        `;
    }

    /** @private */
    dropdownIndicatorTemplate() {
        return html` <div class="icon">&or;</div> `;
    }
}

export function define() {
    defineElement('el-select-field', SelectField);
}
