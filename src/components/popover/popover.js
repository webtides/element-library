import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './popover.style.js';
import Events from './popover.events.js';
import { followAnchor, placeAtAnchor } from '../../utils/floating.js';

/**
 * A panel that floats next to an anchor: a click on the anchor opens it, a second click, a click
 * beside it or `Escape` closes it. Built on the native popover of the platform, which owns the top
 * layer (nothing clips the panel or lies on top of it), the closing and the return of the focus.
 * The component adds the anchor and the place of the panel: at the side of the anchor that
 * `placement` names, on the other side when there is no room, and never outside the viewport.
 *
 * @element el-popover
 *
 * @fires {CustomEvent} popover-show - Fired when the panel has opened.
 * @fires {CustomEvent} popover-hide - Fired when the panel has closed.
 *
 * @slot - The content of the panel.
 * @slot anchor - The element the panel belongs to and opens from, a button as a rule. It gets
 *   `aria-expanded`.
 *
 * @csspart anchor - Forwarded onto the `anchor` slot.
 * @csspart panel - The floating panel: background, border, radius, elevation, width.
 * @csspart arrow - The arrow that points to the anchor, present only while `arrow` is `true`.
 *
 * @cssstate open - Set while the panel is shown. Style with `:host(:state(open))` or
 *   `el-popover:state(open)` from outside.
 *
 * @property {boolean} open - Whether the panel is shown. Reflected to the `open` attribute.
 * @property {'top'|'top-start'|'top-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'|'right'|'right-start'|'right-end'} placement -
 *   The side of the anchor the panel is placed at, and with `-start` or `-end` the edge of the
 *   anchor it is aligned with. Without room there, the panel goes to the opposite side. Default
 *   `'bottom'`.
 * @property {number} distance - The gap between the anchor and the panel, or the tip of its arrow,
 *   in pixels. Default `8`.
 * @property {boolean} arrow - Whether the panel has an arrow that points to the anchor. Default
 *   `false`.
 */
export default class Popover extends TemplateElement {
    constructor() {
        super({ styles: [style], shadowRender: true, propertyOptions: { open: { reflect: true } } });
    }

    properties() {
        return {
            open: false,
            placement: 'bottom',
            distance: 8,
            arrow: false,
        };
    }

    connected() {
        this._syncAnchor();
        // The watcher does not run for the first value, so a popover that is open from the start is
        // shown here.
        if (this.open) this._applyOpen();
    }

    disconnected() {
        this._stopPositioning();
    }

    afterUpdate() {
        // A new placement or distance, an arrow that came or went, other content in the panel.
        if (this.open) this._position();
    }

    watch() {
        return {
            open: (open) => {
                if (open) this._applyOpen();
                else this._applyClose();
            },
        };
    }

    events() {
        return {
            '[data-anchor]': {
                pointerdown: () => {
                    this._openAtPointerDown = this.open;
                },
                click: (event) => {
                    // The platform closes an open panel when the pointer is released beside it, and
                    // the anchor is beside it. Whether the panel has reported that when the click
                    // arrives is a matter of timing (Chromium reports it after the click), and a
                    // click that found it closed would open it again. So a click of a pointer goes
                    // by what was the case when the pointer went down. A click of the keyboard has
                    // no pointer (`detail` is 0) and goes by what is the case now.
                    const byPointer = event.detail > 0 && this._openAtPointerDown !== undefined;
                    const wasOpen = byPointer ? this._openAtPointerDown : this.open;
                    this._openAtPointerDown = undefined;
                    this.open = !wasOpen;
                },
                slotchange: () => this._syncAnchor(),
            },
            "[part~='panel']": {
                beforetoggle: (event) => {
                    // Still open at this point, so the focus is where it was. Once the panel is
                    // closed, an element that had the focus inside it has lost it to the page.
                    if (event.newState === 'closed') this._focusWasInPanel = this._hasFocusInPanel();
                },
                toggle: (event) => {
                    // The platform has closed the panel: a click beside it, Escape, or another
                    // popover that opened.
                    if (event.newState === 'closed' && this.open) this.open = false;
                },
            },
        };
    }

