const html = String.raw;
import readme from './sticky-element.readme.md?raw';
import { define } from './sticky-element.js';
define();

export default {
    title: 'Components/StickyElement',
    component: 'el-sticky-element',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const StickyElement = {
    name: 'StickyElement',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-sticky-element></el-sticky-element>`,
};
