import { html, defineElement, when } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import style from './select-field.style.js';

/**
 * Native `<select>` wrapper with label, help text, validation feedback and a custom
 * dropdown indicator. Extends `FormField` and inherits its label / help / error /
 * required surface.
 *
 * @element el-select-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the selected value changes.
 *   `detail` is the new value. Bubbles.
 *
 * @property {string | null} value - The value of the selected option. Setting it selects the
 *   option with that value, when the field is rendered and later. Without a value the field takes
 *   over what the select shows: the option marked `selected` in `options`, or else the first one.
 *   It stays `null` while the placeholder is shown. An empty value that none of `options` has
 *   counts as no value.
 * @property {string} placeholder - Placeholder text rendered as the first disabled `<option>`
 *   when no selection has been made.
 * @property {Array<string | { value: string, label?: string, selected?: boolean }>} options -
 *   Options to render. Accepts plain strings (`['Apple', 'Pear']`) or option objects
 *   (`[{ value, label, selected? }]`). Strings are used as both value and label. `selected` is the
 *   choice of a field without a `value`; a `value` wins over it.
 */
export default class SelectField extends FormField {
    /**
     * The value the field last took over from the select, see `_syncSelection()`.
     * @private
     */
    _adoptedValue = undefined;

    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            ...super.properties(),
            placeholder: '',
            options: [],
        };
    }

    watch() {
        const watchers = super.watch();
        return {
            ...watchers,
            value: (value, oldValue) => {
                // What the field took over from the select is no change: nobody chose anything.
                if (this._adoptedValue !== undefined && value === this._adoptedValue) {
                    this._adoptedValue = undefined;
                    return;
                }
                watchers.value(value, oldValue);
            },
        };
    }

    afterUpdate() {
        // Before the form field keeps the state for a reset: what the field takes over from the
        // select is part of it.
        this._syncSelection();
        super.afterUpdate();
    }

    /**
     * Makes the select and `value` say the same, after every render.
     *
     * The template marks the option of the value as `selected`, which is all that server-rendered
     * markup and a fresh select need. That attribute is only the default of an option: once the user
     * has chosen, the browser no longer follows it. So the option is selected here as well.
     *
     * Without a value, or without an option for it, the select has its default: the option the
     * markup marks, the last one if there are several, or else the first one that is not disabled.
     * That is what the browser selects in fresh markup. A field without a value then takes over
     * what the select shows, so that `value` says what the form submits. The placeholder has no
     * value, the field keeps its own for it. A value without an option is left alone: its option
     * can still arrive with `options`.
     * @private
     */
    _syncSelection() {
        const select = this.$refs.input;
        if (!select) return;

        const all = [...select.options];
        // The placeholder is the first option of the select and none of `options`.
        const options = this.placeholder ? all.slice(1) : all;
        const hasValue = this._hasValue();
        const option =
            (hasValue && options.find((candidate) => candidate.value === String(this.value))) ||
            all.filter((candidate) => candidate.defaultSelected).pop() ||
            all.find((candidate) => !candidate.disabled);
        if (option && !option.selected) option.selected = true;

        if (!hasValue && select.value !== '') {
            this._adoptedValue = select.value;
            this.value = select.value;
        }
    }

    /**
     * Whether the field has a value that decides which option is selected. `null` is none. An empty
     * value is none either, unless one of `options` has it: element-js writes a `null` back as an
     * empty attribute where the value came from an attribute, and a page that renders
     * `value=""` for "nothing chosen yet" means the same.
     * @private
     * @returns {boolean}
     */
    _hasValue() {
        if (this.value == null) return false;
        return this.value !== '' || this.options.some((option) => String(option.value ?? option) === '');
    }

    /**
     * Whether an option carries `selected` in the markup: the option of the value, or, for a field
     * without a value, the one that `options` marks.
     * @private
     * @param {string | { value: string, selected?: boolean }} option
     * @returns {boolean}
     */
    _marksSelected(option) {
        if (this._hasValue()) return String(option.value ?? option) === String(this.value);
        return !!option.selected;
    }

    /** @private */
    fieldTemplate() {
        return html`
            <select
                ref="input"
                id="input-${this.name}"
                name="${this.name}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                aria-describedby="${this._describedBy()}"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this.name}-error-message"
            >
                ${when(this.placeholder, html` <option value="" selected disabled>${this.placeholder}</option> `)}
                ${this.options.map((option) => {
                    return html`
                        <option value="${option.value ?? option}" ?selected="${this._marksSelected(option)}">
                            ${option.label ?? option}
                        </option>
                    `;
                })}
            </select>
            ${this.dropdownIndicatorTemplate()}
        `;
    }

    /** @private */
    dropdownIndicatorTemplate() {
        return html`
            <div class="dropdown-indicator" aria-hidden="true">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-select-field', SelectField);
}
