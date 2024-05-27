import { html, defineElement } from '@webtides/element-js';
import { classMap, when } from '@webtides/element-js/src/dom-parts/directives.js';
import FormField from '../form-field/form-field.js';
import style from './input-field.style.js';

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
