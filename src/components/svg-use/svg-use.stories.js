import { html } from '@webtides/element-js';
import readme from './svg-use.readme.md?raw';
import { define } from './svg-use.js';
define();

export default {
    title: 'Components/SvgUse',
    component: 'el-svg-use',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const SvgUse = {
    name: 'SvgUse',
    parameters: {
        docs: {
            description: {
                story: 'References a symbol from an SVG sprite via `<use>`; shown here with no `href` set.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`<el-svg-use></el-svg-use>`,
};
