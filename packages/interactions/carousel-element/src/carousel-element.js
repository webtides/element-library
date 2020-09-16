import { TemplateElement, html, defineElement } from '@webtides/element-js';
import Glide from '@glidejs/glide';
import style from './carousel-element.css'
import CarouselElementEvents from './CarouselElementEvents';

import ShadowHtml from './glide/components/ShadowHtml'
import ShadowAnchors from './glide/components/ShadowAnchors'
import ShadowGaps from './glide/components/ShadowGaps'
import ShadowClones from './glide/components/ShadowClones'


/*
 * example:
 * <carousel-element>
 *    <img src="http://localhost:8080/author/dam/jcr:2fe596f2-1ad5-4cce-b32b-4e2ec458f994/photo-1536244881128-90b1d3d2549f.jpeg" alt="">
 *    <img src="https://images.unsplash.com/photo-1458372810370-daad23adb565?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2088&q=80" alt="">
 *    <img src="http://localhost:8080/author/dam/jcr:2fe596f2-1ad5-4cce-b32b-4e2ec458f994/photo-1536244881128-90b1d3d2549f.jpeg" alt="">
 * </carousel-element>
 */

export default class GlideElement extends TemplateElement {
	properties() {
		return {
			options: {
				type: 'carousel',
				perView: 1,
				startAt: 0,
				keyboard: false,
			},
			disabled: false,
			slidePrefix: 'slide',
			bullets: true,
			arrows: true,
		};
	}

	constructor() {
		super({ styles: [style], shadowRender: true, deferUpdate: true , mutationObserverOptions: {childList: false}});
		this._glide = null;
		this._children = [];
	}

	connected() {
		this._children = Array.from(this.children);
		this.requestUpdate();
	}
	afterUpdate() {
		this.destroyGlide();
		this.mountGlide();
	}
	disconnected() {
		this.destroyGlide();
	}

	mountGlide() {
		const el = this.getRoot().querySelector('.glide');
		this._glide = new Glide(el, this.options).mount({'Html': ShadowHtml, 'Clones': ShadowClones, 'Gaps': ShadowGaps, 'Anchors': ShadowAnchors});
		this._bullets = Array.from(this.getRoot().querySelectorAll('.glide__bullet'));
		this._glide.on('run', () => {
			this.dispatch(CarouselElementEvents.GLIDE_RUN, this._glide.index);
			this.setBulletClasses();
		});
		this.setBulletClasses();
	}

	setBulletClasses() {
		this._bullets.forEach((bullet, index) => {
			if (index === this._glide.index) {
				bullet.classList.add('glide-element-bullet-active');
			} else {
				bullet.classList.remove('glide-element-bullet-active');
			}
		});
	}

	renderBullets() {
		let bullets = [];
		for (let i = 0; i < this._children.length; i++) {
			bullets.push(
				html`
                    <div class="glide__bullet" data-glide-dir="=${i}"></div>
                `,
			);
		}
		return bullets;
	}

	renderSlides() {
		let slides = [];
		for (let i = 0; i < this._children.length; i++) {
			slides.push(
				html`
                    ${this._children[i]}
                `,
			);
		}
		return slides;
	}

	destroyGlide() {
		if (this._glide) {
			this._glide.destroy();
			this._glide = null;
		}
	}

	get api() {
		// returns interface for external navigation or configuration
		return this._glide || { go: () => {} };
	}

	next() {
		this.api.go('>');
	}

	prev() {
		this.api.go('<');
	}

	template() {
		return html`
            <div class="glide">
                <div class="glide__track" data-glide-el="track">
                	<div class="glide__slides">
						${this._options.shadowRender ? html`<slot></slot>` : this.renderSlides()}
					</div>
                </div>
                ${this.arrows
			? html`
                          <div class="glide__arrows" data-glide-el="controls">
                              <button class="glide__arrow glide__arrow--left" data-glide-dir="<"></button>
                              <button class="glide__arrow glide__arrow--right" data-glide-dir=">"></button>
                          </div>
                      `
			: ''}
                ${this.bullets ? html`
					  <div class="glide__bullets" data-glide-el="controls[nav]">
						  ${this.renderBullets()}
					  </div>
                      `
			: ''}
            </div>
        `;
	}
}



export function define() {
	defineElement('carousel-element', GlideElement);
}

export { html, defineElement }
