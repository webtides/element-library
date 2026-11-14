import { html, defineElement } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './checkbox-group-field.style.js';

/**
 * What the bubble of the browser says when a required group has no checked option and the field has
 * no `errorMessage`. The browser has no text of its own for it: "at least one of a group" is no
 * constraint of a native checkbox.
 */
const REQUIRED_MESSAGE = 'Select at least one option.';

/**
 * A choice of any number of options: a group of checkboxes with a custom box, label, help text and
 * validation. Renders a native `<fieldset>`/`<legend>` wrapping one `<input type="checkbox">` per
 * option, all under one name, so the grouping, the keyboard and the form submission are native.
 * Extends `FormField` and inherits its help / error / required / touched-state surface; the `label`
 * becomes the `<legend>` of the group.
 *
 * It is the group of checkboxes that `el-radio-field` is for radios.
 *
 * @element el-checkbox-group-field
 *
 * @fires {CustomEvent<string[]>} input-change - Fired when the checked options change. `detail` is
 *   the list of the checked values. Bubbles.
 *
 * @cssstate touched - Set once the user has left the group, or the browser has refused a submit
 *   because of it. Inherits `valid` and `invalid` from `FormField`.
 *
 * @property {string[]} value - The values of the checked options, in the order of the options. As
 *   an attribute it is JSON: `value='["news", "offers"]'`.
 * @property {Array<string | { value: string, label?: string, disabled?: boolean }>} options -
 *   Options to render. Accepts plain strings (`['News', 'Offers']`) or option objects
 *   (`[{ value, label, disabled? }]`). Strings are used as both value and label.
 * @property {boolean} required - Whether at least one option has to be checked.
 */
export default class CheckboxGroupField extends FormField {
    constructor(options) {
        super({
            shadowRender: false,
            styles: [style],
            ...options,
            // The value of this field is a list, so the attribute is parsed, as element-js does for
            // any other. The form field takes its value as text.
            propertyOptions: { value: {}, ...options?.propertyOptions },
        });
    }

    properties() {
        return {
            ...super.properties(),
            value: [],
            options: [],
        };
    }

    connected() {
        // The page can render the group as not valid, after a check of its own.
        const renderedInvalid = this.valid === false;
        super.connected();
        // Reflect validity (required and nothing checked) so :state(invalid) is correct from the
        // start; the message stays hidden until the group is touched.
        if (!renderedInvalid) this.valid = this._computeValid();
    }

    afterUpdate() {
        // Before the form field keeps the state for a reset.
        this._syncControls();
        super.afterUpdate();
    }

    events() {
        return {
            'input[type="checkbox"]': {
                change: () => {
                    this.value = this._boxes()
                        .filter((box) => box.checked)
                        .map((box) => box.value);
                    this.valid = this._computeValid();
                },
                focus: () => this.onFocus(),
                blur: (event) => this._onBoxBlur(event),
                invalid: (event) => this._onInvalid(event.target),
            },
        };
    }

    /**
     * The values of the checked options as text. `value` is a list; a single value, as an attribute
     * that is no JSON list gives it, is a list of one.
     * @private
     * @returns {string[]}
     */
    _values() {
        if (this.value == null || this.value === '') return [];
        return (Array.isArray(this.value) ? this.value : [this.value]).map(String);
    }

    /**
     * @private
     * @returns {HTMLInputElement[]}
     */
    _boxes() {
        return [...this.querySelectorAll('input[type="checkbox"]')];
    }

    /**
     * Whether the group currently passes validation: required means at least one checked option.
     * @private
     */
    _computeValid() {
        if (this.required) return this._values().length > 0;
        return true;
    }

    /**
     * Makes the checkboxes say what the field says, after every render.
     *
     * The `checked` attribute the template writes is only the default of a checkbox: once the user
     * has checked or unchecked it, the browser no longer follows the attribute. So a value from
     * outside is written to the checkboxes as well.
     *
     * A native checkbox knows no "at least one of the group". The first checkbox that is not
     * disabled carries that for the group, as a validity of its own: the browser then refuses to
     * submit the form, focuses that checkbox and shows its bubble there, as it does for every other
     * field that is required and empty.
     * @private
     */
    _syncControls() {
        const values = this._values();
        const boxes = this._boxes();
        const carrier = boxes.find((box) => !box.disabled);
        const message = this._computeValid() ? '' : this.errorMessage || REQUIRED_MESSAGE;

        for (const box of boxes) {
            const checked = values.includes(box.value);
            if (box.checked !== checked) box.checked = checked;
            box.setCustomValidity(box === carrier ? message : '');
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
     * A checkbox of the group lost the focus. The group is touched once the user has left it, not
     * while the focus moves from one of its checkboxes to the next: the message "pick at least one"
     * would show before the user had the chance to. While a pointer is pressed inside the group the
     * focus is on its way to another option, where a click on the label puts it.
     * @private
     * @param {FocusEvent} event
     */
    _onBoxBlur(event) {
        if (this.contains(event.relatedTarget) || this.matches(':active')) return;
        this.onBlur();
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

    /**
     * The box that is drawn in the place of a checkbox is hidden from assistive technology: the
     * checkbox itself says whether it is checked.
     * @private
     */
    fieldTemplate() {
        const values = this._values();

        return this.options.map((option, index) => {
            const value = option.value ?? option;
            const label = option.label ?? option;
            const id = `checkbox-${this.uuid}-${index}`;

            return html`
                <label class="option" for="${id}">
                    <input
                        type="checkbox"
                        id="${id}"
                        name="${this.name}"
                        value="${value}"
                        ?checked="${values.includes(String(value))}"
                        ?disabled="${this.disabled || !!option.disabled}"
                        aria-describedby="${this._describedBy()}"
                    />
                    <span class="checkbox-indicator" aria-hidden="true"></span>
                    <span class="option-label">${label}</span>
                </label>
            `;
        });
    }
}

export function define() {
    defineElement('el-checkbox-group-field', CheckboxGroupField);
}
