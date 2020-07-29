import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/slider-element';
define();

export default {
    title: 'Interactions/SliderElement',
    component: 'slider-element',
};

export const singleComponent = () => html`
    <slider-element>
    	<li class="item bg-red-500 p-4 h-64">1</li>
    	<li class="item bg-blue-500 p-4  h-64">2</li>
    	<li class="item bg-green-500 p-4 h-64">3</li>
	</slider-element>
`;

