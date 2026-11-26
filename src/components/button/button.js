import { TemplateElement, defineElement, html, classMap, spreadAttributes } from '@webtides/element-js';
import style from './button.style.js';
import Events from './button.events.js';

/**
 * The ARIA attributes of the element that its control takes over. The control is what has the
 * focus and what a screen reader announces; the element itself has no role. `aria-disabled` and
 * `aria-busy` are not among them: the button sets those itself, from `disabled` and `loading`.
 */
const ARIA_ATTRIBUTES = [
    'aria-label',
    'aria-description',
    'aria-expanded',
    'aria-haspopup',
    'aria-pressed',
    'aria-current',
];

/**
 * The ARIA attributes that name other elements by id, and the property of the control that takes
 * those elements. An id does not reach out of the shadow root the control is in, a reference to
 * the element does.
 */
const ARIA_RELATIONS = {
    'aria-labelledby': 'ariaLabelledByElements',
    'aria-describedby': 'ariaDescribedByElements',
    'aria-controls': 'ariaControlsElements',
};

/**
 * The attributes of the element that a native submit button has as well, and that the submit button
 * of the element takes over: the form it belongs to, and what it says for the one submit it starts.
 */
const SUBMITTER_ATTRIBUTES = ['form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget'];

/**
 * A themeable button that renders a native `<button>` — or an `<a>` when `href` is set — and
 * decorates it with the `--el-*` design tokens. Speaks the library's shared vocabulary: a semantic
 * `variant`, an `appearance` and a `size`. Also supports pill / circle shapes, an optional
 * dropdown caret and a loading spinner.
 *
 * ARIA attributes on the element reach the control inside it, which is what has the focus and what
 * a screen reader announces: `aria-label`, `aria-description`, `aria-expanded`, `aria-haspopup`,
 * `aria-pressed` and `aria-current` as they are, `aria-labelledby`, `aria-describedby` and
 * `aria-controls` as references to the elements they name.
 *
 * The element is form-associated: a `<fieldset disabled>` around it disables it, and it is listed in
 * the `elements` of its form. A button of the type `submit` submits its form with a hidden native
 * `<button type="submit">` in its content: it is the `submitter` of the `submit` event, its `name`
 * and `value` are in the data of the form, and Enter in a field of the form finds it. The element
 * makes that button when the form is first submitted with it, by a click or by Enter in a field.
 * Until then its content is what the page wrote, so a framework can hydrate a server-rendered
 * button, also when the element has started before the framework does. The attributes `form`,
 * `formaction`, `formenctype`, `formmethod`, `formnovalidate` and `formtarget` of the element do
 * what they do on a native button. A `click` listener of the page that calls `preventDefault()`
 * keeps the button from submitting or resetting.
 *
 * With `toggle` the button stays pressed: a click flips `pressed`, the control says so to assistive
 * technology (`aria-pressed`), and the button shows it. A `click` listener of the page that calls
 * `preventDefault()` keeps the button from flipping, as it keeps it from submitting.
 *
 * @element el-button
 *
 * @fires {CustomEvent<{ pressed: boolean }>} button-toggle - Fired when a click has flipped a
 *   toggle button. `detail.pressed` is the new state. Not fired when `pressed` is set from a script.
 *
 * @slot - The button's label.
 * @slot prefix - A presentational prefix icon or similar element.
 * @slot suffix - A presentational suffix icon or similar element.
 *
 * @csspart base - The internal `<button>` / `<a>`. The surface for background, border, radius.
 * @csspart prefix - Container wrapping the `prefix` slot.
 * @csspart label - The default-slot label wrapper.
 * @csspart suffix - Container wrapping the `suffix` slot.
 * @csspart caret - The dropdown caret, present only while `caret` is `true`.
 * @csspart spinner - The loading spinner, present only while `loading` is `true`.
 *
 * @property {'neutral'|'brand'|'success'|'warning'|'danger'} variant - Semantic variant, which
 *   picks the colours. Default `'neutral'`. Reflected to the `variant` attribute.
 * @property {'filled'|'outlined'|'plain'} appearance - How the colours of the variant are painted:
 *   as a fill, as a border around a transparent button, or as text only. Default `'filled'`.
 *   Reflected to the `appearance` attribute.
 * @property {'small'|'medium'|'large'} size - Button size. Default `'medium'`. Reflected to the
 *   `size` attribute.
 * @property {boolean} pill - Fully rounded ends.
 * @property {boolean} circle - Renders a square, fully-rounded icon button (use with a single icon).
 * @property {boolean} caret - Appends a dropdown caret after the label.
 * @property {boolean} loading - Shows a spinner and blocks interaction.
 * @property {boolean} disabled - Disables the button. Reflected to the `disabled` attribute, which is
 *   there while the button is disabled and gone while it is not.
 * @property {boolean} toggle - The button is a toggle button: it stays pressed. A click flips
 *   `pressed`, and the control has `aria-pressed`. Ignored when `href` is set. Default `false`.
 * @property {boolean} pressed - Whether a toggle button is pressed. Reflected to the `pressed`
 *   attribute of a toggle button. Without `toggle` it does nothing. Default `false`.
 * @property {'button'|'submit'|'reset'} type - Behaviour when activated. `submit` / `reset` act on
 *   the form of the button: the nearest ancestor `<form>`, or the one its `form` attribute names.
 *   Ignored when `href` is set. Default `'button'`.
 * @property {string} name - Name submitted with the form, when the form is submitted with this
 *   button (button mode only).
 * @property {string} value - Value submitted under that name (button mode only).
 * @property {string} href - When set, the button renders as a link to this URL.
 * @property {string} target - Where to open the linked URL (link mode only).
 * @property {string} rel - `rel` attribute for the link (link mode only). Default `'noreferrer noopener'`.
 * @property {string} download - Tells the browser to download the linked URL (link mode only).
 */
