import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/carousel-element';

define();

export default {
	title: 'Interactions/CarouselElement',
	component: 'carousel-element',
};

export const defaultVariant = () => html`
	<carousel-element>
		<div class="bg-red-500 p-4 h-64 ">1</div>
		<div class="bg-blue-500 p-4  h-64">2</div>
		<div class="bg-green-500 p-4 h-64">3</div>
		<div class="bg-green-500 p-4 h-64">4</div>
		<div class="bg-green-500 p-4 h-64">5</div>
		<div class="bg-green-500 p-4 h-64">6</div>
	</carousel-element>
`;

export const multiCenterVariant = () => html`
	<carousel-element options='{"perView": 5, "focusAt": "center"}'>
		<div class="bg-red-500 p-4 h-64 ">1</div>
		<div class="bg-blue-500 p-4  h-64">2</div>
		<div class="bg-green-500 p-4 h-64">3</div>
		<div class="bg-green-500 p-4 h-64">4</div>
		<div class="bg-green-500 p-4 h-64">5</div>
		<div class="bg-green-500 p-4 h-64">6</div>
		<div class="bg-red-500 p-4 h-64 ">7</div>
		<div class="bg-blue-500 p-4  h-64">8</div>
		<div class="bg-green-500 p-4 h-64">9</div>
		<div class="bg-green-500 p-4 h-64">10</div>
		<div class="bg-green-500 p-4 h-64">11</div>
		<div class="bg-green-500 p-4 h-64">12</div>
	</carousel-element>
`;

export const arrowSlotVariant = () => html`
	<carousel-element>
		<div class="bg-red-500 p-4 h-64 ">1</div>
		<div class="bg-blue-500 p-4  h-64">2</div>
		<div class="bg-green-500 p-4 h-64">3</div>
		<div class="bg-green-500 p-4 h-64">4</div>
		<div class="bg-green-500 p-4 h-64">5</div>
		<div class="bg-green-500 p-4 h-64">6</div>
		<span slot="arrow-left">L</span>
		<span slot="arrow-right">R</span>
	</carousel-element>
`;
