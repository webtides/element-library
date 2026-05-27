import { TemplateElement, defineElement, html } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './amount-field.style.js';

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
