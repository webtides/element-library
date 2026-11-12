import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './tooltip.style.js';
import Events from './tooltip.events.js';
import { followAnchor, placeAtAnchor } from '../../utils/floating.js';

/** For the ids of the tooltips that have none of their own. */
let count = 0;

/**
 * Whether the element that has the focus shows it, which a browser does for the keyboard and not
 * for a click on a button. The question goes to the innermost element with the focus: a custom
 * element with the focus on a control inside its shadow root does not match `:focus-visible` itself.
 * @returns {boolean}
 */
function focusIsVisible() {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    return !!active?.matches(':focus-visible');
}

/**
 * A short text that explains another element, its anchor. It appears next to the anchor while the
 * pointer is over it or while it has the focus of the keyboard, and `Escape` closes it. The
 * tooltip names its anchor by id with `for`, the way a `<label>` does, and is the description of
 * that element for a screen reader (`aria-describedby`), open or not.
 *
 * The element is a native popover of the platform (`popover="manual"`), which owns the top layer:
 * nothing clips the tooltip or lies on top of it. The component adds the opening and closing and
 * the place: at the side of the anchor that `placement` names, on the other side when there is no
 * room, and never outside the viewport.
 *
 * @element el-tooltip
 *
 * @fires {CustomEvent} tooltip-show - Fired when the tooltip has opened.
 * @fires {CustomEvent} tooltip-hide - Fired when the tooltip has closed.
 *
 * @slot - The text of the tooltip.
 *
 * @csspart body - The surface of the tooltip: background, text colour, padding, radius.
 * @csspart arrow - The arrow that points to the anchor, present only while `arrow` is `true`.
 *
 * @cssstate open - Set while the tooltip is shown. Style with `:host(:state(open))` or
 *   `el-tooltip:state(open)` from outside.
 *
 * @property {string} for - The id of the anchor: the element the tooltip explains and opens from.
 *   It is looked up in the document or the shadow root the tooltip is in.
 * @property {boolean} open - Whether the tooltip is shown. Reflected to the `open` attribute.
 * @property {'top'|'top-start'|'top-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'|'right'|'right-start'|'right-end'} placement -
 *   The side of the anchor the tooltip is placed at, and with `-start` or `-end` the edge of the
 *   anchor it is aligned with. Without room there, the tooltip goes to the opposite side. Default
 *   `'top'`.
 * @property {number} distance - The gap between the anchor and the tooltip, or the tip of its
 *   arrow, in pixels. Default `8`.
 * @property {number} showDelay - How long the pointer has to rest on the anchor before the tooltip
 *   opens, in milliseconds. Default `150`. The focus of the keyboard opens it at once.
 * @property {number} hideDelay - How long the tooltip stays after the pointer has left, in
 *   milliseconds. Default `0`.
 * @property {boolean} arrow - Whether the tooltip has an arrow that points to the anchor. Default
 *   `false`.
 * @property {boolean} disabled - Takes the pointer and the focus out of it: the tooltip no longer
 *   opens or closes for them, only for a script and for `Escape`. A tooltip that is open when it
 *   becomes disabled closes. It stays the description of its anchor. Default `false`.
 */
export default class Tooltip extends TemplateElement {
    constructor() {
        super({ styles: [style], shadowRender: true, propertyOptions: { open: { reflect: true } } });

        /**
         * Why the tooltip is wanted right now: the pointer is over the `anchor` or over the
         * `tooltip`, or the anchor has the `focus` of the keyboard.
         * @private
         * @type {Set<'anchor' | 'tooltip' | 'focus'>}
         */
        this._reasons = new Set();
    }

    properties() {
        return {
            for: '',
            open: false,
            placement: 'top',
            distance: 8,
            showDelay: 150,
            hideDelay: 0,
            arrow: false,
            disabled: false,
        };
    }

    connected() {
        this._attach();
        // The watcher does not run for the first value, so a tooltip that is open from the start is
        // shown here.
        if (this.open) this._applyOpen();
    }

