import { TemplateElement, html, defineElement } from '@webtides/element-js';
import style from './notification.style.js';
import Events from './notification.events.js';
import { afterTransition, nextFrame } from '../../utils/transitions.js';

/**
 * A notification / alert: feedback after an action, or a status message in the page. Semantic
 * variants, an optional close button, and optional auto-dismiss. It is shown where it stands;
 * `el-toast` shows it as a toast, at an edge of the viewport.
 *
 * The host is exposed as an ARIA live region — `role="alert"` (assertive) for `danger` / `warning`
 * variants, `role="status"` (polite) otherwise — so it is announced when it appears.
 *
 * @element el-notification
 *
 * @fires {CustomEvent} notification-show - Fired when the notification starts to open.
 * @fires {CustomEvent} notification-after-show - Fired once the open transition has finished.
 * @fires {CustomEvent} notification-hide - Fired when the notification starts to close.
 * @fires {CustomEvent} notification-after-hide - Fired once the close transition has finished.
 *
 * @slot - The notification's message.
 * @slot icon - A leading icon. Falls back to a variant-appropriate default icon.
 *
 * @csspart base - The animated outer wrapper.
 * @csspart panel - The visual surface (background, border, variant accent).
 * @csspart icon - The leading icon container.
 * @csspart message - The message wrapper around the default slot.
 * @csspart close-button - The optional close button.
 *
 * @cssstate open - Set while the notification is shown.
 *
 * @property {boolean} open - Whether the notification is shown. Reflected to the `open` attribute.
 * @property {'default'|'primary'|'success'|'neutral'|'warning'|'danger'} variant - Visual + semantic
 *   variant. Default `'default'`.
 * @property {boolean} closable - Whether to render a close button. Default `false`.
 * @property {string} closeLabel - Accessible label for the close button. Default `'Close'`.
 * @property {number} duration - Auto-dismiss delay in milliseconds; `Infinity` (default) never
 *   auto-dismisses. The countdown pauses while the pointer or focus is inside the notification.
 */
export default class Notification extends TemplateElement {
    constructor() {
        super({ shadowRender: true, styles: [style], propertyOptions: { open: { reflect: true } } });
    }

    properties() {
        return {
            open: false,
            variant: 'default',
            closable: false,
            closeLabel: 'Close',
            duration: Infinity,
        };
    }

    connected() {
        // Expose the host as a live region so it is announced. Assertive for danger/warning.
        const assertive = this.variant === 'danger' || this.variant === 'warning';
        this.setAttribute('role', assertive ? 'alert' : 'status');
        this.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
        this.setAttribute('aria-atomic', 'true');

        if (this.open) {
            this._internals.states.add('open');
            this._applyOpen();
        } else {
            this.$refs.base?.classList.add('is-hidden');
        }
    }

    disconnected() {
        clearTimeout(this._autoHideTimer);
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
            '[data-close]': {
                click: () => this.hide(),
            },
            "[part~='base']": {
                // Pause the auto-dismiss countdown while the user is interacting with it.
                mouseenter: () => clearTimeout(this._autoHideTimer),
                mouseleave: () => this._startAutoHide(),
                focusin: () => clearTimeout(this._autoHideTimer),
                focusout: () => this._startAutoHide(),
            },
        };
    }

    /**
     * Shows the notification.
     * @returns {Promise<void>} Resolves after the open transition has finished.
     */
    show() {
        if (this.open) return Promise.resolve();
        const done = this._once(Events.AFTER_SHOW);
        this.open = true;
        return done;
    }

    /**
     * Hides the notification.
     * @returns {Promise<void>} Resolves after the close transition has finished.
     */
    hide() {
        if (!this.open) return Promise.resolve();
        const done = this._once(Events.AFTER_HIDE);
        this.open = false;
        return done;
    }

    /** @private */
    async _applyOpen() {
        const base = this.$refs.base;
        if (!base) return;

        this._internals.states.add('open');
        this.dispatch(Events.SHOW);

        base.classList.remove('is-hidden');
        // Commit the hidden start state before transitioning in.
        void base.offsetWidth;
        base.classList.add('showing');
        await afterTransition(base);

        this.dispatch(Events.AFTER_SHOW);
        this._startAutoHide();
    }

    /** @private */
    async _applyClose() {
        const base = this.$refs.base;
        if (!base) return;

        clearTimeout(this._autoHideTimer);
        this.dispatch(Events.HIDE);

        base.classList.remove('showing');
        await afterTransition(base);
        base.classList.add('is-hidden');

        this._internals.states.delete('open');
        this.dispatch(Events.AFTER_HIDE);
    }

    /** @private */
    _startAutoHide() {
        clearTimeout(this._autoHideTimer);
        if (this.open && Number.isFinite(this.duration)) {
            this._autoHideTimer = setTimeout(() => this.hide(), this.duration);
        }
    }

    /** @private */
    _once(name) {
        return new Promise((resolve) => this.addEventListener(name, () => resolve(), { once: true }));
    }

    /** @private */
    closeButtonTemplate() {
        return html`
            <button part="close-button" type="button" class="close-button" aria-label="${this.closeLabel}" data-close>
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
        `;
    }

    template() {
        return html`
            <div part="base" ref="base">
                <div part="panel" class="panel notification--${this.variant}">
                    <span part="icon" class="icon"><slot name="icon">${this.variantIconTemplate()}</slot></span>
                    <div part="message" class="message"><slot></slot></div>
                    ${this.closable ? this.closeButtonTemplate() : ''}
                </div>
            </div>
        `;
    }

    /** @private */
    variantIconTemplate() {
        // Every variant is one complete <svg> template. A template result nested inside the <svg> is
        // parsed on its own, which puts its children into the HTML namespace when the element renders
        // in the browser, so nothing would be drawn.
        if (this.variant === 'success') {
            return html`
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
        }
        if (this.variant === 'danger') {
            return html`
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;
        }
        if (this.variant === 'warning') {
            return html`
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path
                        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    ></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            `;
        }
        return html`
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `;
    }
}

export function define() {
    defineElement('el-notification', Notification);
}

export { Events };
