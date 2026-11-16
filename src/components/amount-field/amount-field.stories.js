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
        value: 1,
        min: 0,
        max: 10,
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

/** What the form was submitted with, written below it. */
const showSubmit = (event) => {
    event.preventDefault();
    const data = new URLSearchParams(new FormData(event.currentTarget)).toString();
    event.currentTarget.querySelector('output').textContent = `Submitted: ${data || 'nothing'}`;
};

export const Disabled = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'A disabled field disables its input and both buttons. The Tab key passes it, and its value is left out of a form.',
            },
        },
    },
    render: () => html`
        <el-amount-field name="locked" label="Seats" value="3" min="0" max="10" disabled="true"></el-amount-field>
    `,
};

export const InAForm = {
    name: 'In a form',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The input of the field belongs to the form around it. Its value is submitted under the `name` of the field, and a reset brings back the value it was rendered with.',
            },
        },
    },
    render: () => html`
        <form style="display:grid;gap:0.75rem;justify-items:start" @submit="${showSubmit}">
            <el-amount-field name="seats" label="Seats" value="3" min="1" max="10"></el-amount-field>
            <div style="display:flex;gap:0.75rem">
                <button type="submit" style="border:1px solid;border-radius:0.25rem;padding:0.25rem 0.75rem">
                    Submit
                </button>
                <button type="reset" style="border:1px solid;border-radius:0.25rem;padding:0.25rem 0.75rem">
                    Reset
                </button>
            </div>
            <output></output>
        </form>
    `,
};

export const OwnSigns = {
    name: 'With signs of its own',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The signs of the buttons are CSS strings: `--el-amount-field-plus` and `--el-amount-field-minus`. `plusLabel` and `minusLabel` name the buttons.',
            },
        },
    },
    render: () => html`
        <el-amount-field
            name="guests"
            label="Guests"
            value="2"
            min="0"
            plus-label="One more"
            minus-label="One less"
            style="--el-amount-field-plus: '▲'; --el-amount-field-minus: '▼'"
        ></el-amount-field>
    `,
};
