import { html, defineElement, classMap, when, optionalAttribute, spreadAttributes } from '@webtides/element-js';
import FormField from '../form-field/form-field.js';
import {
    lengthAttribute,
    shadowNativeTextEntryProperties,
    textEntryAttributes,
} from '../../utils/text-entry-attributes.js';
import style from './input-field.style.js';

/** What is a control of its own in the content of the page: it has a name and a stop of the Tab key. */
const CONTROL = 'a[href], button, input, select, textarea, [tabindex], el-button, el-copy-button';

/** What takes the focus of a click itself. Asked of everything a click has passed, shadow roots included. */
const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]';

/**
 * Native `<input>` wrapper with label, help text, validation feedback (visual checkmark /
 * cross indicators) and ARIA wiring. Extends `FormField` and inherits its label / help /
 * error / required surface.
 *
 * The page can put content at the start and at the end of the control: an element with
 * `slot="start"` or `slot="end"` among the children of the field. The field has no shadow root,
 * so these are no slots of the platform: the field takes the elements into its control when it
 * renders. And `clearable` adds a button that empties the field.
 *
 * @element el-input-field
 *
 * @fires {CustomEvent<string>} input-change - Fired when the input's value changes.
 *   `detail` is the new value. Bubbles.
 *
 * @slot start - Content at the start of the control, in front of the text: an icon, a text, a
 *   button. An element of the page with `slot="start"`.
 * @slot end - Content at the end of the control, after the text: a unit, a button. An element of
 *   the page with `slot="end"`.
 *
 * @property {string} type - Native `type` attribute of the underlying `<input>` (e.g.
 *   `'text'`, `'email'`, `'password'`, `'tel'`, `'url'`).
 * @property {'small'|'medium'|'large'} size - Size of the control: its height, its padding and its
 *   font size. Default `'medium'`. Reflected to the `size` attribute. It shows once the control is
 *   decorated (`styles/native.css`); a control with the look of the browser keeps its size.
 * @property {string} placeholder - Placeholder text shown while the input is empty.
 * @property {string | false} pattern - Regular expression used as the input's `pattern`
 *   attribute. When `false` (the default), the `pattern` attribute is omitted entirely, so
 *   the field applies no pattern constraint.
 * @property {boolean} clearable - Whether the control has a button that empties it. The button
 *   shows while the field has a value and is not disabled. Default `false`.
 * @property {string} clearLabel - The name of that button for assistive technology. Default
 *   `'Clear'`.
 * @property {number | null} maxlength - Passed on to the control as `maxlength`: the browser takes
 *   no more characters than this while the user types. `null` (the default) leaves the attribute
 *   out.
 * @property {number | null} minlength - Passed on as `minlength`: a text the user has typed that is
 *   shorter makes the field invalid. `null` (the default) leaves the attribute out.
 * @property {string | null} autocomplete - Passed on to the control as its `autocomplete`
 *   attribute (e.g. `'email'`, `'current-password'`, `'one-time-code'`). `null` (the default)
 *   leaves the attribute out. The same holds for the five properties below.
 * @property {string | null} inputmode - Passed on as `inputmode`: the on-screen keyboard to show
 *   (e.g. `'numeric'`, `'email'`).
 * @property {string | null} enterkeyhint - Passed on as `enterkeyhint`: the label of the enter key
 *   on an on-screen keyboard (e.g. `'next'`, `'send'`).
 * @property {string | null} autocapitalize - Passed on as `autocapitalize` (e.g. `'none'`,
 *   `'sentences'`).
 * @property {string | null} autocorrect - Passed on as `autocorrect` (`'on'` or `'off'`).
 * @property {boolean | string | null} spellcheck - Passed on as `spellcheck` (`true` or `false`).
 */
export default class InputField extends FormField {
    constructor(options) {
        super({
            shadowRender: false,
            styles: [style],
            // The size module selects the host by this attribute.
            propertyOptions: { size: { reflect: true } },
            ...options,
        });
        shadowNativeTextEntryProperties(this);
    }

    properties() {
        return {
            ...super.properties(),
            type: 'text',
            size: 'medium',
            placeholder: '',
            pattern: false,
            clearable: false,
            clearLabel: 'Clear',
            maxlength: null,
            minlength: null,
            autocomplete: null,
            inputmode: null,
            enterkeyhint: null,
            autocapitalize: null,
            autocorrect: null,
            spellcheck: null,
        };
    }

    connectedCallback() {
        // A server renders the template without the lifecycle: from here on the field is in a
        // browser, and what the page has put into it are nodes the template takes in.
        this._started = true;
        super.connectedCallback();
    }

    watch() {
        const watchers = super.watch();
        return {
            ...watchers,
            value: (value, oldValue) => {
                // The value attribute of an input is only its default: once the user has typed, a
                // value set from outside has to be written to the control as well.
                this._syncControlValue();
                watchers.value(value, oldValue);
            },
        };
    }

    events() {
        const events = super.events();
        return {
            ...events,
            '.control': {
                click: (event) => this._onControlClick(event),
            },
            '[data-clear]': {
                click: () => this.clearInput(),
            },
        };
    }

    /**
     * The elements the page has put into the field for the start or the end of its control:
     * `<span slot="end">€</span>`. They are children of the field until it renders, and in
     * their place in the control from then on, also in server-rendered markup. An element that
     * comes later is taken in with the next render.
     * @private
     * @param {'start'|'end'} name
     * @returns {Element[]}
     */
    _slotted(name) {
        const placed = this._started ? this.querySelector(`:scope > .field > .control > .control-${name}`) : null;
        return [
            ...(placed ? placed.children : []),
            ...[...this.children].filter((child) => child.getAttribute('slot') === name),
        ];
    }

