import { Story, Meta, html } from '@open-wc/demoing-storybook';
import '../element';

export default {
    title: 'Elements|TextareaField',
    component: 'textarea-field',
};

export const singleComponent = () => html`
    <textarea-field></textarea-field>
`;

