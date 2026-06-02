import { html, defineElement } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './radio-field.style.js';

/**
 * A single-choice radio group with a custom indicator, label, help text and validation. Renders a
 * native `<fieldset>`/`<legend>` wrapping mutually-exclusive `<input type="radio">`s (so keyboard
 * navigation, grouping and form submission are all native). Extends `FormField` and inherits its
 * help / error / required / touched-state surface; the `label` becomes the group's `<legend>`.
 *
 * @element el-radio-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the selected value changes. `detail` is
 *   the newly selected value. Bubbles.
 *
 * @cssstate touched - Set once the user has focused and blurred the group. Inherits `valid` and
 *   `invalid` from `FormField`.
 *
 * @property {string} value - The selected option's value.
 * @property {Array<string | { value: string, label?: string, disabled?: boolean }>} options -
 *   Options to render. Accepts plain strings (`['Yes', 'No']`) or option objects
 *   (`[{ value, label, disabled? }]`). Strings are used as both value and label.
 */
export default class RadioField extends FormField {
    /** @private */
    uuid = Math.random().toString(36).substr(2, 5);

    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            options: [],
        };
    }

    connected() {
        super.connected();
        // Reflect validity (required-but-empty) so :state(invalid) is correct from the start; the
        // message stays hidden until the group is touched.
        this.valid = this._computeValid();
    }

    events() {
        return {
            'input[type="radio"]': {
                change: (event) => {
                    this.value = event.target.value;
                    this.valid = this._computeValid();
                },
                focus: () => this.onFocus(),
                blur: () => this.onBlur(),
            },
        };
    }

    /**
     * Whether the group currently passes validation. A radio group's only native constraint is
     * `required`, so this is timing-independent (no rendered input needed): required ⇒ a value
     * must be selected.
     * @private
     */
    _computeValid() {
        if (this.required) return this.value != null && this.value !== '';
        return true;
    }

    onFocus() {
        this.valid = this._computeValid();
    }

    onBlur() {
        this.touched = true;
        this.valid = this._computeValid();
    }

    /**
     * The label is rendered as the group's `<legend>` (see `template`), so the base FormField
     * `<label>` is suppressed.
     * @returns {null}
     */
    labelTemplate() {
        return null;
    }

    template() {
        return html`
            <fieldset
                class="field ${this.classes().field}"
                aria-describedby="${this.name}-help-message"
                aria-errormessage="${this.name}-error-message"
                aria-invalid="${this.valid ? 'false' : 'true'}"
            >
                ${this.legendTemplate()} ${this.helpTemplate()}
                <div class="options">${this.fieldTemplate()}</div>
                ${this.errorTemplate()}
            </fieldset>
        `;
    }

    /** @private */
    legendTemplate() {
        if (!this.label) return null;
        return html` <legend class="${this.classes().label}">${this.label}</legend> `;
    }

    /** @private */
    fieldTemplate() {
        return this.options.map((option, index) => {
            const value = option.value ?? option;
            const label = option.label ?? option;
            const optionDisabled = this.disabled || !!option.disabled;
            const checked = this.value != null && String(this.value) === String(value);
            const id = `radio-${this.uuid}-${index}`;

            return html`
                <label class="option" for="${id}">
                    <input
                        type="radio"
                        id="${id}"
                        name="${this.name}"
                        value="${value}"
                        ?checked="${checked}"
                        ?disabled="${optionDisabled}"
                        ?required="${this.required}"
                        aria-describedby="${this.name}-help-message"
                    />
                    <span class="radio-indicator" aria-hidden="true"></span>
                    <span class="option-label">${label}</span>
                </label>
            `;
        });
    }
}

export function define() {
    defineElement('el-radio-field', RadioField);
}
