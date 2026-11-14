import { html, defineElement } from '@webtides/element-js';
import FormField, { FormFieldEvents } from '../form-field/form-field.js';
import style from './range-field.style.js';

/**
 * A number from a span, picked with a thumb on a track. Renders a native `<input type="range">`,
 * so the keyboard, the touch handling and the form submission are the ones of the browser. Extends
 * `FormField` and inherits its label / help / error surface.
 *
 * The control always has a value: without one it puts its thumb in the middle of the span. The
 * field takes that value over, so that `value` says what the form submits.
 *
 * @element el-range-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the value changes, also while the thumb
 *   moves. `detail` is the new value. Bubbles.
 *
 * @cssstate touched - Set on the host once the user has focused and left the control. Inherits
 *   `valid` and `invalid` from `FormField`.
 *
 * @property {string | null} value - The value, as the text the form submits. A field without one
 *   takes over the value of the control, the middle of the span.
 * @property {number} min - The lower end of the span. Default `0`.
 * @property {number} max - The upper end of the span. Default `100`.
 * @property {number | 'any'} step - The distance between two values. Default `1`; `'any'` takes
 *   every value of the span.
 * @property {boolean} showValue - Shows the value beside the control. Default `false`.
 */
export default class RangeField extends FormField {
    /**
     * The value that `input-change` last reported, or that the field started with. See `watch()`.
     * @private
     */
    _reportedValue = undefined;

    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            min: 0,
            max: 100,
            step: 1,
            showValue: false,
        };
    }

    /**
     * A form field takes a control with a value as touched: someone has filled it in. The control
     * of this field always has a value, so that says nothing here.
     */
    connected() {
        if (this.valid === false) this.touched = true;
        this.syncValidationStates();
    }

    afterUpdate() {
        // Before the form field keeps the state for a reset: what the field takes over from the
        // control is part of it.
        this._matchControl();
        if (this._reportedValue === undefined) this._reportedValue = this.value;
        super.afterUpdate();
    }

    watch() {
        return {
            ...super.watch(),
            // The watcher runs a frame after the change, once for every change, and the field can
            // have taken another value over from the control by then. So it is the value of now
            // that is reported, and each one once.
            value: () => {
                this._matchControl();
                if (this.value === this._reportedValue) return;
                this._reportedValue = this.value;
                this.dispatch(FormFieldEvents.INPUT_CHANGE, this.value);
            },
        };
    }

    events() {
        return {
            '[ref=input]': {
                // The value follows the thumb while it moves. `change`, at the end of a move, has
                // nothing new to say.
                input: () => this.onChange(),
                focus: () => this.onFocus(),
                blur: () => this.onBlur(),
                invalid: (event) => this._onInvalid(event.target),
            },
        };
    }

    /**
     * Makes the control and `value` say the same, after every render and every change of `value`.
     *
     * The `value` attribute of the control is only its default: once the user has moved the thumb,
     * a value from outside has to be written to the control. The control in turn keeps its value
     * inside the span and on a step, and has one in the middle of the span when it is given none.
     * The field takes over what the control made of the value: that is what the form submits.
     * @private
     */
    _matchControl() {
        const control = this.$refs.input;
        if (!control) return;

        const wanted = String(this.value ?? '');
        if (control.value !== wanted) control.value = wanted;
        if (control.value !== wanted) this.value = control.value;
    }

    /**
     * The longest text the value can have, which keeps the room for it: the control would change
     * its length with every digit that comes or goes while the thumb moves.
     * @private
     * @returns {string}
     */
    _longestValue() {
        const decimals = (number) => String(number).split('.')[1]?.length ?? 0;
        const places = Math.max(decimals(this.min), decimals(this.step));
        const ends = [this.min, this.max].map((end) => Number(end)).filter((end) => Number.isFinite(end));
        return ends
            .map((end) => end.toFixed(Math.min(places, 20)))
            .reduce((longest, text) => (text.length > longest.length ? text : longest), '');
    }

    /** @private */
    fieldTemplate() {
        return html`
            <input
                ref="input"
                type="range"
                id="${this._idOf('input')}"
                name="${this.name}"
                min="${this.min}"
                max="${this.max}"
                step="${this.step}"
                value="${this.value}"
                ?disabled="${this.disabled}"
                aria-describedby="${this._describedBy()}"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this._idOf('error-message')}"
            />
            ${this.valueTemplate()}
        `;
    }

    /**
     * The value beside the control. It is hidden from assistive technology: the control says its
     * value itself, and would be heard twice.
     * @private
     */
    valueTemplate() {
        if (!this.showValue) return null;
        return html`
            <span class="value" aria-hidden="true">
                <span class="value-room">${this._longestValue()}</span>
                <span class="value-now">${this.value}</span>
            </span>
        `;
    }
}

export function define() {
    defineElement('el-range-field', RangeField);
}
