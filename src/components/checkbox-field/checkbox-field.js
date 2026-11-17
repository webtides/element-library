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

    /** @private */
    _stateForReset() {
        return { ...super._stateForReset(), checked: this.checked };
    }

    watch() {
        return {
            ...super.watch(),
            // The value of a checkbox is what the form submits while it is checked. What the user
            // changes is `checked`, and its watcher reports that: once for every change.
            value: () => {},
            checked: (checked) => {
                this.setAttribute('checked', checked ? 'true' : 'false');
                if (checked) this._internals.states.add('checked');
                else this._internals.states.delete('checked');
                // The `checked` attribute the template writes is only the default of the control:
                // once the user has pressed it, the browser no longer follows the attribute. So a
                // state from outside is written to the control as well, before the event says
                // that it has changed.
                const input = this.$refs.input;
                if (input.checked !== !!checked) input.checked = !!checked;
                this.dispatch(FormFieldEvents.INPUT_CHANGE, input.value);
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
     * The checkbox has its label next to the box, in the row of the control (see `fieldTemplate`),
     * and none in front of it. The help message explains that label, so it comes after the row.
     */
    template() {
        return html`
            <div class="field ${this.classes().field}">${this.fieldTemplate()}</div>
            ${this.helpTemplate()} ${this.errorTemplate()}
        `;
    }

    /**
     * The box with its check mark is inside the label, in front of the text. It is hidden from
     * assistive technology: the checkbox itself says whether it is checked, and the mark would be
     * part of its name, checked or not.
     */
    fieldTemplate() {
        const classes = { 'is-checked': !!this.checked };
        return html`
            <label for="checkbox-${this.uuid}">
                <input
                    ref="input"
                    type="checkbox"
                    id="checkbox-${this.uuid}"
                    aria-describedby="${this._describedBy()}"
                    aria-invalid="${this.valid ? 'false' : 'true'}"
                    value="${this.value}"
                    name="${this.name}"
                    ?disabled="${this.disabled}"
                    ?checked="${this.checked}"
                    ?required="${this.required}"
                />
                <div class="checked-indicator ${classMap(classes)}" aria-hidden="true">
                    ${this.selectedIndicatorTemplate()}
                </div>
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
