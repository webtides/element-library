import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/sticky-element';
define();

export default {
	title: 'Elements/StickyElement',
	component: 'sticky-element',
};

export const singleComponent = () => html` <sticky-element></sticky-element> `;
