import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/mobile-accordion-element';
define();

export default {
	title: 'Interactions/MobileAccordionElement',
	component: 'mobile-accordion-element',
};

export const singleComponent = () => html`
	<mobile-accordion-element class="block">
		<div slot="header" class="">Resize the screen width to see the effect</div>
		<ul slot="content" class="">
			<li>Item 1</li>
			<li>Item 2</li>
			<li>Item 3</li>
			<li>Item 4</li>
		</ul>
	</mobile-accordion-element>
`;
