import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { define as defineDrawer } from '../drawer/drawer.js';
import { containsFocusable } from '../../utils/focus.js';
import { hasSlotted } from '../../utils/slots.js';
import style, { DEFAULT_STEP, STEPS } from './app-frame.style.js';
import Events from './app-frame.events.js';

/** The regions the page can leave out by the width of the frame. */
const REGIONS = ['header', 'navigation', 'aside', 'footer'];

/** What opens and closes the navigation where it is a drawer: any element with this attribute. */
const TOGGLE = '[data-navigation-toggle]';

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
 * From the width `wide-from` names, the navigation and the aside are columns beside the content,
 * and each scrolls on its own. Where the frame is narrow, the content and the aside are one
 * column that scrolls, and the navigation does not show: it opens as a drawer from the start
 * edge, from any element with `data-navigation-toggle`. The page writes the navigation once.
 *
 * The width is the one of the frame, and the stylesheet alone decides: a server-rendered frame
 * has its layout before the script has run.
 *
 * @element el-app-frame
 *
 * @fires {CustomEvent<{ open: boolean }>} app-frame-navigation-toggle - Fired when the drawer of
 *   the navigation opens or closes, with the new state in `detail.open`.
 *
 * @slot - The content of the view: the `main` of the page, with an id for the skip link.
 * @slot header - The region at the top, an app bar as a rule. Left out while it is empty.
 * @slot navigation - The region at the start side, and the content of the drawer where the frame
 *   is narrow. Left out while it is empty.
 * @slot aside - The region at the end side. Left out while it is empty.
 * @slot footer - The region at the lower edge. Left out while it is empty.
 *
 * @csspart base - The frame: the grid of the regions.
 * @csspart skip-link - The link that skips to the content. It shows while it has the focus.
 * @csspart header - The region at the top. Its surface reaches under the status bar of a phone.
 * @csspart navigation - The region at the start side, where the frame is wide.
 * @csspart body - The content and the aside. Where the frame is narrow, it is what scrolls.
 * @csspart content - The region of the content. Where the frame is wide, it is what scrolls.
 * @csspart aside - The region at the end side.
 * @csspart footer - The region at the lower edge. Its surface reaches under the home indicator.
 * @csspart drawer - The surface of the drawer the navigation is in where the frame is narrow.
 * @csspart drawer-header - The header of that drawer, with its title and its close button.
 * @csspart drawer-title - The title of that drawer.
 * @csspart drawer-close-button - The close button of that drawer.
 * @csspart drawer-body - The body of that drawer: the navigation of the page is in it.
 *
 * @cssproperty --el-app-frame-navigation-size - The width of the navigation where the frame is
 *   wide, and of its drawer where it is narrow. Default `16rem`. `auto` is the width of what is
 *   in it.
 * @cssproperty --el-app-frame-aside-size - The width of the aside where the frame is wide.
 *   Default `20rem`.
 *
 * @cssstate navigation-open - Set while the drawer of the navigation is open.
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
 * @property {boolean} navigationOpen - Whether the drawer of the navigation is open. It is one
 *   only where the frame is narrow: elsewhere the property is `false`. Reflected to the
 *   `navigation-open` attribute.
 * @property {string} navigationLabel - The title of the drawer of the navigation, and its name
 *   for assistive technology. Default `'Navigation'`.
 * @property {string} closeLabel - The name of the close button of that drawer. Default
 *   `'Close'`.
 */
export default class AppFrame extends TemplateElement {
    /**
     * Tells of every change of a size: of the frame, which can make it wide or narrow, and of a
     * region, which can make it scroll or stop it from scrolling.
     * @private
     * @type {ResizeObserver | undefined}
     */
    _resizeObserver = undefined;

    /**
     * Whether the navigation is in a drawer: the frame is narrow, and has a navigation there.
     * Only the script knows, so a server and the first render in the browser have the region.
     * @private
     */
    _inDrawer = false;

