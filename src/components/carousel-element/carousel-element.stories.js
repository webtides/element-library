const html = String.raw;
import readme from './carousel-element.readme.md?raw';
import { define } from './carousel-element.js';
define();

export default {
    title: 'Components/CarouselElement',
    component: 'carousel-element',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const CarouselElement = {
    name: 'CarouselElement',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-carousel-element>
            <div class="bg-red-500 p-4 h-64 ">1</div>
            <div class="bg-blue-500 p-4  h-64">2</div>
            <div class="bg-green-500 p-4 h-64">3</div>
            <div class="bg-green-500 p-4 h-64">4</div>
            <div class="bg-green-500 p-4 h-64">5</div>
            <div class="bg-green-500 p-4 h-64">6</div>
        </el-carousel-element>
    `,
};

export const multiCenterVariant = {
    name: 'multiCenterVariant',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-carousel-element options='{"perView": 5, "focusAt": "center"}'>
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
        </el-carousel-element>
    `,
};

export const arrowSlotVariant = {
    name: 'arrowSlotVariant',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-carousel-element>
            <div class="bg-red-500 p-4 h-64 ">1</div>
            <div class="bg-blue-500 p-4  h-64">2</div>
            <div class="bg-green-500 p-4 h-64">3</div>
            <div class="bg-green-500 p-4 h-64">4</div>
            <div class="bg-green-500 p-4 h-64">5</div>
            <div class="bg-green-500 p-4 h-64">6</div>
            <span slot="arrow-left">L</span>
            <span slot="arrow-right">R</span>
        </el-carousel-element>
    `,
};
