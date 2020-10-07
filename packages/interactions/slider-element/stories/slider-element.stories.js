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
		<div class="item bg-blue-500 p-4 h-64">2</div>
		<div class="item bg-green-500 p-4 h-64">3</div>
	</slider-element>
`;

export const noArrowVariant = () => html`
	<slider-element arrows="false">
		<div class="item bg-red-500 p-4 h-64">1</div>
		<div class="item bg-blue-500 p-4 h-64">2</div>
		<div class="item bg-green-500 p-4 h-64">3</div>
	</slider-element>
`;

export const noDotsVariant = () => html`
	<slider-element dots="false">
		<div class="item bg-red-500 p-4 h-64">1</div>
		<div class="item bg-blue-500 p-4 h-64">2</div>
		<div class="item bg-green-500 p-4 h-64">3</div>
	</slider-element>
`;

export const noDotsNoArrowsVariant = () => html`
	<slider-element dots="false" arrows="false">
		<div class="item bg-red-500 p-4 h-64">1</div>
		<div class="item bg-blue-500 p-4 h-64">2</div>
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

export const paddingVariant = () => html`
	<slider-element items-to-show="3">
		<div class="item bg-red-100 p-4 h-64 mr-2">1</div>
		<div class="item bg-red-200 p-4 h-64 mx-2">2</div>
		<div class="item bg-red-300 p-4 h-64 mx-2">3</div>
		<div class="item bg-red-400 p-4 h-64 mx-2">4</div>
		<div class="item bg-red-500 p-4 h-64 mx-2">5</div>
		<div class="item bg-red-600 p-4 h-64 mx-2">6</div>
		<div class="item bg-red-700 p-4 h-64 mx-2">7</div>
		<div class="item bg-red-800 p-4 h-64 mx-2">8</div>
		<div class="item bg-red-900 p-4 h-64 ml-2">9</div>
	</slider-element>
`;

export const selectedIndexVariant = () => html`
	<slider-element selected-index="3">
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
export const itemsToShowSnapPointVariant = () => html`
	<slider-element items-to-show="3">
		<div class="item bg-red-100 p-4 h-64">1</div>
		<div class="item bg-red-200 p-4 h-64">2</div>
		<div class="item bg-red-300 p-4 h-64" style="--snap-align: start;">4, start</div>
		<div class="item bg-red-400 p-4 h-64" style="--snap-align: end;">5, end</div>
		<div class="item bg-red-500 p-4 h-64">5</div>
		<div class="item bg-red-600 p-4 h-64" style="--snap-align: start;">6, start</div>
		<div class="item bg-red-700 p-4 h-64">7</div>
		<div class="item bg-red-800 p-4 h-64" style="--snap-align: end;">8, end</div>
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

export const variableWidthVariant = () => html`
	<slider-element>
		<div class="item bg-red-100 p-4 h-64 w-1/2">1</div>
		<div class="item bg-red-200 p-4 h-64 w-6/12">2</div>
		<div class="item bg-red-300 p-4 h-64" style="--snap-align: start;">3, start</div>
		<div class="item bg-red-400 p-4 h-64" style="--snap-align: end;">4, end</div>
		<div class="item bg-red-500 p-4 h-64">5</div>
		<div class="item bg-red-600 p-4 h-64" style="--snap-align: start;">6, start</div>
		<div class="item bg-red-700 p-4 h-64">7</div>
		<div class="item bg-red-800 p-4 h-64" style="--snap-align: end;">8, end</div>
		<div class="item bg-red-900 p-4 h-64">9</div>
	</slider-element>
`;

export const variableWidthEdgeFocusVariant = () => html`
	<slider-element auto-select="true">
		<div class="item bg-red-100 p-4 h-64 w-1/2">1</div>
		<div class="item bg-red-200 p-4 h-64 w-1/5">2</div>
		<div class="item bg-red-300 p-4 h-64 w-1/2" style="--snap-align: start;">3, start</div>
		<div class="item bg-red-400 p-4 h-64 w-1/5" style="--snap-align: end;">4, end</div>
		<div class="item bg-red-500 p-4 h-64 w-1/5">5</div>
		<div class="item bg-red-600 p-4 h-64 w-1/5" style="--snap-align: start;">6, start</div>
		<div class="item bg-red-700 p-4 h-64 w-1/2">7</div>
		<div class="item bg-red-800 p-4 h-64 w-1/5" style="--snap-align: end;">8, end</div>
		<div class="item bg-red-900 p-4 h-64 w-1/5">9</div>
	</slider-element>
`;
