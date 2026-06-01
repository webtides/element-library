import { html } from '@webtides/element-js';
import readme from './checkbox-field.readme.md?raw';
import { define } from './checkbox-field.js';
define();

export default {
    title: 'Components/CheckboxField',
    component: 'el-checkbox-field',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const CheckboxField = {
    name: 'CheckboxField',
    parameters: {
        docs: {
            description: {
                story: 'A checkbox with a custom indicator, inheriting label, validation and state handling from `form-field`.',
            },
        },
    },
    decorators: [],
    render: ({}) => html` <el-checkbox-field></el-checkbox-field> `,
};
