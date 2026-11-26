import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { containsFocusable } from '../../utils/focus.js';
import { hasSlotted } from '../../utils/slots.js';
import style, { DEFAULT_STEP, STEPS } from './app-frame.style.js';

/** The regions the page can leave out by the width of the frame. */
const REGIONS = ['header', 'navigation', 'aside', 'footer'];

/**
 * The frame of an application: it fills what the browser shows and lays out five regions, a
 * header, a footer, a navigation at the start side, an aside at the end side, and the content.
 * The header and the footer stay in view, and the content scrolls between them.
 *
 * The frame knows regions, not what they mean. The page writes the elements that say so, the
 * landmarks, and slots them: `<header slot="header">`, `<nav slot="navigation" aria-label="…">`,
 * `<main id="…">`, `<aside slot="aside">`, `<footer slot="footer">`. The frame adds the layout,
 * the room for the notch and the home indicator of a phone, and a link that skips to the content
 * as the first stop of the Tab key.
 *
 * Where the frame is narrow, the navigation, the content and the aside are one column that
 * scrolls. From the width `wide-from` names, the three are beside each other and scroll on their
 * own. The width is the one of the frame, and the stylesheet alone decides: a server-rendered
 * frame has its layout before the script has run.
 *
 * @element el-app-frame
 *
 * @slot - The content of the view: the `main` of the page, with an id for the skip link.
 * @slot header - The region at the top, an app bar as a rule. Left out while it is empty.
 * @slot navigation - The region at the start side. Left out while it is empty.
 * @slot aside - The region at the end side. Left out while it is empty.
 * @slot footer - The region at the lower edge. Left out while it is empty.
 *
 * @csspart base - The frame: the grid of the regions.
 * @csspart skip-link - The link that skips to the content. It shows while it has the focus.
 * @csspart header - The region at the top. Its surface reaches under the status bar of a phone.
 * @csspart body - The navigation, the content and the aside. Where the frame is narrow, it is
 *   what scrolls.
 * @csspart navigation - The region at the start side.
 * @csspart content - The region of the content. Where the frame is wide, it is what scrolls.
 * @csspart aside - The region at the end side.
 * @csspart footer - The region at the lower edge. Its surface reaches under the home indicator.
 *
 * @cssproperty --el-app-frame-navigation-size - The width of the navigation where the frame is
 *   wide. Default `16rem`. `auto` is the width of what is in it.
 * @cssproperty --el-app-frame-aside-size - The width of the aside where the frame is wide.
 *   Default `20rem`.
 *
 * @property {string} skipLabel - The text of the link that skips to the content. Default
 *   `'Skip to content'`.
 * @property {'30rem'|'40rem'|'48rem'|'64rem'|'80rem'} wideFrom - The width of the frame from
 *   which the navigation and the aside are columns beside the content. One of the steps the
 *   stylesheet knows, another value is the default. Default `'48rem'`.
 * @property {string} narrowOnly - The regions that are there only where the frame is narrow, as
 *   their names with a space between them: `header`, `navigation`, `aside`, `footer`. A bar of
 *   destinations in the footer of a phone, for example (`narrow-only="footer"`). Default `''`.
 * @property {string} wideOnly - The regions that are there only where the frame is wide, named
 *   the same way. Default `''`.
 */
export default class AppFrame extends TemplateElement {
    /**
     * Tells of every change of a size that can make a region scroll, or stop it from scrolling.
     * @private
     * @type {ResizeObserver | undefined}
     */
    _resizeObserver = undefined;

    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    connected() {
        this._resizeObserver = new ResizeObserver(() => this._syncTabStops());
        this._observeSizes();
    }

    disconnected() {
        this._resizeObserver?.disconnect();
    }

    properties() {
        return {
            skipLabel: 'Skip to content',
            wideFrom: DEFAULT_STEP,
            narrowOnly: '',
            wideOnly: '',
        };
    }

    events() {
        return {
            // A template element does not render again when a child comes, goes or changes its
            // `slot` attribute. The slot tells of all three, and the event bubbles to the base.
            "[part~='base']": {
                slotchange: () => {
                    this.requestUpdate();
                    this._observeSizes();
                },
            },
            "[part~='skip-link']": {
                click: (event) => this._onSkip(event),
            },
        };
    }

    /**
     * Whether the frame is wide: the navigation, the content and the aside are beside each other.
     * The stylesheet decides, by the width of the frame and its `wide-from`; this reads what it
     * has decided, so the width is written in one place.
     * @returns {boolean}
     */
    get wide() {
        const base = this.$refs.base;
        if (!base) return false;
        return getComputedStyle(base).getPropertyValue('--_el-app-frame-view').trim() === 'wide';
    }

    /**
     * The element that scrolls the content: the region of the content where the frame is wide,
     * the column of the navigation, the content and the aside where it is narrow. For a page that
     * sets the scroll back after a change of the view, or brings a position back. The window does
     * not scroll in a frame.
     * @returns {HTMLElement | undefined}
     */
    get scroller() {
        return this.wide ? this.$refs.content : this.$refs.body;
    }

