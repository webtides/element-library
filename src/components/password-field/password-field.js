import { html, defineElement } from '@webtides/element-js';
import InputField from '../input-field/input-field.js';
import style from './password-field.style.js';

/**
 * A password input with an optional show/hide reveal toggle. Extends `InputField` (and therefore
 * `FormField`), inheriting the label / help / error / validation surface; it pins the input `type`
 * to `password` and flips it to `text` while revealed.
 *
 * @element el-password-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the input's value changes. `detail` is
 *   the new value. Bubbles.
 *
 * @property {boolean} passwordToggle - Whether to render the show/hide reveal button. Default `true`.
 * @property {boolean} passwordVisible - Whether the value is currently revealed as plain text.
 *   Default `false`.
 */
export default class PasswordField extends InputField {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            type: 'password',
            passwordToggle: true,
            passwordVisible: false,
        };
    }

    /**
     * Toggles between masked (`password`) and revealed (`text`) input.
     * @returns {void}
     */
    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
        this.type = this.passwordVisible ? 'text' : 'password';
    }

    events() {
        return {
            ...super.events(),
            '[data-password-toggle]': {
                click: () => this.togglePasswordVisibility(),
            },
        };
    }

    /** @private */
    fieldTemplate() {
        return html` ${super.fieldTemplate()} ${this.passwordToggle ? this.toggleTemplate() : ''} `;
    }

    /** @private */
    toggleTemplate() {
        return html`
            <button
                type="button"
                class="password-toggle"
                data-password-toggle
                aria-label="${this.passwordVisible ? 'Hide password' : 'Show password'}"
                aria-pressed="${this.passwordVisible ? 'true' : 'false'}"
                ?disabled="${this.disabled}"
            >
                ${this.passwordVisible ? this.eyeOffIconTemplate() : this.eyeIconTemplate()}
            </button>
        `;
    }

    /** @private */
    eyeIconTemplate() {
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
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }

    /** @private */
    eyeOffIconTemplate() {
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
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                ></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    }
}

export function define() {
    defineElement('el-password-field', PasswordField);
}
