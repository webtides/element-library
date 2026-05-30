import { TemplateElement, defineElement, html } from '@webtides/element-js';
import SliderEvents from './slider.events.js';
import style from './slider.style.js';

/**
 * CSS-scroll-snap based carousel. Direct children matched by `itemSelector` are arranged
 * horizontally and navigated via the rendered dot pager and arrow buttons, by setting
 * `selectedIndex`, or by calling `next()` / `previous()` / `goTo()`.
 *
 * @element el-slider
 *
 * @fires {CustomEvent<number>} SliderRun - Fired when `selectedIndex` changes.
 *   `detail` is the new index.
 * @fires {CustomEvent<number>} SliderResize - Fired after the host element resizes and
 *   the slider re-aligns to the current index. `detail` is the current index.
 *
 * @slot - Default slot. Place item nodes here; each must match `itemSelector`.
 * @slot arrow-left - Content of the "previous" navigation button (defaults to `⟨`).
 * @slot arrow-right - Content of the "next" navigation button (defaults to `⟩`).
 *
 * @csspart scroller - The horizontally scrolling track.
 * @csspart controls - Applied to both the dots wrapper and the arrows wrapper.
 * @csspart dots - The dot pager wrapper.
 * @csspart dot - Applied to each pager dot.
 * @csspart selected-dot - Added to the dot representing the active slide.
 * @csspart arrows - The arrow buttons wrapper.
 * @csspart arrow - Applied to both arrow buttons.
 * @csspart arrow-left - Applied to the previous button (in addition to `arrow`).
 * @csspart arrow-right - Applied to the next button (in addition to `arrow`).
 * @csspart arrow-disabled - Added to an arrow button when it cannot navigate further.
 *
 * @property {string} itemSelector - CSS selector used to find item nodes among the slotted
 *   children.
 * @property {number} itemsToShow - Number of items visible per slide step. Used to compute
 *   the per-item width.
 * @property {number} itemsToScroll - Number of items advanced by each `next()` / `previous()`
 *   call.
 * @property {boolean} rewind - When `true`, navigating past the last (or before the first)
 *   item wraps around.
 * @property {number} selectedIndex - Currently focused item index.
 * @property {boolean} autoSelect - When `true`, navigation skips items that are already fully
 *   visible.
 * @property {boolean} dots - Whether to render the dot pager.
 * @property {boolean} arrows - Whether to render the previous/next arrow buttons.
 * @property {boolean} setIndexAfterResize - When `true`, the slider re-aligns to
 *   `selectedIndex` after the host resizes.
 * @property {number} manualScrollEndDelay - Debounce window (ms) used to detect the end of a
 *   manual scroll.
 */
export default class Slider extends TemplateElement {
    /** @private */
    itemsCount = 0;
    /** @private */
    #scrollTimer = null;
    /** @private */
    items = null;
    /** @private */
    #scrollToIndex = false;

    constructor(options) {
        super({ shadowRender: true, deferUpdate: true, adoptGlobalStyles: false, styles: [style], ...options });
    }

    properties() {
        return {
            itemSelector: '.item',
            itemsToShow: 1,
            itemsToScroll: 1,
            rewind: false,
            selectedIndex: 0,
            autoSelect: false,
            dots: true,
            arrows: true,
            setIndexAfterResize: true,
            manualScrollEndDelay: 200,
        };
    }

    /**
     * `true` when the slider's content overflows its viewport (i.e. there is anything
     * to scroll through).
     */
    get canSlide() {
        if (!this.$refs.scroller) {
            return false;
        }
        return this.$refs.scroller.scrollWidth > this.$refs.scroller.offsetWidth;
    }

    /** `true` when `selectedIndex` can be decremented. */
    get canSlideLeft() {
        return this.selectedIndex > 0;
    }

    /** `true` when `selectedIndex` can be incremented. */
    get canSlideRight() {
        return this.selectedIndex < this.itemsCount;
    }

    connected() {
        this.indexItems();
        this.requestUpdate().then(() => {
            if (this.selectedIndex > 0) {
                //scroll to initial slide if set
                this.scrollToIndex(false);
            }
            if (this.setIndexAfterResize) {
                this.addResizeListener();
            }
        });
    }

    /** @private */
    indexItems() {
        this.items = Array.from(this.querySelectorAll(this.itemSelector));
        this.itemsCount = this.items.length > 1 ? this.items.length - 1 : 0;
        this.style.setProperty('--item-width', `${100 / this.itemsToShow}%`);
    }

    events() {
        return {
            '.scroller': {
                scroll: () => this.startScrollEndTimer(),
            },
            '.dot': {
                click: (e) => {
                    const indicator = e.target.closest('.dot');
                    this.selectedIndex = Array.from(indicator.parentNode.children).indexOf(indicator);
                    this.scrollToIndex();
                },
            },
            '.arrow-left': {
                click: () => this.previous(),
            },
            '.arrow-right': {
                click: () => this.next(),
            },
        };
    }

    watch() {
        return {
            selectedIndex: () => {
                this.dispatch(SliderEvents.SLIDER_RUN, this.selectedIndex);
            },
        };
    }