    /**
     * The element of the page the skip link leads to: its `main`, or the first element that is in
     * no named slot.
     * @private
     * @returns {Element | undefined}
     */
    _content() {
        const inDefaultSlot = [...this.children].filter((child) => !child.getAttribute('slot'));
        return inDefaultSlot.find((child) => child.localName === 'main') ?? inDefaultSlot[0];
    }

    /**
     * The regions that can scroll, each with the elements of the page that are in it.
     * @private
     * @returns {Array<[HTMLElement, Element[]]>}
     */
    _regions() {
        return ['body', 'navigation', 'content', 'aside']
            .map((name) => this.shadowRoot.querySelector(`[part~='${name}']`))
            .filter(Boolean)
            .map((region) => [
                region,
                [...region.querySelectorAll('slot')].flatMap((slot) => slot.assignedElements({ flatten: true })),
            ]);
    }

    /**
     * Watches the sizes of the regions and of what the page has put into them.
     * @private
     */
    _observeSizes() {
        if (!this._resizeObserver) return;
        this._resizeObserver.disconnect();
        for (const [region, elements] of this._regions()) {
            this._resizeObserver.observe(region);
            for (const element of elements) this._resizeObserver.observe(element);
        }
    }

    /**
     * A region that scrolls and has nothing in it that takes the focus is a stop of the Tab key
     * itself: without one the keyboard cannot scroll it. Some browsers do that by themselves, and
     * this does it for the others.
     * @private
     */
    _syncTabStops() {
        for (const [region, elements] of this._regions()) {
            const { overflowY } = getComputedStyle(region);
            const scrolls =
                (overflowY === 'auto' || overflowY === 'scroll') && region.scrollHeight > region.clientHeight;

            if (scrolls && !elements.some(containsFocusable)) {
                region.setAttribute('tabindex', '0');
            } else if (region.getAttribute('tabindex') === '0') {
                region.removeAttribute('tabindex');
            }
        }
    }

    /**
     * After the skip link the content is in view from its start, the keys scroll it, and the Tab
     * key goes on inside of it: the region of the content has the focus.
     *
     * The link is a link to the id of the content, which a browser follows before the script has
     * run. From then on the script does the same and leaves the address alone: a page that keeps
     * its route in the fragment would lose it.
     * @private
     * @param {MouseEvent} event
     */
    _onSkip(event) {
        event.preventDefault();

        const region = this.$refs.content;
        const scroller = this.scroller;
        // The region scrolls itself where the frame is wide, and is a part of what scrolls where
        // it is narrow.
        scroller.scrollTop =
            scroller === region
                ? 0
                : scroller.scrollTop + region.getBoundingClientRect().top - scroller.getBoundingClientRect().top;

        // Where the region is no stop of the Tab key, it takes the focus for this moment only.
        if (!region.hasAttribute('tabindex')) {
            region.setAttribute('tabindex', '-1');
            region.addEventListener(
                'blur',
                () => {
                    if (region.getAttribute('tabindex') === '-1') region.removeAttribute('tabindex');
                },
                { once: true },
            );
        }
        region.focus({ preventScroll: true });
    }

    template() {
        const id = this._content()?.id;
        // The stylesheet reads the step from the frame, not from the host: a value it does not
        // know is the default here, and a server writes it as the browser does.
        const step = STEPS.includes(this.wideFrom) ? this.wideFrom : DEFAULT_STEP;
        // The names of regions, and nothing else: the stylesheet matches them as words.
        const regions = (names) =>
            String(names ?? '')
                .split(/\s+/)
                .filter((name) => REGIONS.includes(name))
                .join(' ');

        return html`
            <a part="skip-link" class="skip" href="#${id || ''}">${this.skipLabel}</a>
            <div
                part="base"
                ref="base"
                class="frame ${hasSlotted(this, 'header') ? 'frame--header' : ''} ${
                    hasSlotted(this, 'footer') ? 'frame--footer' : ''
                } ${hasSlotted(this, 'navigation') ? 'frame--navigation' : ''} ${
                    hasSlotted(this, 'aside') ? 'frame--aside' : ''
                }"
                data-wide-from="${step}"
                data-narrow-only="${regions(this.narrowOnly)}"
                data-wide-only="${regions(this.wideOnly)}"
            >
                <div part="header" class="header" ?hidden="${!hasSlotted(this, 'header')}">
                    <slot name="header"></slot>
                </div>
                <div part="body" ref="body" class="body">
                    <div part="navigation" class="navigation" ?hidden="${!hasSlotted(this, 'navigation')}">
                        <slot name="navigation"></slot>
                    </div>
                    <div part="content" ref="content" class="content"><slot></slot></div>
                    <div part="aside" class="aside" ?hidden="${!hasSlotted(this, 'aside')}">
                        <slot name="aside"></slot>
                    </div>
                </div>
                <div part="footer" class="footer" ?hidden="${!hasSlotted(this, 'footer')}">
                    <slot name="footer"></slot>
                </div>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-app-frame', AppFrame);
}
