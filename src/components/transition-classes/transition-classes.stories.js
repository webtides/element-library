import { html } from '@webtides/element-js';
import readme from './transition-classes.readme.md?raw';
import { define } from './transition-classes.js';
define();

export default {
    title: 'Components/TransitionClasses',
    component: 'el-transition-classes',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const TransitionClasses = {
    name: 'TransitionClasses',
    parameters: {
        docs: {
            description: {
                story: 'The bare element in its default state. Set the per-stage `enter*` / `leave*` attributes to apply transition classes to the host as the `show` property flips.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-transition-classes></el-transition-classes>`,
};
