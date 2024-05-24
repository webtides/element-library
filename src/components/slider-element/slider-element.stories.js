import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/slider-element';
define();
import { defineElement, TemplateElement } from '@webtides/element-js';

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

class RenderingElement extends TemplateElement {
    constructor() {
        super({ shadowRender: false, deferUpdate: true });
    }

    properties() {
        return {
            index: 0,
        };
    }
    connected() {
        window.setTimeout(() => this.requestUpdate(), Math.random() * 1500);
    }

    template() {
        return `<div style="min-width: 50px; width:${
            100 + Math.random() * 300
        }px; height: 150px; background-color: red;">${this.index}</div>`;
    }
}

defineElement('rendering-element', RenderingElement);

export const itemsToScrollRenderVariant = () => html`
    <slider-element items-to-scroll="1" style="--snap-align: start;">
        <rendering-element class="item mx-2 w-auto" index="1"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="2"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="3"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="4"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="5"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="6"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="7"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="8"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="9"></rendering-element>
        <rendering-element class="item mx-2 w-auto" index="10"></rendering-element>
    </slider-element>
`;

export const autoSelectVariant = () => html`
    <slider-element items-to-scroll="1" auto-select="true" items-to-show="4">
        <rendering-element class="item mx-2 " index="1"></rendering-element>
        <rendering-element class="item mx-2 " index="2"></rendering-element>
        <rendering-element class="item mx-2" index="3"></rendering-element>
        <rendering-element class="item mx-2" index="4"></rendering-element>
        <rendering-element class="item mx-2" index="5"></rendering-element>
        <rendering-element class="item mx-2" index="6"></rendering-element>
        <rendering-element class="item mx-2" index="7"></rendering-element>
        <rendering-element class="item mx-2" index="8"></rendering-element>
        <rendering-element class="item mx-2" index="9"></rendering-element>
        <rendering-element class="item mx-2" index="10"></rendering-element>
    </slider-element>
`;
