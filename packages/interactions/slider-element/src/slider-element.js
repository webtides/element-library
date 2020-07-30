import { defineElement, html, TemplateElement } from '@webtides/element-js';
import { repeat } from 'lit-html/directives/repeat';
import style from './slider-element.css';

export default class SliderElement extends TemplateElement {
	scrollTimer = null;
	itemsCount = 0;

    constructor() {
        super({ shadowRender: true, deferRender: true, styles: [style] });
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
			'.scroll': {
				'scroll': () => {
					clearTimeout(this.scrollTimer);
					// wait for scroll end
					this.scrollTimer = setTimeout(() => {
						let index = Math.round((this.$refs.scroller.scrollLeft / this.$refs.scroller.scrollWidth) * this.itemsCount);
						this.selectedIndex = index;
					}, 100);
				},
			},
			'.indicator': {
				'click': (e) => {
					const indicator = e.target.closest('.indicator');
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
			<ol ref="scroller" class="scroll" style="--per-view: ${this.itemsToShow}">
				<slot></slot>
			</ol>
			<div class="controls">
				<ul class="indicators">
					${repeat(Array.from(Array(this.itemsCount).keys()), (i) => i, (i, index) => html`
						<li class="indicator">
							<button class="indicator-button" aria-pressed="${this.selectedIndex === index ? 'true' : 'false'}"></button>
						</li>
					`)}
				</ul>
				<div class="arrows">
					<div class="arrow arrow-left"><button ?disabled=${!this.rewind && this.selectedIndex === 0}><</button></div>
					<div class="arrow arrow-right"><button ?disabled=${!this.rewind && this.selectedIndex >= (this.itemsCount - 1)}>></button></div>
				</div>
			</div>
		`;
	}
}

export function define() {
	defineElement('slider-element', SliderElement);
}

