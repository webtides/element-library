import { StyledElement, defineElement } from '@webtides/element-js';
import { scrollContainer } from '../../utils/scroll.js';
import style from './scroll-to-top.style.js';

/**
 * Wraps any click-emitting child (`<a>`, `<button>`, …) and smoothly scrolls to the top when the
 * child is clicked: the window, or the element around it that scrolls, the content of an
 * `el-app-frame` for example.
 *
 * @element el-scroll-to-top
 *
 * @slot - Default slot. Any child that emits a `click` event will trigger the scroll.
 *
 * @property {number} duration - Duration of the easing animation in milliseconds. Ignored
 *   when what scrolls has `scroll-behavior: smooth`, the `html` element for the window (the
 *   browser drives the scroll in that case).
 * @property {boolean} preventDefault - When `true`, the captured click's default action is
 *   suppressed.
 */
export default class ScrollToTop extends StyledElement {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            duration: 1000,
            preventDefault: true,
        };
    }

    connected() {
        // TODO: find a more generic way of dealing with cloaking
        // maybe use a mixin for cloaking?!
        this.removeAttribute('cloak');
    }

    events() {
        return {
            this: {
                click: (e) => {
                    if (this.preventDefault) e.preventDefault();
                    this.scrollToTop();
                },
            },
        };
    }

    /**
     * Scroll to the top: the element around this one that scrolls, or the window.
     * @returns {void}
     */
    scrollToTop() {
        const container = scrollContainer(this);
        const target = container ?? window;
        const behavior = getComputedStyle(container ?? document.documentElement).getPropertyValue('scroll-behavior');

        if (behavior === 'smooth') {
            target.scrollTo(0, 0);
        } else {
            const duration = this.duration;
            const difference = container
                ? container.scrollTop
                : document.documentElement.scrollTop || document.body.scrollTop;
            const startTime = performance.now();

            // noinspection JSAnnotator
            function step(timeStamp) {
                let normalizedTime = (timeStamp - startTime) / duration;
                if (normalizedTime > 1) normalizedTime = 1;

                target.scrollTo(0, difference * Math.cos(normalizedTime * Math.PI));
                if (normalizedTime < 1) window.requestAnimationFrame(step);
            }
            window.requestAnimationFrame(step);
        }
    }
}

export function define() {
    defineElement('el-scroll-to-top', ScrollToTop);
}
