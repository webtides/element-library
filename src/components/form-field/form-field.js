import { TemplateElement, html, defineElement } from '@webtides/element-js';
import { classMap } from '@webtides/element-js/src/dom-parts/directives.js';
import FormFieldEvents from './form-fields.events';
import style from './form-field.style.js';

export default class FormField extends TemplateElement {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    connected() {
        if (!!this.$refs.input?.value || this.valid === false) {
            this.touched = true;
        }
    }

    properties() {
        return {
            name: '',
            value: null,
            required: false,
            disabled: false,

            label: '',
            labelScreenReaderOnly: false,
            errorMessage: '',
            helpMessage: '',

            valid: true,
            touched: false,
        };
    }

    watch() {
        return {
            value: (value) => {
                this.dispatch(FormFieldEvents.INPUT_CHANGE, value, true);
            },
        };
    }

    events() {
        return {
            '[ref=input]': {
                focus: () => {
                    this.onFocus();
                },
                blur: () => {
                    this.onBlur();
                },
                keyup: (event) => {
                    // don't trigger change when tabbing through inputs
                    if (event.keyCode !== 9) {
                        this.onChange();
                    }
                },
                change: () => {
                    this.onChange();
                    this.dispatch(FormFieldEvents.INPUT_CHANGE, this.$refs.input.value);
                },
            },
            '.is-invalid': {
                focus: () => {
                    this.onBlur();
                },
            },
            '[data-clear-input]': {
                click: () => {
                    this.clearInput();
                },
                touchstart: () => {
                    this.clearInput();
                },
            },
        };
    }

    onFocus() {
        this.valid = this.$refs.input.validity.valid;
    }

    onBlur() {
        this.touched = true;
        this.valid = this.$refs.input.validity.valid;
    }

    onChange() {
        this.value = this.$refs.input.value;
        this.valid = this.$refs.input.validity.valid;
    }

    clearInput() {
        this.$refs.input.focus();
        this.$refs.input.value = '';
        this.touched = false;
    }

    classes() {
        return {
            field: classMap({ 'is-valid': !!this.valid, 'is-invalid': !this.valid, 'is-touched': !!this.touched }),
            label: classMap({ 'sr-only': this.labelScreenReaderOnly }),
        };
    }

    template() {
        return html`
            ${this.labelTemplate()} ${this.helpTemplate()}
            <div class="field ${this.classes().field}">${this.fieldTemplate()}</div>
            ${this.errorTemplate()}
        `;
    }

    labelTemplate() {
        if (!this.label) return null;
        return html`
            <label ref="label" for="input-${this.name}" class="${this.classes().label}"> ${this.label} </label>
        `;
    }

    fieldTemplate() {
        return html` <!-- IMPLEMENT FIELD --> `;
    }

    helpTemplate() {
        return html` <span id="${this.name}-help-message" class="message help-message">${this.helpMessage}</span> `;
    }

    errorTemplate() {
        if (!(this.touched && this.errorMessage && !this.valid)) return null;

        return html` <span id="${this.name}-error-message" class="message error-message">${this.errorMessage}</span> `;
    }
}

export function define() {
    defineElement('el-form-field', FormField);
}

export { FormField, FormFieldEvents };
