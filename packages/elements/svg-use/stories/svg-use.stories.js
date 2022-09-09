import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '../src/svg-use';
define();

export default {
	title: 'Elements/SvgUse',
	component: 'svg-use',
};

export const singleComponent = () => html` <svg-use></svg-use> `;
