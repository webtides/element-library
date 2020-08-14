import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { repeat } from 'lit-html/directives/repeat';
import style from './slider-element.css';

export default class SliderElement extends TemplateElement {
	scrollTimer = null;
	itemsCount = 0;

    constructor() {
        super({ shadowRender: true, deferRender: true, adoptGlobalStyles:false, styles: [style] });
    }

	properties() {
		return {
			itemSelector: '.item',
			itemsToShow: 1,
			itemsToScroll: 1,
			rewind: false,
			selectedIndex: 0,
		};
	}

    connected() {
		this.itemsCount = this.querySelectorAll(this.itemSelector).length || 0;
		this.requestUpdate();
    }

    watch() {
        return {
			selectedIndex: (index) => {
				this.scrollToIndex(index);
			},
		};
    }

    events() {
		return {
			'.scroller': {
				'scroll': () => {
					clearTimeout(this.scrollTimer);
					// wait for scroll end
					this.scrollTimer = setTimeout(() => {
						let index = Math.round((this.$refs.scroller.scrollLeft / this.$refs.scroller.scrollWidth) * this.itemsCount);
						this.selectedIndex = index;
					}, 100);
				},
			},
			'.dot': {
				'click': (e) => {
					const indicator = e.target.closest('.dot');
					this.selectedIndex = Array.from(indicator.parentNode.children).indexOf(indicator);
				}
			},
			'.arrow-left': {
				'click': () => {
					const newIndex = this.selectedIndex - this.itemsToScroll;
					const lastIndex = this.itemsCount - 1;
					this.selectedIndex = this.rewind && newIndex < 0 ? lastIndex : Math.max(newIndex, 0);
				},
			},
			'.arrow-right': {
				'click': () => {
					const newIndex = this.selectedIndex + this.itemsToScroll;
					const lastIndex = this.itemsCount - 1;
					this.selectedIndex = this.rewind && newIndex > lastIndex ? 0 : Math.min(lastIndex, newIndex);
				},
			},
		}
	}

	scrollToIndex() {
		const scrollLeft = Math.floor(this.$refs.scroller.scrollWidth * (this.selectedIndex / this.itemsCount));
		this.$refs.scroller.scrollTo({
			'left': scrollLeft,
			behavior: 'smooth'
		})
	}

	template() {
		return html`
			<ol ref="scroller" part="scroller" class="scroller" style="--per-view: ${this.itemsToShow}">
				<slot></slot>
			</ol>
			<div part="controls dots">
				${this.dotsTemplate()}
			</div>
			<div part="controls arrows">
				${this.arrowsTemplate()}
			</div>
		`;
	}

	dotsTemplate() {
    	return html`
    		${repeat(Array.from(Array(this.itemsCount).keys()), (i) => i, (i, index) => html`
				<button part="dot ${this.selectedIndex === index ? 'selected-dot' : ''}" class="dot" aria-pressed="${this.selectedIndex === index ? 'true' : 'false'}"></button>
			`)}
    	`;
	}

	arrowsTemplate() {
    	return html`
    		<button part="arrow arrow-left" class="arrow-left" ?disabled=${!this.rewind && this.selectedIndex === 0}><slot name="arrow-left">&lang;</slot></button>
			<button part="arrow arrow-right" class="arrow-right" ?disabled=${!this.rewind && this.selectedIndex >= (this.itemsCount - 1)}><slot name="arrow-right">&rang;</slot></button>
    	`;
	}
}

export function define() {
	defineElement('slider-element', SliderElement);
}

export { html, defineElement }
