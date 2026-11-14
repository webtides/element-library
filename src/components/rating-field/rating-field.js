import { html, defineElement } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import { focusLeft } from '../../utils/focus.js';
import style from './rating-field.style.js';

/**
 * A rating as a number from 1 to `max`, drawn as a row of stars: the stars up to the chosen one
 * are filled. Renders a native `<fieldset>`/`<legend>` wrapping one `<input type="radio">` per
 * step, so the grouping, the arrow keys and the form submission are native. Extends `FormField`
 * and inherits its help / error / required / touched-state surface; the `label` becomes the
 * `<legend>` of the group.
 *
 * @element el-rating-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the rating changes. `detail` is the
 *   chosen step. Bubbles.
 *
 * @cssstate touched - Set once the user has left the group, or the browser has refused a submit
 *   because of it. Inherits `valid` and `invalid` from `FormField`.
 *
 * @cssproperty --el-rating-color - The colour of a filled star. Unset, it is the accent colour of
 *   the theme.
 * @cssproperty --el-rating-size - The width and the height of a star. Unset, it is `--el-space-5`,
 *   and `1.5em` without a theme.
 *
 * @property {string | null} value - The chosen step, as the text the form submits (`'3'`), or
 *   `null` while nothing is chosen.
 * @property {number} max - The number of stars. Default `5`.
 */
export default class RatingField extends FormField {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            max: 5,
        };
    }

    connected() {
        // The page can render the field as not valid, after a check of its own.
        const renderedInvalid = this.valid === false;
        super.connected();
        // Reflect validity (required and nothing chosen) so :state(invalid) is correct from the
        // start; the message stays hidden until the group is touched.
        if (!renderedInvalid) this.valid = this._computeValid();
    }

    afterUpdate() {
        // Before the form field keeps the state for a reset.
        this._syncControls();
        super.afterUpdate();
    }

    events() {
        return {
            'input[type="radio"]': {
                change: (event) => {
                    this.value = event.target.value;
                    this.valid = this._computeValid();
                },
                focus: () => this.onFocus(),
                // The group is touched once the user has left it, not while the focus moves from
                // one star to the next.
                blur: (event) => focusLeft(this, event) && this.onBlur(),
                invalid: (event) => this._onInvalid(event.target),
            },
        };
    }

    /**
     * The steps of the scale: 1 to `max`. A `max` that is no number of stars gives the five of
     * the default.
     * @private
     * @returns {number[]}
     */
    _steps() {
        const max = Math.floor(Number(this.max));
        return Array.from({ length: max >= 1 ? max : 5 }, (_, index) => index + 1);
    }

    /**
     * The chosen step as a number, or 0 while nothing is chosen. A value that is no step of the
     * scale chooses nothing: no radio has it, and nothing would be submitted for it.
     * @private
     * @returns {number}
     */
    _chosen() {
        const value = Number(this.value);
        return this.value != null && this.value !== '' && this._steps().includes(value) ? value : 0;
    }

    /**
     * Whether the group currently passes validation: required means a chosen step.
     * @private
     */
    _computeValid() {
        if (this.required) return this.value != null && this.value !== '';
        return true;
    }

    /**
     * Makes the radios say what the field says, after every render. The `checked` attribute the
     * template writes is only the default of a radio: once the user has chosen, the browser no
     * longer follows the attribute, so a value from outside is written to the radios as well.
     * @private
     */
    _syncControls() {
        const chosen = this._chosen();
        for (const radio of this.querySelectorAll('input[type="radio"]')) {
            const checked = Number(radio.value) === chosen;
            if (radio.checked !== checked) radio.checked = checked;
        }
    }

    onFocus() {
        this.valid = this._computeValid();
    }

    onBlur() {
        this.touched = true;
        this.valid = this._computeValid();
    }

    /**
     * The label is rendered as the group's `<legend>` (see `template`), so the base FormField
     * `<label>` is suppressed.
     * @returns {null}
     */
    labelTemplate() {
        return null;
    }

    template() {
        return html`
            <fieldset
                class="field ${this.classes().field}"
                aria-describedby="${this._describedBy()}"
                aria-errormessage="${this._idOf('error-message')}"
                aria-invalid="${this.valid ? 'false' : 'true'}"
            >
                ${this.legendTemplate()} ${this.helpTemplate()}
                <div class="options">${this.fieldTemplate()}</div>
                ${this.errorTemplate()}
            </fieldset>
        `;
    }

    /** @private */
    legendTemplate() {
        if (!this.label) return null;
        return html` <legend class="${this.classes().label}">${this.label}</legend> `;
    }

    /**
     * One radio per step, each in a label that shows a star. A radio is named by its number, which
     * needs no translation. The star is hidden from assistive technology: the radio says whether it
     * is chosen. The stars up to the chosen one carry `is-on`, which fills them.
     * @private
     */
    fieldTemplate() {
        const chosen = this._chosen();

        return this._steps().map((step) => {
            const id = `rating-${this.uuid}-${step}`;

            return html`
                <label class="option ${step <= chosen ? 'is-on' : ''}" for="${id}">
                    <input
                        type="radio"
                        id="${id}"
                        name="${this.name}"
                        value="${step}"
                        aria-label="${step}"
                        ?checked="${step === chosen}"
                        ?disabled="${this.disabled}"
                        ?required="${this.required}"
                        aria-describedby="${this._describedBy()}"
                    />
                    <svg class="star" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                            d="M12 2.8l2.84 5.76 6.36.92-4.6 4.49 1.09 6.33L12 17.31l-5.69 2.99 1.09-6.33-4.6-4.49 6.36-.92z"
                        />
                    </svg>
                </label>
            `;
        });
    }
}

export function define() {
    defineElement('el-rating-field', RatingField);
}
