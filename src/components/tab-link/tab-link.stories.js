import { html } from '@webtides/element-js';
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
                story: 'A standalone tab link. Clicking it dispatches a bubbling `tab-select` event carrying its `for` value; an `el-tab-group` wires several together into a tab set.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-tab-link></el-tab-link>`,
};
