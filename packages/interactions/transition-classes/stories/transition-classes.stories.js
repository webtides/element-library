import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/transition-classes';
define();

export default {
    title: 'Interactions/TransitionClasses',
    component: 'transition-classes',
};

export const singleComponent = () => html`
    <transition-classes></transition-classes>
`;

