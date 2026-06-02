import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './password-field.readme.md?raw';
import { define } from './password-field.js';
define();

export default {
    title: 'Components/PasswordField',
    component: 'el-password-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'password',
        label: 'Password',
        value: '',
        placeholder: '••••••••',
        required: true,
        disabled: false,
        passwordToggle: true,
    },
};

export const PasswordField = {
    parameters: {
        docs: {
            description: {
                story: 'A masked password input with a show/hide reveal button, inheriting label, help, validation and touched-state handling from `input-field` / `form-field`.',
            },
        },
    },
    render: ({ name, label, value, placeholder, required, disabled, passwordToggle }) => html`
        <el-password-field
            name="${name}"
            label="${label}"
            value="${value}"
            placeholder="${placeholder}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            password-toggle="${passwordToggle ? 'true' : 'false'}"
        ></el-password-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-password-field');
        const input = await canvas.findByLabelText('Password');

        await step('masks the value by default', async () => {
            await userEvent.type(input, 'hunter2');
            await expect(input).toHaveValue('hunter2');
            await expect(input).toHaveAttribute('type', 'password');
        });

        await step('the reveal button shows the value as plain text', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
            await waitFor(() => expect(field.querySelector('input')).toHaveAttribute('type', 'text'));
            await expect(canvas.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
        });

        await step('clicking it again re-masks the value', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Hide password' }));
            await waitFor(() => expect(field.querySelector('input')).toHaveAttribute('type', 'password'));
        });
    },
};

export const NoToggle = {
    name: 'Without reveal button',
    parameters: {
        docs: {
            description: {
                story: 'Set `password-toggle="false"` to hide the reveal button (e.g. for high-security forms).',
            },
        },
    },
    args: {
        passwordToggle: false,
    },
    render: ({ name, label, value, placeholder, required, disabled, passwordToggle }) => html`
        <el-password-field
            name="${name}"
            label="${label}"
            value="${value}"
            placeholder="${placeholder}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            password-toggle="${passwordToggle ? 'true' : 'false'}"
        ></el-password-field>
    `,
};
