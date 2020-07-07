import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/form-field';
define();

export default {
    title: 'Form Fields/FormField',
    component: 'form-field',
};

export const singleComponent = () => html`
    <form-field></form-field>
`;

