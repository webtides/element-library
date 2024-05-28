const html = String.raw;
import readme from './tab-panel.readme.md?raw';
import { define } from './tab-panel.js';
define();

export default {
    title: 'Components/TabPanel',
    component: 'el-tab-panel',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const TabPanel = {
    name: 'TabPanel',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-tab-panel></el-tab-panel>`,
};
