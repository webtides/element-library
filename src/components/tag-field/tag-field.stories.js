import { userEvent, within, expect, waitFor } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './tag-field.readme.md?raw';
import { define } from './tag-field.js';
define();

export default {
    title: 'Components/TagField',
    component: 'el-tag-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'skills',
        label: 'Skills',
        value: ['TypeScript', 'Svelte'],
        placeholder: '',
        required: false,
        disabled: false,
        size: 'medium',
        helpMessage: 'Press Enter after each skill, or separate them with a comma.',
        errorMessage: 'Add at least one skill.',
    },
    argTypes: {
        size: { control: 'select', options: ['small', 'medium', 'large'] },
    },
};

export const TagField = {
    parameters: {
        docs: {
            description: {
                story: 'A text input that turns what is entered into a list of tags. Enter or a comma adds an entry, the button of a tag removes it.',
            },
        },
    },
    render: ({ name, label, value, placeholder, required, disabled, size, helpMessage, errorMessage }) => html`
        <el-tag-field
            name="${name}"
            label="${label}"
            .value="${value}"
            placeholder="${placeholder}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            size="${size}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-tag-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const field = canvasElement.querySelector('el-tag-field');

        await step('renders the entries as a list of tags', async () => {
            // The field renders into light DOM asynchronously on connect.
            await canvas.findByRole('list', { name: 'Skills' });
            await waitFor(() => expect(field.querySelectorAll('el-tag')).toHaveLength(2));
        });

        await step('Enter adds the text of the input as an entry', async () => {
            await userEvent.type(await canvas.findByRole('textbox', { name: 'Skills' }), 'CSS{Enter}');
            await waitFor(() => expect(field.value).toEqual(['TypeScript', 'Svelte', 'CSS']));
        });
    },
};

export const Empty = {
    name: 'Without entries',
    parameters: {
        docs: {
            description: {
                story: 'Paste a list to add several entries at once: `news, offers, events`.',
            },
        },
    },
    render: () => html`
        <el-tag-field
            name="topics"
            label="Topics"
            placeholder="A topic"
            help-message="Separate topics with a comma."
        ></el-tag-field>
    `,
};

export const Required = {
    name: 'Required, with no entry',
    parameters: {
        docs: {
            description: {
                story: 'Required means at least one entry. Text that is still in the input counts: it becomes an entry when the form is submitted. Press the button with and without text in the input.',
            },
        },
    },
    render: () => html`
        <form
            style="display: grid; gap: 1rem; justify-items: start"
            @submit="${(event) => {
                event.preventDefault();
                event.target.querySelector('output').textContent =
                    `Submitted: ${new FormData(event.target).getAll('recipients').join(', ')}`;
            }}"
        >
            <el-tag-field
                name="recipients"
                label="Recipients"
                required="true"
                error-message="Add at least one recipient."
            ></el-tag-field>
            <button type="submit">Send</button>
            <output></output>
        </form>
    `,
};

export const Sizes = {
    parameters: {
        docs: {
            description: {
                story: 'The size of the field is the size of its tags. On the input it shows once the control is decorated (`styles/native.css`).',
            },
        },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <el-tag-field name="small" label="Small" size="small" .value="${['One', 'Two']}"></el-tag-field>
            <el-tag-field name="medium" label="Medium" .value="${['One', 'Two']}"></el-tag-field>
            <el-tag-field name="large" label="Large" size="large" .value="${['One', 'Two']}"></el-tag-field>
        </div>
    `,
};

export const LongEntries = {
    name: 'Many and long entries',
    parameters: {
        docs: {
            description: {
                story: 'The entries wrap. One that is longer than the field is cut off, its remove button stays.',
            },
        },
    },
    render: () => html`
        <div style="max-width: 16rem">
            <el-tag-field
                name="keywords"
                label="Keywords"
                .value="${[
                    'Accessibility',
                    'Web Components',
                    'An entry that is far too long for a field of this width',
                    'CSS',
                    'Forms',
                ]}"
            ></el-tag-field>
        </div>
    `,
};

export const Disabled = {
    render: () => html`
        <el-tag-field name="locked" label="Skills" .value="${['TypeScript', 'Svelte']}" disabled="true"></el-tag-field>
    `,
};
