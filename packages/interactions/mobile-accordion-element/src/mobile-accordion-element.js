import { html, defineElement } from '@webtides/element-js';
import BaseAccordionElement from '@webtides/accordion-element';
import style from './mobile-accordion-element.css';

export default class MobileAccordionElement extends BaseAccordionElement {
	renderMobileTemplate = true;

	constructor() {
        super({ styles: [style] });
    }

	properties() {
		return {
			open: false,
			maxWidth: 1023,
		};
	}

	get mediaQuery() {
		return `(max-width: ${this.maxWidth}px)`;
	}

	connected() {
		const mediaQueryList = window.matchMedia(this.mediaQuery);
		this.renderMobileTemplate = mediaQueryList.matches;

		mediaQueryList.addEventListener('change', event => {
			this.renderMobileTemplate = mediaQueryList.matches;
			this.requestUpdate().then(() => {
				this.evaluateState();
			});
		});

		this.requestUpdate().then(() => {
			this.evaluateState();
		});
	}

	evaluateState() {
		if (this.renderMobileTemplate) {
			this.open === true ? this.expand() : this.collapse();
		}
	}

	template() {
		return this.renderMobileTemplate ? this.mobileTemplate() : this.desktopTemplate();
	}

	mobileTemplate() {
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

	desktopTemplate() {
		return html`
            <slot name="header"></slot>
            <slot name="content"></slot>
        `;
	}
}

export function define() {
	defineElement('mobile-accordion-element', MobileAccordionElement);
}

