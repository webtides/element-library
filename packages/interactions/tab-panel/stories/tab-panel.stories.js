import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/tab-panel';
define();

export default {
    title: 'Interactions/TabPanel',
    component: 'tab-panel',
};

export const singleComponent = () => html`
    <tab-panel></tab-panel>
`;

