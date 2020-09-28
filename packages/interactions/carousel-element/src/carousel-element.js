import {TemplateElement, html, defineElement} from '@webtides/element-js';
import Glide from '@glidejs/glide';
import style from './carousel-element.css'
import CarouselElementEvents from './CarouselElementEvents';

import ShadowHtml from './glide/components/ShadowHtml'
import ShadowAnchors from './glide/components/ShadowAnchors'
import ShadowGaps from './glide/components/ShadowGaps'
import ShadowClones from './glide/components/ShadowClones'

const DEFAULT_OPTIONS = {
	type: 'carousel',
	perView: 1,
	startAt: 0,
	keyboard: false,
}

export default class CarouselElement extends TemplateElement {
	#glide = null;
	#uniqueChildren = [];

	constructor() {
		super({
			styles: [style],
			shadowRender: true,
			deferUpdate: true,
			autoUpdate: false,
			mutationObserverOptions: {childList: false}
		});
	}

	get api() {
		// returns interface for external navigation or configuration
		return this.#glide || {
			go: () => {
			}
		};
	}

	properties() {
		return {
			options: {},
			disabled: false,
			slidePrefix: 'slide',
			bullets: true,
			arrows: true,
		};
	}

	connected() {
		this.requestUpdate();
	}

	beforeUpdate() {
		this.destroyGlide();
		//this assumes that childrens are always added as direct children
		this.#uniqueChildren = this.getUniqueChildren();
	}

	afterUpdate() {
		this.mountGlide();
	}

	disconnected() {
		this.destroyGlide();
	}

	getUniqueChildren() {
		return Array.from(this.children).filter(item => !item.classList.contains('glide__slide--clone') && !item.hasAttribute('slot'));
	}

	mountGlide() {
		if(this.disabled){
			return;
		}
		this.#glide = new Glide(this.$refs.glide, {...DEFAULT_OPTIONS, ...this.options}).mount({
			'Html': ShadowHtml,
			'Clones': ShadowClones,
			'Gaps': ShadowGaps,
			'Anchors': ShadowAnchors
		});
		this.#glide.on('run', () => {
			this.dispatch(CarouselElementEvents.CAROUSEL_RUN, this.#glide.index);
			this.updateBulletClasses();
		});
		this.updateBulletClasses();
	}

	destroyGlide() {
		if (this.#glide) {
			this.#glide.destroy();
			this.#glide = null;
		}
	}

	next() {
		this.api.go('>');
	}

	prev() {
		this.api.go('<');
	}


	updateBulletClasses() {
		const bullets = Array.from(this.getRoot().querySelectorAll('.glide__bullet'));
		bullets.forEach((bullet, index) => {
			if (index === this.#glide.index) {
				bullet.part.add('selected-dot');
			} else {
				bullet.part.remove('selected-dot');
			}
		});
	}

	renderBullets() {
		let bullets = [];
		for (let i = 0; i < this.#uniqueChildren.length; i++) {
			bullets.push(
				html`
                    <div part="dot" class="glide__bullet" data-glide-dir="=${i}"></div>
                `,
			);
		}
		return bullets;
	}

	renderSlides() {
		let slides = [];
		for (let i = 0; i < this.#uniqueChildren.length; i++) {
			slides.push(
				html`
                    ${this.#uniqueChildren[i]}
                `,
			);
		}
		return slides;
	}


	template() {
		if(this.disabled) {
			return this._options.shadowRender ? html`<slot></slot>` : this.renderSlides();
		}
		return html`
            <div class="glide" ref="glide">
                <div class="glide__track" data-glide-el="track">
                	<div class="glide__slides">
						${this._options.shadowRender ? html`<slot></slot>` : this.renderSlides()}
					</div>
                </div>
                ${this.arrows ? html`
						 <div part="arrows" class="glide__arrows" data-glide-el="controls">
                              	<button part="arrow arrow-left"  class="glide__arrow glide__arrow--left" data-glide-dir="<">
                                	<slot name="arrow-left"></slot>
								</button>
								<button part="arrow arrow-right"  class="glide__arrow glide__arrow--right" data-glide-dir=">">
                                	<slot name="arrow-right"></slot>
								</button>
                          </div>
                      `
			: ''}
                ${this.bullets ? html`
					  <div part="dots"  class="glide__bullets" data-glide-el="controls[nav]">
						  ${this.renderBullets()}
					  </div>
                      `
			: ''}
            </div>
        `;
	}
}


export function define() {
	defineElement('carousel-element', CarouselElement);
}

export {html, defineElement, CarouselElementEvents}
