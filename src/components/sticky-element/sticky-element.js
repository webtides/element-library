import { StyledElement, defineElement } from '@webtides/element-js';
import style from './sticky-element.style.js';

/**
 * Sticky positioning helper. Toggles `sticky`, `up` and `down` custom states on the host
 * element based on the page's scroll position and direction so consumers can drive styling
 * from CSS (e.g. `el-sticky-element:state(sticky):state(up) { … }`). Publishes the host's
 * height as the `--sticky-height` custom property.
 *
 * @element el-sticky-element
 *
 * @slot - Default slot for the sticky content (e.g. a `<nav>`).
 *
 * @cssstate sticky - Set when the element has scrolled past its initial position.
 * @cssstate up - Set while the page is scrolling up past the threshold.
 * @cssstate down - Set while the page is scrolling down past the threshold.
 *
 * @cssproperty --sticky-height - Auto-set to the host's `clientHeight`. Maintained via a
 *   `ResizeObserver` and useful for transform calculations or layout offsets.
 *
 * @property {boolean} forceDown - When `true`, the element always shows the `down` state
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
            this._internals.states.add('sticky');
        } else {
            this._internals.states.delete('sticky');
        }

        if (scrollY > this.lastScrollTop && scrollY > this.height) {
            // Scroll Down
            this._internals.states.delete('down');
            this._internals.states.add('up');
        } else {
            // Scroll Up
            if (scrollY < this.lastScrollTop) {
                this._internals.states.delete('up');
                this._internals.states.add('down');
            }
        }

        this.lastScrollTop = scrollY;
    }
}

export function define() {
    defineElement('el-sticky-element', StickyElement);
}
