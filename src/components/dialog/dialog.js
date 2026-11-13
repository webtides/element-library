import { TemplateElement, html, defineElement, spreadAttributes } from '@webtides/element-js';
import style from './dialog.style.js';
import Events from './dialog.events.js';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll.js';
import { afterTransition, nextFrame } from '../../utils/transitions.js';

/**
 * A promise together with the function that resolves it.
 * @returns {{ promise: Promise<void>, resolve: () => void }}
 */
function pending() {
    let resolve;
    const promise = new Promise((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

/**
 * A modal dialog built on the native `<dialog>` element, so the platform owns focus trapping,
 * background `inert`, top-layer rendering and focus restoration. The component adds an animated,
 * cancelable open/close lifecycle and ref-counted body-scroll locking on top, and closes for a
 * `<form method="dialog">` in one of its slots.
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
    /**
     * @param {object} [options] - For a component that extends the dialog: its own `styles`, and
     *   `propertyOptions` for the properties it adds.
     */
    constructor(options = {}) {
        super({
            shadowRender: true,
            styles: [style],
            ...options,
            propertyOptions: { open: { reflect: true }, noHeader: { reflect: true }, ...options.propertyOptions },
        });

        // element-js keeps the stylesheets of an element on its class, and looks them up there
        // without asking whose they are. A component that extends the dialog found the stylesheets
        // of the dialog there, when a dialog was connected first, and never built its own: an
        // el-drawer after an el-dialog was a dialog in the middle of the page. A property of its own
        // on every class makes the lookup stop there. The fields have the same in FormField.
        if (!Object.hasOwn(this.constructor, 'elementStyleSheets')) {
            this.constructor.elementStyleSheets = undefined;
        }

        /**
         * Counts the ways the dialog has set out on. See `_sync()`.
         * @private
         */
        this._run = 0;

        /**
         * Where the dialog is, or is on its way to: shown (`true`) or closed.
         * @private
         */
        this._heading = false;

        /**
         * Whether it is on its way, with a transition still to wait for.
         * @private
         */
        this._moving = false;
    }

    /**
     * The names of the events. A component that extends the dialog fires them under names of its
     * own.
     * @protected
     * @returns {typeof Events}
     */
    get _eventNames() {
        return Events;
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
        // What is in the footer slot right now. A `slotchange` tells of every later change, but the
        // first one can be over before the listener is there: in server-rendered markup the browser
        // fills the slots while it parses.
        const footerSlot = this.$refs.footer?.querySelector('slot');
        if (footerSlot) this._syncFooter(footerSlot);

        // The watcher does not run during initial hydration, so honour a declaratively-open dialog here.
        if (this.open) {
            this._internals.states.add('open');
            this._sync();
        }
    }

    disconnected() {
        // A dialog that leaves the page while it is open: the platform takes it out of the top
        // layer, but the `<dialog>` stays open and the page stays locked. Both are undone here, so
        // that the page scrolls again and the dialog can open as a modal when it comes back.
        // element-js has emptied `$refs` by now; the element is the one `_sync()` kept.
        // Whatever way was under way ends here.
        this._run++;
        this._heading = false;
        const dialog = this._shown;
        if (dialog) {
            dialog.classList.remove('showing');
            this._close(dialog);
            // It was on its way out, and it is out now.
            if (!this.open) this.dispatch(this._eventNames.AFTER_HIDE);
        }
        this._settle();
    }

    watch() {
        return {
            // element-js calls a watcher after the next render, a frame after the change, and once
            // for every change. So what counts is the value `open` has now, not the one of the call.
            open: () => {
                if (this.open) this._internals.states.add('open');
                else this._internals.states.delete('open');
                this._sync();
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
                submit: (event) => this._handleSubmit(event),
            },
        };
    }

    /**
     * Opens the dialog.
     * @returns {Promise<void>} Resolves once the dialog has come to rest. That is after the open
     *   transition as a rule; when a `hide()` overtakes it, it is once the dialog is closed again.
     *   It never rejects.
     */
    show() {
        return this._setOpen(true);
    }

    /**
     * Closes the dialog.
     * @returns {Promise<void>} Resolves once the dialog has come to rest. That is after the close
     *   transition as a rule; when a `show()` overtakes it, it is once the dialog is shown again.
     *   It never rejects.
     */
    hide() {
        return this._setOpen(false);
    }

    /**
     * Requests that the dialog close, emitting its cancelable request-close event. When a listener
     * calls `preventDefault()` the dialog stays open and plays a short deny animation.
     * @param {'close-button' | 'keyboard' | 'overlay'} source - What triggered the request.
     * @returns {void}
     */
    requestClose(source) {
        // element-js's dispatch() swallows the dispatchEvent() return value, so build the cancelable
        // event by hand to read defaultPrevented.
        const event = new CustomEvent(this._eventNames.REQUEST_CLOSE, {
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

    /**
     * Sets `open` and hands out the promise for the moment the dialog is at rest again.
     * @private
     * @param {boolean} open
     * @returns {Promise<void>}
     */
    _setOpen(open) {
        // Outside of the page nothing moves, so there is nothing to wait for.
        if (!this.isConnected) {
            this.open = open;
            return Promise.resolve();
        }
        // The watcher runs a frame later. The promise has to be there before that, whenever the
        // dialog is not where the call wants it. That is not read from `open`: it can have got its
        // value just before, by hand or by a request to close, and the dialog has not moved yet.
        if (this._heading !== open) this._rest ??= pending();
        this.open = open;
        return this._rest?.promise ?? Promise.resolve();
    }

    /**
     * Brings the `<dialog>` to what `open` says, with the transition on the way.
     *
     * Every time the dialog has to turn, it sets out on a new way with a number of its own. A way
     * waits, for two frames and for the transition, and when it goes on it first looks whether a
     * later way has begun. If so it stops: the last value of `open` wins, and no way finishes
     * work that is out of date.
     *
     * `…-after-show` and `…-after-hide` are fired by the way that gets there. A way that is cut
     * short has none: after `…-show` comes `…-after-show` or `…-hide`, after `…-hide` comes
     * `…-after-hide` or `…-show`.
     * @private
     */
    async _sync() {
        const wanted = !!this.open;
        const dialog = this.$refs.dialog;
        if (!dialog) {
            // Not rendered yet, or not in the page. A dialog that is `open` is shown when it
            // connects; until then only a closed one is at rest.
            if (!wanted || !this.isConnected) this._settle();
            return;
        }

        // It is there already, or on its way there. `open` can change twice between two frames.
        if (wanted === this._heading) {
            if (!this._moving) this._settle();
            return;
        }

        const run = ++this._run;
        const overtaken = () => run !== this._run;
        this._heading = wanted;
        this._moving = true;
        // What `show()` and `hide()` hand out: one promise for all the ways until it is at rest.
        this._rest ??= pending();

        const names = this._eventNames;
        if (wanted) {
            this.dispatch(names.SHOW);
            if (!dialog.open) {
                this._shown = dialog;
                this._lockScroll();
                dialog.showModal();
                // The platform has now moved focus inside the dialog; let consumers redirect it.
                this.dispatch(names.INITIAL_FOCUS);

                // The look before it is shown has to be painted, or the transition has no start.
                await nextFrame();
                if (overtaken()) return;
            }
            // Also the way back from a close that was under way: the `<dialog>` is still open then,
            // and the transition turns round where it is.
            dialog.classList.add('showing');
            await afterTransition(dialog);
            if (overtaken()) return;
            this.dispatch(names.AFTER_SHOW);
        } else {
            this.dispatch(names.HIDE);
            // A dialog that has not begun to come in has no way out to wait for.
            const shown = dialog.classList.contains('showing');
            dialog.classList.remove('showing');
            if (shown) {
                await afterTransition(dialog);
                if (overtaken()) return;
            }
            this._close(dialog);
            this.dispatch(names.AFTER_HIDE);
        }

        this._settle();
    }

    /**
     * Closes the `<dialog>` for the platform and gives the page back.
     * @private
     * @param {HTMLDialogElement} dialog
     */
    _close(dialog) {
        if (dialog.open) dialog.close();
        this._shown = undefined;
        this._unlockScroll();
    }

    /**
     * The dialog is at rest, shown or closed: whoever waits for that can go on.
     * @private
     */
    _settle() {
        this._moving = false;
        this._rest?.resolve();
        this._rest = undefined;
    }

    /**
     * Takes the lock on the scrolling of the page, once for this dialog.
     * @private
     */
    _lockScroll() {
        if (this._scrollLocked) return;
        this._scrollLocked = true;
        lockBodyScroll();
    }

    /**
     * Gives the lock back, if this dialog holds it. The lock counts its holders, so a dialog must
     * not give back more than it took.
     * @private
     */
    _unlockScroll() {
        if (!this._scrollLocked) return;
        this._scrollLocked = false;
        unlockBodyScroll();
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

    /**
     * Closes the dialog for a form with `method="dialog"` in one of its slots, as the platform does
     * for a form inside a `<dialog>`. The platform looks for the `<dialog>` above the form in the
     * tree of the form, and a form in a slot is a child of the element, in the page. Its `submit`
     * passes the `<dialog>` all the same, on its way up through the slot.
     * @private
     * @param {SubmitEvent} event
     */
    _handleSubmit(event) {
        const path = event.composedPath();
        const form = path[0];
        if (!(form instanceof HTMLFormElement)) return;
        // The nearest `<dialog>` above the form is the one that closes. One that is inside this
        // one, of the platform or of a component, comes before it on the path.
        if (path.find((node) => node.localName === 'dialog') !== event.currentTarget) return;

        // The button decides before the form. Read from the attributes: a control with the name
        // `method` takes the place of the property of the form.
        const method = event.submitter?.getAttribute('formmethod') ?? form.getAttribute('method');
        if (method?.toLowerCase() !== 'dialog') return;

        // The platform acts once every listener has had the event, those further up included: on
        // the element, on the document. So whether one of them has prevented it is known after that.
        setTimeout(() => {
            if (!event.defaultPrevented) this.open = false;
        });
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
