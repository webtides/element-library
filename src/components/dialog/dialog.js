import { TemplateElement, html, defineElement, spreadAttributes } from '@webtides/element-js';
import style from './dialog.style.js';
import Events from './dialog.events.js';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll.js';
import { afterTransition, nextFrame } from '../../utils/transitions.js';

/**
 * A modal dialog built on the native `<dialog>` element, so the platform owns focus trapping,
 * background `inert`, top-layer rendering, focus restoration and `<form method="dialog">`
 * auto-close. The component adds an animated, cancelable open/close lifecycle and ref-counted
 * body-scroll locking on top. API modelled on Shoelace's `<sl-dialog>`.
 *
 * @element el-dialog
 *
 * @fires {CustomEvent} dialog-show - Fired when the dialog starts to open.
 * @fires {CustomEvent} dialog-after-show - Fired once the open transition has finished.
 * @fires {CustomEvent} dialog-hide - Fired when the dialog starts to close.
 * @fires {CustomEvent} dialog-after-hide - Fired once the close transition has finished.
 * @fires {CustomEvent} dialog-initial-focus - Fired after the dialog has been opened and the
 *   platform has moved focus inside it. Cancelable: call `preventDefault()` to take over focus.
 * @fires {CustomEvent<{ source: 'close-button' | 'keyboard' | 'overlay' }>} dialog-request-close -
 *   Fired before the dialog closes in response to the close button, `Escape`, or an overlay
 *   click. Cancelable: call `preventDefault()` to keep the dialog open.
 *
 * @slot - The dialog's main content (body).
 * @slot label - The dialog's title. Takes precedence over the `label` attribute.
 * @slot header-actions - Optional controls rendered in the header, before the close button.
 * @slot footer - Footer content, typically action buttons. The footer collapses when empty.
 *
 * @csspart base - The native `<dialog>` element — the panel surface (background, border, radius,
 *   elevation). The overlay is its `::backdrop` pseudo-element.
 * @csspart header - The header row wrapping the title, header actions and close button.
 * @csspart title - The title heading.
 * @csspart header-actions - The container for the `header-actions` slot.
 * @csspart close-button - The built-in close button.
 * @csspart body - The scrollable body wrapping the default slot.
 * @csspart footer - The footer wrapping the `footer` slot.
 *
 * @cssstate open - Set while the dialog is open. Style with `:host(:state(open))` or
 *   `el-dialog:state(open)` from outside.
 *
 * @property {boolean} open - Whether the dialog is open. Reflected to the `open` attribute.
 * @property {string} label - The dialog's title (used when the `label` slot is empty); also the
 *   accessible name when `no-header` is set.
 * @property {boolean} noHeader - Removes the header (title and built-in close button). Provide
 *   your own dismissal when set. Reflected to the `no-header` attribute.
 * @property {string} closeLabel - Accessible label for the built-in close button. Default `'Close'`.
 */
export default class Dialog extends TemplateElement {
    constructor() {
        super({
            shadowRender: true,
            styles: [style],
            propertyOptions: { open: { reflect: true }, noHeader: { reflect: true } },
        });
    }

    properties() {
        return {
            open: false,
            label: '',
            noHeader: false,
            closeLabel: 'Close',
        };
    }

    connected() {
        // The watcher does not run during initial hydration, so honour a declaratively-open dialog here.
        if (this.open) {
            this._internals.states.add('open');
            this._applyOpen();
        }
    }

    disconnected() {
        // Release the scroll lock we took if the dialog is torn down while open.
        if (this.$refs.dialog?.open) {
            unlockBodyScroll();
        }
    }

    watch() {
        return {
            open: (open) => {
                if (open) {
                    this._internals.states.add('open');
                    this._applyOpen();
                } else {
                    this._internals.states.delete('open');
                    this._applyClose();
                }
            },
        };
    }

    events() {
        return {
            '[data-dialog-close]': {
                click: () => this.requestClose('close-button'),
            },
            "slot[name='footer']": {
                slotchange: (event) => this._syncFooter(event.target),
            },
            "[part~='base']": {
                // The UA fires `cancel` on Escape; route it through our cancelable close flow.
                cancel: (event) => {
                    event.preventDefault();
                    this.requestClose('keyboard');
                },
                click: (event) => this._handleOverlayClick(event),
            },
        };
    }

