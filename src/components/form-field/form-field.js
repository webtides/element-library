import { TemplateElement, html, defineElement, classMap } from '@webtides/element-js';
import FormFieldEvents from './form-field.events.js';
import style from './form-field.style.js';

/**
 * Base class for form input components. Provides label, help text, error message,
 * validation and touched-state plumbing. Intended to be extended (`InputField`,
 * `CheckboxField`, `TextareaField`, `AmountField`, …); subclasses override
 * `fieldTemplate()` to render their actual input.
 *
 * @element el-form-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the field's `value` changes.
 *   `detail` is the new value. Bubbles.
 *
 * @cssstate touched - Set on the host once the user has focused and blurred the field, or the
 *   browser has refused a submit because of it. Inherited by all subclasses (`InputField`,
 *   `CheckboxField`, `TextareaField`, `AmountField`, `SelectField`).
 * @cssstate valid - Set on the host while the field currently passes validation.
 * @cssstate invalid - Set on the host while the field currently fails validation.
 *
 * @property {string} name - Form name for the underlying input.
 * @property {string | null} value - Current value of the field.
 * @property {boolean} required - Whether the field is required for form submission.
 * @property {boolean} disabled - Whether the field is disabled.
 * @property {string} label - Label text displayed for the field.
 * @property {boolean} labelScreenReaderOnly - When `true`, the label is visually hidden but
 *   still announced to screen readers (via an `sr-only` class).
 * @property {string} errorMessage - Error message displayed when the field is invalid and has
 *   been touched.
 * @property {string} helpMessage - Helper text displayed below the field.
 * @property {boolean} valid - Whether the field currently passes validation.
 * @property {boolean} touched - Whether the user has interacted with the field (focused and
 *   blurred), or the browser has refused a submit because of it. Validation messages only surface
 *   when this is `true`.
 */
export default class FormField extends TemplateElement {
    /**
     * The state the field was rendered with, for a reset of its form. See `_stateForReset()`.
     * @private
     */
    _renderedState = undefined;

    /**
     * Where the field listens for the reset of its form, see `afterUpdate()`.
     * @private
     */
    _resetRoot = undefined;

