import { TemplateElement, html, defineElement } from '@webtides/element-js';
import style from './notification.style.js';
import Events from './notification.events.js';

/**
 * Resolves after two animation frames, long enough for an enter starting-style to be committed.
 * (Mirrors `src/utils/transitions.js` from the dialog work; inlined here to keep this an
 * independent, main-based component.)
 */
function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** Resolves once `element`'s running CSS transition finishes — or immediately when none is set. */
function afterTransition(element) {
    return new Promise((resolve) => {
        const styles = getComputedStyle(element);
        const seconds = (value) => Math.max(0, ...value.split(',').map((part) => parseFloat(part) || 0));
        const duration = seconds(styles.transitionDuration) + seconds(styles.transitionDelay);
        if (duration === 0) {
            resolve();
            return;
        }
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            element.removeEventListener('transitionend', onEnd);
            resolve();
        };
        const onEnd = (event) => {
            if (event.target === element) finish();
        };
        element.addEventListener('transitionend', onEnd);
        setTimeout(finish, duration * 1000 + 50);
    });
}

/**
 * Lazily-created, shared toast container pinned to the top-right of the viewport. Toasts append
 * themselves to it; it is removed again once the last toast leaves.
 */
let toastStack = null;

function getToastStack() {
    if (!toastStack) {
        toastStack = document.createElement('div');
        toastStack.className = 'el-toast-stack';
        Object.assign(toastStack.style, {
            position: 'fixed',
            top: '1rem',
            insetInlineEnd: '1rem',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            pointerEvents: 'none',
        });
        document.body.append(toastStack);
    }
    return toastStack;
}

/**
 * A notification / alert that can be shown inline or as a transient toast. Built for both feedback
 * after an action and inline status messages. Semantic variants, an optional close button, and
 * optional auto-dismiss. API modelled on Shoelace's `<sl-alert>`.
 *
 * The host is exposed as an ARIA live region — `role="alert"` (assertive) for `danger` / `warning`
 * variants, `role="status"` (polite) otherwise — so toasts are announced when they appear.
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
            duration: Infinity,
        };
    }

    connected() {
        // Expose the host as a live region so toasts are announced. Assertive for danger/warning.
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
                // Pause the auto-dismiss countdown while the user is interacting with the toast.
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

    /**
     * Moves the notification into the shared top-right toast stack and shows it.
     * @returns {Promise<void>} Resolves after the open transition has finished.
     */
    toast() {
        getToastStack().append(this);
        return this.show();
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
        this._removeFromToastStack();
    }

    /** @private */
    _startAutoHide() {
        clearTimeout(this._autoHideTimer);
        if (this.open && Number.isFinite(this.duration)) {
            this._autoHideTimer = setTimeout(() => this.hide(), this.duration);
        }
    }

    /** @private */
    _removeFromToastStack() {
        if (toastStack && this.parentElement === toastStack) {
            this.remove();
            if (toastStack.childElementCount === 0) {
                toastStack.remove();
                toastStack = null;
            }
        }
    }

    /** @private */
    _once(name) {
        return new Promise((resolve) => this.addEventListener(name, () => resolve(), { once: true }));
    }

    /** @private */
    closeButtonTemplate() {
        return html`
            <button part="close-button" type="button" class="close-button" aria-label="Close" data-close>
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
        const paths = {
            success: html`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>`,
            danger: html`<circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>`,
            warning: html`<path
                    d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                ></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>`,
        };
        const info = html`<circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>`;
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
                ${paths[this.variant] ?? info}
            </svg>
        `;
    }
}

export function define() {
    defineElement('el-notification', Notification);
}

export { Events };
