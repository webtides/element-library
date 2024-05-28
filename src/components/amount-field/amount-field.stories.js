const html = String.raw;
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
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({ value, min, max }) =>
        html`<el-amount-field value="${value}" min="${min}" max="${max}"></el-amount-field>`,
};
