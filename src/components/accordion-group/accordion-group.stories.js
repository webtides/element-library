import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/accordion-group';
define();

export default {
    title: 'Elements/AccordionGroup',
    component: 'accordion-group',
};

export const singleElement = () => html`
    <div class="max-w-2xl">
        <accordion-group show-multiple="false">
            <accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dicta,
                    minima numquam. Asperiores commodi consequuntur delectus dolor eos fuga natus nemo repellendus
                    repudiandae sunt? Amet beatae dicta impedit, praesentium quis vel.
                </div>
            </accordion-element>

            <accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem!
                </div>
            </accordion-element>

            <accordion-element open="false">
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
            </accordion-element>
        </accordion-group>
    </div>
`;

export const multipleElement = () => html`
    <div class="max-w-2xl">
        <accordion-group>
            <accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dicta,
                    minima numquam. Asperiores commodi consequuntur delectus dolor eos fuga natus nemo repellendus
                    repudiandae sunt? Amet beatae dicta impedit, praesentium quis vel.
                </div>
            </accordion-element>

            <accordion-element open="false">
                <div slot="header" class="">Accordion Header</div>
                <div slot="content">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta
                    eos, fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia
                    repellendus soluta sunt voluptatem!
                </div>
            </accordion-element>

            <accordion-element open="false">
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
            </accordion-element>
        </accordion-group>
    </div>
`;