    disconnected() {
        // A tooltip that leaves the page is closed, and stays closed when it comes back: what
        // opened it, a pointer or the focus on its anchor, is not known to be there any more.
        this._detach();
        clearTimeout(this._timer);
        this._reasons.clear();
        this._applyClose();
        if (this.open) this.open = false;
    }

    afterUpdate() {
        // A new placement or distance, an arrow that came or went.
        if (this.open) this._position();
    }

    watch() {
        return {
            open: (open) => {
                if (open) this._applyOpen();
                else this._applyClose();
            },
            for: () => {
                if (!this.isConnected) return;
                // What opened the tooltip, a pointer or the focus, was on the anchor it had.
                this._dismiss();
                this._attach();
            },
            disabled: (disabled) => {
                if (disabled) this._dismiss();
            },
        };
    }

    /**
     * Opens the tooltip. A tooltip without an anchor in the page stays closed.
     * @returns {void}
     */
    show() {
        this.open = true;
    }

    /**
     * Closes the tooltip.
     * @returns {void}
     */
    hide() {
        this.open = false;
    }

    /**
     * Makes the element what a tooltip is to the platform: a popover that only a script opens and
     * closes, with the role of a tooltip and an id by which its anchor can name it.
     * @private
     */
    _prepare() {
        if (!this.hasAttribute('popover')) this.setAttribute('popover', 'manual');
        if (!this.id) this.id = `el-tooltip-${++count}`;
        this._internals.role = 'tooltip';
    }

    /**
     * Looks the anchor up and binds the tooltip to it: the anchor is described by the tooltip, and
     * the pointer and the focus on it open and close the tooltip. The pointer on the tooltip itself
     * counts as well, so that it can be moved onto the text.
     * @private
     */
    _attach() {
        this._prepare();
        this._detach();

        const id = String(this.for ?? '');
        const anchor = id ? (this.getRootNode().getElementById?.(id) ?? null) : null;
        if (!anchor) {
            // Nothing to be placed at.
            if (this.open) this.open = false;
            return;
        }

        this._anchor = anchor;
        this._describe(anchor, true);

        this._anchorListeners = new AbortController();
        const options = { signal: this._anchorListeners.signal };
        for (const target of [anchor, this]) {
            target.addEventListener('pointerenter', (event) => this._onPointerEnter(event), options);
            target.addEventListener('pointerleave', (event) => this._onPointerLeave(event), options);
        }
        anchor.addEventListener('focusin', () => this._onFocusIn(), options);
        anchor.addEventListener('focusout', () => this._onFocusOut(), options);
        this.addEventListener('toggle', (event) => this._onToggle(event), options);
    }

    /** @private */
    _detach() {
        this._anchorListeners?.abort();
        this._anchorListeners = undefined;
        if (this._anchor) this._describe(this._anchor, false);
        this._anchor = undefined;
    }

    /**
     * Adds the id of the tooltip to the `aria-describedby` of its anchor, or takes it away again.
     * What else the anchor is described by stays.
     * @private
     * @param {Element} anchor
     * @param {boolean} described
     */
    _describe(anchor, described) {
        const others = (anchor.getAttribute('aria-describedby') ?? '')
            .split(/\s+/)
            .filter((id) => id && id !== this.id);
        const ids = described ? [...others, this.id] : others;
        if (ids.length > 0) anchor.setAttribute('aria-describedby', ids.join(' '));
        else anchor.removeAttribute('aria-describedby');
    }

    /** @private */
    _onPointerEnter(event) {
        // A finger has no hover: it would open the tooltip together with the press on the anchor.
        if (event.pointerType === 'touch') return;
        this._reasons.add(event.currentTarget === this ? 'tooltip' : 'anchor');
        this._schedule(this.showDelay);
    }

    /** @private */
    _onPointerLeave(event) {
        this._reasons.delete(event.currentTarget === this ? 'tooltip' : 'anchor');
        this._schedule(this.hideDelay);
    }

