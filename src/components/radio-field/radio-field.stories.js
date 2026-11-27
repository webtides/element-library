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

export const ColourAndIcon = {
    name: 'A colour or an icon in front of the label',
    parameters: {
        docs: {
            description: {
                story: 'An option can name a `color`, drawn as a dot in front of its label, and an `icon`, the address of an SVG symbol. Both are decorations: the label stays the name of the option.',
            },
        },
    },
    render: () => html`
        <svg width="0" height="0" style="position:absolute" aria-hidden="true">
            <symbol id="radio-field-icon-archive" viewBox="0 0 24 24">
                <path d="M3 4h18v5H3zM5 9v11h14V9M9 13h6" fill="none" stroke="currentColor" stroke-width="2" />
            </symbol>
        </svg>
        <el-radio-field
            name="radio-field-decorated"
            label="Calendar"
            value="home"
            .options="${[
                { value: 'work', label: 'Work', color: '#c81e1e' },
                { value: 'home', label: 'Home', color: '#1e5fc8' },
                { value: 'travel', label: 'Travel', color: '#0b7a3e', icon: '#radio-field-icon-archive' },
                { value: 'archive', label: 'Archive', icon: '#radio-field-icon-archive' },
                { value: 'none', label: 'No tag' },
            ]}"
        ></el-radio-field>
    `,
};
