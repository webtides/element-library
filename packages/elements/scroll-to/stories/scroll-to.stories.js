import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/scroll-to';
define();

export default {
    title: 'Elements|ScrollTo',
    component: 'scroll-to',
};

export const singleComponent = () => html`
    <scroll-to selector="#element5">
        <button
            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
            Scroll to Element 5
        </button>
    </scroll-to>
    <div class="py-64 border border-blue-500 text-center m-2">Element 1</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 2</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 3</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 4</div>
    <div id="element5" class="py-64 border border-blue-500 text-center m-2">Element 5</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 6</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 7</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 8</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 9</div>
    <div class="py-64 border border-blue-500 text-center m-2">Element 10</div>
`;