    /**
     * Opens the panel.
     * @returns {void}
     */
    show() {
        this.open = true;
    }

    /**
     * Closes the panel.
     * @returns {void}
     */
    hide() {
        this.open = false;
    }

    /**
     * Opens the panel when it is closed, and closes it when it is open.
     * @returns {void}
     */
    toggle() {
        this.open = !this.open;
    }

    /**
     * The element the panel is placed at: what is in the `anchor` slot, or the popover itself.
     * @private
     * @returns {Element}
     */
    _anchor() {
        return this.$refs.anchor?.assignedElements({ flatten: true })[0] ?? this;
    }

    /**
     * Tells on the anchor whether the panel is open. Only an anchor that can say so gets the
     * attribute: a button, a link, an element with a role of its own, or a custom element, which
     * may pass it on to the control inside it. On a `<span>` it would be an error.
     * @private
     */
    _syncAnchor() {
        const anchor = this._anchor();
        if (anchor === this) return;
        const canTell =
            anchor.localName.includes('-') || anchor.matches('button, a[href], input[type="button"], [role]');
        if (canTell) anchor.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    }

    /**
     * Whether the focus is in the content of the panel, that is in the popover but not in its anchor.
     * @private
     * @returns {boolean}
     */
    _hasFocusInPanel() {
        // Not `:focus-within`: the popover does not match it for a focus inside its open panel,
        // which is in the top layer.
        const active = this.getRootNode().activeElement;
        if (!active || active === this || !this.contains(active)) return false;
        const anchor = this._anchor();
        return anchor === this || !anchor.contains(active);
    }

    /**
     * Gives the focus back to the anchor when it was in the panel that has just closed. The platform
     * does that for the content of a popover, but the content here is slotted: it belongs to the
     * page and not to the panel, and the focus would be left on nothing.
     * @private
     */
    _restoreFocus() {
        if (!this._focusWasInPanel) return;
        this._focusWasInPanel = false;
        const anchor = this._anchor();
        if (anchor !== this) anchor.focus?.();
    }

    /** @private */
    _applyOpen() {
        const panel = this.$refs.panel;
        if (!panel || !this.isConnected) return;

        if (!panel.matches(':popover-open')) panel.showPopover();
        this._internals.states.add('open');
        this._syncAnchor();
        this._startPositioning();
        this.dispatch(Events.SHOW);
    }

    /** @private */
    _applyClose() {
        const panel = this.$refs.panel;
        if (!panel) return;

        this._stopPositioning();
        if (panel.matches(':popover-open')) panel.hidePopover();
        this._internals.states.delete('open');
        this._syncAnchor();
        this._restoreFocus();
        this.dispatch(Events.HIDE);
    }

    /**
     * Places the panel now, and again whenever the anchor moves: on scroll, on resize, when the
     * anchor or the panel changes its size.
     * @private
     */
    _startPositioning() {
        this._stopPositioning();
        this._stopAutoUpdate = followAnchor(this._anchor(), this.$refs.panel, () => this._position());
    }

    /** @private */
    _stopPositioning() {
        this._stopAutoUpdate?.();
        this._stopAutoUpdate = undefined;
    }

    /** @private */
    async _position() {
        const panel = this.$refs.panel;
        if (!panel || !this.open) return;

        await placeAtAnchor(this._anchor(), panel, {
            placement: this.placement,
            distance: this.distance,
            arrowElement: this.$refs.arrow,
        });
    }

    template() {
        return html`
            <slot part="anchor" name="anchor" ref="anchor" data-anchor></slot>
            <div part="panel" ref="panel" popover="auto">
                <slot></slot>
                ${this.arrow ? html`<div part="arrow" ref="arrow" class="arrow"></div>` : ''}
            </div>
        `;
    }
}

export function define() {
    defineElement('el-popover', Popover);
}

export { Events };
