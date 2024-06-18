import { html, defineElement } from '@webtides/element-js';
import { classMap, when } from '@webtides/element-js/src/dom-parts/directives.js';
import FormField from '../form-field/form-field.js';
import style from './select-field.style.js';

export default class SelectField extends FormField {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            ...super.properties(),
            placeholder: '',
            options: [], // ['string1', 'string2'] or [{value: 'value', label: 'label'}, ...]
        };
    }

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

    dropdownIndicatorTemplate() {
        return html` <div class="icon">&or;</div> `;
    }
}

export function define() {
    defineElement('el-select-field', SelectField);
}
