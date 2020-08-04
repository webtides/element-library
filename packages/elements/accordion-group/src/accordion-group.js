import { BaseElement, defineElement } from '@webtides/element-js';

export default class AccordionGroup extends BaseElement {
	constructor() {
		super();
		this._children = [];
	}

	hooks() {
		return {
			connected: () => {
				this._children = Array.from(this.children);
			},
		};
	}

	events() {
		return {
			document: {
				['AccordionElementOpen']: (event) => {
					this._children?.map((details) => {
						details.open = event.target === details;
					});
				},
			},
		};
	}
}

export function define() {
	defineElement('accordion-group', AccordionGroup);
}
