import { html, defineElement, classMap, unsafeHTML } from '@webtides/element-js';
import FormField, { FormFieldEvents } from '../form-field/form-field.js';
import style from './switch-field.style.js';

/**
 * An on/off toggle switch. Renders a native `<input type="checkbox">` with `role="switch"` (so it
 * is announced as a switch and submits with forms) behind a custom track/thumb. Extends
 * `FormField` and inherits its label / help / error / required surface.
 *
 * @element el-switch-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the on/off state changes. `detail` is the
 *   input's `value`. Bubbles.
 *
 * @cssstate checked - Set on the host while the switch is on. Style with
 *   `el-switch-field:state(checked) { … }`. Inherits `touched`, `valid` and `invalid` from
 *   `FormField`.
 *
 * @property {boolean} checked - Whether the switch is on. Reflected to the `checked` attribute.
 */
export default class SwitchField extends FormField {
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
     * The switch renders its label inline next to the track (see `fieldTemplate`), so the base
     * FormField label is suppressed.
     * @returns {null}
     */
    labelTemplate() {
        return null;
    }

    fieldTemplate() {
        const classes = { 'is-checked': !!this.checked };
        return html`
            <label for="switch-${this.uuid}">
                <input
                    ref="input"
                    type="checkbox"
                    role="switch"
                    id="switch-${this.uuid}"
                    aria-describedby="${this.name}-help-message"
                    value="${this.value}"
                    name="${this.name}"
                    ?disabled="${this.disabled}"
                    ?checked="${this.checked}"
                    ?required="${this.required}"
                />
                <span class="switch-track ${classMap(classes)}"><span class="switch-thumb"></span></span>
                <span class="label">${this.label ? unsafeHTML(this.label) : ''}</span>
            </label>
        `;
    }
}

export function define() {
    defineElement('el-switch-field', SwitchField);
}
