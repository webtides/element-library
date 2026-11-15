import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './combobox-field.readme.md?raw';
import { define } from './combobox-field.js';
define();

const CITIES = ['Amsterdam', 'Berlin', 'Bern', 'Bremen', 'Brussels', 'Copenhagen', 'Vienna', 'Zurich'];

export default {
    title: 'Components/ComboboxField',
    component: 'el-combobox-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'city',
        label: 'City',
        value: '',
        options: CITIES,
        placeholder: '',
        required: false,
        disabled: false,
        size: 'medium',
        helpMessage: 'Pick a suggestion, or write another city.',
        errorMessage: 'Enter a city.',
    },
    argTypes: {
        size: { control: 'select', options: ['small', 'medium', 'large'] },
    },
};

export const ComboboxField = {
    parameters: {
        docs: {
            description: {
                story: 'A text input with suggestions. The browser offers the ones that fit what is typed; the user may write something else.',
            },
        },
    },
    render: ({ name, label, value, options, placeholder, required, disabled, size, helpMessage, errorMessage }) => html`
        <el-combobox-field
            name="${name}"
            label="${label}"
            value="${value}"
            .options="${options}"
            placeholder="${placeholder}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            size="${size}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-combobox-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-combobox-field');

        await step('is a combobox that offers the options', async () => {
            // The field renders into light DOM asynchronously on connect.
            const control = await canvas.findByRole('combobox', { name: 'City' });
            await waitFor(() => expect(control.list.options).toHaveLength(CITIES.length));
        });

        await step('takes a text that is none of the options', async () => {
            await userEvent.type(await canvas.findByRole('combobox', { name: 'City' }), 'Oslo');
            await waitFor(() => expect(field.value).toBe('Oslo'));
        });
    },
};

export const WithLabels = {
    name: 'Options with a label',
    parameters: {
        docs: {
            description: {
                story: 'An option can have a `label` beside its value. What a browser shows of the two differs between browsers.',
            },
        },
    },
    render: () => html`
        <el-combobox-field
            name="airport"
            label="Airport"
            .options="${[
                { value: 'BER', label: 'Berlin Brandenburg' },
                { value: 'ZRH', label: 'Zurich' },
                { value: 'VIE', label: 'Vienna' },
            ]}"
        ></el-combobox-field>
    `,
};

export const Required = {
    name: 'Required, in a form',
    parameters: {
        docs: {
            description: {
                story: 'Everything an input field has works here: the field is required, and the form submits what is in the control, a suggestion or not.',
            },
        },
    },
    render: () => html`
        <form
            style="display: grid; gap: 1rem; justify-items: start"
            @submit="${(event) => {
                event.preventDefault();
                event.target.querySelector('output').textContent =
                    `Submitted: ${new FormData(event.target).get('role')}`;
            }}"
        >
            <el-combobox-field
                name="role"
                label="Role"
                required="true"
                error-message="Enter a role."
                .options="${['Designer', 'Developer', 'Product manager', 'Researcher']}"
            ></el-combobox-field>
            <button type="submit">Send</button>
            <output></output>
        </form>
    `,
};

export const WithoutOptions = {
    name: 'Without options',
    parameters: {
        docs: {
            description: {
                story: 'Without options the control has no list: it is a plain text input.',
            },
        },
    },
    render: () => html`<el-combobox-field name="plain" label="City"></el-combobox-field>`,
};

export const Sizes = {
    parameters: {
        docs: {
            description: {
                story: 'The three sizes show once the control is decorated (`styles/native.css`).',
            },
        },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <el-combobox-field name="small" label="Small" size="small" .options="${CITIES}"></el-combobox-field>
            <el-combobox-field name="medium" label="Medium" .options="${CITIES}"></el-combobox-field>
            <el-combobox-field name="large" label="Large" size="large" .options="${CITIES}"></el-combobox-field>
        </div>
    `,
};

export const Disabled = {
    render: () => html`
        <el-combobox-field
            name="locked"
            label="City"
            value="Berlin"
            disabled="true"
            .options="${CITIES}"
        ></el-combobox-field>
    `,
};