export default class Button extends TemplateElement {
    /**
     * The platform tells a form-associated element when a `<fieldset disabled>` around it disables
     * it, and resolves its `form` attribute.
     */
    static formAssociated = true;

    static get observedAttributes() {
        return [...ARIA_ATTRIBUTES, ...Object.keys(ARIA_RELATIONS), ...SUBMITTER_ATTRIBUTES, 'disabled'];
    }

    /**
     * The native submit button of a button of the type `submit`, see `_syncSubmitter()`.
     * @private
     * @type {HTMLButtonElement | undefined}
     */
    _submitter = undefined;

    /**
     * Where the element listens for Enter in a field of its form, see `afterUpdate()`.
     * @private
     * @type {Node | undefined}
     */
    _keydownRoot = undefined;

    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // A native submit button that the page writes into the content of the element is
            // taken with the next render, see `_syncSubmitter()`.
            mutationObserverOptions: { childList: true },
            // The shared style modules select the host by these attributes.
            propertyOptions: {
                variant: { reflect: true },
                appearance: { reflect: true },
                size: { reflect: true },
                // For the platform the attribute is what disables the element, see `reflectProperty()`.
                disabled: { reflect: true },
                // The attribute of a toggle button says whether it is pressed, see `reflectProperty()`.
                pressed: { reflect: true },
                // What a form submits is text. element-js parses every attribute, so that text which
                // reads as a number arrives as one: "1.50" as 1.5.
                name: { parse: false },
                value: { parse: false },
            },
        });
    }

    properties() {
        return {
            variant: 'neutral',
            appearance: 'filled',
            size: 'medium',
            pill: false,
            circle: false,
            caret: false,
            loading: false,
            disabled: false,
            toggle: false,
            pressed: false,
            type: 'button',
            name: '',
            value: '',
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            download: '',
        };
    }

    /** Whether the button renders as a link rather than a native button. */
    get isLink() {
        return !!this.href;
    }

    /**
     * Whether the button is a toggle button: one that stays pressed. A link leads somewhere, it
     * has no state to stay in.
     */
    get isToggle() {
        return !!this.toggle && !this.isLink;
    }

    watch() {
        return {
            // A button that becomes a toggle gets the attribute of its state.
            toggle: () => this.reflectProperty({ property: 'pressed', newValue: this.pressed }),
        };
    }

    /**
     * An ARIA attribute of the element, or one it shares with a native submit button, was set,
     * changed or removed. They are no properties of the component: the template and the submit
     * button read them from the element, so a change asks for a new render. Before the first render
     * there is nothing to do, it reads them anyway.
     *
     * `disabled` is a property. For the platform an attribute that is there disables a
     * form-associated element, whatever it says: the browser then keeps every click from it. The
     * library reads `disabled="false"` and an attribute without a value as not disabled, so those
     * are taken off the element.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'disabled') {
            if (newValue === 'false' || newValue === '') this.removeAttribute('disabled');
            return;
        }
        if (oldValue !== newValue && this.$refs?.control) this.requestUpdate();
    }

    /**
     * The platform says that the element is disabled, or no longer is: by its own attribute, or by a
     * `<fieldset disabled>` around it. The template asks the platform, see `_isDisabled()`.
     */
    formDisabledCallback() {
        if (this.$refs?.control) this.requestUpdate();
    }

    /**
     * `disabled` is reflected as the platform reads it: the attribute is there while the button is
     * disabled, and gone while it is not. element-js would write `disabled="false"`.
     * @param {{ property: string, newValue: unknown }} options
     */
    reflectProperty(options) {
        if (options.property === 'pressed') {
            this._reflectPressed(options.newValue);
            return;
        }
        if (options.property !== 'disabled') {
            super.reflectProperty(options);
            return;
        }
        if (!options.newValue) this.removeAttribute('disabled');
        else if (!this.hasAttribute('disabled')) this.setAttribute('disabled', 'true');
        // element-js reads an attribute that is gone as `null`. The property stays a boolean.
        if (options.newValue === null) this.disabled = false;
    }

    /**
     * `pressed` is the attribute of a toggle button: `"true"` or `"false"`, so that the page can
     * read the state and select by it. On a button that is no toggle the attribute says nothing,
     * and the element does not write it there.
     * @private
     * @param {unknown} pressed
     */
    _reflectPressed(pressed) {
        // element-js reads an attribute that is gone as `null`. The property stays a boolean.
        if (pressed === null || pressed === undefined || pressed === '') {
            this.pressed = false;
            return;
        }
        if (!this.isToggle) return;
        const text = pressed ? 'true' : 'false';
        if (this.getAttribute('pressed') !== text) this.setAttribute('pressed', text);
    }

    afterUpdate() {
        this._syncAriaRelations();
        this._syncSubmitter();

        // `keydown` passes the root of its tree on the way to the field, the document or a shadow
        // root: there the element hears Enter before the browser looks for the submit button.
        if (!this._keydownRoot) {
            this._keydownRoot = this.getRootNode();
            this._keydownRoot.addEventListener('keydown', this._onRootKeydown, true);
        }
    }

    disconnected() {
        this._keydownRoot?.removeEventListener('keydown', this._onRootKeydown, true);
        this._keydownRoot = undefined;
    }

    /**
     * Enter in a field of the form submits the form with its first submit button, and without one
     * only a form with a single field. The browser looks for that button once every listener has
     * had the key, so the native submit button of the element is made here, if it is not there yet.
     *
     * Only for a key the browser may submit with: Enter in an `<input>` or a `<select>` of the
     * form, and not while a text is being composed. Enter in a `<textarea>` is a line break, and
     * leaves the content of the element as it is.
     * @private
     * @param {KeyboardEvent} event
     */
    _onRootKeydown = (event) => {
        if (event.key !== 'Enter' || event.isComposing || this.isLink || this.type !== 'submit') return;
        const field = event.target;
        const form = this._internals.form;
        if (!form || field?.form !== form || !field.matches('input, select')) return;
        this._syncSubmitter(true);
    };

    /** Focuses the underlying control. */
    focus(options) {
        this.$refs.control?.focus(options);
    }

    /** Removes focus from the underlying control. */
    blur() {
        this.$refs.control?.blur();
    }

    /** Simulates a click on the underlying control. */
    click() {
        this.$refs.control?.click();
    }

    events() {
        return {
            '.button': {
                click: (event) => {
                    // Enter in a field of the form clicks the native submit button, which is in the
                    // label slot: that click passes the control, and has submitted the form already.
                    if (event.target === this._submitter) return;
                    if (this._isDisabled() || this.loading) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        return;
                    }
                    if (this.isLink) return;
                    // A toggle flips once the page has had the click, and not when a listener has
                    // prevented it: as a native checkbox takes its check mark back then.
                    if (this.isToggle) {
                        this._afterListeners(event, () => {
                            this.pressed = !this.pressed;
                            this.dispatch(Events.TOGGLE, { pressed: this.pressed });
                        });
                    }
                    // The control is in the shadow root, where it has no form. A submit goes through
                    // the native submit button of the element, a reset to the form of the element.
                    // Both are taken here, while the button is not disabled, and act once the page
                    // has had the click.
                    if (this.type === 'submit') {
                        const submitter = this._syncSubmitter(true);
                        this._afterListeners(event, () => submitter?.form?.requestSubmit(submitter));
                    } else if (this.type === 'reset') {
                        const form = this._internals.form;
                        this._afterListeners(event, () => form?.reset());
                    }
                },
            },
        };
    }

    /**
     * Runs `action` once every listener has had `event`, and not when one of them has prevented it:
     * what the platform does with the activation of a native control. The listener of the control
     * is the first on the path of a click, before every listener of the page.
     *
     * The last target on the path is the window, and a listener that is added there now comes after
     * the ones it has: `action` runs inside of the click, as a caller of `click()` expects. A
     * listener on the way that stops the event keeps it from getting there. The platform acts all
     * the same, so `action` runs a task later then.
     * @private
     * @param {Event} event
     * @param {() => void} action
     */
    _afterListeners(event, action) {
        const end = event.composedPath().at(-1);
        let timer;
        const act = () => {
            clearTimeout(timer);
            end.removeEventListener(event.type, act);
            if (!event.defaultPrevented) action();
        };
        end.addEventListener(event.type, act);
        timer = setTimeout(act);
    }

    /**
     * Whether the button is disabled: by its own `disabled`, or by a `<fieldset disabled>` around
     * it. The platform knows the second, and counts the attribute of the element as well. On the
     * server there is no tree to ask.
     * @private
     * @returns {boolean}
     */
    _isDisabled() {
        return !!this.disabled || !!this.matches?.(':disabled');
    }

    /**
     * Keeps the native submit button of a button of the type `submit`: a hidden
     * `<button type="submit">` in the content of the element, in the page, where it belongs to the
     * form. A form is submitted with a submit button that belongs to it, and with nothing else: the
     * button is the `submitter` of the `submit` event, its `name` and `value` are in the data, it
     * says how to submit (`formmethod`, `formnovalidate`, …), and Enter in a field looks for it.
     * The control in the shadow root has no form, and the element itself is no submit button for the
     * platform.
     *
     * The button takes over `name`, `value` and the attributes of the element that a native submit
     * button has. It is disabled while the element is disabled or loading, which keeps Enter from
     * submitting as well. One that is in the content already is taken: written by the page, for a
     * form that is submitted with Enter before the script has run, or copied with the element.
     *
     * The element makes the button only when the form is about to be submitted with it (`create`):
     * with a click, or with Enter in a field. A render does not. The content of the element is what
     * the page wrote until then: a framework that hydrates a server-rendered page after the element
     * has started finds the children it rendered, and no other.
     * @private
     * @param {boolean} [create] - Whether to make the button when there is none.
     * @returns {HTMLButtonElement | null} The submit button, or `null`: for a button of another
     *   type, and while there is none and none was asked for.
     */
    _syncSubmitter(create = false) {
        const ours = this._submitter?.parentNode === this ? this._submitter : null;
        let submitter = ours ?? this.querySelector(':scope > button[type="submit"][hidden]');

        if (this.isLink || this.type !== 'submit') {
            ours?.remove();
            this._submitter = undefined;
            return null;
        }

        if (!submitter && !create) {
            this._submitter = undefined;
            return null;
        }

        if (!submitter) {
            submitter = document.createElement('button');
            submitter.type = 'submit';
            submitter.hidden = true;
            this.append(submitter);
        }
        this._submitter = submitter;

        // A rule of the page for buttons does not show it.
        submitter.style.setProperty('display', 'none', 'important');
        submitter.disabled = this._isDisabled() || !!this.loading;

        // A script may set a number. An empty text is no attribute, as on the control.
        const text = (value) => (value === '' || value === null || value === undefined ? null : String(value));
        const attributes = { name: text(this.name), value: text(this.value) };
        for (const name of SUBMITTER_ATTRIBUTES) attributes[name] = this.getAttribute(name);
        for (const [name, value] of Object.entries(attributes)) {
            if (value === null) submitter.removeAttribute(name);
            else if (submitter.getAttribute(name) !== value) submitter.setAttribute(name, value);
        }
        return submitter;
    }

    /**
     * The ARIA attributes of the element, for the control. An empty one counts as not set: none of
     * them has an empty value, and element-js writes an attribute that was there from the start
     * back as an empty one when it is removed.
     * @private
     * @returns {Object<string, string | undefined>}
     */
    _ariaAttributes() {
        const attributes = Object.fromEntries(
            ARIA_ATTRIBUTES.map((name) => [name, this.getAttribute(name) || undefined]),
        );
        // The state of a toggle button is its own. Without `toggle` the `aria-pressed` of the page
        // goes through as it is, and a button that has neither has no `aria-pressed`.
        if (this.isToggle) attributes['aria-pressed'] = this.pressed ? 'true' : 'false';
        return attributes;
    }

    /**
     * Hands the control the elements that the element names by id in `aria-labelledby`,
     * `aria-describedby` and `aria-controls`. They are looked up when the button renders, so an
     * element that comes into the page later is found once the attribute is set again.
     * @private
     */
    _syncAriaRelations() {
        const control = this.$refs.control;
        if (!control) return;

        const root = this.getRootNode();
        for (const [attribute, property] of Object.entries(ARIA_RELATIONS)) {
            // A browser without element references stays where it was: without the relation.
            if (!(property in control)) continue;
            const ids = this.getAttribute(attribute)?.trim().split(/\s+/) ?? [];
            const elements = ids.map((id) => root.getElementById?.(id)).filter(Boolean);
            control[property] = elements.length > 0 ? elements : null;
        }
    }

    /** @private */
    contentTemplate() {
        return html`
            <slot part="prefix" name="prefix"></slot>
            <slot part="label"></slot>
            <slot part="suffix" name="suffix"></slot>
            ${this.caret ? html`<span part="caret" class="caret" aria-hidden="true">▾</span>` : ''}
            ${this.loading ? html`<span part="spinner" class="spinner" aria-hidden="true"></span>` : ''}
        `;
    }

    template() {
        const classes = {
            button: true,
            'button--pill': !!this.pill,
            'button--circle': !!this.circle,
            'button--loading': !!this.loading,
            'button--caret': !!this.caret,
        };
        const disabled = this._isDisabled();

        if (this.isLink) {
            return html`
                <a
                    ref="control"
                    part="base"
                    class="${classMap(classes)}"
                    role="button"
                    aria-disabled="${disabled ? 'true' : 'false'}"
                    aria-busy="${this.loading ? 'true' : 'false'}"
                    tabindex="${disabled ? '-1' : '0'}"
                    ${spreadAttributes({
                        href: disabled ? undefined : this.href,
                        target: this.target || undefined,
                        rel: this.target ? this.rel : undefined,
                        download: this.download || undefined,
                        ...this._ariaAttributes(),
                    })}
                >
                    ${this.contentTemplate()}
                </a>
            `;
        }

        return html`
            <button
                ref="control"
                part="base"
                class="${classMap(classes)}"
                type="${this.type}"
                ?disabled="${disabled}"
                aria-busy="${this.loading ? 'true' : 'false'}"
                ${spreadAttributes({
                    name: this.name || undefined,
                    value: this.value || undefined,
                    ...this._ariaAttributes(),
                })}
            >
                ${this.contentTemplate()}
            </button>
        `;
    }
}

export function define() {
    defineElement('el-button', Button);
}

export { Events };