    /**
     * Opens the dialog.
     * @returns {Promise<void>} Resolves after the open transition has finished.
     */
    show() {
        if (this.open) return Promise.resolve();
        const done = this._once(Events.AFTER_SHOW);
        this.open = true;
        return done;
    }

    /**
     * Closes the dialog.
     * @returns {Promise<void>} Resolves after the close transition has finished.
     */
    hide() {
        if (!this.open) return Promise.resolve();
        const done = this._once(Events.AFTER_HIDE);
        this.open = false;
        return done;
    }

    /**
     * Requests that the dialog close, emitting the cancelable `dialog-request-close` event. When a
     * listener calls `preventDefault()` the dialog stays open and plays a short deny animation.
     * @param {'close-button' | 'keyboard' | 'overlay'} source - What triggered the request.
     * @returns {void}
     */
    requestClose(source) {
        // element-js's dispatch() swallows the dispatchEvent() return value, so build the cancelable
        // event by hand to read defaultPrevented.
        const event = new CustomEvent(Events.REQUEST_CLOSE, {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: { source },
        });
        this.dispatchEvent(event);

        if (event.defaultPrevented) {
            this._denyClose();
            return;
        }
        this.open = false;
    }

    /** @private */
    async _applyOpen() {
        const dialog = this.$refs.dialog;
        if (!dialog || dialog.open) return;

        this.dispatch(Events.SHOW);
        lockBodyScroll();
        dialog.showModal();
        // The platform has now moved focus inside the dialog; let consumers redirect it.
        this.dispatch(Events.INITIAL_FOCUS);

        await nextFrame();
        dialog.classList.add('showing');
        await afterTransition(dialog);
        this.dispatch(Events.AFTER_SHOW);
    }

    /** @private */
    async _applyClose() {
        const dialog = this.$refs.dialog;
        if (!dialog || !dialog.open) return;

        this.dispatch(Events.HIDE);
        dialog.classList.remove('showing');
        await afterTransition(dialog);
        dialog.close();
        unlockBodyScroll();
        this.dispatch(Events.AFTER_HIDE);
    }

    /** @private */
    _handleOverlayClick(event) {
        const dialog = this.$refs.dialog;
        if (event.target !== dialog) return;
        // A click whose target is the dialog itself is either the backdrop or the element's own
        // padding. Treat it as an overlay click only when it lands outside the panel box.
        const rect = dialog.getBoundingClientRect();
        const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
        if (!inside) this.requestClose('overlay');
    }

    /** @private */
    _denyClose() {
        const dialog = this.$refs.dialog;
        if (!dialog?.animate) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        dialog.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], {
            duration: 150,
            easing: 'ease',
        });
    }

    /** @private */
    _syncFooter(slot) {
        const hasContent = slot
            .assignedNodes({ flatten: true })
            .some((node) => node.nodeType === Node.ELEMENT_NODE || node.textContent.trim() !== '');
        this.$refs.footer?.classList.toggle('is-empty', !hasContent);
    }

    /** @private */
    _once(name) {
        return new Promise((resolve) => this.addEventListener(name, () => resolve(), { once: true }));
    }

    /** @private */
    headerTemplate() {
        return html`
            <div part="header">
                <h2 part="title" id="title"><slot name="label">${this.label}</slot></h2>
                <span part="header-actions"><slot name="header-actions"></slot></span>
                <button part="close-button" type="button" aria-label="${this.closeLabel}" data-dialog-close>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    }

    template() {
        const labelling = this.noHeader ? { 'aria-label': this.label || undefined } : { 'aria-labelledby': 'title' };

        return html`
            <dialog ref="dialog" part="base" ${spreadAttributes(labelling)}>
                ${this.noHeader ? '' : this.headerTemplate()}
                <div part="body"><slot></slot></div>
                <div part="footer" ref="footer" class="is-empty"><slot name="footer"></slot></div>
            </dialog>
        `;
    }
}

export function define() {
    defineElement('el-dialog', Dialog);
}

export { Events };
