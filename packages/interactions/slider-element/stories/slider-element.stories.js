import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/slider-element';
define();

export default {
    title: 'Interactions/SliderElement',
    component: 'slider-element',
};

export const defaultVariant = () => html`
    <slider-element>
    	<li class="item bg-red-500 p-4 h-64">1</li>
    	<li class="item bg-blue-500 p-4  h-64">2</li>
    	<li class="item bg-green-500 p-4 h-64">3</li>
	</slider-element>
`;

export const rewindVariant = () => html`
    <slider-element rewind="true">
    	<li class="item bg-red-500 p-4 h-64">1</li>
    	<li class="item bg-blue-500 p-4  h-64">2</li>
    	<li class="item bg-green-500 p-4 h-64">3</li>
	</slider-element>
`;

export const itemsToShowVariant = () => html`
    <slider-element items-to-show="3">
    	<li class="item bg-red-100 p-4 h-64">1</li>
    	<li class="item bg-red-200 p-4 h-64">2</li>
    	<li class="item bg-red-300 p-4 h-64">3</li>
    	<li class="item bg-red-400 p-4 h-64">4</li>
    	<li class="item bg-red-500 p-4 h-64">5</li>
    	<li class="item bg-red-600 p-4 h-64">6</li>
    	<li class="item bg-red-700 p-4 h-64">7</li>
    	<li class="item bg-red-800 p-4 h-64">8</li>
    	<li class="item bg-red-900 p-4 h-64">9</li>
	</slider-element>
`;

export const itemsToScrollVariant = () => html`
    <slider-element items-to-show="3" items-to-scroll="3">
    	<li class="item bg-red-100 p-4 h-64">1</li>
    	<li class="item bg-red-200 p-4 h-64">2</li>
    	<li class="item bg-red-300 p-4 h-64">3</li>
    	<li class="item bg-red-400 p-4 h-64">4</li>
    	<li class="item bg-red-500 p-4 h-64">5</li>
    	<li class="item bg-red-600 p-4 h-64">6</li>
    	<li class="item bg-red-700 p-4 h-64">7</li>
    	<li class="item bg-red-800 p-4 h-64">8</li>
    	<li class="item bg-red-900 p-4 h-64">9</li>
	</slider-element>
`;

