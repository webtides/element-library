/* eslint-disable no-unused-expressions */
import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/lazy-src';
define();

export default {
	title: 'Elements/LazySrc',
	component: 'lazy-src',
};

export const lazyImage = () => html`
	<lazy-src>
		<img
			data-src="https://images.unsplash.com/photo-1524125833033-bc59e523d3e5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1970&q=80"
			class="h-64 w-auto "
		/>
	</lazy-src>
`;
