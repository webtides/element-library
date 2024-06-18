import { userEvent, within, expect } from '@storybook/test';
import { define } from './select-field.js';
define();
const html = String.raw;

export default {
    title: 'Components/SelectField',
    component: 'el-select-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'The SelectField wraps the native `select` form field and includes lots of boilerplate like label, error messages and validation',
            },
        },
    },
    args: {
        name: 'name',
        options: ['Option 1', 'Option 2'],
        placeholder: 'Placeholder',
        required: true,
        disabled: false,
        label: 'Label',
        helpMessage: 'Help Message',
        errorMessage: 'Error Message',
    },
};

export const selectField = {
    name: 'Select Field',
    parameters: {
        docs: {
            description: {
                story: 'Set the placement attribute to top to show the tooltip on top from the element.',
            },
        },
    },
    decorators: [],
    render: ({ name, options, placeholder, required, disabled, label, helpMessage, errorMessage }) => html`
        <el-select-field
            name="${name}"
            options='${JSON.stringify(options)}'
            placeholder="${placeholder}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            label="${label}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-select-field>
    `,
};

export const browserSelectField = {
    name: 'Vanilla select field',
    parameters: {
        docs: {
            description: {
                story: 'This is the regular simple vanilla `select` field for comparison',
            },
        },
    },
    decorators: [],
    render: ({ label, placeholder, options }) =>
        html`<label
            >${label}<br /><select>
                <option selected value="" disabled>${placeholder}</option>
                ${options.map((option) => html` <option value="${option}">${option}</option> `).join('')}
            </select></label
        >`,
};
