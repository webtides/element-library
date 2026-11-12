import { TemplateElement, defineElement, html, classMap, spreadAttributes } from '@webtides/element-js';
import style from './button.style.js';

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
 * @element el-button
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
 * @property {boolean} disabled - Disables the button.
 * @property {'button'|'submit'|'reset'} type - Behaviour when activated. `submit` / `reset` act on
 *   the nearest ancestor `<form>`. Ignored when `href` is set. Default `'button'`.
 * @property {string} name - Name submitted with the owning form (button mode only).
 * @property {string} value - Value submitted with the owning form (button mode only).
 * @property {string} href - When set, the button renders as a link to this URL.
 * @property {string} target - Where to open the linked URL (link mode only).
 * @property {string} rel - `rel` attribute for the link (link mode only). Default `'noreferrer noopener'`.
 * @property {string} download - Tells the browser to download the linked URL (link mode only).
 */
export default class Button extends TemplateElement {
    static get observedAttributes() {
        return [...ARIA_ATTRIBUTES, ...Object.keys(ARIA_RELATIONS)];
    }

    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The shared style modules select the host by these attributes.
            propertyOptions: {
                variant: { reflect: true },
                appearance: { reflect: true },
                size: { reflect: true },
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
     * An ARIA attribute of the element was set, changed or removed. They are no properties of the
     * component: the template reads them from the element, so a change asks for a new render.
     * Before the first render there is nothing to do, it reads them anyway.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.$refs?.control) this.requestUpdate();
    }

    afterUpdate() {
        this._syncAriaRelations();
    }

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
                    if (this.disabled || this.loading) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        return;
                    }
                    // Shadow DOM swallows the native submit/reset, so drive the nearest form by hand.
                    if (!this.isLink && (this.type === 'submit' || this.type === 'reset')) {
                        const form = this.closest('form');
                        if (form) {
                            if (this.type === 'submit') form.requestSubmit();
                            else form.reset();
                        }
                    }
                },
            },
        };
    }

    /**
     * The ARIA attributes of the element, for the control. An empty one counts as not set: none of
     * them has an empty value, and element-js writes an attribute that was there from the start
     * back as an empty one when it is removed.
     * @private
     * @returns {Object<string, string | undefined>}
     */
    _ariaAttributes() {
        return Object.fromEntries(ARIA_ATTRIBUTES.map((name) => [name, this.getAttribute(name) || undefined]));
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

        if (this.isLink) {
            return html`
                <a
                    ref="control"
                    part="base"
                    class="${classMap(classes)}"
                    role="button"
                    aria-disabled="${this.disabled ? 'true' : 'false'}"
                    aria-busy="${this.loading ? 'true' : 'false'}"
                    tabindex="${this.disabled ? '-1' : '0'}"
                    ${spreadAttributes({
                        href: this.disabled ? undefined : this.href,
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
                ?disabled="${this.disabled}"
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
