import { TemplateElement, html, defineElement } from '@webtides/element-js';
import style from './accordion-element.css';
import Events from './accordion-element.events';

export default class AccordionElement extends TemplateElement {
	constructor() {
		super({ shadowRender: true, styles: [style], propertyOptions: { open: { reflect: true } } });
	}

	connected() {
		if (!this.open) this.collapse();
	}

	properties() {
		return {
			open: false,
		};
	}

	watch() {
		return {
			open: (open) => {
				open === true ? this.expand() : this.collapse();
				this.dispatch(Events.TOGGLE, { open: this.open }, true);
			},
		};
	}

	events() {
		return {
			'[data-toggle]': {
				click: () => {
					this.toggle();
				},
			},
		};
	}

	toggle() {
		this.open = !this.open;
	}

	collapse() {
		const contentHeight = this.$refs.content.scrollHeight;

		const elementTransition = this.$refs.content.style.transition;
		this.$refs.content.style.transition = '';

		requestAnimationFrame(() => {
			this.$refs.content.style.height = contentHeight + 'px';
			this.$refs.content.style.transition = elementTransition;

			requestAnimationFrame(() => {
				this.$refs.content.style.height = 0 + 'px';
			});
		});

		this.$refs.content.setAttribute('data-collapsed', 'true');
	}

	expand() {
		const contentHeight = this.$refs.content.scrollHeight;
		this.$refs.content.style.height = contentHeight + 'px';

		this.$refs.content.setAttribute('data-collapsed', 'false');
	}

	template() {
		return html`
			<div part="title-wrapper" ref="header" data-toggle>
				<slot name="header"></slot>
				${this.iconsTemplate()}
			</div>
			<div part="content-wrapper" class="content-wrapper" ref="content">
				<slot name="content"></slot>
			</div>
		`;
	}

	iconsTemplate() {
		return html`
			<!--    		https://www.compart.com/de/unicode/U+2227-->
			<div part="open-icon" class="open-icon">&vee;</div>
			<div part="close-icon" class="close-icon">&wedge;</div>
		`;
	}
}

export function define() {
	defineElement('accordion-element', AccordionElement);
}

export { html, defineElement, Events }
