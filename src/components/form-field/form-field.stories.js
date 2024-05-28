const html = String.raw;
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
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-form-field></el-form-field>`,
};
