import { html } from '@webtides/element-js';
import readme from './form-field.readme.md?raw';
import { define } from './form-field.js';
define();

export default {
    title: 'Components/FormField',
    component: 'form-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const FormField = {
    name: 'FormField',
    parameters: {
        docs: {
            description: {
                story: 'The base field rendered directly. It is normally extended by concrete fields (`input-field`, `checkbox-field`, …) rather than used on its own.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-form-field></el-form-field>`,
};
