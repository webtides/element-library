import { html } from '@webtides/element-js';
import readme from './accordion.readme.md?raw';
import { define } from './accordion.js';
define();

export default {
    title: 'Components/Accordion',
    component: 'el-accordion',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const Accordion = {
    name: 'Accordion',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) =>
        html`<el-accordion open="false">
            <div slot="header" class="">
                <div>Accordion Header</div>
            </div>

            <div slot="content">Accordion Content</div>
        </el-accordion>`,
};

export const InitialOpen = {
    name: 'InitialOpen',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) =>
        html`<el-accordion open="true">
            <div slot="header" class="">Accordion Header</div>
            <div slot="content">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia repellendus
                soluta sunt voluptatem!
            </div>
        </el-accordion>`,
};
