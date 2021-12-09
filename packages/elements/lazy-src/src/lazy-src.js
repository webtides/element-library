import { BaseElement, defineElement } from '@webtides/element-js';
import lozad from 'lozad';
import Events from './lazy-src.events';

export default class LazySrc extends BaseElement {
	#observer = null;

	constructor() {
		super({
			propertyOptions: {
				loaded: {
					reflect: true,
				},
			},
		});
	}

	properties() {
		return {
			rootMargin: '0px',
			threshold: 0.01,
			loaded: false,
			imgClass: '',
			imgAlt: '',
		};
	}

	connected() {
		this.#observer = lozad(this.firstElementChild, {
			rootMargin: this.rootMargin,
			threshold: this.threshold,
			loaded: this.afterIntersection.bind(this),
		});

		this.#observer.observe();
	}

	get api() {
		return this.#observer;
	}

	afterIntersection(target) {
		this.dispatch(Events.LOAD, this, true);
		this.loaded = true;

		const img = target.querySelector('img');
		if (img) {
			//pass classes to generated img element
			if (this.imgClass !== '') {
				img.setAttribute('class', this.imgClass);
			}
			if (this.imgAlt !== '') {
				img.setAttribute('alt', this.imgAlt);
			}
			img.onload = () => {
				this.dispatch(Events.IMG_LOAD, this, true);
			};
			img.onerror = () => {
				this.dispatch(Events.IMG_ERROR, this, true);
			};
		}
	}
}

export function define() {
	defineElement('lazy-src', LazySrc);
}

export { Events };
