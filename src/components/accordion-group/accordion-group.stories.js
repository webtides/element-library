const html = String.raw;
import readme from './accordion-group.readme.md?raw';
import { define as define1 } from './accordion-group.js';
define1();
import { define as define2 } from '../accordion-element/accordion-element.js';
define2();

export default {
    title: 'Components/AccordionGroup',
    component: 'el-accordion-group',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const SingleElement = {
    name: 'SingleElement',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-accordion-group show-multiple="false">
            <el-accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dicta,
                    minima numquam. Asperiores commodi consequuntur delectus dolor eos fuga natus nemo repellendus
                    repudiandae sunt? Amet beatae dicta impedit, praesentium quis vel.
                </div>
            </el-accordion-element>

            <el-accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem!
                </div>
            </el-accordion-element>

            <el-accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab aut
                    cum dignissimos dolor dolorem excepturi expedita explicabo facilis id in incidunt, neque, nobis odio
                    officia quia, quisquam quos suscipit veniam! Lorem ipsum dolor sit amet, consectetur adipisicing
                    elit. Adipisci alias amet autem cupiditate ea earum est explicabo illo inventore laboriosam neque
                    nisi perferendis, quia quisquam quo sapiente voluptas voluptate voluptates?
                </div>
            </el-accordion-element>
        </el-accordion-group>
    `,
};

export const MultipleOpen = {
    name: 'MultipleOpen',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) =>
        html` <el-accordion-group>
            <el-accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dicta,
                    minima numquam. Asperiores commodi consequuntur delectus dolor eos fuga natus nemo repellendus
                    repudiandae sunt? Amet beatae dicta impedit, praesentium quis vel.
                </div>
            </el-accordion-element>

            <el-accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem!
                </div>
            </el-accordion-element>

            <el-accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab aut
                    cum dignissimos dolor dolorem excepturi expedita explicabo facilis id in incidunt, neque, nobis odio
                    officia quia, quisquam quos suscipit veniam! Lorem ipsum dolor sit amet, consectetur adipisicing
                    elit. Adipisci alias amet autem cupiditate ea earum est explicabo illo inventore laboriosam neque
                    nisi perferendis, quia quisquam quo sapiente voluptas voluptate voluptates?
                </div>
            </el-accordion-element>
        </el-accordion-group>`,
};
