import { StyledElement, defineElement } from '@webtides/element-js';
import style from './sticky-element.style.js';

/**
 * Sticky positioning helper. Toggles `is-sticky`, `is-up` and `is-down` classes on the
 * host element based on the page's scroll position and direction so consumers can drive
 * styling from CSS. Publishes the host's height as the `--sticky-height` custom property.
 *
 * @element el-sticky-element
 *
 * @slot - Default slot for the sticky content (e.g. a `<nav>`).
 *
 * @cssproperty --sticky-height - Auto-set to the host's `clientHeight`. Maintained via a
 *   `ResizeObserver` and useful for transform calculations or layout offsets.
 *
 * @property {boolean} forceDown - When `true`, the element always shows the `is-down` state
 *   regardless of scroll direction. Useful for navigation that should remain visible.
 */
export default class StickyElement extends StyledElement {
    /** @private */
    height = 0;
    /** @private */
    lastScrollTop = 0;
    /** @private */
    resizeObserver = undefined;

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
        this.calcCSSProperties();
        try {
            this.resizeObserver = new ResizeObserver(() => {
                this.calcCSSProperties();
            });
            this.resizeObserver.observe(this);
        } catch (e) {}
    }

    disconnected() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
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

    /** @private */
    calcCSSProperties() {
        this.style.setProperty('--sticky-height', this.clientHeight + 'px');
    }

    /** @private */
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
    defineElement('el-sticky-element', StickyElement);
}
