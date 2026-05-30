import { TemplateElement, html, defineElement, classMap } from '@webtides/element-js';
import FormFieldEvents from './form-field.events.js';
import style from './form-field.style.js';

/**
 * Base class for form input components. Provides label, help text, error message,
 * validation and touched-state plumbing. Intended to be extended (`InputField`,
 * `CheckboxField`, `TextareaField`, `AmountField`, …); subclasses override
 * `fieldTemplate()` to render their actual input.
 *
 * @element el-form-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the field's `value` changes.
 *   `detail` is the new value. Bubbles.
 *
 * @cssstate touched - Set on the host once the user has focused and blurred the field.
 *   Inherited by all subclasses (`InputField`, `CheckboxField`, `TextareaField`,
 *   `AmountField`, `SelectField`).
 * @cssstate valid - Set on the host while the field currently passes validation.
 * @cssstate invalid - Set on the host while the field currently fails validation.
 *
 * @property {string} name - Form name for the underlying input.
 * @property {string | null} value - Current value of the field.
 * @property {boolean} required - Whether the field is required for form submission.
 * @property {boolean} disabled - Whether the field is disabled.
 * @property {string} label - Label text displayed for the field.
 * @property {boolean} labelScreenReaderOnly - When `true`, the label is visually hidden but
 *   still announced to screen readers (via an `sr-only` class).
 * @property {string} errorMessage - Error message displayed when the field is invalid and has
 *   been touched.
 * @property {string} helpMessage - Helper text displayed below the field.
 * @property {boolean} valid - Whether the field currently passes validation.
 * @property {boolean} touched - Whether the user has interacted with the field (focused and
 *   blurred). Validation messages only surface when this is `true`.
 */
export default class FormField extends TemplateElement {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    connected() {
        if (!!this.$refs.input?.value || this.valid === false) {
            this.touched = true;
        }
        this.syncValidationStates();
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
                this.dispatch(FormFieldEvents.INPUT_CHANGE, value);
            },
            valid: () => this.syncValidationStates(),
            touched: () => this.syncValidationStates(),
        };
    }

    /** @private */
    syncValidationStates() {
        if (this.touched) this._internals.states.add('touched');
        else this._internals.states.delete('touched');
        if (this.valid) {
            this._internals.states.add('valid');
            this._internals.states.delete('invalid');
        } else {
            this._internals.states.delete('valid');
            this._internals.states.add('invalid');
        }
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

    /**
     * Called when the input receives focus. Refreshes validation state.
     * @returns {void}
     */
    onFocus() {
        this.valid = this.$refs.input.validity.valid;
    }

    /**
     * Called when the input loses focus. Marks the field as touched and refreshes
     * validation state.
     * @returns {void}
     */
    onBlur() {
        this.touched = true;
        this.valid = this.$refs.input.validity.valid;
    }

    /**
     * Called when the input value changes. Updates `value` and refreshes validation.
     * @returns {void}
     */
    onChange() {
        this.value = this.$refs.input.value;
        this.valid = this.$refs.input.validity.valid;
    }

    /**
     * Clears the input value, refocuses it, and resets the touched state.
     * @returns {void}
     */
    clearInput() {
        this.$refs.input.focus();
        this.$refs.input.value = '';
        this.touched = false;
    }

    /** @private */
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

    /** @private */
    labelTemplate() {
        if (!this.label) return null;
        return html`
            <label ref="label" for="input-${this.name}" class="${this.classes().label}"> ${this.label} </label>
        `;
    }

    /**
     * Subclass extension point. Override to render the actual input element(s).
     * @returns {unknown}
     */
    fieldTemplate() {
        return html` <!-- IMPLEMENT FIELD --> `;
    }

    /** @private */
    helpTemplate() {
        return html` <span id="${this.name}-help-message" class="message help-message">${this.helpMessage}</span> `;
    }

    /** @private */
    errorTemplate() {
        if (!(this.touched && this.errorMessage && !this.valid)) return null;

        return html` <span id="${this.name}-error-message" class="message error-message">${this.errorMessage}</span> `;
    }
}

export function define() {
    defineElement('el-form-field', FormField);
}

export { FormField, FormFieldEvents };
