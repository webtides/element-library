const html = String.raw;
import readme from './scroll-to-top.readme.md?raw';
import { define } from './scroll-to-top.js';
define();

export default {
    title: 'Components/ScrollToTop',
    component: 'el-scroll-to-top',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const ScrollToTop = {
    name: 'ScrollToTop',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <div class="flex flex-col items-center justify-between" style="height: 1600px;">
            <p class="py-4">Scroll to the bottom...</p>
            <el-scroll-to-top duration="1000">
                <button
                    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                >
                    Click to scroll up
                </button>
            </el-scroll-to-top>
        </div>
    `,
};
