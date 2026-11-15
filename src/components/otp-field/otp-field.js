import { defineElement } from '@webtides/element-js';
import InputField from '../input-field/input-field.js';
import Events from './otp-field.events.js';
import style from './otp-field.style.js';

/**
 * A one-time code: the short code of a second factor that the user gets by SMS, by mail or from an
 * app. Extends `InputField` (and therefore `FormField`), inheriting the label / help / error /
 * validation surface and the look from `styles/native.css`.
 *
 * It is one native `<input>`, not one per digit: the code from an SMS, a paste, a password manager
 * and a screen reader all work on one control. The field sets what such an input needs
 * (`autocomplete`, `inputmode`, a pattern of `length` digits), takes the spaces and the hyphens out
 * of a code that is entered the way a mail shows it, takes no further key once the code is full, and
 * says when the code is complete.
 *
 * @element el-otp-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the value changes. `detail` is the new
 *   value. Bubbles.
 * @fires {CustomEvent<string>} input-complete - Fired when the user has entered a code of full
 *   length that is valid: once, and again after the code was changed and completed again. Not
 *   fired for a value a script sets. `detail` is the code. Bubbles.
 *
 * @property {number} length - The number of characters of the code. Default `6`.
 * @property {string | false} pattern - Regular expression for the code. `false` (the default) is a
 *   pattern of `length` digits. Set one of your own for a code with letters.
 * @property {string | null} autocomplete - Passed on to the control as `autocomplete`. Default
 *   `'one-time-code'`: a phone offers the code of an SMS it has just got.
 * @property {string | null} inputmode - Passed on as `inputmode`. Default `'numeric'`: a phone
 *   shows the digits. Set `'text'` for a code with letters.
 */
export default class OtpField extends InputField {
    /**
     * The complete code the control has, or `null`. What `input-complete` is not fired for again.
     * @private
     */
    _completed = null;

    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            length: 6,
            autocomplete: 'one-time-code',
            inputmode: 'numeric',
        };
    }

    watch() {
        const watchers = super.watch();
        return {
            ...watchers,
            value: (value, oldValue) => {
                watchers.value(value, oldValue);
                // A code from a script is not one the user has entered.
                this._completed = this._completeCode();
            },
        };
    }

    events() {
        const events = super.events();
        return {
            ...events,
            '[ref=input]': {
                ...events['[ref=input]'],
                beforeinput: (event) => this._onBeforeInput(event),
                // Not every way into the control presses a key: a paste with the mouse, the code a
                // phone offers from an SMS.
                input: (event) => this._onInput(event),
            },
        };
    }

    onChange() {
        super.onChange();
        this._completed = this._completeCode();
    }

    /**
     * A code that is full takes no further key, as an input with `maxlength` does: the character
     * would push the last one of the code out, wherever the caret is. The control has no
     * `maxlength` itself, see `_clean()`. A paste is not held back here, it is cut after it was
     * cleaned.
     * @private
     * @param {InputEvent} event
     */
    _onBeforeInput(event) {
        if (event.inputType !== 'insertText' || event.isComposing) return;

        const control = event.target;
        const replaced = control.selectionEnd - control.selectionStart;
        if (control.value.length - replaced >= this._length()) event.preventDefault();
    }

    /**
     * The control has another text. Cleans it, takes it over, and says so when it is a complete
     * code now and was not one before.
     * @private
     * @param {InputEvent} event
     */
    _onInput(event) {
        const control = this.$refs.input;

        // A text that is still being composed is left alone, writing it would end the composition.
        if (!event.isComposing) {
            const code = this._clean(control.value);
            if (code !== control.value) control.value = code;
        }

        const before = this._completed;
        this.onChange();
        if (this._completed !== null && this._completed !== before) {
            this.dispatch(Events.COMPLETE, this._completed);
        }
    }

    /**
     * A code the way it is entered: without the spaces and the hyphens that a mail or an SMS groups
     * its digits with, and not longer than a code is. Nothing else is taken out: what does not fit
     * the pattern is not valid, and the field says so.
     *
     * This is why the control has no `maxlength`: the browser would cut a pasted `123 456` to
     * `123 45` before the field has taken the space out.
     * @private
     * @param {string} text
     * @returns {string}
     */
    _clean(text) {
        return String(text ?? '')
            .replace(/[\s-]/g, '')
            .slice(0, this._length());
    }

    /**
     * @private
     * @returns {number} The length of a code: `length`, or 6 where that is no number of characters.
     */
    _length() {
        const length = Math.floor(Number(this.length));
        return length >= 1 ? length : 6;
    }

    /**
     * The pattern of the page, or one of `length` digits.
     * @private
     * @returns {string}
     */
    _pattern() {
        return this.pattern || `[0-9]{${this._length()}}`;
    }

    /**
     * @private
     * @returns {string | null} The text of the control when it is a complete and valid code.
     */
    _completeCode() {
        const control = this.$refs?.input;
        if (!control || control.value.length !== this._length() || !control.validity.valid) return null;
        return control.value;
    }
}

export function define() {
    defineElement('el-otp-field', OtpField);
}

export { Events };
