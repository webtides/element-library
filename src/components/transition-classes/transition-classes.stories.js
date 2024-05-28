const html = String.raw;
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
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-transition-classes></el-transition-classes>`,
};
