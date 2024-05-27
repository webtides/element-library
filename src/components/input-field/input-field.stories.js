import { userEvent, within, expect } from '@storybook/test';
import { define } from './input-field.js';
define();
const html = String.raw;

export default {
    title: 'Components/InputField',
    component: 'el-input-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'The InputField wraps the native `input` form field and includes lots of boilerplate like label, error messages and validation',
            },
        },
    },
    args: {
        name: 'name',
        value: '',
        type: 'text',
        placeholder: 'Placeholder',
        required: true,
        disabled: false,
        label: 'Label',
        helpMessage: 'Help Message',
        errorMessage: 'Error Message',
    },
    argTypes: {
        type: {
            options: ['text', 'email'],
            control: { type: 'select' },
        },
    },
};

export const inputField = {
    name: 'Input Field',
    parameters: {
        docs: {
            description: {
                story: 'Set the placement attribute to top to show the tooltip on top from the element.',
            },
        },
    },
    decorators: [],
    render: ({ name, type, value, placeholder, required, disabled, label, helpMessage, errorMessage }) => html`
        <el-input-field
            name="${name}"
            value="${value}"
            type="${type}"
            placeholder="${placeholder}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            label="${label}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-input-field>
    `,
};

export const browserInputField = {
    name: 'Vanilla input field',
    parameters: {
        docs: {
            description: {
                story: 'This is the regular simple vanilla `input` field for comparison',
            },
        },
    },
    decorators: [],
    render: ({ label, placeholder }) => html`<label>${label}<br><input type="text" placeholder="${placeholder}" /></label>`,
};
