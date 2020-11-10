import { StyledElement, defineElement } from '@webtides/element-js';
import style from './tab-link.css';

export default class TabLink extends StyledElement {
	constructor() {
		super({ styles: [style] });
	}

	properties() {
		return {
			for: undefined,
		};
	}

	events() {
		return {
			this: {
				click: (event) => {
					event.preventDefault();
					event.stopPropagation();
					if (this.hasAttribute('disabled')) return;
					this.dispatch('tab-select', { selected: this.for }, true, true, true);
				},
			},
		};
	}
}

export function define() {
	defineElement('tab-link', TabLink);
}