    /**
     * The content for a place in the control. In a browser the elements of the page themselves:
     * they are moved, not copied, and stay where they are with every render. On a server their
     * markup, written as it is.
     *
     * That is what `unsafeHTML()` gives on a server. It is written out here because the directive
     * gives nodes wherever there is a DOM, and a template that is turned into a string in a
     * browser, as the tests of the server-rendered markup do, would lose them.
     * @private
     * @param {Element[]} elements
     * @returns {Element[] | { __unsafeHTML: true, string: string }}
     */
    _content(elements) {
        if (this._started) return elements;
        return { __unsafeHTML: true, string: elements.map((element) => element.outerHTML).join('') };
    }

    /**
     * Whether what the page has put at a place describes the value: a unit, a currency, the start
     * of an address. A screen reader reads it with the input then. A control there, a button or
     * a link, has a name and a stop of the Tab key itself, and is no description. An icon is none
     * either: it has no text, and is hidden from assistive technology (`aria-hidden`).
     * @private
     * @param {Element[]} elements
     * @returns {boolean}
     */
    _describes(elements) {
        return (
            elements.some((element) => element.textContent.trim() !== '') &&
            !elements.some((element) => element.matches(CONTROL) || element.querySelector(CONTROL))
        );
    }

    /**
     * The description of the control: what the page has put at its start and at its end, then the
     * messages of the field.
     * @private
     * @returns {string}
     */
    _describedBy() {
        const { start = [], end = [] } = this._controlContent ?? {};
        const ids = [];
        if (this._describes(start)) ids.push(this._idOf('control-start'));
        if (this._describes(end)) ids.push(this._idOf('control-end'));
        return [...ids, super._describedBy()].join(' ');
    }

    /**
     * A click on the control beside its input, on a text or an icon of the page, puts the focus
     * into the input: to the eye all of it is the control. A control in the content, the button
     * that clears the field and the input itself keep their click.
     * @private
     * @param {MouseEvent} event
     */
    _onControlClick(event) {
        const path = event.composedPath();
        const inside = path.slice(0, path.indexOf(event.currentTarget));
        if (inside.some((node) => node instanceof Element && node.matches(FOCUSABLE))) return;
        this.$refs.input.focus();
    }

    /**
     * The pattern of the control. A field that extends this one can have a pattern of its own
     * where the page gives none (`OtpField`).
     * @private
     * @returns {string | false}
     */
    _pattern() {
        return this.pattern;
    }

    /**
     * Attributes of the control that this field has no property for. A field that extends this one
     * has: the list of its suggestions (`ComboboxField`), the limits and the step of a date
     * (`DateField`). One that is `null` or missing is left out.
     *
     * Each of them is a binding of its own in the template, which writes an attribute when its
     * value has changed. `spreadAttributes()` writes its attributes with every render, and that is
     * not the same for these: a control for a date drops what the user has entered of a date so
     * far when its limits are written again.
     * @private
     * @returns {{ list?: string | null, min?: string | null, max?: string | null, step?: number | string | null }}
     */
    _controlAttributes() {
        return {};
    }

    /** @private */
    fieldTemplate() {
        const pattern = this._pattern();
        const { list = null, min = null, max = null, step = null } = this._controlAttributes();
        const start = this._slotted('start');
        const end = this._slotted('end');
        const clearable = this.clearable === true || this.clearable === 'true' || this.clearable === '';
        // The description of the input names the content, so it is found before the input.
        this._controlContent = { start, end };

        const input = html`
            <input
                ref="input"
                id="${this._idOf('input')}"
                name="${this.name}"
                type="${this.type}"
                value="${this.value}"
                placeholder="${this.placeholder}"
                ?required="${this.required}"
                ?disabled="${this.disabled}"
                ${optionalAttribute(pattern, 'pattern', pattern)}
                list="${list}"
                min="${min}"
                max="${max}"
                step="${step}"
                maxlength="${lengthAttribute(this.maxlength)}"
                minlength="${lengthAttribute(this.minlength)}"
                ${spreadAttributes(textEntryAttributes(this))}
                aria-describedby="${this._describedBy()}"
                aria-invalid="${this.valid ? 'false' : 'true'}"
                aria-errormessage="${this._idOf('error-message')}"
            />
        `;
        const validity = when(
            this.touched,
            html`
                <div class="validity ${classMap({ 'is-valid': !!this.valid, 'is-invalid': !this.valid })}">
                    ${when(
                        this.valid,
                        html` <span class="valid h-4 w-4">&checkmark;</span> `,
                        html` <span class="invalid h-4 w-4" data-clear-input>&cross;</span> `,
                    )}
                </div>
            `,
        );

        // A field without any of it is its input, as it was.
        if (!start.length && !end.length && !clearable) return html`${input} ${validity}`;

        // The button shows while there is something to clear, and has its place in the markup
        // all the time. The mark of the validity stays beside the control.
        const clears = clearable && String(this.value ?? '') !== '' && !this.disabled;
        return html`
            <div class="control">
                <span
                    id="${this._idOf('control-start')}"
                    class="control-content control-start"
                    ?hidden="${!start.length}"
                    >${this._content(start)}</span
                >
                ${input}
                <button
                    type="button"
                    class="control-clear"
                    data-clear
                    aria-label="${this.clearLabel}"
                    ?hidden="${!clears}"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        aria-hidden="true"
                    >
                        <path d="M6 6l12 12M18 6L6 18"></path>
                    </svg>
                </button>
                <span id="${this._idOf('control-end')}" class="control-content control-end" ?hidden="${!end.length}"
                    >${this._content(end)}</span
                >
            </div>
            ${validity}
        `;
    }
}

export function define() {
    defineElement('el-input-field', InputField);
}
