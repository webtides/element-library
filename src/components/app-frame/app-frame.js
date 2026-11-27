import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { define as defineDrawer } from '../drawer/drawer.js';
import { define as defineSplitter } from '../splitter/splitter.js';
import { activeElement, containsFocusable } from '../../utils/focus.js';
import { hasSlotted } from '../../utils/slots.js';
import style, { DEFAULT_STEP, STEPS } from './app-frame.style.js';
import Events from './app-frame.events.js';

/** The regions the page can leave out by the width of the frame. */
const REGIONS = ['header', 'navigation', 'aside', 'footer'];

/** The regions whose width the user can set by dragging their edge. */
const RESIZABLE = ['navigation', 'aside'];

/** What opens and closes the navigation where it is a drawer: any element with this attribute. */
const TOGGLE = '[data-navigation-toggle]';

/** What the user types into: the controls an on-screen keyboard opens for. */
const TYPED_INTO =
    'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';

/**
 * The least a part of the viewport is covered by, in pixels, for it to be taken as covered by an
 * on-screen keyboard. Less is a scrollbar, or a height that is rounded.
 */
const KEYBOARD = 80;

/**
 * How long, in milliseconds, a scroll of the document is taken for the doing of something else
 * than a tap on the status bar: after a finger that dragged the page has left the screen, after a
 * wheel or a key, after a keyboard has come or gone, and after the viewport has changed its size.
 * A page that was dragged swings back for that long.
 */
const SETTLE = 700;

/**
 * How long, in milliseconds, a scroll of the document is taken to go on after it was last heard
 * of, where the browser does not say when it is over (`scrollend`). iOS is on its way to the
 * top for a second and a half after a tap on the status bar, and takes the document back there
 * for as long.
 */
const LONGEST = 2000;

/**
 * How long, in milliseconds, after the frame has put the document on its pixel a scroll back to
 * zero is the browser that takes the pixel away again, and no tap.
 */
