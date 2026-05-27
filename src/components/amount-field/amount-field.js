import { TemplateElement, defineElement, html } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './amount-field.style.js';

/**
 * Numeric amount stepper input. Renders a readonly `<input type="number">` flanked by
 * increment (`+`) and decrement (`-`) buttons, with optional `min` and `max` bounds.
 * Extends `FormField` and inherits its label, help and validation surface.
 *
 * @element el-amount-field
 *
 * @slot plus - Replaces the default `+` glyph in the increment button.
 * @slot minus - Replaces the default `-` glyph in the decrement button.
 *
 * @csspart wrapper - The outer container around the input and stepper buttons.
 * @csspart button - Applied to both stepper buttons.
 * @csspart plus - Applied to the increment button (in addition to `button`).
 * @csspart minus - Applied to the decrement button (in addition to `button`).
 * @csspart input - The numeric input element.
 *
 * @property {string} name - Form name for the underlying `<input>` element.
 * @property {number} value - Current numeric value of the field.
 * @property {number | false} max - Upper bound. Set to `false` to leave the value unbounded
 *   above.
 * @property {number | false} min - Lower bound. Set to `false` to leave the value unbounded
 *   below.
 */
export default class AmountField extends FormField {
    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    properties() {
        return {
            ...super.properties(),
            name: 'amount',
            value: 1,
            max: false,
            min: 0,
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

    template() {
        return html`
            <div part="wrapper">
                <button ref="plus" part="button plus" ?disabled="${this.max !== false && this.value >= this.max}">
                    <slot name="plus">+</slot>
                </button>
                <input
                    ref="input"
                    part="input"
                    type="number"
                    readonly="true"
                    id="input-${this.name}"
                    name="${this.name}"
                    ?required="${this.required}"
                    ?disabled="${this.disabled}"
                    value="${this.value}"
                    max="${this.max}"
                    min="${this.min}"
                    aria-describedby="${this.name}-help"
                />
                <button ref="minus" part="button minus" ?disabled="${this.min !== false && this.value <= this.min}">
                    <slot name="minus">-</slot>
                </button>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-amount-field', AmountField);
}
