const html = String.raw;
import readme from './tab-link.readme.md?raw';
import { define } from './tab-link.js';
define();

export default {
    title: 'Components/TabLink',
    component: 'el-tab-link',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const TabLink = {
    name: 'TabLink',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-tab-link></el-tab-link>`,
};
