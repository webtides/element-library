import { Story, Meta, html } from '@open-wc/demoing-storybook';
import '../element';

export default {
    title: 'Elements|InputField',
    component: 'input-field',
};

export const singleComponent = () => html`
    <input-field></input-field>
`;

