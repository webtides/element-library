import { html, defineElement } from '@webtides/element-js';
import RadioField from '../radio-field/radio-field.js';
import style from './segmented-field.style.js';

/**
 * One choice of a few options, shown as a row of joined buttons: "List | Grid",
 * "Day | Week | Month". It looks like an `el-button-group` and behaves like a group of radios,
 * because it is one: a native `<fieldset>`/`<legend>` with an `<input type="radio">` per option
 * (it extends `el-radio-field`). So the one tab stop, the arrow keys, the value in the form, its
 * reset and `required` are native, and the label, the help message and the error message are the
 * ones of every field.
 *
 * In a container that gives its controls a size, an `el-toolbar`, the field takes it from there,
 * while the page has not set `size` on the field itself.
 *
 * @element el-segmented-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the chosen option changes. `detail` is
 *   its value. Bubbles.
 *
 * @cssstate touched - Set once the user has left the group, or the browser has refused a submit
 *   because of it. Inherits `valid` and `invalid` from `FormField`.
 *
 * @property {string | null} value - The value of the chosen option.
 * @property {Array<string | { value: string, label?: string, icon?: string, disabled?: boolean }>} options -
 *   The options. Plain strings (`['Day', 'Week']`) are value and label at once; an object has a
 *   `value`, a `label`, and can be `disabled`. With `icon`, the address of an SVG symbol
 *   (`'#grid'`, `'/icons.svg#grid'`), the option shows that icon in the place of its label: the
 *   label is then its name for assistive technology and its tooltip.
 * @property {'small'|'medium'|'large'} size - The size of the options: their height, their padding
 *   and their font size. Default `'medium'`. Reflected to the `size` attribute.
 */
export default class SegmentedField extends RadioField {
    constructor(options) {
        super({
            styles: [style],
            ...options,
            // The size module selects the host by this attribute.
            propertyOptions: { size: { reflect: true }, ...options?.propertyOptions },
        });
    }

    /**
     * Whether the page has given the field a size of its own, see `_hasOwnSize()`.
     * @private
     * @type {boolean | undefined}
     */
    _ownSize = undefined;

    properties() {
        return {
            ...super.properties(),
            size: 'medium',
        };
    }

    static observedAttributes = ['size'];

    /**
     * Whether the field is writing a property to its attribute right now, see `reflectProperty()`.
     * @private
     */
    _reflecting = false;

    connectedCallback() {
        // Before element-js writes the default onto the element: after that, every field has a
        // `size` attribute, and nothing says who wrote it.
        this._ownSize ??= this.hasAttribute('size') || Object.hasOwn(this, 'size');
        super.connectedCallback();
    }

    /**
     * The page has written the `size` attribute, after the field was connected: the size is the
     * field's own from now on, also when it is the default. The field writes the attribute itself
     * as well, which says nothing.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name !== 'size' || this._ownSize !== false || this._reflecting || newValue === null) return;
        this._ownSize = true;
        this.requestUpdate();
    }

    reflectProperty(options) {
        // `attributeChangedCallback()` runs before `setAttribute()` returns.
        this._reflecting = true;
        try {
            super.reflectProperty(options);
        } finally {
            this._reflecting = false;
        }
    }

    watch() {
        return {
            ...super.watch(),
            // A size that is set later, as an attribute or from a script, is the field's own.
            size: () => {
                this._ownSize = true;
            },
        };
    }

    /**
     * Whether the page has given the field a size of its own. A field without one takes the size
     * of a container that gives one to its controls, a toolbar. The template marks the row with
     * the answer, and the stylesheet reads the mark. On the server no attribute has been written
     * by the element: one that is there is the one of the page.
     * @private
     * @returns {boolean}
     */
    _hasOwnSize() {
        if (this._ownSize === undefined) return !!this.hasAttribute?.('size');
        // A size that is not the default was set by someone: the watcher has not run yet when the
        // field renders with a size it has just got from a script.
        return this._ownSize || this.size !== 'medium';
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
                <div class="options ${this._hasOwnSize() ? '' : 'options--inherit-size'}">${this.fieldTemplate()}</div>
                ${this.errorTemplate()}
            </fieldset>
        `;
    }

    /** @private */
    fieldTemplate() {
        return this.options.map((option, index) => {
            const value = option.value ?? option;
            const label = option.label ?? value;
            const optionDisabled = this.disabled || !!option.disabled;
            const checked = this.value != null && String(this.value) === String(value);
            const id = `segment-${this.uuid}-${index}`;

            // The radio is hidden from the eye, and the segment after it is what is drawn in its
            // place: it shows whether the radio is checked, has the focus or is disabled, by the
            // stylesheet alone.
            return html`
                <label class="option" for="${id}" title="${option.icon ? label : null}">
                    <input
                        type="radio"
                        id="${id}"
                        name="${this.name}"
                        value="${value}"
                        ?checked="${checked}"
                        ?disabled="${optionDisabled}"
                        ?required="${this.required}"
                        aria-describedby="${this._describedBy()}"
                    />
                    <span class="segment">
                        ${
                            option.icon
                                ? html`<svg class="segment-icon" aria-hidden="true" focusable="false">
                                          <use href="${option.icon}"></use>
                                      </svg>
                                      <span class="segment-name">${label}</span>`
                                : html`<span class="option-label">${label}</span>`
                        }
                    </span>
                </label>
            `;
        });
    }
}

export function define() {
    defineElement('el-segmented-field', SegmentedField);
}
