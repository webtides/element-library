import { within, expect } from 'storybook/test';
import { html } from '@webtides/element-js';
import readme from './file-field.readme.md?raw';
import { define } from './file-field.js';
define();

export default {
    title: 'Components/FileField',
    component: 'el-file-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
    args: {
        name: 'cv',
        label: 'Your CV',
        accept: '.pdf',
        multiple: false,
        required: false,
        disabled: false,
        size: 'medium',
        helpMessage: 'A PDF, up to 5 MB.',
        errorMessage: 'Please add your CV.',
    },
    argTypes: {
        size: { control: 'select', options: ['small', 'medium', 'large'] },
    },
};

export const FileField = {
    parameters: {
        docs: {
            description: {
                story: 'A native file input with the label and the messages of a field. Click the control, or drop a file onto it.',
            },
        },
    },
    render: ({ name, label, accept, multiple, required, disabled, size, helpMessage, errorMessage }) => html`
        <el-file-field
            name="${name}"
            label="${label}"
            accept="${accept}"
            multiple="${multiple ? 'true' : 'false'}"
            required="${required ? 'true' : 'false'}"
            disabled="${disabled ? 'true' : 'false'}"
            size="${size}"
            help-message="${helpMessage}"
            error-message="${errorMessage}"
        ></el-file-field>
    `,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('renders a file input that is named by the label', async () => {
            // The field renders its control into light DOM asynchronously on connect.
            const control = await canvas.findByLabelText('Your CV');
            await expect(control).toHaveAttribute('type', 'file');
            await expect(control).toHaveAttribute('accept', '.pdf');
        });
    },
};

export const Multiple = {
    name: 'Several files',
    parameters: {
        docs: {
            description: {
                story: 'With `multiple` the dialog takes more than one file. `accept` says which kinds it offers.',
            },
        },
    },
    render: () => html`
        <el-file-field
            name="receipts"
            label="Receipts"
            accept="image/*,.pdf"
            multiple="true"
            help-message="Pictures or PDFs."
        ></el-file-field>
    `,
};

export const Required = {
    name: 'Required, with no file',
    parameters: {
        docs: {
            description: {
                story: 'The error message shows once the user has left the control, or the browser has refused to submit the form: press the button.',
            },
        },
    },
    render: () => html`
        <form style="display: grid; gap: 1rem; justify-items: start" @submit="${(event) => event.preventDefault()}">
            <el-file-field
                name="contract"
                label="Signed contract"
                required="true"
                error-message="Please add the contract."
            ></el-file-field>
            <button type="submit">Send</button>
        </form>
    `,
};

export const RefusedByTheServer = {
    name: 'An error of the page',
    parameters: {
        docs: {
            description: {
                story: 'The size and the number of the files are checked by the page. It renders the field as not valid, with the reason as its error message.',
            },
        },
    },
    render: () => html`
        <el-file-field
            name="picture"
            label="Profile picture"
            accept="image/*"
            valid="false"
            error-message="The picture is larger than 5 MB."
        ></el-file-field>
    `,
};

export const Sizes = {
    parameters: {
        docs: {
            description: {
                story: 'The three sizes of the fields. They show once the control is decorated (`styles/native.css`).',
            },
        },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <el-file-field name="small" label="Small" size="small"></el-file-field>
            <el-file-field name="medium" label="Medium"></el-file-field>
            <el-file-field name="large" label="Large" size="large"></el-file-field>
        </div>
    `,
};

export const Disabled = {
    render: () => html` <el-file-field name="locked" label="Your CV" disabled="true"></el-file-field> `,
};
