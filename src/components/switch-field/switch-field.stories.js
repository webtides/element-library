import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './switch-field.readme.md?raw';
import { define } from './switch-field.js';
define();

export default {
    title: 'Components/SwitchField',
    component: 'el-switch-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'notifications',
        label: 'Enable notifications',
        checked: false,
        disabled: false,
    },
};

export const SwitchField = {
    parameters: {
        docs: {
            description: {
                story: 'An on/off toggle backed by a native `<input type="checkbox" role="switch">`, inheriting label, validation and state handling from `form-field`.',
            },
        },
    },
    render: ({ name, label, checked, disabled }) => html`
        <el-switch-field
            name="${name}"
            label="${label}"
            checked="${checked ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
        ></el-switch-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-switch-field');
        // el-switch-field renders into light DOM asynchronously on connect, so wait for the control.
        const control = await canvas.findByRole('switch');

        await step('starts off', async () => {
            await expect(control).not.toBeChecked();
            await expect(field.checked).toBe(false);
        });

        await step('toggling it on updates checked and emits input-change', async () => {
            const changed = new Promise((resolve) =>
                field.addEventListener('input-change', () => resolve(true), { once: true }),
            );
            await userEvent.click(control);
            await waitFor(() => expect(field.checked).toBe(true));
            await expect(control).toBeChecked();
            await expect(await changed).toBe(true);
        });

        await step('toggling it off again', async () => {
            await userEvent.click(control);
            await waitFor(() => expect(field.checked).toBe(false));
        });
    },
};

export const On = {
    name: 'Checked by default',
    parameters: {
        docs: {
            description: {
                story: 'Set `checked="true"` to render the switch in its on state.',
            },
        },
    },
    args: {
        name: 'darkmode',
        label: 'Dark mode',
        checked: true,
    },
    render: ({ name, label, checked, disabled }) => html`
        <el-switch-field
            name="${name}"
            label="${label}"
            checked="${checked ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
        ></el-switch-field>
    `,
};
