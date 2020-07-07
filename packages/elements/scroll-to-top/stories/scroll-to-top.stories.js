import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/scroll-to-top';
define();

export default {
    title: 'Elements|ScrollToTop',
    component: 'scroll-to-top',
};

export const singleComponent = () => html`
    <div class="flex flex-col items-center justify-between" style="height: 1600px;">
        <p class="py-4">Scroll to the bottom...</p>
        <scroll-to-top duration="1000">
            <button
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            >
                Click to scroll up
            </button>
        </scroll-to-top>
    </div>
`;
