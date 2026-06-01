import { userEvent, within, expect, waitFor } from 'storybook/test';
import { define } from './input-field.js';
define();
import { html } from '@webtides/element-js';

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

export const InputField = {
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
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        // el-input-field renders its <label>/<input> into light DOM asynchronously
        // on connect, so wait for the input rather than querying synchronously.
        const input = await canvas.findByLabelText('Label');

        await step('renders an empty, required text field', async () => {
            await expect(input).toHaveValue('');
            await expect(input).toBeRequired();
        });

        await step('flags the field invalid once touched while empty', async () => {
            input.focus();
            await userEvent.tab();
            await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
        });

        await step('typing a value updates it and clears the error', async () => {
            await userEvent.type(input, 'hello@example.com');
            await expect(input).toHaveValue('hello@example.com');
            await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'false'));
        });
    },
};

export const BrowserInputField = {
    name: 'Vanilla input field',
    parameters: {
        docs: {
            description: {
                story: 'This is the regular simple vanilla `input` field for comparison',
            },
        },
    },
    decorators: [],
    render: ({ label, placeholder }) =>
        html`<label>${label}<br /><input type="text" placeholder="${placeholder}" /></label>`,
};