    /**
     * What the frame has said of its drawer last, so it says a change once.
     * @private
     */
    _saidOpen = false;

    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            propertyOptions: { navigationOpen: { reflect: true } },
        });
    }

    properties() {
        return {
            skipLabel: 'Skip to content',
            wideFrom: DEFAULT_STEP,
            narrowOnly: '',
            wideOnly: '',
            navigationOpen: false,
            navigationLabel: 'Navigation',
            closeLabel: 'Close',
        };
    }

    connected() {
        this._resizeObserver = new ResizeObserver(() => {
            this._syncView();
            this._syncTabStops();
        });
        this._observeSizes();
        this._syncView();
    }

    disconnected() {
        this._resizeObserver?.disconnect();
    }

    afterUpdate() {
        // A render can have brought or taken the drawer, and with it a region to watch.
        this._observeSizes();
        this._syncToggles();
    }

    watch() {
        return {
            navigationOpen: () => {
                // There is a drawer to open only where the frame is narrow.
                if (this.navigationOpen && !this._inDrawer) {
                    this.navigationOpen = false;
                    return;
                }
                if (this.navigationOpen) this._internals.states.add('navigation-open');
                else this._internals.states.delete('navigation-open');
                this._syncToggles();
                if (this.navigationOpen === this._saidOpen) return;
                this._saidOpen = this.navigationOpen;
                this.dispatch(Events.NAVIGATION_TOGGLE, { open: this.navigationOpen });
            },
        };
    }

    events() {
        return {
            this: {
                click: (event) => this._onClick(event),
            },
            // A template element does not render again when a child comes, goes or changes its
            // `slot` attribute. The slot tells of all three, and the event bubbles to the base.
            "[part~='base']": {
                slotchange: () => {
                    this.requestUpdate();
                    this._observeSizes();
                    this._syncView();
                },
            },
            "[part~='skip-link']": {
                click: (event) => this._onSkip(event),
            },
            // The drawer is a part of the frame. What it says of itself stays in the frame, and
            // the frame says it in its own words.
            'el-drawer': {
                'drawer-show': (event) => event.stopPropagation(),
                'drawer-after-show': (event) => event.stopPropagation(),
                'drawer-initial-focus': (event) => event.stopPropagation(),
                'drawer-request-close': (event) => event.stopPropagation(),
                'drawer-hide': (event) => {
                    event.stopPropagation();
                    // Closed by its own button, by Escape or by a click beside it.
                    this.navigationOpen = false;
                },
                'drawer-after-hide': (event) => event.stopPropagation(),
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
     * the column of the content and the aside where it is narrow. For a page that sets the scroll
     * back after a change of the view, or brings a position back. The window does not scroll in a
     * frame.
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
     * The names of regions in an attribute of the page, and nothing else.
     * @private
     * @param {string} names
     * @returns {string[]}
     */
    _regionsOf(names) {
        return String(names ?? '')
            .split(/\s+/)
            .filter((name) => REGIONS.includes(name));
    }

    /**
     * Takes what the stylesheet has decided: where the frame is narrow and has a navigation
     * there, the navigation is in a drawer. Where it is wide again, the drawer goes, open or
     * not: the platform takes a dialog that leaves the page out of the top layer, and the drawer
     * gives the scroll of the page back.
     * @private
     */
    _syncView() {
        if (!this.$refs.base) return;

        const inDrawer =
            !this.wide && hasSlotted(this, 'navigation') && !this._regionsOf(this.wideOnly).includes('navigation');
        if (inDrawer === this._inDrawer) return;

        this._inDrawer = inDrawer;
        if (!inDrawer) this.navigationOpen = false;
        this.requestUpdate();
    }

    /**
     * The elements of the page that open and close the navigation.
     * @private
     * @returns {HTMLElement[]}
     */
    _toggles() {
        return [...this.querySelectorAll(TOGGLE)];
    }

    /**
     * A toggle says whether the navigation is open, and is not there where there is no drawer to
     * open. An `el-button` reads that from the stylesheet of the frame, before the script has
     * run; any other element is hidden here.
     * @private
     */
    _syncToggles() {
        for (const toggle of this._toggles()) {
            toggle.setAttribute('aria-expanded', this.navigationOpen ? 'true' : 'false');
            if (toggle.localName !== 'el-button') toggle.hidden = !this._inDrawer;
        }
    }

    /**
     * A click on a toggle opens or closes the drawer. A click on a link in the open drawer closes
     * it: the user has chosen where to go, also where the page changes the view without loading.
     * @private
     * @param {MouseEvent} event
     */
    _onClick(event) {
        const path = event.composedPath().filter((node) => node instanceof Element);

        if (path.some((node) => node.matches(TOGGLE))) {
            if (this._inDrawer) this.navigationOpen = !this.navigationOpen;
            return;
        }

        if (!this.navigationOpen) return;
        const inNavigation = path.some(
            (node) => node.parentNode === this && node.getAttribute('slot') === 'navigation',
        );
        if (inNavigation && path.some((node) => node.matches('a[href]'))) this.navigationOpen = false;
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
     * Watches the sizes of the frame, of the regions and of what the page has put into them.
     * @private
     */
    _observeSizes() {
        if (!this._resizeObserver) return;
        this._resizeObserver.disconnect();
        this._resizeObserver.observe(this);
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

    /**
     * The navigation: a region of the frame, or the content of a drawer where the frame is
     * narrow. One slot either way, so the page writes the navigation once and no node is moved.
     * @private
     */
    navigationTemplate() {
        if (this._inDrawer) {
            return html`
                <el-drawer
                    class="drawer"
                    placement="start"
                    exportparts="base:drawer, header:drawer-header, title:drawer-title, close-button:drawer-close-button, body:drawer-body"
                    label="${this.navigationLabel}"
                    close-label="${this.closeLabel}"
                    open="${this.navigationOpen ? 'true' : 'false'}"
                >
                    <slot name="navigation"></slot>
                </el-drawer>
            `;
        }

        return html`
            <div part="navigation" class="navigation" ?hidden="${!hasSlotted(this, 'navigation')}">
                <slot name="navigation"></slot>
            </div>
        `;
    }

    template() {
        const id = this._content()?.id;
        // The stylesheet reads the step from the frame, not from the host: a value it does not
        // know is the default here, and a server writes it as the browser does.
        const step = STEPS.includes(this.wideFrom) ? this.wideFrom : DEFAULT_STEP;

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
                data-narrow-only="${this._regionsOf(this.narrowOnly).join(' ')}"
                data-wide-only="${this._regionsOf(this.wideOnly).join(' ')}"
            >
                <div part="header" class="header" ?hidden="${!hasSlotted(this, 'header')}">
                    <slot name="header"></slot>
                </div>
                ${this.navigationTemplate()}
                <div part="body" ref="body" class="body">
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
    // The drawer the navigation is in where the frame is narrow.
    defineDrawer();
    defineElement('el-app-frame', AppFrame);
}

export { Events };
