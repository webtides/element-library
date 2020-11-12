import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/dropdown-element';
define();
import { define as define2 } from '@webtides/transition-classes';
define2();

export default {
	title: 'Interactions/DropdownElement',
	component: 'dropdown-element',
};

export const simple = () => html`
	<div class="mx-auto w-64 py-4 text-right">
		<dropdown-element open="false">
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
		</dropdown-element>
	</div>
`;

export const withTransition = () => html`
	<div class="mx-auto w-64 py-4 text-right">
		<dropdown-element open="false">
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
				<transition-classes
					enter="duration-200 ease-out"
					enter-start="opacity-0 scale-95"
					enter-end="opacity-100 scale-100"
					leave="duration-100 ease-in"
					leave-start="opacity-100 scale-100"
					leave-end="opacity-0 scale-95"
					class="absolute top-0 inset-x-0 p-2 transition transform origin-top-right"
					style="display: block;"
					show="true"
				>
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
				</transition-classes>
			</div>
		</dropdown-element>
	</div>
`;
