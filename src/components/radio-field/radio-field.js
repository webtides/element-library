import { html, defineElement } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import { focusLeft } from '../../utils/focus.js';
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
 * @cssstate touched - Set once the user has left the group, or the browser has refused a submit
 *   because of it. Inherits `valid` and `invalid` from `FormField`.
 *
 * @property {string | null} value - The selected option's value.
 * @property {Array<string | { value: string, label?: string, disabled?: boolean }>} options -
 *   Options to render. Accepts plain strings (`['Yes', 'No']`) or option objects
 *   (`[{ value, label, disabled? }]`). Strings are used as both value and label.
 */
export default class RadioField extends FormField {
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
        // The page can render the group as not valid, after a check of its own.
        const renderedInvalid = this.valid === false;
        super.connected();
        // Reflect validity (required-but-empty) so :state(invalid) is correct from the start; the
        // message stays hidden until the group is touched.
        if (!renderedInvalid) this.valid = this._computeValid();
    }

    afterUpdate() {
        // Before the form field keeps the state for a reset.
        this._syncControls();
        super.afterUpdate();
    }

    events() {
        return {
            'input[type="radio"]': {
                change: (event) => {
                    this.value = event.target.value;
                    this.valid = this._computeValid();
                },
                focus: () => this.onFocus(),
                // The group is touched once the user has left it, not while the focus moves from
                // one of its radios to the next.
                blur: (event) => focusLeft(this, event) && this.onBlur(),
                invalid: (event) => this._onInvalid(event.target),
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

    /**
     * Makes the radios say what the field says, after every render. The `checked` attribute the
     * template writes is only the default of a radio: once the user has chosen, the browser no
     * longer follows the attribute, so a value from outside is written to the radios as well.
     * @private
     */
    _syncControls() {
        const value = this.value == null ? null : String(this.value);
        for (const radio of this.querySelectorAll('input[type="radio"]')) {
            const checked = radio.value === value;
            if (radio.checked !== checked) radio.checked = checked;
        }
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
                aria-describedby="${this._describedBy()}"
                aria-errormessage="${this._idOf('error-message')}"
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
                        aria-describedby="${this._describedBy()}"
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
