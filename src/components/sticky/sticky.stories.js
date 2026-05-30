import { html } from '@webtides/element-js';
import readme from './sticky.readme.md?raw';
import { define } from './sticky.js';
define();

export default {
    title: 'Components/Sticky',
    component: 'el-sticky',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const Sticky = {
    name: 'Sticky',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-sticky></el-sticky>`,
};
