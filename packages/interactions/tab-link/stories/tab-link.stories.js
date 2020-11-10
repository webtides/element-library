import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/tab-link';
define();

export default {
    title: 'Interactions/TabLink',
    component: 'tab-link',
};

export const singleComponent = () => html`
    <tab-link></tab-link>
`;

