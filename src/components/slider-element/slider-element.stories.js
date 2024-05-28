import { defineElement, TemplateElement } from '@webtides/element-js';
const html = String.raw;
import readme from './slider-element.readme.md?raw';
import { define } from './slider-element.js';
define();

export default {
    title: 'Components/SliderElement',
    component: 'el-slider-element',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const SliderElement = {
    name: 'SliderElement',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element>
            <div class="item bg-red-500 p-4 h-64">1</div>
            <div class="item bg-blue-500 p-4 h-64">2</div>
            <div class="item bg-green-500 p-4 h-64">3</div>
        </el-slider-element>
    `,
};

export const NoArrow = {
    name: 'NoArrow',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element arrows="false">
            <div class="item bg-red-500 p-4 h-64">1</div>
            <div class="item bg-blue-500 p-4 h-64">2</div>
            <div class="item bg-green-500 p-4 h-64">3</div>
        </el-slider-element>
    `,
};

export const NoDots = {
    name: 'NoDots',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element dots="false">
            <div class="item bg-red-500 p-4 h-64">1</div>
            <div class="item bg-blue-500 p-4 h-64">2</div>
            <div class="item bg-green-500 p-4 h-64">3</div>
        </el-slider-element>
    `,
};

export const NoDotsAndNoArrows = {
    name: 'NoDotsAndNoArrows',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element dots="false" arrows="false">
            <div class="item bg-red-500 p-4 h-64">1</div>
            <div class="item bg-blue-500 p-4 h-64">2</div>
            <div class="item bg-green-500 p-4 h-64">3</div>
        </el-slider-element>
    `,
};

export const Rewind = {
    name: 'Rewind',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element rewind="true">
            <div class="item bg-red-500 p-4 h-64">1</div>
            <div class="item bg-blue-500 p-4 h-64">2</div>
            <div class="item bg-green-500 p-4 h-64">3</div>
        </el-slider-element>
    `,
};

export const Padding = {
    name: 'Padding',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element items-to-show="3">
            <div class="item bg-red-100 p-4 h-64 mr-2">1</div>
            <div class="item bg-red-200 p-4 h-64 mx-2">2</div>
            <div class="item bg-red-300 p-4 h-64 mx-2">3</div>
            <div class="item bg-red-400 p-4 h-64 mx-2">4</div>
            <div class="item bg-red-500 p-4 h-64 mx-2">5</div>
            <div class="item bg-red-600 p-4 h-64 mx-2">6</div>
            <div class="item bg-red-700 p-4 h-64 mx-2">7</div>
            <div class="item bg-red-800 p-4 h-64 mx-2">8</div>
            <div class="item bg-red-900 p-4 h-64 ml-2">9</div>
        </el-slider-element>
    `,
};

export const SelectedIndex = {
    name: 'SelectedIndex',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element selected-index="3">
            <div class="item bg-red-100 p-4 h-64 mr-2">1</div>
            <div class="item bg-red-200 p-4 h-64 mx-2">2</div>
            <div class="item bg-red-300 p-4 h-64 mx-2">3</div>
            <div class="item bg-red-400 p-4 h-64 mx-2">4</div>
            <div class="item bg-red-500 p-4 h-64 mx-2">5</div>
            <div class="item bg-red-600 p-4 h-64 mx-2">6</div>
            <div class="item bg-red-700 p-4 h-64 mx-2">7</div>
            <div class="item bg-red-800 p-4 h-64 mx-2">8</div>
            <div class="item bg-red-900 p-4 h-64 ml-2">9</div>
        </el-slider-element>
    `,
};

export const ItemsToShow = {
    name: 'ItemsToShow',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element items-to-show="3">
            <div class="item bg-red-100 p-4 h-64 mr-2">1</div>
            <div class="item bg-red-200 p-4 h-64 mx-2">2</div>
            <div class="item bg-red-300 p-4 h-64 mx-2">3</div>
            <div class="item bg-red-400 p-4 h-64 mx-2">4</div>
            <div class="item bg-red-500 p-4 h-64 mx-2">5</div>
            <div class="item bg-red-600 p-4 h-64 mx-2">6</div>
            <div class="item bg-red-700 p-4 h-64 mx-2">7</div>
            <div class="item bg-red-800 p-4 h-64 mx-2">8</div>
            <div class="item bg-red-900 p-4 h-64 ml-2">9</div>
        </el-slider-element>
    `,
};

export const ItemsToShowSnapPoint = {
    name: 'ItemsToShowSnapPoint',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element items-to-show="3">
            <div class="item bg-red-100 p-4 h-64">1</div>
            <div class="item bg-red-200 p-4 h-64">2</div>
            <div class="item bg-red-300 p-4 h-64" style="--snap-align: start;">4, start</div>
            <div class="item bg-red-400 p-4 h-64" style="--snap-align: end;">5, end</div>
            <div class="item bg-red-500 p-4 h-64">5</div>
            <div class="item bg-red-600 p-4 h-64" style="--snap-align: start;">6, start</div>
            <div class="item bg-red-700 p-4 h-64">7</div>
            <div class="item bg-red-800 p-4 h-64" style="--snap-align: end;">8, end</div>
            <div class="item bg-red-900 p-4 h-64">9</div>
        </el-slider-element>
    `,
};

export const ItemsToScroll = {
    name: 'ItemsToShow',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element items-to-show="3" items-to-scroll="3">
            <div class="item bg-red-100 p-4 h-64 mr-2">1</div>
            <div class="item bg-red-200 p-4 h-64 mx-2">2</div>
            <div class="item bg-red-300 p-4 h-64 mx-2">3</div>
            <div class="item bg-red-400 p-4 h-64 mx-2">4</div>
            <div class="item bg-red-500 p-4 h-64 mx-2">5</div>
            <div class="item bg-red-600 p-4 h-64 mx-2">6</div>
            <div class="item bg-red-700 p-4 h-64 mx-2">7</div>
            <div class="item bg-red-800 p-4 h-64 mx-2">8</div>
            <div class="item bg-red-900 p-4 h-64 ml-2">9</div>
        </el-slider-element>
    `,
};

export const VariableWidth = {
    name: 'VariableWidth',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element>
            <div class="item bg-red-100 p-4 h-64 w-1/2">1</div>
            <div class="item bg-red-200 p-4 h-64 w-6/12">2</div>
            <div class="item bg-red-300 p-4 h-64" style="--snap-align: start;">3, start</div>
            <div class="item bg-red-400 p-4 h-64" style="--snap-align: end;">4, end</div>
            <div class="item bg-red-500 p-4 h-64">5</div>
            <div class="item bg-red-600 p-4 h-64" style="--snap-align: start;">6, start</div>
            <div class="item bg-red-700 p-4 h-64">7</div>
            <div class="item bg-red-800 p-4 h-64" style="--snap-align: end;">8, end</div>
            <div class="item bg-red-900 p-4 h-64">9</div>
        </el-slider-element>
    `,
};

export const VariableWidthEdgeFocus = {
    name: 'VariableWidthEdgeFocus',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element auto-select="true">
            <div class="item bg-red-100 p-4 h-64 w-1/2">1</div>
            <div class="item bg-red-200 p-4 h-64 w-6/12">2</div>
            <div class="item bg-red-300 p-4 h-64" style="--snap-align: start;">3, start</div>
            <div class="item bg-red-400 p-4 h-64" style="--snap-align: end;">4, end</div>
            <div class="item bg-red-500 p-4 h-64">5</div>
            <div class="item bg-red-600 p-4 h-64" style="--snap-align: start;">6, start</div>
            <div class="item bg-red-700 p-4 h-64">7</div>
            <div class="item bg-red-800 p-4 h-64" style="--snap-align: end;">8, end</div>
            <div class="item bg-red-900 p-4 h-64">9</div>
        </el-slider-element>
    `,
};

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

defineElement('el-rendering-element', RenderingElement);

export const ItemsToScrollRender = {
    name: 'ItemsToScrollRender',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element items-to-scroll="1" style="--snap-align: start;">
            <el-rendering-element class="item mx-2 w-auto" index="1"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="2"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="3"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="4"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="5"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="6"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="7"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="8"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="9"></el-rendering-element>
            <el-rendering-element class="item mx-2 w-auto" index="10"></el-rendering-element>
        </el-slider-element>
    `,
};

export const AutoSelect = {
    name: 'AutoSelect',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <el-slider-element items-to-scroll="1" auto-select="true" items-to-show="4">
            <el-rendering-element class="item mx-2 " index="1"></el-rendering-element>
            <el-rendering-element class="item mx-2 " index="2"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="3"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="4"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="5"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="6"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="7"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="8"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="9"></el-rendering-element>
            <el-rendering-element class="item mx-2" index="10"></el-rendering-element>
        </el-slider-element>
    `,
};
