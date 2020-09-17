import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/carousel-element';
define();

export default {
    title: 'Interactions/CarouselElement',
    component: 'carousel-element',
};

export const defaultVariant = () => html`

    <carousel-element>
		<div class="item bg-red-500 p-4 h-64 ">1<a></a></div>
		<div class="item bg-blue-500 p-4  h-64">2</div>
		<div class="item bg-green-500 p-4 h-64">3</div>
		<div class="item bg-green-500 p-4 h-64">4</div>
		<div class="item bg-green-500 p-4 h-64">5</div>
		<div class="item bg-green-500 p-4 h-64">6</div>
	</carousel-element>
`;

export const multiCenterVariant = () => html`
    <carousel-element options='{"perView": 5, "focusAt": "center"}'>
		<div class="item bg-red-500 p-4 h-64 ">1</div>
		<div class="item bg-blue-500 p-4  h-64">2</div>
		<div class="item bg-green-500 p-4 h-64">3</div>
		<div class="item bg-green-500 p-4 h-64">4</div>
		<div class="item bg-green-500 p-4 h-64">5</div>
		<div class="item bg-green-500 p-4 h-64">6</div>
		<div class="item bg-red-500 p-4 h-64 ">7</div>
		<div class="item bg-blue-500 p-4  h-64">8</div>
		<div class="item bg-green-500 p-4 h-64">9</div>
		<div class="item bg-green-500 p-4 h-64">10</div>
		<div class="item bg-green-500 p-4 h-64">11</div>
		<div class="item bg-green-500 p-4 h-64">12</div>
	</carousel-element>
`;
