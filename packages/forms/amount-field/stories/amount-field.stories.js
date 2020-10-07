import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '../src/amount-field';
define();

export default {
	title: 'Form Fields/AmountField',
	component: 'amount-field',
};

export const amountComponent = () => html` <amount-field></amount-field> `;
export const valueComponent = () => html` <amount-field value="5"></amount-field> `;
export const maxComponent = () => html` <amount-field value="5" max="6"></amount-field> `;
export const minMaxComponent = () => html` <amount-field min="2" value="5" max="6"></amount-field> `;
export const noLimitComponent = () => html` <amount-field min="false" max="false"></amount-field> `;
