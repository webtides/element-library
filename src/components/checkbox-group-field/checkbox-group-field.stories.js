import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './checkbox-group-field.readme.md?raw';
import { define } from './checkbox-group-field.js';
define();

export default {
    title: 'Components/CheckboxGroupField',
    component: 'el-checkbox-group-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'topics',
        label: 'What should we write to you about?',
        value: ['News'],
        required: true,
        disabled: false,
        helpMessage: 'Pick as many as you like.',
        errorMessage: 'Pick at least one topic.',
        options: ['News', 'Offers', 'Events'],
    },
};

export const CheckboxGroupField = {
    parameters: {
        docs: {
            description: {
                story: 'A group of checkboxes rendered from an `options` array, under one name. `value` is the list of the checked values; `required` means at least one.',
            },
        },
    },
    render: ({ name, label, value, required, disabled, helpMessage, errorMessage, options }) => html`
        <el-checkbox-group-field
            name="${name}"
            label="${label}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
            .options="${options}"
            .value="${value}"
        ></el-checkbox-group-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-checkbox-group-field');

        await step('renders one checkbox per option, the one of the value checked', async () => {
            // The field renders its checkboxes into light DOM asynchronously on connect.
            const boxes = await canvas.findAllByRole('checkbox');
            await expect(boxes).toHaveLength(3);
            await expect(field.value).toEqual(['News']);
        });

        await step('checking another option adds it to the value, in the order of the options', async () => {
            await userEvent.click(await canvas.findByLabelText('Events'));
            await waitFor(() => expect(field.value).toEqual(['News', 'Events']));
        });
    },
};

export const WithObjectOptions = {
    name: 'Object options (with a disabled choice)',
    parameters: {
        docs: {
            description: {
                story: 'Options can be objects with separate `value`/`label` and a per-option `disabled` flag. A disabled option that is checked is not submitted, as the browser has it.',
            },
        },
    },
    render: () => html`
        <el-checkbox-group-field
            name="days"
            label="Delivery days"
            .value="${['tue', 'thu']}"
            .options="${[
                { value: 'tue', label: 'Tuesday' },
                { value: 'thu', label: 'Thursday' },
                { value: 'sat', label: 'Saturday (no delivery in your area)', disabled: true },
            ]}"
        ></el-checkbox-group-field>
    `,
};

export const Required = {
    name: 'Required, with nothing checked',
    parameters: {
        docs: {
            description: {
                story: 'The group is not valid from the start. Its error message shows once the user has left the group, or the browser has refused to submit the form: press the button.',
            },
        },
    },
    render: () => html`
        <form style="display: grid; gap: 1rem; justify-items: start" @submit="${(event) => event.preventDefault()}">
            <el-checkbox-group-field
                name="consent"
                label="How may we contact you?"
                required="true"
                error-message="Pick at least one way."
                .options="${['Email', 'Phone', 'Letter']}"
            ></el-checkbox-group-field>
            <button type="submit">Save</button>
        </form>
    `,
};

export const Disabled = {
    render: () => html`
        <el-checkbox-group-field
            name="locked"
            label="Topics"
            disabled="true"
            .value="${['News']}"
            .options="${['News', 'Offers']}"
        ></el-checkbox-group-field>
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
            <symbol id="checkbox-group-field-icon-archive" viewBox="0 0 24 24">
                <path d="M3 4h18v5H3zM5 9v11h14V9M9 13h6" fill="none" stroke="currentColor" stroke-width="2" />
            </symbol>
        </svg>
        <el-checkbox-group-field
            name="checkbox-group-field-decorated"
            label="Tags"
            .value="${['work']}"
            .options="${[
                { value: 'work', label: 'Work', color: '#c81e1e' },
                { value: 'home', label: 'Home', color: '#1e5fc8' },
                { value: 'travel', label: 'Travel', color: '#0b7a3e', icon: '#checkbox-group-field-icon-archive' },
                { value: 'archive', label: 'Archive', icon: '#checkbox-group-field-icon-archive' },
                { value: 'none', label: 'No tag' },
            ]}"
        ></el-checkbox-group-field>
    `,
};
