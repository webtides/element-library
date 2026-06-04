// Vendored from @glidejs/glide@3.6.2 (src/components/html.js), MIT License.
// https://github.com/glidejs/glide
//
// Only change vs. upstream: the unused `exist` named import was dropped — the
// pristine file does `import { exist, toArray } from '../utils/dom'`, but
// `dom.js` exports no `exist`, which bundlers such as esbuild/Vite reject as a
// hard error ("No matching export for import 'exist'"). The carousel deep-imports
// this component, so we vendor the fixed copy here instead of patching consumers'
// node_modules at install time. Relative util imports are re-pointed to the
// published package paths; the rest is upstream verbatim.
import { warn } from '@glidejs/glide/src/utils/log';
import { toArray } from '@glidejs/glide/src/utils/dom';
import { define } from '@glidejs/glide/src/utils/object';
import { isString } from '@glidejs/glide/src/utils/unit';

const TRACK_SELECTOR = '[data-glide-el="track"]';

export default function (Glide, Components, Events) {
    const Html = {
        /**
         * Setup slider HTML nodes.
         *
         * @param {Glide} glide
         */
        mount() {
            this.root = Glide.selector;
            this.track = this.root.querySelector(TRACK_SELECTOR);
            this.collectSlides();
        },

        /**
         * Collect slides
         */
        collectSlides() {
            this.slides = toArray(this.wrapper.children).filter((slide) => {
                return !slide.classList.contains(Glide.settings.classes.slide.clone);
            });
        },
    };

    define(Html, 'root', {
        /**
         * Gets node of the glide main element.
         *
         * @return {Object}
         */
        get() {
            return Html._r;
        },

        /**
         * Sets node of the glide main element.
         *
         * @return {Object}
         */
        set(r) {
            if (isString(r)) {
                r = document.querySelector(r);
            }

            if (r !== null) {
                Html._r = r;
            } else {
                warn('Root element must be a existing Html node');
            }
        },
    });

    define(Html, 'track', {
        /**
         * Gets node of the glide track with slides.
         *
         * @return {Object}
         */
        get() {
            return Html._t;
        },

        /**
         * Sets node of the glide track with slides.
         *
         * @return {Object}
         */
        set(t) {
            Html._t = t;
        },
    });

    define(Html, 'wrapper', {
        /**
         * Gets node of the slides wrapper.
         *
         * @return {Object}
         */
        get() {
            return Html.track.children[0];
        },
    });

    /**
     * Add/remove/reorder dynamic slides
     */
    Events.on('update', () => {
        Html.collectSlides();
    });

    return Html;
}
