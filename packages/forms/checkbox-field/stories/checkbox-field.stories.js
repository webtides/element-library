import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/checkbox-field';
define();

export default {
    title: 'Elements|CheckboxField',
    component: 'checkbox-field',
};

export const singleComponent = () => html`
    <checkbox-field></checkbox-field>
`;

