import { html, defineElement, classMap, when, optionalAttribute, spreadAttributes } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import { shadowNativeTextEntryProperties, textEntryAttributes } from '../../utils/text-entry-attributes.js';
import style from './input-field.style.js';

/**
 * Native `<input>` wrapper with label, help text, validation feedback (visual checkmark /
 * cross indicators) and ARIA wiring. Extends `FormField` and inherits its label / help /
 * error / required surface.
 *
 * @element el-input-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the input's value changes.
 *   `detail` is the new value. Bubbles.
 *
 * @property {string} type - Native `type` attribute of the underlying `<input>` (e.g.
 *   `'text'`, `'email'`, `'password'`, `'tel'`, `'url'`).
 * @property {string} placeholder - Placeholder text shown while the input is empty.
 * @property {string | false} pattern - Regular expression used as the input's `pattern`
 *   attribute. When `false` (the default), the `pattern` attribute is omitted entirely, so
 *   the field applies no pattern constraint.
 * @property {string | null} autocomplete - Passed on to the control as its `autocomplete`
 *   attribute (e.g. `'email'`, `'current-password'`, `'one-time-code'`). `null` (the default)
 *   leaves the attribute out. The same holds for the five properties below.
 * @property {string | null} inputmode - Passed on as `inputmode`: the on-screen keyboard to show
 *   (e.g. `'numeric'`, `'email'`).
 * @property {string | null} enterkeyhint - Passed on as `enterkeyhint`: the label of the enter key
 *   on an on-screen keyboard (e.g. `'next'`, `'send'`).
 * @property {string | null} autocapitalize - Passed on as `autocapitalize` (e.g. `'none'`,
 *   `'sentences'`).
 * @property {string | null} autocorrect - Passed on as `autocorrect` (`'on'` or `'off'`).
 * @property {boolean | string | null} spellcheck - Passed on as `spellcheck` (`true` or `false`).
 */
export default class InputField extends FormField {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
        shadowNativeTextEntryProperties(this);
    }

    properties() {
        return {
            ...super.properties(),
            type: 'text',
            placeholder: '',
            pattern: false,
            autocomplete: null,
            inputmode: null,
            enterkeyhint: null,
            autocapitalize: null,
            autocorrect: null,
            spellcheck: null,
        };
    }

    /** @private */
    fieldTemplate() {
        return html`
            <input
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                type="${this.type}"
                value="${this.value}"
                placeholder="${this.placeholder}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                ${optionalAttribute(this.pattern, 'pattern', this.pattern)}
                ${spreadAttributes(textEntryAttributes(this))}
                aria-describedby="${this.name}-help-message"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this.name}-error-message"
            />
            ${when(
                this.touched,
                html`
                    <div class="validity ${classMap({ 'is-valid': !!this.valid, 'is-invalid': !this.valid })}">
                        ${when(
                            this.valid,
                            html` <span class="valid h-4 w-4">&checkmark;</span> `,
                            html` <span class="invalid h-4 w-4" data-clear-input>&cross;</span> `,
                        )}
                    </div>
                `,
            )}
        `;
    }
}

export function define() {
    defineElement('el-input-field', InputField);
}
