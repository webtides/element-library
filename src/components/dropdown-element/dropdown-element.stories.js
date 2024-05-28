const html = String.raw;
import readme from './dropdown-element.readme.md?raw';
import { define } from './dropdown-element.js';
define();

export default {
    title: 'Components/DropdownElement',
    component: 'el-dropdown-element',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: readme,
            },
        },
    },
};

export const DropdownElement = {
    name: 'DropdownElement',
    parameters: {
        docs: {
            description: {
                story: 'enables you to...',
            },
        },
    },
    decorators: [],
    render: ({}) => html`
        <div class="mx-auto w-64 py-4 text-right">
            <el-dropdown-element open="false">
                <div slot="trigger">
                    <span class="">
                        <button
                            type="button"
                            class="inline-flex justify-center rounded-md shadow-sm border border-gray-300 px-4 py-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150"
                        >
                            Options
                            <!-- Heroicon name: chevron-down -->
                            <svg
                                class="-mr-1 ml-2 h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </span>
                </div>
                <div slot="content">
                    <div
                        class="origin-top-right absolute right-0 text-left mt-2 w-56 rounded-md shadow-lg rounded-md bg-white shadow-xs"
                    >
                        <div class="py-1">
                            <a
                                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                                role="menuitem"
                                >Account settings</a
                            >
                            <a
                                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                                role="menuitem"
                                >Support</a
                            >
                            <a
                                class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
                                role="menuitem"
                                >License</a
                            >
                        </div>
                    </div>
                </div>
            </el-dropdown-element>
        </div>
    `,
};
