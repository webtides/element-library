import { defineElement, html, TemplateElement } from '@webtides/element-js';
import { repeat } from 'lit-html/directives/repeat';
import style from './slider-element.css';

export default class SliderElement extends TemplateElement {
	scrollTimer = null;
	indicators = 0;

    constructor() {
        super({ shadowRender: true, deferRender: true, styles: [style] });
    }

	properties() {
		return {
			itemSelector: '.item',
			selectedIndex: 0,
		};
	}

    connected() {
		const items = this.querySelectorAll(this.itemSelector);
		this.indicators = items.length || 0;
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
						let index = Math.round((this.$refs.scroller.scrollLeft / this.$refs.scroller.scrollWidth) * this.indicators);
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
					this.selectedIndex = Math.max((this.selectedIndex - 1), 0);
				},
			},
			'.arrow-right': {
				'click': () => {
					this.selectedIndex = Math.min((this.indicators - 1), (this.selectedIndex + 1));
				},
			},
		}
	}

	scrollToIndex() {
		const scrollLeft = Math.floor(this.$refs.scroller.scrollWidth * (this.selectedIndex / this.indicators));
		this.$refs.scroller.scrollTo({
			'left': scrollLeft,
			behavior: 'smooth'
		})
	}

	template() {
		return html`
			<ol ref="scroller" class="scroll">
				<slot></slot>
			</ol>
			<div class="controls">
				<ul class="indicators">
					${repeat(Array.from(Array(3).keys()), (i) => i, (i, index) => html`
						<li class="indicator">
							<button class="indicator-button" aria-pressed="${this.selectedIndex === index ? 'true' : 'false'}"></button>
						</li>
					`)}
				</ul>
				<div class="arrows">
					<div class="arrow arrow-left"><button ?disabled=${this.selectedIndex === 0}><</button></div>
					<div class="arrow arrow-right"><button ?disabled=${this.selectedIndex >= (this.indicators - 1)}>></button></div>
				</div>
			</div>
		`;
	}
}

export function define() {
	defineElement('slider-element', SliderElement);
}

