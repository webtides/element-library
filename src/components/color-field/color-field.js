import { html, defineElement } from '@webtides/element-js';
import FormField, { FormFieldEvents } from '../form-field/form-field.js';
import style from './color-field.style.js';

/**
 * A colour, picked in the picker of the browser. Renders a native `<input type="color">`, so the
 * picker, the keyboard and the form submission are the ones of the browser. Extends `FormField`
 * and inherits its label / help / error surface.
 *
 * The control always has a value: without one it is black. The field takes that value over, so
 * that `value` says what the form submits.
 *
 * @element el-color-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the value changes, also while the user
 *   goes through the picker. `detail` is the new value. Bubbles.
 *
 * @cssstate touched - Set on the host once the user has focused and left the control. Inherits
 *   `valid` and `invalid` from `FormField`.
 *
 * @property {string | null} value - The colour, as the text the form submits: `#rrggbb`. A field
 *   without one takes over the value of the control, `#000000`.
 * @property {'small'|'medium'|'large'} size - Size of the control. Default `'medium'`. Reflected to
 *   the `size` attribute. It shows once the control is decorated (`styles/native.css`); a control
 *   with the look of the browser keeps its size.
 * @property {boolean} showValue - Shows the value beside the control. Default `false`.
 * @property {Array<string | { value: string, label?: string }>} options - Colours the picker of the
 *   browser offers: plain strings (`['#2563eb', '#16a34a']`) or option objects. Without options the
 *   control has no list.
 */
export default class ColorField extends FormField {
    /**
     * The value that `input-change` last reported, or that the field started with. See `watch()`.
     * @private
     */
    _reportedValue = undefined;

    constructor(options) {
        super({
            shadowRender: false,
            styles: [style],
            ...options,
            // The size module selects the host by the `size` attribute.
            propertyOptions: { size: { reflect: true }, ...options?.propertyOptions },
        });
    }

    properties() {
        return {
            ...super.properties(),
            size: 'medium',
            showValue: false,
            options: [],
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
                // The value follows the picker while the user goes through it. `change`, when the
                // picker is closed, has nothing new to say.
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
     * The `value` attribute of the control is only its default: once the user has picked a colour,
     * a value from outside has to be written to the control. The control in turn keeps a colour in
     * its own format: it writes `#F00` as `#ff0000`, and is black for a text that is no colour and
     * when it is given none. The field takes over what the control made of the value: that is what
     * the form submits.
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
     * The colours of `options`, as the options of the list.
     * @private
     * @returns {Array<{ value: string, label: string | null }>}
     */
    _colors() {
        if (!Array.isArray(this.options)) return [];
        return this.options.map((option) => ({
            value: String(option?.value ?? option),
            label: option?.label ?? null,
        }));
    }

    /** @private */
    fieldTemplate() {
        const colors = this._colors();

        return html`
            <input
                ref="input"
                type="color"
                id="${this._idOf('input')}"
                name="${this.name}"
                value="${this.value}"
                ?disabled="${this.disabled}"
                list="${colors.length > 0 ? this._idOf('list') : null}"
                aria-describedby="${this._describedBy()}"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this._idOf('error-message')}"
            />
            ${this.listTemplate(colors)} ${this.valueTemplate()}
        `;
    }

    /**
     * The colours the picker of the browser offers. A control without them has no list: an empty
     * one would be an offer of nothing.
     * @private
     * @param {Array<{ value: string, label: string | null }>} colors
     */
    listTemplate(colors) {
        if (colors.length === 0) return null;

        return html`
            <datalist id="${this._idOf('list')}">
                ${colors.map((color) => html`<option value="${color.value}" label="${color.label}"></option>`)}
            </datalist>
        `;
    }

    /**
     * The value beside the control. It is hidden from assistive technology: the control says its
     * value itself, and would be heard twice.
     * @private
     */
    valueTemplate() {
        if (!this.showValue) return null;
        return html`<span class="value" aria-hidden="true">${this.value}</span>`;
    }
}

export function define() {
    defineElement('el-color-field', ColorField);
}
