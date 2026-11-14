import { html } from '@webtides/element-js';
import readme from './amount-field.readme.md?raw';
import { define } from './amount-field.js';
define();

export default {
    title: 'Components/AmountField',
    component: 'el-amount-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        label: 'Quantity',
        value: 0,
        min: Number.MIN_VALUE,
        max: Number.MAX_VALUE,
    },
};

export const AmountField = {
    name: 'AmountField',
    parameters: {
        docs: {
            description: {
                story: 'A numeric stepper with increment and decrement controls, clamped to the `min`/`max` range.',
            },
        },
    },
    decorators: [],
    render: ({ label, value, min, max }) =>
        html`<el-amount-field label="${label}" value="${value}" min="${min}" max="${max}"></el-amount-field>`,
};

export const WithMessages = {
    name: 'With a help and an error message',
    parameters: {
        docs: {
            description: {
                story: 'The help message stands between the label and the stepper. The error message is shown below the stepper while the field is not valid. The stepper keeps the amount between `min` and `max`; what else is wrong with it, the page says with `valid="false"`.',
            },
        },
    },
    render: () => html`
        <el-amount-field
            name="seats"
            label="Seats"
            value="0"
            min="0"
            help-message="One for every person on the team."
            error-message="Book at least one seat."
            valid="false"
        ></el-amount-field>
    `,
};