    /** @private */
    _onFocusIn() {
        // The focus of the keyboard only. A button that was clicked keeps the focus, and the
        // tooltip would stay open after the pointer has left.
        if (!focusIsVisible()) return;
        this._reasons.add('focus');
        this._schedule(0);
    }

    /** @private */
    _onFocusOut() {
        this._reasons.delete('focus');
        this._schedule(0);
    }

    /**
     * The platform has opened or closed the popover, by `showPopover()` or `hidePopover()` on the
     * element.
     * @private
     */
    _onToggle(event) {
        const open = event.newState === 'open';
        if (open !== this.open) this.open = open;
    }

    /** @private */
    _onKeyDown(event) {
        if (event.key !== 'Escape' || event.isComposing) return;
        // Escape closes one thing at a time: a dialog or a popover around the anchor stays open.
        event.preventDefault();
        this._dismiss();
    }

    /**
     * Opens or closes the tooltip after a delay, by what is the case then. The decision is always
     * taken in a task of its own, also without a delay: a pointer that goes from the anchor onto
     * the tooltip leaves the one before it enters the other.
     * @private
     * @param {number} delay - In milliseconds.
     */
    _schedule(delay) {
        clearTimeout(this._timer);
        this._timer = setTimeout(
            () => {
                // A disabled tooltip is left to the script that opens and closes it.
                if (this.disabled) return;
                const wanted = this._reasons.size > 0;
                if (wanted !== this.open) this.open = wanted;
            },
            Math.max(0, Number(delay) || 0),
        );
    }

    /**
     * Closes the tooltip now. It opens again when the pointer or the focus comes anew, not for the
     * one that is still on the anchor.
     * @private
     */
    _dismiss() {
        clearTimeout(this._timer);
        this._reasons.clear();
        this.open = false;
    }

    /** @private */
    _applyOpen() {
        if (!this.isConnected) return;

        // An anchor that came into the page after the tooltip.
        if (!this._anchor) this._attach();
        if (!this._anchor) {
            this.open = false;
            return;
        }

        if (!this.matches(':popover-open')) this.showPopover();
        this._internals.states.add('open');
        this._startPositioning();

        // On the document, before anything else sees the key: the focus need not be on the anchor.
        this._openListeners?.abort();
        this._openListeners = new AbortController();
        document.addEventListener('keydown', (event) => this._onKeyDown(event), {
            capture: true,
            signal: this._openListeners.signal,
        });

        this.dispatch(Events.SHOW);
    }

    /** @private */
    _applyClose() {
        // Not shown: nothing to undo and nothing to report.
        if (!this._internals.states.has('open')) return;

        this._stopPositioning();
        this._openListeners?.abort();
        this._openListeners = undefined;
        if (this.matches(':popover-open')) this.hidePopover();
        this._internals.states.delete('open');
        this.dispatch(Events.HIDE);
    }

    /**
     * Places the tooltip now, and again whenever the anchor moves: on scroll, on resize, when the
     * anchor or the tooltip changes its size.
     * @private
     */
    _startPositioning() {
        this._stopPositioning();
        this._stopFollowing = followAnchor(this._anchor, this, () => this._position());
    }

    /** @private */
    _stopPositioning() {
        this._stopFollowing?.();
        this._stopFollowing = undefined;
    }

    /** @private */
    async _position() {
        if (!this.open || !this._anchor) return;

        const { gap } = await placeAtAnchor(this._anchor, this, {
            placement: this.placement,
            distance: this.distance,
            arrowElement: this.$refs?.arrow,
        });

        // The stylesheet lets the surface reach across the gap to the anchor, for the pointer.
        if (gap !== this._gap) {
            this._gap = gap;
            this.style.setProperty('--_el-tooltip-gap', `${gap}px`);
        }
    }

    template() {
        return html`
            <div part="body" class="body">
                <slot></slot>
                ${this.arrow ? html`<div part="arrow" ref="arrow" class="arrow"></div>` : ''}
            </div>
        `;
    }
}

export function define() {
    defineElement('el-tooltip', Tooltip);
}

export { Events };
