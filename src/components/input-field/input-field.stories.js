import { userEvent, within, expect } from '@storybook/test';
import { define } from './input-field.js';
define();
const html = String.raw;

export default {
    title: 'Components/InputField',
    component: 'el-input-field',
    tags: ['autodocs'],
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

export const inputFieldDefault = {
    name: 'default',
    description: 'Set the placement attribute to top to show the tooltip on top from the element.',
    parameters: {},
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

export const inputFieldBrowser = {
    name: 'browser',
    description: 'Set the placement attribute to top to show the tooltip on top from the element.',
    parameters: {},
    decorators: [],
    render: ({ content }) => html`<input type="text" />`,
};
