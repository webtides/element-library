import { TemplateElement, defineElement, html } from '@webtides/element-js';
import SliderElementEvents from './SliderElementEvents';
import style from './slider-element.css';

export default class SliderElement extends TemplateElement {
	itemsCount = 0;
	#scrollTimer = null;
	items = null;
	#scrollToIndex = false;

	constructor(options) {
		super({ shadowRender: true, deferUpdate: true, adoptGlobalStyles: false, styles: [style], ...options });
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
			setIndexAfterResize: true,
			manualScrollEndDelay: 200,
		};
	}

	get canSlide() {
		if (!this.$refs.scroller) {
			return false;
		}
		return this.$refs.scroller.scrollWidth > this.$refs.scroller.offsetWidth;
	}

	get canSlideLeft() {
		return this.selectedIndex > 0;
	}

	get canSlideRight() {
		return this.selectedIndex < this.itemsCount;
	}

	connected() {
		this.indexItems();
		this.requestUpdate().then(() => {
			if (this.selectedIndex > 0) {
				//scroll to initial slide if set
				this.scrollToIndex(false);
			}
			if (this.setIndexAfterResize) {
				this.addResizeListener();
			}
		});
	}

	indexItems() {
		this.items = Array.from(this.querySelectorAll(this.itemSelector));
		this.itemsCount = this.items.length > 1 ? this.items.length - 1 : 0;
		this.style.setProperty('--item-width', `${100 / this.itemsToShow}%`);
	}

	events() {
		return {
			'.scroller': {
				scroll: () => this.startScrollEndTimer(),
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
		this.selectedIndex = this.rewind && newIndex > this.itemsCount ? 0 : Math.min(this.itemsCount, newIndex);
		if (this.autoSelect && this.canSlide) {
			//check if element is already visible
			const target = this.items[this.selectedIndex];
			const parent = this.$refs.scroller;
			const { marginLeft, marginRight } = getComputedStyle(target);
			const targetWidth = target.offsetWidth + parseInt(marginLeft) + parseInt(marginRight);
			if (target.offsetLeft + targetWidth < parent.scrollLeft + parent.offsetWidth) {
				// means is in bounds
				this.next();
				return;
			}
		}
		this.scrollToIndex();
	}

	previous() {
		const newIndex = this.selectedIndex - this.itemsToScroll;
		this.selectedIndex = this.rewind && newIndex < 0 ? this.itemsCount : Math.max(newIndex, 0);

		if (this.autoSelect && this.canSlide) {
			//check if element is already visible
			const target = this.items[this.selectedIndex];
			const { marginLeft } = getComputedStyle(target);
			const parent = this.$refs.scroller;
			if (target.offsetLeft - parseInt(marginLeft) > parent.scrollLeft) {
				// means is still in viewport
				this.previous();
				return;
			}
		}

		this.scrollToIndex();
	}

	goTo(index, smooth = true) {
		if (index !== this.selectedIndex) {
			this.selectedIndex = index;
			this.scrollToIndex(smooth);
		}
	}

	startScrollEndTimer() {
		clearTimeout(this.#scrollTimer);
		this.#scrollTimer = setTimeout(() => this.onManualScrollEnd(), this.manualScrollEndDelay);
	}

	scrollToIndex(smooth = true) {
		if (!this.$refs.scroller) {
			//external call before render
			return;
		}
		if (smooth) {
			this.#scrollToIndex = true;
			// start timer just in case the slider is not scrolling at all
			this.startScrollEndTimer();
		}
		const target = this.items[this.selectedIndex];
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
			behavior: smooth ? 'smooth' : 'auto',
		});
	}

	onManualScrollEnd() {
		if (!this.#scrollToIndex) {
			const scroller = this.$refs.scroller;
			const scrollLeft = scroller.scrollLeft;
			const scrollPercentage = scrollLeft / (scroller.scrollWidth - scroller.offsetWidth);

			if (scrollPercentage === 0) {
				this.selectedIndex = 0;
			} else if (scrollPercentage === 1) {
				this.selectedIndex = this.itemsCount;
			} else {
				//aprox or guess selectedIndex to fix UI state
				this.selectedIndex = Math.ceil(this.itemsCount * scrollPercentage);
			}
		}
		this.#scrollToIndex = false;
	}

	addResizeListener() {
		try {
			const resizeObserver = new ResizeObserver(() => {
				/*
				 * https://web.dev/snap-after-layout/
				 * this codes attempts to fix scrollsnap Position after layout changes
				 * */
				this.#scrollToIndex = true;
				this.dispatch(SliderElementEvents.SLIDER_RESIZE, this.selectedIndex);
				this.scrollToIndex(false);
				this.startScrollEndTimer();
			});
			resizeObserver.observe(this);
		} catch (e) {
			/* no ResizeOberserver no fix */
		}
	}

	template() {
		return html`
			<div ref="scroller" part="scroller" class="scroller">
				<slot></slot>
			</div>
			${this.dots ? html` <div part="controls dots">${this.dotsTemplate()}</div> ` : null}
			${this.arrows ? html` <div part="controls arrows">${this.arrowsTemplate()}</div> ` : null}
		`;
	}

	dotsTemplate() {
		return this.items.map((item, index) => {
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
		const disabledLeft = !this.rewind && !this.canSlideLeft;
		const disabledRight = !this.rewind && !this.canSlideRight;

		return html`
			<button
				part="arrow arrow-left ${disabledLeft ? 'arrow-disabled' : ''}"
				class="arrow-left"
				?disabled=${disabledLeft}
			>
				<slot name="arrow-left">&lang;</slot>
			</button>
			<button
				part="arrow arrow-right ${disabledRight ? 'arrow-disabled' : ''}"
				class="arrow-right"
				?disabled=${disabledRight}
			>
				<slot name="arrow-right">&rang;</slot>
			</button>
		`;
	}
}

export function define() {
	defineElement('slider-element', SliderElement);
}

export { html, defineElement, SliderElementEvents };
