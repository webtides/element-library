import { html } from '@webtides/element-js';
import readme from './checkbox-field.readme.md?raw';
import { define } from './checkbox-field.js';
define();

export default {
    title: 'Components/CheckboxField',
    component: 'el-checkbox-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const CheckboxField = {
    name: 'CheckboxField',
    parameters: {
        docs: {
            description: {
                story: 'A checkbox with a custom indicator, inheriting label, validation and state handling from `form-field`.',
            },
        },
    },
    decorators: [],
    render: ({}) => html` <el-checkbox-field name="terms" label="I agree to the terms"></el-checkbox-field> `,
};

export const WithHelpMessage = {
    name: 'With a help message',
    parameters: {
        docs: {
            description: {
                story: 'The label is next to the box, so the help message stands below the two, and the error message below that.',
            },
        },
    },
    render: () => html`
        <el-checkbox-field
            name="updates"
            label="Send me product updates"
            help-message="About once a month."
        ></el-checkbox-field>
    `,
};
