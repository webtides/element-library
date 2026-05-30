import { html, defineElement, classMap, unsafeHTML } from '@webtides/element-js';
import FormField, { FormFieldEvents } from '../form-field/form-field.js';
import style from './checkbox-field.style.js';

/**
 * Styled checkbox input with a custom checkmark indicator, label, and validation. Extends
 * `FormField` and inherits its label / help / error / required surface.
 *
 * @element el-checkbox-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the checked state changes.
 *   `detail` is the input's `value`. Bubbles.
 *
 * @cssstate checked - Set on the host while the checkbox is checked. Style with
 *   `el-checkbox-field:state(checked) { … }`. Inherits `touched`, `valid` and `invalid`
 *   from `FormField`.
 *
 * @property {boolean} checked - Whether the checkbox is checked. Reflected to the `checked`
 *   attribute.
 */
export default class CheckboxField extends FormField {
    /** @private */
    uuid = Math.random().toString(36).substr(2, 5);

    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            checked: false,
        };
    }
    connected() {
        this.setAttribute('checked', this.checked === true ? 'true' : 'false');
        if (this.checked) this._internals.states.add('checked');
        this.syncValidationStates();
    }

    watch() {
        return {
            ...super.watch(),
            checked: (checked) => {
                this.setAttribute('checked', checked ? 'true' : 'false');
                if (checked) this._internals.states.add('checked');
                else this._internals.states.delete('checked');
                this.dispatch(FormFieldEvents.INPUT_CHANGE, this.$refs.input.value);
            },
        };
    }

    events() {
        return {
            ...super.events(),
            input: {
                change: () => {
                    this.checked = this.$refs.input.checked;
                },
            },
        };
    }

    /**
     * The checkbox renders its label inline next to the box (see `fieldTemplate`), so the base
     * FormField label is suppressed.
     * @returns {null}
     */
    labelTemplate() {
        return null;
    }

    fieldTemplate() {
        const classes = { 'is-checked': !!this.checked };
        return html`
            <label for="checkbox-${this.uuid}">
                <input
                    ref="input"
                    type="checkbox"
                    id="checkbox-${this.uuid}"
                    aria-describedby="checkbox-${this.uuid}"
                    value="${this.value}"
                    name="${this.name}"
                    ?disabled="${this.disabled}"
                    ?checked="${this.checked}"
                    ?required="${this.required}"
                />
                <div class="checked-indicator ${classMap(classes)}">${this.selectedIndicatorTemplate()}</div>
                <div class="label">${this.label ? unsafeHTML(this.label) : ''}</div>
            </label>
        `;
    }

    /** @private */
    selectedIndicatorTemplate() {
        return html` <div class="checked">&checkmark;</div> `;
    }
}

export function define() {
    defineElement('el-checkbox-field', CheckboxField);
}
