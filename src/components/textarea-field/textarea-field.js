import { html, defineElement, classMap, spreadAttributes } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import { shadowNativeTextEntryProperties, textEntryAttributes } from '../../utils/text-entry-attributes.js';
import style from './textarea-field.style.js';

/**
 * Native `<textarea>` wrapper with label, help text, validation feedback (visual
 * checkmark / cross indicators) and ARIA wiring. Extends `FormField` and inherits its
 * label / help / error / required surface.
 *
 * @element el-textarea-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the textarea's value changes.
 *   `detail` is the new value. Bubbles.
 *
 * @property {string} placeholder - Placeholder text shown while the textarea is empty.
 * @property {number} rows - Number of visible text rows. Forwarded to the underlying
 *   `<textarea>`'s `rows` attribute.
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
export default class TextareaField extends FormField {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
        shadowNativeTextEntryProperties(this);
    }

    properties() {
        return {
            ...super.properties(),
            placeholder: '',
            rows: 3,
            autocomplete: null,
            inputmode: null,
            enterkeyhint: null,
            autocapitalize: null,
            autocorrect: null,
            spellcheck: null,
        };
    }

    watch() {
        const watchers = super.watch();
        return {
            ...watchers,
            value: (value, oldValue) => {
                // The text of a textarea is only its default: a value set from outside has to be
                // written to the control as well.
                this._syncControlValue();
                watchers.value(value, oldValue);
            },
        };
    }

    events() {
        const events = super.events();
        return {
            ...events,
            '[ref=input]': {
                ...events['[ref=input]'],
                // Text arrives without a key going up as well: a paste with the mouse, dictation, a
                // suggestion of an on-screen keyboard, a script that fills the field.
                input: () => this.onChange(),
            },
        };
    }

    /** @private */
    fieldTemplate() {
        const classes = { 'is-valid': !!this.valid, 'is-invalid': !this.valid };
        // The value has to follow the opening tag on the same line: element-js 1.3.1 only renders an
        // interpolation into a textarea when the content between the tags has no line break. The
        // formatter would put one there, so it must not touch this template.
        // oxfmt-ignore
        return html`
            <textarea
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                rows="${this.rows}"
                placeholder="${this.placeholder}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                ${spreadAttributes(textEntryAttributes(this))}
                aria-describedby="${this._describedBy()}"
            >${this.value ?? ''}</textarea>
            ${
                this.touched
                    ? html`
                          <div class="validity ${classMap(classes)}">
                              ${
                                  this.valid
                                      ? html` <span class="valid h-4 w-4">&checkmark;</span> `
                                      : html` <span class="invalid h-4 w-4" data-clear-input>&cross;</span> `
                              }
                          </div>
                      `
                    : ''
            }
        `;
    }
}

export function define() {
    defineElement('el-textarea-field', TextareaField);
}