const ECHO = 200;

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
 * `resizable` names the columns whose width the user sets by dragging their edge, an
 * `el-splitter` of the frame. `navigation-size` and `aside-size` are those widths: the frame tells
 * of them, and the page keeps them and gives them back.
 *
 * Where a browser lays its on-screen keyboard over the page, the frame is as high as what shows
 * above the keyboard, and where that part is: the header stays in view, and the field the user
 * types into does. That needs the script.
 *
 * With `status-bar-tap` a tap on the status bar of an iPhone brings the content to its top, as it
 * does in an application. iOS scrolls the document for that tap and never a region, so the frame
 * keeps the document scrolled by one pixel there, and hears it go back. The document snaps to
 * that pixel: a script of the page that scrolls the window does not move it, and is no tap.
 *
 * @element el-app-frame
 *
 * @fires {CustomEvent<{ open: boolean }>} app-frame-navigation-toggle - Fired when the drawer of
 *   the navigation opens or closes, with the new state in `detail.open`.
 * @fires {CustomEvent<{ region: 'navigation'|'aside', size: number }>} app-frame-resize - Fired
 *   with every change the user makes to the width of a column: while its edge is dragged, and
 *   with every key. The new width in pixels is in `detail.size`.
 * @fires {CustomEvent<{ region: 'navigation'|'aside', size: number }>} app-frame-resize-end -
 *   Fired once the user has set a width: when the pointer lets go of the edge, and with every
 *   key. The width to keep is in `detail.size`.
 * @fires {CustomEvent} app-frame-status-bar-tap - Fired when the user has tapped the status bar of
 *   an iPhone, with `status-bar-tap`. The frame scrolls its content to the top after it, unless a
 *   listener calls `preventDefault()`: a view whose columns scroll brings those to their tops.
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
 * @csspart navigation-splitter - The edge of the navigation the user drags, an `el-splitter`.
 * @csspart aside-splitter - The edge of the aside the user drags, an `el-splitter`.
 *
 * @cssproperty --el-app-frame-navigation-size - The width of the navigation where the frame is
 *   wide, and of its drawer where it is narrow. Default `16rem`. `auto` is the width of what is
 *   in it.
 * @cssproperty --el-app-frame-aside-size - The width of the aside where the frame is wide.
 *   Default `20rem`.
 * @cssproperty --el-app-frame-navigation-min-size - The least width of a navigation that is
 *   resizable. Default `10rem`.
 * @cssproperty --el-app-frame-navigation-max-size - The greatest width of a navigation that is
 *   resizable. Default `min(30rem, 40cqi)`: two fifths of the width of the frame at most.
 * @cssproperty --el-app-frame-aside-min-size - The least width of an aside that is resizable.
 *   Default `10rem`.
 * @cssproperty --el-app-frame-aside-max-size - The greatest width of an aside that is resizable.
 *   Default `min(30rem, 40cqi)`.
 *
 * @cssstate navigation-open - Set while the drawer of the navigation is open.
 * @cssstate keyboard - Set while an on-screen keyboard covers a part of the viewport, and the
 *   frame is as high as what shows above it.
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
 * @property {'drawer'|'bar'} narrowNavigation - What the navigation is where the frame is narrow.
 *   `drawer`: it does not show, and opens as a drawer. `bar`: its region lies at the lower edge,
 *   for an `el-nav` whose destinations are a bar there and a rail in the column of the wide
 *   frame. Default `'drawer'`.
 * @property {boolean} navigationOpen - Whether the drawer of the navigation is open. It is one
 *   only where the frame is narrow: elsewhere the property is `false`. Reflected to the
 *   `navigation-open` attribute.
 * @property {string} navigationLabel - The title of the drawer of the navigation, and its name
 *   for assistive technology. Default `'Navigation'`.
 * @property {string} closeLabel - The name of the close button of that drawer. Default
 *   `'Close'`.
 * @property {string} resizable - The columns whose width the user sets by dragging their edge,
 *   as their names with a space between them: `navigation`, `aside`. Default `''`.
 * @property {number} navigationSize - The width of the navigation where the frame is wide, in
 *   pixels: the one the user has set, or the one the page has kept. `0` is the width of the
 *   stylesheet (`--el-app-frame-navigation-size`). Default `0`.
 * @property {number} asideSize - The width of the aside where the frame is wide, in pixels. `0`
 *   is the width of the stylesheet (`--el-app-frame-aside-size`). Default `0`.
 * @property {string} asideLabel - The name of the aside for assistive technology, on the edge
 *   that sizes it. The edge of the navigation has `navigation-label`. Default `'Aside'`.
 * @property {boolean} statusBarTap - Whether a tap on the status bar of an iPhone brings the
 *   content to its top. The document of the page is one pixel higher than the viewport then, and
 *   snaps to that pixel. Default `false`.
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

    /**
     * Whether the script has started. The edges to drag are there from then on: they do nothing
     * before, and a server leaves them out.
     * @private
     */
    _started = false;

    /**
     * The height of what scrolls the content, as it was last: a field the user types into is
     * brought back into view when that height gets less.
     * @private
     */
    _scrollerSize = 0;

    /**
     * Whether an on-screen keyboard covers a part of the viewport, as the frame has said last
     * (`:state(keyboard)`). Kept here, and not read back from the states of the element: WebKit
     * forgets what was added to them a moment later (`states.has()` is `false`), while the state
     * still matches.
     * @private
     */
    _keyboard = false;

    /**
     * Tells of a visual viewport that changes: an on-screen keyboard that comes or goes, or the
     * page that the browser moves behind it.
     * @private
     * @param {Event} event
     */
    _onViewport = (event) => {
        // A viewport that changes its size is not the doing of a tap on the status bar, whatever
        // the document does next. One that moves says nothing: it does so for that tap as well.
        if (event.type === 'resize') this._quiet();
        this._syncViewport();
    };

    /**
     * What the frame keeps while it listens for a tap on the status bar: the element that makes
     * the document one pixel higher than the viewport, whether the document snaps to that pixel
     * and what the page had in the place of that rule, whether a script can move the document all
     * the same, how many fingers are on the screen, until when a scroll of the document is
     * somebody else's, whether the document is scrolling and when it was last heard of, when the
     * frame has put it on its pixel last, and the timer that does so.
     * @private
     * @type {{ sentinel: HTMLElement, snaps: boolean, snapBefore: string, held: boolean, touches: number, dragged: boolean, quietUntil: number, scrolling: boolean, scrolledAt: number, armedAt: number, timer: number } | undefined}
     */
    _statusBar = undefined;

    /** @private */
    _onDocumentScroll = () => this._onStatusBarScroll();

    /**
     * The scroll of the document is over: it can have its pixel back.
     * @private
     */
    _onDocumentScrollEnd = () => {
        const state = this._statusBar;
        if (!state) return;
        state.scrolling = false;
        if (window.scrollY < 1) this._arm();
    };

    /**
     * A finger has come or gone. One that has dragged the document, from the header or the
     * footer, leaves a page that swings back: for that moment a scroll is not a tap. One that has
     * scrolled the content has moved no document, and a tap right after it counts.
     * @private
     * @param {TouchEvent} event
     */
    _onTouch = (event) => {
        const state = this._statusBar;
        if (!state) return;
        state.touches = event.touches.length;
        if (state.touches > 0 || !state.dragged) return;
        state.dragged = false;
        this._quiet();
    };

    /**
     * A wheel or a key: over the header they scroll the document, as the tap does.
     * @private
     */
    _onInput = () => this._quiet();

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
            narrowNavigation: 'drawer',
            navigationOpen: false,
            navigationLabel: 'Navigation',
            closeLabel: 'Close',
            resizable: '',
            navigationSize: 0,
            asideSize: 0,
            asideLabel: 'Aside',
            statusBarTap: false,
        };
    }

    connected() {
        this._resizeObserver = new ResizeObserver(() => {
            this._syncView();
            this._syncTabStops();
            this._syncEdges();
            this._syncFocus();
        });
        this._observeSizes();
        this._syncView();
        this._started = true;
        if (this._resizable().length > 0) this.requestUpdate();

        window.visualViewport?.addEventListener('resize', this._onViewport);
        window.visualViewport?.addEventListener('scroll', this._onViewport);
        this._syncViewport();
        this._syncStatusBar();
    }

    disconnected() {
        this._resizeObserver?.disconnect();
        window.visualViewport?.removeEventListener('resize', this._onViewport);
        window.visualViewport?.removeEventListener('scroll', this._onViewport);
        this._syncStatusBar();
    }

    afterUpdate() {
        // A render can have brought or taken the drawer, and with it a region to watch.
        this._observeSizes();
        this._syncToggles();
        this._syncEdges();
    }

    watch() {
        return {
            narrowNavigation: () => this._syncView(),
            wideOnly: () => this._syncView(),
            statusBarTap: () => this._syncStatusBar(),
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
            // And so are the edges of the columns.
            'el-splitter': {
                'splitter-resize': (event) => this._onResize(event, Events.RESIZE),
                'splitter-resize-end': (event) => this._onResize(event, Events.RESIZE_END),
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
     * The columns the page lets the user size.
     * @private
     * @returns {string[]}
     */
    _resizable() {
        return this._regionsOf(this.resizable).filter((name) => RESIZABLE.includes(name));
    }

    /**
     * An edge says the width of its column, and the least and the greatest one. The stylesheet
     * has them, in any unit, and the edge needs pixels: they are read from the column as it is
     * laid out. A limit that is no length there, a percentage, is none for the edge. The
     * stylesheet keeps it all the same, and the width is read again after every change.
     * @private
     */
    _syncEdges() {
        for (const edge of this.shadowRoot?.querySelectorAll('el-splitter') ?? []) {
            const region = this.shadowRoot.querySelector(`[part~='${edge.dataset.region}']`);
            // A column that is not laid out, where the frame is narrow, has no width to say.
            if (!region || !this.wide || getComputedStyle(region).display === 'none') continue;

            const { inlineSize, minInlineSize, maxInlineSize } = getComputedStyle(region);
            const pixels = (length, otherwise) => (length.endsWith('px') ? Math.round(parseFloat(length)) : otherwise);
            const value = pixels(inlineSize, 0);
            const min = pixels(minInlineSize, 0);
            const max = pixels(maxInlineSize, Math.round(this.$refs.base.getBoundingClientRect().width));
            if (edge.value !== value) edge.value = value;
            if (edge.min !== min) edge.min = min;
            if (edge.max !== max) edge.max = max;
        }
    }

    /**
     * The user has moved an edge: the column takes the width, and the frame tells of it in its
     * own words.
     * @private
     * @param {CustomEvent<{ value: number }>} event
     * @param {string} name - The event of the frame.
     */
    _onResize(event, name) {
        event.stopPropagation();

        const region = event.currentTarget.dataset.region;
        const size = event.detail.value;
        if (region === 'aside') this.asideSize = size;
        else this.navigationSize = size;
        this.dispatch(name, { region, size });
    }

    /**
     * A browser that lays its on-screen keyboard over the page leaves the layout as it is: the
     * frame is as high as the viewport, and its lower part is under the keyboard. To show the
     * field the user types into, the browser moves the page up behind the keyboard, and the
     * header leaves the screen with it.
     *
     * The visual viewport is what shows. While it is less high than the layout by more than a
     * scrollbar, and the user types into something, the frame takes its place and its height:
     * the header is at the top of what shows, the footer above the keyboard, and the content
     * scrolls between them. The browser tells of the viewport once it has moved it, so for the
     * moment the keyboard comes in the regions are on their way.
     *
     * A viewport that shows less is no keyboard by itself. Safari on iOS makes the visual
     * viewport less high while a finger pulls the page past its top, by the length of the pull
     * and with the numbers of a keyboard. A keyboard is there for a field, so the frame takes
     * one that has the focus for the sign.
     *
     * Only a frame that fills the viewport follows, and not while the user has zoomed in: what
     * shows is a part of the page then, by the will of the user.
     * @private
     */
    _syncViewport() {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const covered =
            getComputedStyle(this).position === 'fixed' &&
            Math.abs(viewport.scale - 1) < 0.01 &&
            document.documentElement.clientHeight - viewport.height > KEYBOARD &&
            this._isTyping();

        if (!covered) {
            if (!this._keyboard) return;
            this._keyboard = false;
            this._internals.states.delete('keyboard');
            this.style.removeProperty('--_el-app-frame-visible-start');
            this.style.removeProperty('--_el-app-frame-visible-size');
            // The document is where the keyboard has left it: back by its pixel, for a tap on
            // the status bar.
            this._quiet();
            this._arm();
            return;
        }

        // The browser moves the page behind the keyboard, to show the field: it is free to.
        this._snap(false);
        this.style.setProperty('--_el-app-frame-visible-start', `${viewport.offsetTop}px`);
        this.style.setProperty('--_el-app-frame-visible-size', `${viewport.height}px`);
        this._keyboard = true;
        this._internals.states.add('keyboard');
        this._showFocus();
    }

    /**
     * Whether the user types into something: a field or a text they edit has the focus, in the
     * page or in a shadow root that is open, or a frame with another page has it, which keeps
     * to itself what has the focus in it. An on-screen keyboard is there for one of these.
     * @private
     * @returns {boolean}
     */
    _isTyping() {
        return activeElement()?.matches?.(`${TYPED_INTO}, iframe`) === true;
    }

    /**
     * Whether the frame listens for a tap on the status bar: the page asks for it, the frame
     * fills the viewport, and the browser is one of iOS, which has that tap and nothing that
     * tells of it. `-webkit-touch-callout` is a property only its WebKit knows.
     * @private
     * @returns {boolean}
     */
    _wantsStatusBarTap() {
        const asked = this.statusBarTap === true || this.statusBarTap === 'true' || this.statusBarTap === '';
        return (
            asked &&
            this.isConnected &&
            getComputedStyle(this).position === 'fixed' &&
            CSS.supports('-webkit-touch-callout', 'none') &&
            CSS.supports('block-size', '100dvh')
        );
    }

    /**
     * Starts or stops listening for a tap on the status bar.
     *
     * iOS scrolls the document to its top for that tap, and a frame leaves the document nothing
     * to scroll. So an element makes the document one pixel higher than what the browser shows,
     * and the document rests scrolled down by that pixel: it snaps there. The frame is fixed to
     * the viewport and does not move with it. A tap takes the document back to zero, past the
     * snap, which the frame hears.
     * @private
     */
    _syncStatusBar() {
        const wanted = this._wantsStatusBarTap();
        if (wanted === !!this._statusBar) return;

        if (!wanted) {
            const { sentinel, timer } = this._statusBar;
            this._snap(false);
            this._statusBar = undefined;
            clearTimeout(timer);
            sentinel.remove();
            window.removeEventListener('scroll', this._onDocumentScroll);
            window.removeEventListener('scrollend', this._onDocumentScrollEnd);
            for (const type of ['touchstart', 'touchend', 'touchcancel']) {
                window.removeEventListener(type, this._onTouch, true);
            }
            for (const type of ['wheel', 'keydown']) window.removeEventListener(type, this._onInput, true);
            return;
        }

        // An element of its own tree, so its rules need no stylesheet of the page. On paper there
        // is no viewport, and it would add a sheet. The element in it is where the document
        // snaps to: one pixel down.
        const sentinel = document.createElement('div');
        sentinel.setAttribute('data-el-app-frame-sentinel', '');
        sentinel.setAttribute('aria-hidden', 'true');
        sentinel.attachShadow({ mode: 'open' }).innerHTML = `<style>
            :host {
                position: absolute;
                inset-block-start: 0;
                inset-inline-start: 0;
                inline-size: 1px;
                block-size: calc(100dvh + 1px);
                visibility: hidden;
                pointer-events: none;
            }
            div {
                position: absolute;
                inset-block-start: 1px;
                inset-inline-start: 0;
                inline-size: 1px;
                block-size: 1px;
                scroll-snap-align: start;
            }
            @media print {
                :host {
                    display: none;
                }
            }
        </style><div></div>`;
        document.body.append(sentinel);

        this._statusBar = {
            sentinel,
            snaps: false,
            snapBefore: '',
            held: false,
            touches: 0,
            dragged: false,
            quietUntil: 0,
            scrolling: false,
            scrolledAt: 0,
            armedAt: 0,
            timer: 0,
        };
        window.addEventListener('scroll', this._onDocumentScroll, { passive: true });
        window.addEventListener('scrollend', this._onDocumentScrollEnd);
        for (const type of ['touchstart', 'touchend', 'touchcancel']) {
            window.addEventListener(type, this._onTouch, { capture: true, passive: true });
        }
        for (const type of ['wheel', 'keydown']) {
            window.addEventListener(type, this._onInput, { capture: true, passive: true });
        }
        this._snap(true);
        // The browser may put the scroll of a page back while it loads: not a tap either.
        this._quiet();
        this._arm();
    }

    /**
     * Makes the document snap to its one pixel, or lets it go.
     *
     * What snaps is where a scroll ends, also the one of a script: `window.scrollTo(0, 0)` of a
     * router leaves the document on its pixel. And a finger that has dragged the page lets it go
     * back there. The tap on the status bar is the one scroll iOS does not snap.
     *
     * The rule is one for the element of the document, the only place the browser reads it for
     * the viewport: the frame writes it there, and puts back what the page had.
     * @private
     * @param {boolean} on
     */
    _snap(on) {
        const state = this._statusBar;
        if (!state || state.snaps === on) return;
        state.snaps = on;

        const root = document.documentElement;
        if (on) {
            state.snapBefore = root.style.scrollSnapType;
            root.style.scrollSnapType = 'y mandatory';
            return;
        }
        root.style.scrollSnapType = state.snapBefore;
        if (root.getAttribute('style') === '') root.removeAttribute('style');
    }

    /**
     * From now on, for a moment, a scroll of the document is not the doing of a tap on the status
     * bar: a finger drags the page, a keyboard moves it, the phone is turned.
     * @private
     */
    _quiet() {
        if (this._statusBar) this._statusBar.quietUntil = performance.now() + SETTLE;
    }

    /**
     * Whether something else than a tap on the status bar is moving the document.
     * @private
     * @returns {boolean}
     */
    _isMoved() {
        const { touches, quietUntil } = this._statusBar;
        return touches > 0 || performance.now() < quietUntil || this._keyboard;
    }

    /**
     * Whether the document is scrolling: it has scrolled, and the browser has not said that this
     * is over. A browser that never says so is given the time the longest scroll takes.
     * @private
     * @returns {boolean}
     */
    _isScrolling() {
        const { scrolling, scrolledAt } = this._statusBar;
        return scrolling && performance.now() - scrolledAt < LONGEST;
    }

    /**
     * Scrolls the document down by its one pixel, once nothing else moves it and its scroll is
     * over: iOS takes the document back to the top for as long as it is on its way there. Until
     * then it looks again: a finger can stay on the screen for long.
     *
     * And it asks what tells the tap from a script: whether a script can scroll the document to
     * zero. Where the browser snaps the scroll of a script, it cannot. Where it can, the two look
     * the same, and the frame takes no scroll for the tap.
     * @private
     */
    _arm() {
        const state = this._statusBar;
        if (!state) return;
        clearTimeout(state.timer);

        const now = performance.now();
        if (this._isMoved() || this._isScrolling()) {
            const scrolls = this._isScrolling() ? state.scrolledAt + LONGEST - now : 0;
            const wait = Math.max(state.quietUntil - now, scrolls, 150) + 50;
            state.timer = setTimeout(() => this._arm(), wait);
            return;
        }
        this._snap(true);
        state.armedAt = now;
        // At once, also where the page asks for a scroll that takes its time.
        if (window.scrollY < 1) window.scrollTo({ top: 1, behavior: 'instant' });
        window.scrollTo({ top: 0, behavior: 'instant' });
        state.held = window.scrollY >= 1;
        if (!state.held) window.scrollTo({ top: 1, behavior: 'instant' });
    }

    /**
     * The document has scrolled. At zero, with nothing else that moves it, the user has tapped
     * the status bar: the content goes to its top, as the document of a page would.
     *
     * A script of the page does not get the document there, a router that sets the scroll of the
     * window back after a change of the view for one: the document snaps to its pixel.
     * @private
     */
    _onStatusBarScroll() {
        const state = this._statusBar;
        if (!state) return;
        const now = performance.now();
        // The document moves under a finger: a drag, and no tap when the finger has gone.
        if (state.touches > 0) state.dragged = true;
        // The tap is the first thing a document at rest does. What follows it is iOS on its way
        // to the top, which takes the document back there until it has arrived.
        const first = !this._isScrolling();
        state.scrolling = true;
        state.scrolledAt = now;
        if (window.scrollY >= 1) return;

        const taken = now - state.armedAt < ECHO;
        if (first && !taken && state.held && !this._isMoved()) {
            // Built by hand: dispatch() of element-js does not say whether a listener has
            // prevented the default.
            const event = new CustomEvent(Events.STATUS_BAR_TAP, { bubbles: true, composed: true, cancelable: true });
            this.dispatchEvent(event);
            if (!event.defaultPrevented) {
                const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                this.scroller?.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
            }
        }
        // Back by the pixel, for the next tap, once this scroll is over.
        clearTimeout(state.timer);
        state.timer = setTimeout(() => this._arm(), 50);
    }

    /**
     * The regions have changed their sizes. Where what scrolls the content got less high, a
     * keyboard has come in or the window got smaller, and the field the user types into may be
     * out of view now.
     * @private
     */
    _syncFocus() {
        const size = this.scroller?.clientHeight ?? 0;
        const less = size < this._scrollerSize;
        this._scrollerSize = size;
        if (less) this._showFocus();
    }

    /**
     * Brings the field the user types into back into view, in the region that scrolls it. A
     * field in a dialog or a popover is in the top layer and in no region: the browser shows it.
     * @private
     */
    _showFocus() {
        const active = activeElement();
        if (!active?.matches?.(TYPED_INTO)) return;

        for (let node = active; node && node !== this; node = node.assignedSlot ?? node.parentNode ?? node.host) {
            if (node === document) return;
            if (node instanceof Element && node.matches(':modal, :popover-open')) return;
        }
        active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
            !this.wide &&
            this.narrowNavigation !== 'bar' &&
            hasSlotted(this, 'navigation') &&
            !this._regionsOf(this.wideOnly).includes('navigation');
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

    /**
     * The edge of a column the user drags: an `el-splitter` at the side that faces the content.
     * Only where the page asks for it, the column is there, and the script runs. Where the
     * navigation is a drawer, it has no edge.
     * @private
     * @param {'navigation'|'aside'} region
     */
    edgeTemplate(region) {
        if (!this._started || !this._resizable().includes(region) || !hasSlotted(this, region)) return '';
        if (region === 'navigation' && this._inDrawer) return '';

        return html`
            <el-splitter
                part="${region}-splitter"
                class="edge edge--${region}"
                data-region="${region}"
                placement="${region === 'aside' ? 'start' : 'end'}"
                label="${region === 'aside' ? this.asideLabel : this.navigationLabel}"
            ></el-splitter>
        `;
    }

    template() {
        const id = this._content()?.id;
        // The stylesheet reads the step from the frame, not from the host: a value it does not
        // know is the default here, and a server writes it as the browser does.
        const step = STEPS.includes(this.wideFrom) ? this.wideFrom : DEFAULT_STEP;
        // The widths the user has set, or the page has kept: the stylesheet reads them from the
        // frame, so a server-rendered frame has them before the script has run.
        const sizes = [
            ['navigation', this.navigationSize],
            ['aside', this.asideSize],
        ]
            .filter(([, size]) => Number(size) > 0)
            .map(([region, size]) => `--_el-app-frame-${region}-size: ${Math.round(Number(size))}px;`)
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
                data-narrow-only="${this._regionsOf(this.narrowOnly).join(' ')}"
                data-wide-only="${this._regionsOf(this.wideOnly).join(' ')}"
                data-narrow-navigation="${this.narrowNavigation === 'bar' ? 'bar' : 'drawer'}"
                data-resizable="${this._resizable().join(' ')}"
                style="${sizes || null}"
            >
                <div part="header" class="header" ?hidden="${!hasSlotted(this, 'header')}">
                    <slot name="header"></slot>
                </div>
                ${this.navigationTemplate()} ${this.edgeTemplate('navigation')}
                <div part="body" ref="body" class="body">
                    <div part="content" ref="content" class="content"><slot></slot></div>
                    ${this.edgeTemplate('aside')}
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
    // The drawer the navigation is in where the frame is narrow, and the edges of its columns.
    defineDrawer();
    defineSplitter();
    defineElement('el-app-frame', AppFrame);
}

export { Events };
