import GlideHTMLComponent from './glide-html.js';
import { define } from '@glidejs/glide/src/utils/object';

const TRACK_SELECTOR = '[data-glide-el="track"]';

export default function (Glide, Components, Events) {
    // Glide passes (glide, components, events) to every component factory; html.js needs
    // Events to register its `update` handler, so forward it like the sibling Shadow* wrappers.
    const glideHtml = GlideHTMLComponent(Glide, Components, Events);

    define(glideHtml, 'host', {
        /**
         * Exposes light DOM Host or default wrapper
         *
         * @return {Object}
         */
        get() {
            return glideHtml.root.getRootNode().host ? glideHtml.root.getRootNode().host : glideHtml.wrapper;
        },
    });

    define(glideHtml, 'rendered', {
        /**
         * The slides and their clones in the order they render: the wrapper in the shadow root holds
         * the clones around the slot, the slides of the page come in at the slot.
         *
         * @return {Element[]}
         */
        get() {
            return Array.from(glideHtml.wrapper.children).flatMap((child) =>
                child.localName === 'slot' ? glideHtml.slides : [child],
            );
        },
    });

    glideHtml.mount = function () {
        this.root = Glide.selector;
        this.track = this.root.querySelector(TRACK_SELECTOR);
        this.collectSlides();
    };

    /**
     * The slides are the children of the host, without what the page put into a named slot (the
     * content of the arrows). The wrapper, where Glide looks for them, is in the shadow root.
     */
    glideHtml.collectSlides = function () {
        this.slides = Array.from(this.host.children).filter((slide) => !slide.hasAttribute('slot'));
    };

    return glideHtml;
}