    /**
     * The value the control and the `value` property last agreed on, see `_syncControlValue()`.
     * @private
     */
    _controlValue = undefined;

    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });

        // element-js keeps the stylesheets of an element on its class, and looks them up there
        // without asking whose they are. A field whose parent class was connected first found the
        // stylesheets of that parent and never built its own: an el-password-field after an
        // el-input-field had the styles of the input field only. A property of its own on every
        // class makes the lookup stop there.
        if (!Object.hasOwn(this.constructor, 'elementStyleSheets')) {
            this.constructor.elementStyleSheets = undefined;
        }
    }

    connected() {
        if (!!this.$refs.input?.value || this.valid === false) {
            this.touched = true;
        }
        this.syncValidationStates();
    }

    afterUpdate() {
        // The first update of a field is the one that connected() comes with: every class has set
        // its state up by now, the touched mark of a field with a value included.
        this._renderedState ??= this._stateForReset();

        // `reset` bubbles to the root of its tree, the document or a shadow root, and does not
        // leave it. The control is not asked for its form yet: a radio group can get its options
        // later.
        if (!this._resetRoot) {
            this._resetRoot = this.getRootNode();
            this._resetRoot.addEventListener('reset', this._onFormReset);
        }
    }

    disconnected() {
        this._resetRoot?.removeEventListener('reset', this._onFormReset);
        this._resetRoot = undefined;
    }

    /**
     * The properties that a reset of the form puts back, with the values they have now.
     * @private
     * @returns {Object<string, unknown>}
     */
    _stateForReset() {
        return { value: this.value, touched: this.touched, valid: this.valid };
    }

    /**
     * The form of the field was reset. The browser puts every control back to its default, which
     * for these fields is the value of now: a field renders its value as an attribute of the
     * control, and that attribute is the default. So the field puts its own state back, to the one
     * it was rendered with, and the control follows with the next render.
     *
     * The event comes before the browser resets the controls, and a listener after this one can
     * still cancel it. A task later both are settled.
     * @private
     * @param {Event} event
     */
    _onFormReset = (event) => {
        const control = this.$refs.input ?? this.querySelector('input');
        if (!control || event.target !== control.form) return;

        setTimeout(() => {
            if (event.defaultPrevented || !this.isConnected) return;
            Object.assign(this, this._renderedState);
        });
    };

    properties() {
        return {
            name: '',
            value: null,
            required: false,
            disabled: false,

            label: '',
            labelScreenReaderOnly: false,
            errorMessage: '',
            helpMessage: '',

            valid: true,
            touched: false,
        };
    }

    watch() {
        return {
            value: (value) => {
                this.dispatch(FormFieldEvents.INPUT_CHANGE, value);
            },
            valid: () => this.syncValidationStates(),
            touched: () => this.syncValidationStates(),
        };
    }

    /** @private */
    syncValidationStates() {
        if (this.touched) this._internals.states.add('touched');
        else this._internals.states.delete('touched');
        if (this.valid) {
            this._internals.states.add('valid');
            this._internals.states.delete('invalid');
        } else {
            this._internals.states.delete('valid');
            this._internals.states.add('invalid');
        }
    }

    events() {
        return {
            '[ref=input]': {
                focus: () => {
                    this.onFocus();
                },
                blur: () => {
                    this.onBlur();
                },
                keyup: (event) => {
                    // don't trigger change when tabbing through inputs
                    if (event.keyCode !== 9) {
                        this.onChange();
                    }
                },
                change: () => {
                    this.onChange();
                    this.dispatch(FormFieldEvents.INPUT_CHANGE, this.$refs.input.value);
                },
                invalid: (event) => {
                    this._onInvalid(event.target);
                },
            },
            '.is-invalid': {
                focus: () => {
                    this.onBlur();
                },
            },
            '[data-clear-input]': {
                click: () => {
                    this.clearInput();
                },
                touchstart: () => {
                    this.clearInput();
                },
            },
        };
    }

    /**
     * Called when the input receives focus. Refreshes validation state.
     * @returns {void}
     */
    onFocus() {
        this.valid = this.$refs.input.validity.valid;
    }

    /**
     * Called when the input loses focus. Marks the field as touched and refreshes
     * validation state.
     * @returns {void}
     */
    onBlur() {
        this.touched = true;
        this.valid = this.$refs.input.validity.valid;
    }

    /**
     * Called when the input value changes. Updates `value` and refreshes validation.
     * @returns {void}
     */
    onChange() {
        this._controlValue = this.$refs.input.value;
        this.value = this.$refs.input.value;
        this.valid = this.$refs.input.validity.valid;
    }

    /**
     * Writes a value that was set from outside to the control. For the fields that take text
     * (`InputField`, `PasswordField`, `TextareaField`), which call it from their `value` watcher.
     *
     * Such a field renders its value as the default of its control: the `value` attribute of an
     * input, the text of a textarea. Once the user has typed, the browser no longer shows that
     * default, so the control has to be told. A value that came from the control itself is not
     * written back: text typed between a change and the next render is kept, and the caret stays
     * where it is.
     *
     * The watcher runs a frame after the change, once for every change. By then the value can have
     * changed again, so it is the value of now that counts, not the one the watcher was called
     * for: writing an older one moves the caret to the end of the text.
     * @private
     */
    _syncControlValue() {
        const controlValue = String(this.value ?? '');
        if (!this.$refs.input || controlValue === this._controlValue) return;
        this._controlValue = controlValue;
        this.$refs.input.value = controlValue;
    }

    /**
     * The browser found the control not valid. If it did so for a submit, the field shows its error
     * message, as it does once the user has left it: the form was refused, and the user has to see
     * why, on every field and in the words of the page.
     *
     * `checkValidity()` and `reportValidity()` fire the same event without a submit. A page that asks
     * on every keystroke whether its form is valid must not turn every field red. The browser tells
     * the two apart itself: before it validates for a submit it marks all controls of the form as
     * touched by the user, which is the state behind `:user-invalid`.
     *
     * The event is not cancelled, so the browser still focuses the first control and shows its
     * bubble there.
     * @private
     * @param {HTMLElement} control
     */
    _onInvalid(control) {
        if (!control.matches(':user-invalid')) return;
        this.touched = true;
        this.valid = false;
    }

    /**
     * Clears the input value, refocuses it, and resets the touched state. The field follows the
     * control, as it does when the user deletes the text by hand: `value` is empty, `input-change`
     * reports it, and `valid` is what the control says.
     * @returns {void}
     */
    clearInput() {
        this.$refs.input.focus();
        this.$refs.input.value = '';
        // A value that a script sets fires no event, so the field has to be told.
        this.onChange();
        this.touched = false;
    }

    /** @private */
    classes() {
        return {
            field: classMap({ 'is-valid': !!this.valid, 'is-invalid': !this.valid, 'is-touched': !!this.touched }),
            label: classMap({ 'sr-only': this.labelScreenReaderOnly }),
        };
    }

    template() {
        return html`
            ${this.labelTemplate()} ${this.helpTemplate()}
            <div class="field ${this.classes().field}">${this.fieldTemplate()}</div>
            ${this.errorTemplate()}
        `;
    }

    /** @private */
    labelTemplate() {
        if (!this.label) return null;
        return html`
            <label ref="label" for="input-${this.name}" class="${this.classes().label}"> ${this.label} </label>
        `;
    }

    /**
     * Subclass extension point. Override to render the actual input element(s).
     * @returns {unknown}
     */
    fieldTemplate() {
        return html` <!-- IMPLEMENT FIELD --> `;
    }

    /** @private */
    helpTemplate() {
        return html` <span id="${this.name}-help-message" class="message help-message">${this.helpMessage}</span> `;
    }

    /**
     * Whether the error message is rendered: the field has been touched, is invalid and has a message.
     * @private
     * @returns {boolean}
     */
    _showsError() {
        return !!(this.touched && this.errorMessage && !this.valid);
    }

    /**
     * The value of `aria-describedby` for the control: the help message, and the error message while
     * it is rendered, so that a screen reader reads the error when the control gets focus.
     * @private
     * @returns {string}
     */
    _describedBy() {
        const ids = [`${this.name}-help-message`];
        if (this._showsError()) ids.push(`${this.name}-error-message`);
        return ids.join(' ');
    }

    /**
     * The error message is an alert, so that a screen reader announces it the moment it appears.
     * @private
     */
    errorTemplate() {
        if (!this._showsError()) return null;

        return html`
            <span id="${this.name}-error-message" class="message error-message" role="alert">${this.errorMessage}</span>
        `;
    }
}

export function define() {
    defineElement('el-form-field', FormField);
}

export { FormField, FormFieldEvents };