    /**
     * Advance to the next item (by `itemsToScroll`).
     * @returns {void}
     */
    next() {
        const newIndex = this.selectedIndex + this.itemsToScroll;
        this.selectedIndex = this.rewind && newIndex > this.itemsCount ? 0 : Math.min(this.itemsCount, newIndex);
        if (this.autoSelect && this.canSlide) {
            //check if element is already visible
            const target = this.items[this.selectedIndex];
            if (target) {
                const parent = this.$refs.scroller;
                const { marginLeft, marginRight } = getComputedStyle(target);
                const targetWidth = target.offsetWidth + parseInt(marginLeft) + parseInt(marginRight);
                if (target.offsetLeft + targetWidth < parent.scrollLeft + parent.offsetWidth) {
                    // means is in bounds
                    this.next();
                    return;
                }
            }
        }
        this.scrollToIndex();
    }

    /**
     * Move to the previous item (by `itemsToScroll`).
     * @returns {void}
     */
    previous() {
        const newIndex = this.selectedIndex - this.itemsToScroll;
        this.selectedIndex = this.rewind && newIndex < 0 ? this.itemsCount : Math.max(newIndex, 0);

        if (this.autoSelect && this.canSlide) {
            //check if element is already visible
            const target = this.items[this.selectedIndex];
            if (target) {
                const { marginLeft } = getComputedStyle(target);
                const parent = this.$refs.scroller;
                if (target.offsetLeft - parseInt(marginLeft) > parent.scrollLeft) {
                    // means is still in viewport
                    this.previous();
                    return;
                }
            }
        }

        this.scrollToIndex();
    }

    /**
     * Jump directly to `index`.
     * @param {number} index - Target item index.
     * @param {boolean} [smooth=true] - When `true` the scroll animates; otherwise it
     *   jumps instantly.
     * @returns {void}
     */
    goTo(index, smooth = true) {
        if (index !== this.selectedIndex) {
            this.selectedIndex = index;
            this.scrollToIndex(smooth);
        }
    }

    /** @private */
    startScrollEndTimer() {
        clearTimeout(this.#scrollTimer);
        this.#scrollTimer = setTimeout(() => this.onManualScrollEnd(), this.manualScrollEndDelay);
    }

    /** @private */
    scrollToIndex(smooth = true) {
        if (!this.$refs.scroller) {
            //external call before render
            return;
        }
        if (smooth) {
            this.#scrollToIndex = true;
            // start timer just in case the slider is not scrolling at all
            this.startScrollEndTimer();
        }
        const target = this.items[this.selectedIndex];
        if (!target) return;
        const parent = this.$refs.scroller;
        const parentWidth = parent.offsetWidth;

        let targetLeft = target.offsetLeft - (parentWidth - target.offsetWidth) / 2;

        const snapAlign = window.getComputedStyle(target).scrollSnapAlign;
        if (snapAlign === 'start') {
            targetLeft = target.offsetLeft;
        } else if (snapAlign === 'end') {
            targetLeft = target.offsetLeft - (parentWidth - target.offsetWidth);
        }

        this.$refs.scroller.scrollTo({
            left: targetLeft,
            behavior: smooth ? 'smooth' : 'auto',
        });
    }

    /** @private */
    onManualScrollEnd() {
        if (!this.#scrollToIndex) {
            const scroller = this.$refs.scroller;
            const scrollLeft = scroller.scrollLeft;
            const scrollPercentage = scrollLeft / (scroller.scrollWidth - scroller.offsetWidth);

            if (scrollPercentage === 0) {
                this.selectedIndex = 0;
            } else if (scrollPercentage === 1) {
                this.selectedIndex = this.itemsCount;
            } else {
                //aprox or guess selectedIndex to fix UI state
                this.selectedIndex = Math.ceil(this.itemsCount * scrollPercentage);
            }
        }
        this.#scrollToIndex = false;
    }

    /** @private */
    addResizeListener() {
        try {
            const resizeObserver = new ResizeObserver(() => {
                /*
                 * https://web.dev/snap-after-layout/
                 * this codes attempts to fix scrollsnap Position after layout changes
                 * */
                this.#scrollToIndex = true;
                this.dispatch(SliderEvents.SLIDER_RESIZE, this.selectedIndex);
                this.scrollToIndex(false);
                this.startScrollEndTimer();
            });
            resizeObserver.observe(this);
        } catch (e) {
            /* no ResizeOberserver no fix */
        }
    }

    template() {
        return html`
            <div ref="scroller" part="scroller" class="scroller">
                <slot></slot>
            </div>
            ${this.dots ? html` <div part="controls dots">${this.dotsTemplate()}</div> ` : null}
            ${this.arrows ? html` <div part="controls arrows">${this.arrowsTemplate()}</div> ` : null}
        `;
    }

    /** @private */
    dotsTemplate() {
        return this.items.map((item, index) => {
            return html`
                <button
                    part="dot ${this.selectedIndex === index ? 'selected-dot' : ''}"
                    class="dot"
                    aria-pressed="${this.selectedIndex === index ? 'true' : 'false'}"
                ></button>
            `;
        });
    }

    /** @private */
    arrowsTemplate() {
        const disabledLeft = !this.rewind && !this.canSlideLeft;
        const disabledRight = !this.rewind && !this.canSlideRight;

        return html`
            <button
                part="arrow arrow-left ${disabledLeft ? 'arrow-disabled' : ''}"
                class="arrow-left"
                ?disabled=${disabledLeft}
            >
                <slot name="arrow-left">&lang;</slot>
            </button>
            <button
                part="arrow arrow-right ${disabledRight ? 'arrow-disabled' : ''}"
                class="arrow-right"
                ?disabled=${disabledRight}
            >
                <slot name="arrow-right">&rang;</slot>
            </button>
        `;
    }
}

export function define() {
    defineElement('el-slider', Slider);
}

export { html, defineElement, SliderEvents };
