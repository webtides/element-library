import { TemplateElement, defineElement, html, classMap, spreadAttributes } from '@webtides/element-js';
import style from './button.style.js';

/**
 * A themeable button that renders a native `<button>` — or an `<a>` when `href` is set — and
 * decorates it with the `--el-*` design tokens. Supports semantic variants, sizes, outline /
 * pill / circle shapes, an optional dropdown caret and a loading spinner. API modelled on
 * Shoelace's `<sl-button>`.
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
 * @property {'default'|'primary'|'success'|'neutral'|'warning'|'danger'|'text'} variant - Visual
 *   variant. Default `'default'`.
 * @property {'small'|'medium'|'large'} size - Button size. Default `'medium'`.
 * @property {boolean} outline - Draws the button as an outline (transparent fill, colored border).
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
    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    properties() {
        return {
            variant: 'default',
            size: 'medium',
            outline: false,
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
            [`button--${this.variant}`]: true,
            [`button--${this.size}`]: true,
            'button--outline': !!this.outline,
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
