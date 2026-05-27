import { TemplateElement, html, defineElement } from '@webtides/element-js';
import Glide from '@glidejs/glide';
import style from './carousel-element.style.js';
import CarouselElementEvents from './carousel-element.events.js';

import ShadowHtml from './glide/components/ShadowHtml.js';
import ShadowAnchors from './glide/components/ShadowAnchors.js';
import ShadowGaps from './glide/components/ShadowGaps.js';
import ShadowClones from './glide/components/ShadowClones.js';

const DEFAULT_OPTIONS = {
    type: 'carousel',
    perView: 1,
    startAt: 0,
    keyboard: false,
};

/**
 * Carousel/slider component backed by Glide.js. Direct children of the host element are
 * treated as slides; the component renders Glide's controls (navigation arrows and bullet
 * pager) inside the shadow DOM around them.
 *
 * @element el-carousel-element
 *
 * @fires {CustomEvent<number>} CarouselRun - Fired on every Glide `run` (slide change).
 *   `detail` is the new active slide index.
 *
 * @slot - Default slot. Direct children become slides (unless they have a `slot`
 *   attribute or are Glide clones).
 * @slot arrow-left - Content of the "previous" navigation button.
 * @slot arrow-right - Content of the "next" navigation button.
 *
 * @csspart track - The Glide track wrapper.
 * @csspart slides - The slides container.
 * @csspart arrows - The navigation arrows wrapper.
 * @csspart arrow - Applied to both arrow buttons.
 * @csspart arrow-left - Applied to the previous-slide button (in addition to `arrow`).
 * @csspart arrow-right - Applied to the next-slide button (in addition to `arrow`).
 * @csspart dots - The bullet pager wrapper.
 * @csspart dot - Applied to each bullet.
 * @csspart selected-dot - Added to the bullet representing the active slide.
 *
 * @property {object} options - Options forwarded to the Glide constructor. Merged on top of
 *   the component's defaults (`type: 'carousel'`, `perView: 1`, `startAt: 0`,
 *   `keyboard: false`).
 * @property {boolean} disabled - When `true`, Glide is not mounted and slides render as a
 *   plain list (useful for SSR or feature-flagging the carousel off).
 * @property {string} slidePrefix - Prefix used when generating per-slide identifiers.
 * @property {boolean} bullets - Whether to render the bullet pager.
 * @property {boolean} arrows - Whether to render the previous/next navigation arrows.
 */
export default class CarouselElement extends TemplateElement {
    #glide = null;
    #uniqueChildren = [];

    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            deferUpdate: true,
            autoUpdate: false,
            mutationObserverOptions: { childList: false },
        });
    }

    /**
     * Returns the underlying Glide instance for external navigation/configuration. Falls
     * back to a no-op `{ go() }` stub while Glide is not mounted (e.g. when `disabled`).
     */
    get api() {
        return (
            this.#glide || {
                go: () => {},
            }
        );
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

    /** @private */
    getUniqueChildren() {
        return Array.from(this.children).filter(
            (item) => !item.classList.contains('glide__slide--clone') && !item.hasAttribute('slot'),
        );
    }

    /** @private */
    mountGlide() {
        if (this.disabled) {
            return;
        }
        this.#glide = new Glide(this.$refs.glide, { ...DEFAULT_OPTIONS, ...this.options }).mount({
            Html: ShadowHtml,
            Clones: ShadowClones,
            Gaps: ShadowGaps,
            Anchors: ShadowAnchors,
        });
        this.#glide.on('run', () => {
            this.dispatch(CarouselElementEvents.CAROUSEL_RUN, this.#glide.index);
            this.updateBulletClasses();
        });
        this.updateBulletClasses();
    }

    /** @private */
    destroyGlide() {
        if (this.#glide) {
            this.#glide.destroy();
            this.#glide = null;
        }
    }

    /**
     * Advance to the next slide.
     * @returns {void}
     */
    next() {
        this.api.go('>');
    }

    /**
     * Move to the previous slide.
     * @returns {void}
     */
    prev() {
        this.api.go('<');
    }

    /** @private */
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

    /** @private */
    renderBullets() {
        let bullets = [];
        for (let i = 0; i < this.#uniqueChildren.length; i++) {
            bullets.push(html` <div part="dot" class="glide__bullet" data-glide-dir="=${i}"></div> `);
        }
        return bullets;
    }

    /** @private */
    renderSlides() {
        let slides = [];
        for (let i = 0; i < this.#uniqueChildren.length; i++) {
            slides.push(html` ${this.#uniqueChildren[i]} `);
        }
        return slides;
    }

    template() {
        if (this.disabled) {
            return this._options.shadowRender ? html` <slot></slot> ` : this.renderSlides();
        }
        return html`
            <div class="glide" ref="glide">
                <div class="glide__track" data-glide-el="track" part="track">
                    <div class="glide__slides" part="slides">
                        ${this._options.shadowRender ? html` <slot></slot> ` : this.renderSlides()}
                    </div>
                </div>
                ${this.arrows
                    ? html`
                          <div part="arrows" class="glide__arrows" data-glide-el="controls">
                              <button
                                  part="arrow arrow-left"
                                  class="glide__arrow glide__arrow--left"
                                  data-glide-dir="<"
                              >
                                  <slot name="arrow-left"></slot>
                              </button>
                              <button
                                  part="arrow arrow-right"
                                  class="glide__arrow glide__arrow--right"
                                  data-glide-dir=">"
                              >
                                  <slot name="arrow-right"></slot>
                              </button>
                          </div>
                      `
                    : ''}
                ${this.bullets
                    ? html`
                          <div part="dots" class="glide__bullets" data-glide-el="controls[nav]">
                              ${this.renderBullets()}
                          </div>
                      `
                    : ''}
            </div>
        `;
    }
}

export function define() {
    defineElement('el-carousel-element', CarouselElement);
}

export { html, defineElement, CarouselElementEvents };
