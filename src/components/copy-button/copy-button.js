import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './copy-button.style.js';
import Events from './copy-button.events.js';

/** What `feedbackDuration` is without a value that can be used. */
const FEEDBACK_DURATION = 1500;

/**
 * A copy button: a button that copies a text to the clipboard and says whether that worked. The
 * text is `value`, or the content of another element of the page named by `from`, a code block or
 * an input. After a press the icon shows the outcome for a moment, and a screen reader hears it.
 *
 * @element el-copy-button
 *
 * @fires {CustomEvent<{ value: string }>} copy-button-copy - Fired when the text was copied.
 *   `detail.value` is the text.
 * @fires {CustomEvent<{ error: Error }>} copy-button-error - Fired when the text could not be
 *   copied: there was nothing to copy, the browser has no clipboard for the page, or it refused.
 *   `detail.error` says which.
 *
 * @slot copy-icon - The icon of the button. Unset, two sheets.
 * @slot success-icon - The icon after the text was copied. Unset, a check mark.
 * @slot error-icon - The icon after the text could not be copied. Unset, a cross.
 *
 * @csspart base - The native `<button>`.
 * @csspart icon - The icon, around the slot that is shown.
 * @csspart feedback - The text of the outcome, a live region that is not shown.
 *
 * @property {string} value - The text to copy.
 * @property {string} from - The id of an element whose content is copied in the place of `value`:
 *   its `value` if it has one, its text otherwise.
 * @property {boolean} disabled - Disables the button.
 * @property {'small'|'medium'|'large'} size - The size of the button. Default `'medium'`.
 *   Reflected to the `size` attribute.
 * @property {number} feedbackDuration - How long the outcome is shown, in milliseconds. Default
 *   `1500`.
 * @property {string} label - The accessible name of the button. Default `'Copy'`.
 * @property {string} successLabel - What a screen reader hears after the text was copied. Default
 *   `'Copied'`.
 * @property {string} errorLabel - What a screen reader hears after the text could not be copied.
 *   Default `'Could not copy'`.
 * @property {'idle'|'success'|'error'} status - The outcome that is shown right now, set by the
 *   button. Reflected to the `status` attribute, so that a stylesheet can select it.
 */
export default class CopyButton extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            propertyOptions: {
                // The shared size module selects the host by this attribute.
                size: { reflect: true },
                status: { reflect: true },
            },
        });
    }

    properties() {
        return {
            value: '',
            from: '',
            disabled: false,
            size: 'medium',
            feedbackDuration: FEEDBACK_DURATION,
            label: 'Copy',
            successLabel: 'Copied',
            errorLabel: 'Could not copy',
            status: 'idle',
        };
    }

    disconnected() {
        clearTimeout(this._feedbackTimer);
    }

    events() {
        return {
            '[part~="base"]': {
                click: () => this.copy(),
            },
        };
    }

    /** Focuses the button. */
    focus(options) {
        this.$refs.button?.focus(options);
    }

    /** Removes focus from the button. */
    blur() {
        this.$refs.button?.blur();
    }

    /** Simulates a click on the button. */
    click() {
        this.$refs.button?.click();
    }

    /**
     * Copies the text to the clipboard, shows the outcome and fires `copy-button-copy` or
     * `copy-button-error`. Does nothing while the button is disabled.
     * @returns {Promise<boolean>} Whether the text was copied.
     */
    async copy() {
        if (this.disabled) return false;

        const value = this._text();
        try {
            if (!value) throw new Error('There is nothing to copy');
            // Without a secure context a page has no clipboard.
            if (!navigator.clipboard) throw new Error('The page has no access to the clipboard');
            await navigator.clipboard.writeText(value);
        } catch (error) {
            this._show('error');
            this.dispatch(Events.ERROR, { error });
            return false;
        }

        this._show('success');
        this.dispatch(Events.COPY, { value });
        return true;
    }

    /**
     * The text to copy: from the element that `from` names, or `value`. An element with a `value`
     * of its own, an input or a field, gives that, any other one its text without the white space
     * around it.
     * @private
     * @returns {string}
     */
    _text() {
        if (!this.from) return String(this.value ?? '');

        const source = this.getRootNode().getElementById?.(this.from);
        if (!source) return '';
        if (typeof source.value === 'string' && source.value !== '') return source.value;
        return source.textContent.trim();
    }

    /**
     * Shows an outcome, and takes it back after `feedbackDuration`. An outcome that is shown
     * already starts its time again.
     * @private
     * @param {'success'|'error'} status
     */
    _show(status) {
        const duration = Number(this.feedbackDuration);
        this.status = status;
        clearTimeout(this._feedbackTimer);
        this._feedbackTimer = setTimeout(
            () => {
                this.status = 'idle';
            },
            Number.isFinite(duration) && duration >= 0 ? duration : FEEDBACK_DURATION,
        );
    }

    /** @private */
    iconTemplate() {
        if (this.status === 'success') {
            return html`
                <slot name="success-icon">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </slot>
            `;
        }

        if (this.status === 'error') {
            return html`
                <slot name="error-icon">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </slot>
            `;
        }

        return html`
            <slot name="copy-icon">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <rect x="9" y="9" width="12" height="12" rx="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </slot>
        `;
    }

    template() {
        // The live region is there from the start and empty: a screen reader announces what is
        // written into a region it knows, not a region that appears with its text.
        const feedback = this.status === 'success' ? this.successLabel : this.status === 'error' ? this.errorLabel : '';

        return html`
            <button
                ref="button"
                part="base"
                class="copy-button"
                type="button"
                ?disabled="${this.disabled}"
                aria-label="${this.label}"
            >
                <span part="icon" class="icon" aria-hidden="true">${this.iconTemplate()}</span>
            </button>
            <span part="feedback" class="feedback" role="status">${feedback}</span>
        `;
    }
}

export function define() {
    defineElement('el-copy-button', CopyButton);
}

export { Events };
