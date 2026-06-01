import { userEvent, within, expect, waitFor } from 'storybook/test';
import { define } from './select-field.js';
define();
import { html } from '@webtides/element-js';

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

export const SelectField = {
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
            options="${JSON.stringify(options)}"
            placeholder="${placeholder}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            label="${label}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-select-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        // el-select-field renders its <label>/<select> into light DOM asynchronously
        // on connect, so wait for the select rather than querying synchronously.
        const select = await canvas.findByLabelText('Label');

        await step('renders a required select with no choice made', async () => {
            await expect(select).toBeRequired();
            await expect(select).toHaveValue('');
        });

        await step('flags the field invalid once touched without a choice', async () => {
            select.focus();
            await userEvent.tab();
            await waitFor(() => expect(select).toHaveAttribute('aria-invalid', 'true'));
        });

        await step('choosing an option updates the value and clears the error', async () => {
            await userEvent.selectOptions(select, 'Option 1');
            await expect(select).toHaveValue('Option 1');
            await waitFor(() => expect(select).toHaveAttribute('aria-invalid', 'false'));
        });
    },
};

export const BrowserSelectField = {
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
