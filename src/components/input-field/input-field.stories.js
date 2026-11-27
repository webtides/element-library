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
        size: 'medium',
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
        size: { options: ['small', 'medium', 'large'], control: { type: 'inline-radio' } },
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
    render: ({ name, type, size, value, placeholder, required, disabled, label, helpMessage, errorMessage }) => html`
        <el-input-field
            name="${name}"
            value="${value}"
            type="${type}"
            size="${size}"
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

export const Sizes = {
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: 'The three sizes. They show once `styles/native.css` decorates the control, which this Storybook loads with every theme.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;max-width:20rem">
            <el-input-field name="size-small" label="Small" size="small" placeholder="Small"></el-input-field>
            <el-input-field name="size-medium" label="Medium" placeholder="Medium"></el-input-field>
            <el-input-field name="size-large" label="Large" size="large" placeholder="Large"></el-input-field>
        </div>
    `,
};

export const Length = {
    name: 'The length of the text',
    parameters: {
        controls: { disable: true },
        docs: {
            description: {
                story: '`maxlength` and `minlength` go to the native input. The first field takes no more than 10 characters. The second is not valid while what was typed is shorter than 3, and shows its `error-message` once it was left.',
            },
        },
    },
    render: () => html`
        <div style="display:grid;gap:1rem;max-width:20rem">
            <el-input-field
                name="length-short"
                label="Short name"
                help-message="At most 10 characters"
                maxlength="10"
            ></el-input-field>
            <el-input-field
                name="length-handle"
                label="Handle"
                help-message="At least 3 characters"
                error-message="A handle has at least 3 characters"
                minlength="3"
            ></el-input-field>
        </div>
    `,
};
