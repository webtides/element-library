import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/select-field';
define();

export default {
    title: 'Form Fields/SelectField',
    component: 'select-field',
};

export const stringOptions = () => html`
	<select-field
		name="country"
		options='["Germany", "Canada", "US and A"]'
		label="Country"
		help-message="We would like to know where you are from"
	></select-field>
`;

export const objectOptions = () => html`
	<select-field
		name="country"
		options='[{"value":"DE", "label":"Germany"}, {"value":"CA", "label":"Canada"}, {"value":"USA", "label":"US and A"}]'
		label="Country"
		help-message="We would like to know where you are from"
	></select-field>
`;

