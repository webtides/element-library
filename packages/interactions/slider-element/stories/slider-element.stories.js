import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/slider-element';
define();

export default {
    title: 'Interactions/SliderElement',
    component: 'slider-element',
};

export const defaultVariant = () => html`
    <slider-element>
    	<div class="item bg-red-500 p-4 h-64">1</div>
    	<div class="item bg-blue-500 p-4  h-64">2</div>
    	<div class="item bg-green-500 p-4 h-64">3</div>
    	    	<div class="item bg-red-500 p-4 h-64">1</div>
    	<div class="item bg-blue-500 p-4  h-64">2</div>
    	<div class="item bg-green-500 p-4 h-64">3</div>
    	    	<div class="item bg-red-500 p-4 h-64">1</div>
    	<div class="item bg-blue-500 p-4  h-64">2</div>
    	<div class="item bg-green-500 p-4 h-64">3</div>
    	    	<div class="item bg-red-500 p-4 h-64">1</div>
    	<div class="item bg-blue-500 p-4  h-64">2</div>
    	<div class="item bg-green-500 p-4 h-64">3</div>
	</slider-element>
`;


export const rewindVariant = () => html`
    <slider-element rewind="true">
    	<div class="item bg-red-500 p-4 h-64">1</div>
    	<div class="item bg-blue-500 p-4  h-64">2</div>
    	<div class="item bg-green-500 p-4 h-64">3</div>
	</slider-element>
`;

export const itemsToShowVariant = () => html`
    <slider-element items-to-show="3">
    	<div class="item bg-red-100 p-4 h-64">1</div>
    	<div class="item bg-red-200 p-4 h-64">2</div>
    	<div class="item bg-red-300 p-4 h-64">3</div>
    	<div class="item bg-red-400 p-4 h-64">4</div>
    	<div class="item bg-red-500 p-4 h-64">5</div>
    	<div class="item bg-red-600 p-4 h-64">6</div>
    	<div class="item bg-red-700 p-4 h-64">7</div>
    	<div class="item bg-red-800 p-4 h-64">8</div>
    	<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;

export const itemsToShowStartVariant = () => html`
    <slider-element items-to-show="3" snap-align="start">
    	<div class="item bg-red-100 p-4 h-64">1</div>
    	<div class="item bg-red-200 p-4 h-64">2</div>
    	<div class="item bg-red-300 p-4 h-64">3</div>
    	<div class="item bg-red-400 p-4 h-64">4</div>
    	<div class="item bg-red-500 p-4 h-64">5</div>
    	<div class="item bg-red-600 p-4 h-64">6</div>
    	<div class="item bg-red-700 p-4 h-64">7</div>
    	<div class="item bg-red-800 p-4 h-64">8</div>
    	<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;
export const itemsToShowEndVariant = () => html`
    <slider-element items-to-show="3" snap-align="end">
    	<div class="item bg-red-100 p-4 h-64">1</div>
    	<div class="item bg-red-200 p-4 h-64">2</div>
    	<div class="item bg-red-300 p-4 h-64">3</div>
    	<div class="item bg-red-400 p-4 h-64">4</div>
    	<div class="item bg-red-500 p-4 h-64">5</div>
    	<div class="item bg-red-600 p-4 h-64">6</div>
    	<div class="item bg-red-700 p-4 h-64">7</div>
    	<div class="item bg-red-800 p-4 h-64">8</div>
    	<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;

export const itemsToScrollVariant = () => html`
    <slider-element items-to-show="3" items-to-scroll="3">
    	<div class="item bg-red-100 p-4 h-64">1</div>
    	<div class="item bg-red-200 p-4 h-64">2</div>
    	<div class="item bg-red-300 p-4 h-64">3</div>
    	<div class="item bg-red-400 p-4 h-64">4</div>
    	<div class="item bg-red-500 p-4 h-64">5</div>
    	<div class="item bg-red-600 p-4 h-64">6</div>
    	<div class="item bg-red-700 p-4 h-64">7</div>
    	<div class="item bg-red-800 p-4 h-64">8</div>
    	<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;


export const itemsToScrollStartVariant = () => html`
    <slider-element items-to-show="3" items-to-scroll="3" snap-align="start">
    	<div class="item bg-red-100 p-4 h-64">1</div>
    	<div class="item bg-red-200 p-4 h-64">2</div>
    	<div class="item bg-red-300 p-4 h-64">3</div>
    	<div class="item bg-red-400 p-4 h-64">4</div>
    	<div class="item bg-red-500 p-4 h-64">5</div>
    	<div class="item bg-red-600 p-4 h-64">6</div>
    	<div class="item bg-red-700 p-4 h-64">7</div>
    	<div class="item bg-red-800 p-4 h-64">8</div>
    	<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;

export const itemsToScrollEndVariant = () => html`
    <slider-element items-to-show="3" items-to-scroll="3" snap-align="end">
    	<div class="item bg-red-100 p-4 h-64">1</div>
    	<div class="item bg-red-200 p-4 h-64">2</div>
    	<div class="item bg-red-300 p-4 h-64">3</div>
    	<div class="item bg-red-400 p-4 h-64">4</div>
    	<div class="item bg-red-500 p-4 h-64">5</div>
    	<div class="item bg-red-600 p-4 h-64">6</div>
    	<div class="item bg-red-700 p-4 h-64">7</div>
    	<div class="item bg-red-800 p-4 h-64">8</div>
    	<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;

export const variableWidthVariant = () => html`
    <slider-element >
    	<div class="item bg-red-100 p-4 h-64 w-1/2">1</div>
    	<div class="item bg-red-200 p-4 h-64 w-6/12">2</div>
    	<div class="item bg-red-300 p-4 h-64 w-8/12">3</div>
    	<div class="item bg-red-400 p-4 h-64 w-4/12">4</div>
    	<div class="item bg-red-500 p-4 h-64 w-2/12">5</div>
    	<div class="item bg-red-600 p-4 h-64w-12/12">6</div>
    	<div class="item bg-red-700 p-4 h-64">7</div>
    	<div class="item bg-red-800 p-4 h-64 w-1/12">8</div>
    	<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;
