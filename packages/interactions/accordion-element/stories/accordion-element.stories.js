import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/accordion-element';
define();

export default {
	title: 'Interactions/AccordionElement',
	component: 'accordion-element',
};

export const defaultVariant = () => html`
	<accordion-element open="false">
		<div slot="header" class="">
			<div>Accordion Header</div>
		</div>

		<div slot="content">Accordion Content</div>
	</accordion-element>
`;

export const openElementVariant = () => html`
	<accordion-element open="true">
		<div slot="header" class="">Accordion Header</div>
		<div slot="content">
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium, aliquid autem dicta eos,
			fuga fugiat incidunt itaque libero maxime non nostrum odio, perferendis placeat quia repellendus soluta sunt
			voluptatem!
		</div>
	</accordion-element>
`;
