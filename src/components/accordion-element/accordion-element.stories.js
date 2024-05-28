const html = String.raw;
import readme from './accordion-element.readme.md?raw';
import { define } from './accordion-element.js';
define();

export default {
    title: 'Components/AccordionElement',
    component: 'el-accordion-element',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const AccordionElement = {
    name: 'AccordionElement',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) =>
        html`<el-accordion-element open="false">
            <div slot="header" class="">
                <div>Accordion Header</div>
            </div>

            <div slot="content">Accordion Content</div>
        </el-accordion-element>`,
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
        html`<el-accordion-element open="true">
            <div slot="header" class="">Accordion Header</div>
            <div slot="content">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia repellendus
                soluta sunt voluptatem!
            </div>
        </el-accordion-element>`,
};
