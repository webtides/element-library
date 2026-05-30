import { BaseElement, defineElement } from '@webtides/element-js';
import lozad from 'lozad';
import Events from './lazy-src.events.js';

/**
 * Lazy-loads child `<img>` / `<picture>` / `<iframe>` / `<video>` elements that use a
 * `data-src` attribute. Backed by lozad's `IntersectionObserver`; promotes `data-src` to
 * `src` once the child intersects the viewport.
 *
 * @element el-lazy-src
 *
 * @fires {CustomEvent<LazySrc>} LazySrcLoad - Fired once the child first intersects the
 *   viewport and lozad swaps in the real source. `detail` is the host element. Bubbles.
 * @fires {CustomEvent<LazySrc>} LazySrcImgLoad - Fired when an inner `<img>` finishes
 *   loading. `detail` is the host element. Bubbles.
 * @fires {CustomEvent<LazySrc>} LazySrcImgError - Fired when an inner `<img>` fails to
 *   load. `detail` is the host element. Bubbles.
 *
 * @property {string} rootMargin - `IntersectionObserver` `rootMargin` forwarded to lozad.
 * @property {number | number[]} threshold - `IntersectionObserver` `threshold` forwarded to
 *   lozad.
 * @cssstate loaded - Set once the child has been swapped in. Equivalent to the reflected
 *   `loaded` attribute; prefer `el-lazy-src:state(loaded) { … }` going forward.
 *
 * @property {boolean} loaded - `true` once the child has been swapped in. Reflected to the
 *   `loaded` attribute so consumers can target the loaded state from CSS.
 * @property {string} imgClass - Class to apply to the inner `<img>` once it is loaded.
 * @property {string} imgAlt - `alt` text to apply to the inner `<img>` once it is loaded.
 */
export default class LazySrc extends BaseElement {
    /** @private */
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

    /**
     * Returns the underlying lozad observer instance.
     */
    get api() {
        return this.#observer;
    }

    /** @private */
    afterIntersection(target) {
        this.dispatch(Events.LOAD, this);
        this.loaded = true;
        this._internals.states.add('loaded');

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
                this.dispatch(Events.IMG_LOAD, this);
            };
            img.onerror = () => {
                this.dispatch(Events.IMG_ERROR, this);
            };
        }
    }
}

export function define() {
    defineElement('el-lazy-src', LazySrc);
}

export { Events };
