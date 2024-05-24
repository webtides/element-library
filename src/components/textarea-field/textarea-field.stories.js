import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/textarea-field';
define();

export default {
    title: 'Form Fields/TextareaField',
    component: 'textarea-field',
};

export const singleComponent = () => html` <textarea-field></textarea-field> `;
