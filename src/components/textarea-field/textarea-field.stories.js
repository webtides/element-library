import { html } from '@webtides/element-js';
import readme from './textarea-field.readme.md?raw';
import { define } from './textarea-field.js';
define();

export default {
    title: 'Components/TextareaField',
    component: 'el-textarea-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const TextareaField = {
    name: 'TextareaField',
    parameters: {
        docs: {
            description: {
                story: 'A multi-line text field wrapping the native `<textarea>` with label, help text and validation states.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-textarea-field></el-textarea-field>`,
};

export const WithValue = {
    name: 'With value',
    parameters: {
        docs: {
            description: {
                story: 'A pre-filled field. The value is rendered as the content of the `<textarea>`, so server-rendered markup shows it before the element has started.',
            },
        },
    },
    render: () => html`
        <el-textarea-field
            name="notes"
            label="Notes"
            help-message="Line breaks are kept"
            value="Milk
Bread"
        ></el-textarea-field>
    `,
};

export const Length = {
    name: 'The length of the text',
    parameters: {
        docs: {
            description: {
                story: '`maxlength` and `minlength` go to the native textarea: it takes no more than 200 characters, and is not valid while what was typed is shorter than 10.',
            },
        },
    },
    render: () => html`
        <el-textarea-field
            name="length-notes"
            label="Notes"
            help-message="Between 10 and 200 characters"
            error-message="At least 10 characters"
            maxlength="200"
            minlength="10"
        ></el-textarea-field>
    `,
};
