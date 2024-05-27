import readme from './lazy-src.readme.md?raw';
import { define } from './lazy-src.js';
define();
const html = String.raw;

export default {
    title: 'Components/LazySrc',
    component: 'el-lazy-src',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const lazyImage = {
    name: 'Lazy loading Image',
    parameters: {
        docs: {
            description: {
                story: 'This is how to lazy load an image with `el-lazy-src`',
            },
        },
    },
    decorators: [],
    render: ({}) =>
        html`<el-lazy-src>
            <img
                data-src="https://images.unsplash.com/photo-1524125833033-bc59e523d3e5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=80"
                width="300"
                alt="some unsplash image"
            />
        </el-lazy-src>`,
};
