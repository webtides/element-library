import { StyledElement, defineElement } from '@webtides/element-js';
import style from './sticky-element.css';

export default class StickyElement extends StyledElement {
	height = 0;
	lastScrollTop = 0;

	constructor() {
		super({ styles: [style] });
	}

	properties() {
		return {
			forceDown: false,
		};
	}

	connected() {
		this.height = this.offsetHeight;
		this.requestUpdate().then(() => {
			this.calcCSSProperties();
		});
	}

	events() {
		return {
			document: {
				scroll: () => this.hasScrolled(window.scrollY),
			},
			window: {
				load: () => {
					//wait for window to be loaded - otherwise width won't respect the scrollbar
					this.calcCSSProperties();
				},
				resize: () => {
					this.calcCSSProperties();
				},
			},
		};
	}

	calcCSSProperties() {
		this.style.setProperty('--sticky-height', this.clientHeight + 'px');
	}

	hasScrolled(scrollY) {
		if (scrollY > this.height && scrollY > 0) {
			this.classList.add('is-sticky');
		} else {
			this.classList.remove('is-sticky');
		}

		if (scrollY > this.lastScrollTop && scrollY > this.height) {
			// Scroll Down
			this.classList.remove('is-down');
			this.classList.add('is-up');
		} else {
			// Scroll Up
			if (scrollY < this.lastScrollTop) {
				this.classList.remove('is-up');
				this.classList.add('is-down');
			}
		}

		this.lastScrollTop = scrollY;
	}
}

export function define() {
	defineElement('sticky-element', StickyElement);
}

