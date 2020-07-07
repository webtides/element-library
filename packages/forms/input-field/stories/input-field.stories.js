import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/input-field';
define();

export default {
    title: 'Elements|InputField',
    component: 'input-field',
};

export const singleComponent = () => html`
    <input-field></input-field>
`;

