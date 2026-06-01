import { html } from '@webtides/element-js';
import readme from './carousel.readme.md?raw';
import { define } from './carousel.js';
define();

export default {
    title: 'Components/Carousel',
    component: 'carousel',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const Carousel = {
    name: 'Carousel',
    parameters: {
        docs: {
            description: {
                story: 'The default Glide-backed carousel — one slide per view with arrows and bullets.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-carousel>
            <div class="bg-red-500 p-4 h-64 ">1</div>
            <div class="bg-blue-500 p-4  h-64">2</div>
            <div class="bg-green-500 p-4 h-64">3</div>
            <div class="bg-green-500 p-4 h-64">4</div>
            <div class="bg-green-500 p-4 h-64">5</div>
            <div class="bg-green-500 p-4 h-64">6</div>
        </el-carousel>
    `,
};

export const MultiCenterVariant = {
    parameters: {
        docs: {
            description: {
                story: 'Custom Glide `options` showing five slides per view, centered on the active one (`{ perView: 5, focusAt: "center" }`).',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-carousel options='{"perView": 5, "focusAt": "center"}'>
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
        </el-carousel>
    `,
};

export const ArrowSlotVariant = {
    parameters: {
        docs: {
            description: {
                story: 'Replaces the default arrows with custom markup via the `arrow-left` / `arrow-right` slots.',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-carousel>
            <div class="bg-red-500 p-4 h-64 ">1</div>
            <div class="bg-blue-500 p-4  h-64">2</div>
            <div class="bg-green-500 p-4 h-64">3</div>
            <div class="bg-green-500 p-4 h-64">4</div>
            <div class="bg-green-500 p-4 h-64">5</div>
            <div class="bg-green-500 p-4 h-64">6</div>
            <span slot="arrow-left">L</span>
            <span slot="arrow-right">R</span>
        </el-carousel>
    `,
};
