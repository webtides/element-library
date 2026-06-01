import { html } from '@webtides/element-js';
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
                story: 'A standalone panel. Its visibility is normally driven by the parent `el-tab-group`, which shows or hides it by matching `name` to the active tab.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-tab-panel></el-tab-panel>`,
};
