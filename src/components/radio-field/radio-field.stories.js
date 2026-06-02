import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './radio-field.readme.md?raw';
import { define } from './radio-field.js';
define();

export default {
    title: 'Components/RadioField',
    component: 'el-radio-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'plan',
        label: 'Choose a plan',
        value: '',
        required: true,
        disabled: false,
        helpMessage: 'You can change this later.',
        errorMessage: 'Please pick a plan.',
        options: ['Starter', 'Pro', 'Enterprise'],
    },
};

export const RadioField = {
    parameters: {
        docs: {
            description: {
                story: 'A single-choice radio group rendered from an `options` array, inheriting label, help, validation and touched-state handling from `form-field`.',
            },
        },
    },
    render: ({ name, label, value, required, disabled, helpMessage, errorMessage, options }) => html`
        <el-radio-field
            name="${name}"
            label="${label}"
            value="${value}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
            .options="${options}"
        ></el-radio-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-radio-field');

        await step('renders one radio per option, none selected', async () => {
            // el-radio-field renders its radios into light DOM asynchronously on connect, so wait
            // for them rather than querying synchronously.
            const radios = await canvas.findAllByRole('radio');
            await expect(radios).toHaveLength(3);
            await expect(field.value).toBeFalsy();
        });

        await step('selecting an option updates the value and emits input-change', async () => {
            // input-change is dispatched from the value watcher (a microtask after the setter), so
            // await the event rather than reading a captured variable right away.
            const changed = new Promise((resolve) =>
                field.addEventListener('input-change', (event) => resolve(event.detail), { once: true }),
            );
            await userEvent.click(await canvas.findByLabelText('Pro'));
            await waitFor(() => expect(field.value).toBe('Pro'));
            await expect(await changed).toBe('Pro');
        });
    },
};

export const WithObjectOptions = {
    name: 'Object options (with a disabled choice)',
    parameters: {
        docs: {
            description: {
                story: 'Options can be objects with separate `value`/`label` and a per-option `disabled` flag.',
            },
        },
    },
    args: {
        name: 'tier',
        label: 'Support tier',
        value: 'standard',
        required: false,
        helpMessage: '',
        options: [
            { value: 'standard', label: 'Standard (free)' },
            { value: 'priority', label: 'Priority' },
            { value: 'dedicated', label: 'Dedicated (sold out)', disabled: true },
        ],
    },
    render: ({ name, label, value, required, helpMessage, options }) => html`
        <el-radio-field
            name="${name}"
            label="${label}"
            value="${value}"
            required="${required ? 'true' : 'false'}"
            help-message="${helpMessage}"
            .options="${options}"
        ></el-radio-field>
    `,
};
