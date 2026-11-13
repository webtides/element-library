import { TemplateElement, defineElement, html } from '@webtides/element-js';
import Notification, { define as defineNotification } from '../notification/notification.js';
import style from './toast.style.js';

/** How long a toast stays, in milliseconds, unless it says otherwise. */
const DURATION = 5000;

/**
 * The region of a page where toasts appear: short messages about something that has just
 * happened, which come by themselves and leave by themselves. A toast is an `el-notification`;
 * the region gives it its place at an edge of the viewport, puts several of them into a stack,
 * and lets no more than `max` of them show at once. The rest wait for their turn.
 *
 * `toast()` shows a message, on the element or as the function of the same name that this module
 * exports. The function uses the first `el-toast` of the page and adds one when there is none.
 *
 * While it has toasts the element is a native popover of the platform (`popover="manual"`), which
 * owns the top layer: nothing of the page lies on top of a toast. Without toasts it is not shown.
 *
 * @element el-toast
 *
 * @slot - The toasts, `el-notification` elements. `toast()` puts them here.
 *
 * @csspart base - The stack of the toasts. It is the landmark with the name in `label`.
 *
 * @cssproperty --el-toast-inset - The distance of the stack from the edges of the viewport. Unset,
 *   it is `--el-space-4`.
 *
 * @property {'top-start'|'top'|'top-end'|'bottom-start'|'bottom'|'bottom-end'} placement - The
 *   edge of the viewport the toasts appear at, and with `-start` or `-end` the corner. Default
 *   `'top-end'`. Reflected to the `placement` attribute.
 * @property {number} max - How many toasts show at once. The ones beyond that wait until a place
 *   is free. Default `Infinity`: no limit.
 * @property {string} label - The name of the landmark. Default `'Notifications'`.
 */
export default class Toast extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet selects the host by this attribute.
            propertyOptions: {
                placement: { reflect: true },
            },
        });

        /**
         * The toasts that wait for a place, in the order they came.
         * @private
         * @type {HTMLElement[]}
         */
        this._waiting = [];
    }

    properties() {
        return {
            placement: 'top-end',
            max: Infinity,
            label: 'Notifications',
        };
    }

    connected() {
        // Toasts that are in the markup of the page, and toasts that came before the region was
        // in the page.
        this._syncTopLayer();
    }

    watch() {
        return {
            max: () => this._showNext(),
        };
    }

    events() {
        return {
            // What happens to a toast reaches the stack through the slot the toast is in.
            "[part~='base']": {
                'notification-after-hide': (event) => this._onAfterHide(event),
                // A toast that the page has put in or taken out without `toast()`: the region
                // may have to show or hide itself, and a place may be free.
                slotchange: () => {
                    this._syncTopLayer();
                    this._showNext();
                },
            },
        };
    }

    /**
     * Shows a message as a toast. A text, or a node for a message with markup, becomes a
     * notification that can be closed and leaves by itself after five seconds; the options change
     * that. An `el-notification` is shown as it is, with the options on top.
     *
     * A toast beyond `max` waits and is shown when a place is free.
     * @param {string | Node} message - The text, the content, or an `el-notification`.
     * @param {object} [options]
     * @param {'default'|'primary'|'success'|'neutral'|'warning'|'danger'} [options.variant] - The
     *   variant of the notification.
     * @param {number} [options.duration] - How long the toast stays, in milliseconds. `Infinity`
     *   keeps it until it is closed.
     * @param {boolean} [options.closable] - Whether the toast has a close button.
     * @param {string} [options.closeLabel] - The accessible label of the close button.
     * @returns {HTMLElement} The `el-notification`: `hide()` takes it away early, and it fires
     *   the events of a notification.
     */
    toast(message, options = {}) {
        let entry = message;
        if (!(message instanceof Notification)) {
            defineNotification();
            entry = Object.assign(document.createElement('el-notification'), { duration: DURATION, closable: true });
            entry.append(message);
        }
        for (const name of ['variant', 'duration', 'closable', 'closeLabel']) {
            if (options[name] !== undefined) entry[name] = options[name];
        }

        this._waiting.push(entry);
        this._showNext();
        return entry;
    }

    /**
     * Shows the toasts that wait, as long as there is a place for them.
     * @private
     */
    _showNext() {
        const max = Number(this.max) >= 1 ? Number(this.max) : Infinity;
        while (this._waiting.length > 0 && this.childElementCount < max) {
            const entry = this._waiting.shift();
            this.append(entry);
            this._syncTopLayer({ toFront: true });
            entry.show();
        }
    }

    /**
     * Has the region in the top layer while it has toasts, and out of it without: an empty region
     * is nothing to see and no landmark to stop at.
     *
     * The top layer is a stack: what is opened later lies above. A region that is shown already
     * would have its next toast below a dialog that was opened in the meantime, so a new toast
     * takes the region out and puts it in again, which is on top. Both happen before the browser
     * paints.
     * @private
     * @param {object} [options]
     * @param {boolean} [options.toFront] - Whether a region that is shown comes to the front.
     */
    _syncTopLayer({ toFront = false } = {}) {
        if (!this.isConnected) return;
        if (!this.hasAttribute('popover')) this.setAttribute('popover', 'manual');

        const wanted = this.childElementCount > 0;
        const shown = this.matches(':popover-open');
        if (shown && (!wanted || toFront)) this.hidePopover();
        if (wanted && (!shown || toFront)) this.showPopover();
    }

    /**
     * A toast has left: it goes out of the page, and the next one that waits gets its place.
     * @private
     */
    _onAfterHide(event) {
        const entry = event.target;
        if (entry.parentElement !== this) return;

        entry.remove();
        this._syncTopLayer();
        this._showNext();
    }

    template() {
        return html`<div part="base" class="stack" role="region" aria-label="${this.label}"><slot></slot></div>`;
    }
}

export function define() {
    defineElement('el-toast', Toast);
}

/**
 * Shows a message as a toast in the region of the page: the first `el-toast` of the document. A
 * page without one gets one at the end of its body, with the defaults. For the arguments see
 * `toast()` of the element.
 * @param {string | Node} message
 * @param {object} [options]
 * @returns {HTMLElement} The `el-notification`.
 */
export function toast(message, options = {}) {
    define();
    const region = document.querySelector('el-toast') ?? document.body.appendChild(document.createElement('el-toast'));
    return region.toast(message, options);
}
