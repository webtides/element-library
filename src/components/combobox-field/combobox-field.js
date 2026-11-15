import { html, defineElement } from '@webtides/element-js';
import InputField from '../input-field/input-field.js';
import style from './combobox-field.style.js';

/**
 * A text the user writes, with suggestions the browser offers while they type: a city, a job
 * title, the name of a product. Extends `InputField` (and therefore `FormField`), inheriting the
 * label / help / error / validation surface and the look from `styles/native.css`.
 *
 * The suggestions are a native `<datalist>`: the browser filters and shows them, and the keyboard
 * and a screen reader work as the browser has them. A suggestion is an offer, not a limit: the
 * value is free text. For a choice from a fixed list there is `el-select-field`.
 *
 * @element el-combobox-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the value changes: typed, or picked from
 *   the suggestions. `detail` is the new value. Bubbles.
 *
 * @property {Array<string | { value: string, label?: string }>} options - The suggestions: plain
 *   strings (`['Berlin', 'Bern']`) or option objects. The `value` is what a pick writes into the
 *   control; a `label` is a text the browser may show with it. Without options the control has no
 *   list and is a plain text input.
 */
export default class ComboboxField extends InputField {
    constructor(options) {
        super({ shadowRender: false, styles: [style], ...options });
    }

    properties() {
        return {
            ...super.properties(),
            options: [],
        };
    }

    events() {
        const events = super.events();
        return {
            ...events,
            '[ref=input]': {
                ...events['[ref=input]'],
                // A pick from the suggestions presses no key that the field would hear, and not
                // every browser fires `change` before the control is left.
                input: () => this.onChange(),
            },
        };
    }

    /**
     * The suggestions of `options`, as the options of the list.
     * @private
     * @returns {Array<{ value: string, label: string | null }>}
     */
    _suggestions() {
        if (!Array.isArray(this.options)) return [];
        return this.options.map((option) => ({
            value: String(option?.value ?? option),
            label: option?.label ?? null,
        }));
    }

    /**
     * The control names its list. Without suggestions it has none: a list that is empty would
     * still make the control a combobox for a screen reader, one that offers nothing.
     * @private
     */
    _controlAttributes() {
        return { list: this._suggestions().length > 0 ? this._idOf('list') : null };
    }

    /** @private */
    fieldTemplate() {
        return html`${super.fieldTemplate()} ${this.listTemplate()}`;
    }

    /**
     * The suggestions, in the list the control names. The id is the one of this field alone, so
     * two fields of a page do not offer the suggestions of each other.
     * @private
     */
    listTemplate() {
        const suggestions = this._suggestions();
        if (suggestions.length === 0) return null;

        return html`
            <datalist id="${this._idOf('list')}">
                ${suggestions.map(
                    (suggestion) => html`<option value="${suggestion.value}" label="${suggestion.label}"></option>`,
                )}
            </datalist>
        `;
    }
}

export function define() {
    defineElement('el-combobox-field', ComboboxField);
}
