const html = String.raw;
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
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html` <el-checkbox-field></el-checkbox-field> `,
};
