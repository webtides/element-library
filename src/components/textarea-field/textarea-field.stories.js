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
