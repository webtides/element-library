import { defineElement, html } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './amount-field.style.js';

/**
 * Numeric amount stepper input. Renders a readonly `<input type="number">` flanked by
 * increment (`+`) and decrement (`-`) buttons, with optional `min` and `max` bounds.
 * Extends `FormField`: the `label` is rendered above the stepper and names the input, the help
 * message between the two, and the error message below the stepper while the field is touched and
 * not valid. The input names both messages in `aria-describedby`.
 *
 * The field renders into the page, as every field does. Its input belongs to the form around it and
 * is submitted with it, under the `name` of the field.
 *
 * @element el-amount-field
 *
 * @cssprop [--el-amount-field-plus='+'] - The sign of the increment button, a CSS string.
 * @cssprop [--el-amount-field-minus='-'] - The sign of the decrement button, a CSS string.
 *
 * @property {string} name - Form name for the underlying `<input>` element.
 * @property {number} value - Current numeric value of the field.
 * @property {number | false} max - Upper bound. Set to `false` to leave the value unbounded
 *   above.
 * @property {number | false} min - Lower bound. Set to `false` to leave the value unbounded
 *   below.
 * @property {string} plusLabel - The accessible name of the increment button. Default
 *   `'Increase'`.
 * @property {string} minusLabel - The accessible name of the decrement button. Default
 *   `'Decrease'`.
 */
export default class AmountField extends FormField {
    constructor(options) {
        super({
            styles: [style],
            ...options,
            // The value of this field is a number, so the attribute is parsed, as element-js does
            // for any other. The form field takes its value as text.
            propertyOptions: { value: {}, ...options?.propertyOptions },
        });
    }

    properties() {
        return {
            ...super.properties(),
            name: 'amount',
            value: 1,
            max: false,
            min: 0,
            plusLabel: 'Increase',
            minusLabel: 'Decrease',
        };
    }

    events() {
        return {
            '[ref=plus]': {
                click: () => {
                    this.value++;
                },
            },
            '[ref=minus]': {
                click: () => {
                    this.value--;
                },
            },
            '[ref=input]': {
                change: () => this.requestUpdate(),
            },
        };
    }

    /**
     * The stepper: the two buttons around the input. The buttons are of the type `button`, a button
     * without a type submits the form it is in. Their signs are drawn by the stylesheet, so each
     * has its name as a label.
     *
     * A bound that is not set leaves its attribute out of the input.
     */
    fieldTemplate() {
        return html`
            <div class="stepper">
                <button
                    ref="plus"
                    type="button"
                    class="step plus"
                    aria-label="${this.plusLabel}"
                    ?disabled="${this.max !== false && this.value >= this.max}"
                ></button>
                <input
                    ref="input"
                    type="number"
                    readonly
                    id="${this._idOf('input')}"
                    name="${this.name}"
                    ?required="${this.required}"
                    ?disabled="${this.disabled}"
                    value="${this.value}"
                    max="${this.max === false ? null : this.max}"
                    min="${this.min === false ? null : this.min}"
                    aria-describedby="${this._describedBy()}"
                    aria-invalid="${this.valid ? 'false' : 'true'}"
                />
                <button
                    ref="minus"
                    type="button"
                    class="step minus"
                    aria-label="${this.minusLabel}"
                    ?disabled="${this.min !== false && this.value <= this.min}"
                ></button>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-amount-field', AmountField);
}
