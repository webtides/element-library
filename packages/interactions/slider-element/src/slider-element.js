import { TemplateElement, defineElement, html } from '@webtides/element-js';
import SliderElementEvents from './SliderElementEvents';
import style from './slider-element.css';

export default class SliderElement extends TemplateElement {
	#itemsCount = 0;
	#scrollTimer = null;
	#items = null;
	#scrollToIndex = false;

	constructor() {
		super({ shadowRender: true, deferUpdate: true, adoptGlobalStyles: false, styles: [style] });
	}

	properties() {
		return {
			itemSelector: '.item',
			itemsToShow: 1,
			itemsToScroll: 1,
			rewind: false,
			selectedIndex: 0,
			autoSelect: false,
			dots: true,
			arrows: true,
		};
	}

	get canSlideLeft() {
		return this.selectedIndex > 0;
	}

	get canSlideRight() {
		return this.selectedIndex < this.#itemsCount;
	}

	connected() {
		this.#items = Array.from(this.querySelectorAll(this.itemSelector));
		this.#itemsCount = this.#items.length > 1 ? this.#items.length - 1 : 0;

		this.style.setProperty('--item-width', `${100 / this.itemsToShow}%`);
		this.requestUpdate();
	}

	events() {
		return {
			'.scroller': {
				scroll: () => {
					clearTimeout(this.#scrollTimer);
					if (this.#scrollToIndex === true) {
						return;
					}
					this.#scrollTimer = setTimeout(() => this.onManualScrollEnd(), 100);
				},
			},
			'.dot': {
				click: (e) => {
					const indicator = e.target.closest('.dot');
					this.selectedIndex = Array.from(indicator.parentNode.children).indexOf(indicator);
					this.scrollToIndex();
				},
			},
			'.arrow-left': {
				click: () => this.previous(),
			},
			'.arrow-right': {
				click: () => this.next(),
			},
		};
	}

	watch() {
		return {
			selectedIndex: () => {
				this.dispatch(SliderElementEvents.SLIDER_RUN, this.selectedIndex);
			},
		};
	}

	next() {
		const newIndex = this.selectedIndex + this.itemsToScroll;
		this.selectedIndex = this.rewind && newIndex > this.#itemsCount ? 0 : Math.min(this.#itemsCount, newIndex);
		if (this.autoSelect) {
			//check if element is already visible
			const target = this.#items[this.selectedIndex];
			const parent = this.$refs.scroller;
			if (target.offsetLeft + target.offsetWidth <= parent.scrollLeft + parent.offsetWidth) {
				// means is in bounds
				this.next();
				return;
			}
		}
		this.scrollToIndex();
	}

	previous() {
		const newIndex = this.selectedIndex - this.itemsToScroll;
		this.selectedIndex = this.rewind && newIndex < 0 ? this.#itemsCount : Math.max(newIndex, 0);

		if (this.autoSelect) {
			//check if element is already visible
			const target = this.#items[this.selectedIndex];
			const parent = this.$refs.scroller;
			if (target.offsetLeft > parent.scrollLeft) {
				// means is still in viewport
				this.previous();
				return;
			}
		}

		this.scrollToIndex();
	}

	goTo(index) {
		if (index !== this.selectedIndex) {
			this.selectedIndex = index;
			this.scrollToIndex();
		}
	}

	scrollToIndex() {
		this.#scrollToIndex = true;
		const target = this.#items[this.selectedIndex];
		const parent = this.$refs.scroller;
		const parentWidth = parent.offsetWidth;

		let targetLeft = target.offsetLeft - (parentWidth - target.offsetWidth) / 2;

		const snapAlign = window.getComputedStyle(target).scrollSnapAlign;
		if (snapAlign === 'start') {
			targetLeft = target.offsetLeft;
		} else if (snapAlign === 'end') {
			targetLeft = target.offsetLeft - (parentWidth - target.offsetWidth);
		}

		this.$refs.scroller.scrollTo({
			left: targetLeft,
			behavior: 'smooth',
		});
	}

	onManualScrollEnd() {
		this.#scrollToIndex = false;
		const scroller = this.$refs.scroller;
		const scrollLeft = scroller.scrollLeft;
		const scrollPercentage = scrollLeft / (scroller.scrollWidth - scroller.offsetWidth);

		if (scrollPercentage === 0) {
			this.selectedIndex = 0;
		} else if (scrollPercentage === 1) {
			this.selectedIndex = this.#itemsCount;
		} else {
			//aprox or guess selectedIndex to fix UI state
			this.selectedIndex = Math.ceil(this.#itemsCount * scrollPercentage);
		}
	}

	template() {
		return html`
			<div ref="scroller" part="scroller" class="scroller">
				<slot></slot>
			</div>
			${this.dots
				? html`
						<div part="controls dots">${this.dotsTemplate()}</div>
				  `
				: ''}
			${this.arrows
				? html`
						<div part="controls arrows">${this.arrowsTemplate()}</div>
				  `
				: ''}
		`;
	}

	dotsTemplate() {
		return this.#items.map((item, index) => {
			return html`
				<button
					part="dot ${this.selectedIndex === index ? 'selected-dot' : ''}"
					class="dot"
					aria-pressed="${this.selectedIndex === index ? 'true' : 'false'}"
				></button>
			`;
		});
	}

	arrowsTemplate() {
		return html`
			<button part="arrow arrow-left" class="arrow-left" ?disabled=${!this.rewind && !this.canSlideLeft}>
				<slot name="arrow-left">&lang;</slot>
			</button>
			<button part="arrow arrow-right" class="arrow-right" ?disabled=${!this.rewind && !this.canSlideRight}>
				<slot name="arrow-right">&rang;</slot>
			</button>
		`;
	}
}

export function define() {
	defineElement('slider-element', SliderElement);
}

export { html, defineElement, SliderElementEvents };
