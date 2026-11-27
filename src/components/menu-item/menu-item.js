import { TemplateElement, defineElement, html, classMap } from '@webtides/element-js';
import { hasSlotted } from '../../utils/slots.js';
import style from './menu-item.style.js';

/**
 * One entry of an `el-menu`: an action, or a link with an address. A menu item to assistive
 * technology (`role="menuitem"`). The menu moves the focus of the keyboard to it, so it is no stop
 * of the Tab key itself.
 *
 * Choosing an entry is a click on it: listen for `click` on the entry, or for `menu-select` on the
 * menu, which names the entry and its `value`.
 *
 * An entry can set something instead of doing something. With `type="checkbox"` it is on or off
 * (`role="menuitemcheckbox"`), with `type="radio"` it is one of several of which one is chosen
 * (`role="menuitemradio"`), and `checked` is its state, which it says (`aria-checked`) and shows
 * with a mark in front of its text. The page sets `checked`: the entry does not change it when
 * it is chosen.
 *
 * @element el-menu-item
 *
 * @slot - The text of the entry.
 * @slot icon - An icon in front of the text: a decoration, the text is the name.
 *
 * @csspart base - The entry: a `<button>`, or an `<a>` with `href`.
 * @csspart mark - The place of the mark of an entry with a `type`: a check, or a dot. It is
 *   there while the entry is not checked as well.
 * @csspart icon - The place of the icon.
 * @csspart label - The text of the entry.
 *
 * @property {string} href - The address the entry leads to. With one it is a link.
 * @property {string} target - Where to open the address.
 * @property {string} rel - `rel` attribute for the link, written when `target` is set. Default
 *   `'noreferrer noopener'`.
 * @property {string} value - What the entry stands for, for the listener of `menu-select`:
 *   `'delete'`. Default `''`.
 * @property {boolean} disabled - Whether the entry cannot be chosen. The keyboard still gets to
 *   it. Default `false`.
 * @property {'normal'|'checkbox'|'radio'} type - What the entry is: an action or a link
 *   (`'normal'`), an entry that is on or off (`'checkbox'`), or one of several of which one is
 *   chosen (`'radio'`). Default `'normal'`.
 * @property {boolean} checked - Whether an entry with the `type` `checkbox` is on, or one with
 *   the `type` `radio` is the chosen one. The page sets it. Default `false`.
 * @property {'neutral'|'brand'|'success'|'warning'|'danger'} variant - The variant of the entry:
 *   `danger` for something that cannot be undone. Default `'neutral'`. Reflected to the `variant`
 *   attribute.
 */
export default class MenuItem extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The shared variants module selects the host by this attribute.
            propertyOptions: { variant: { reflect: true } },
        });
    }

    properties() {
        return {
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            value: '',
            disabled: false,
            type: 'normal',
            checked: false,
            variant: 'neutral',
        };
    }

    events() {
        return {
            "[part~='base']": {
                // A template element does not render again when a child comes, goes or changes
                // its `slot` attribute. The slot tells of all three.
                slotchange: () => this.requestUpdate(),
                // An entry that is disabled keeps its click to itself: the page hears nothing.
                click: (event) => {
                    if (!this._disabled()) return;
                    event.preventDefault();
                    event.stopPropagation();
                },
            },
        };
    }

    /**
     * Puts the focus on the entry: on the control inside of it.
     * @param {FocusOptions} [options]
     */
    focus(options) {
        this.shadowRoot?.querySelector("[part~='base']")?.focus(options);
    }

    /**
     * @private
     * @returns {boolean}
     */
    _disabled() {
        return this.disabled === true || this.disabled === 'true' || this.disabled === '';
    }

    /**
     * Whether the entry is checked: `checked` is there as an attribute without a value, or true.
     * @private
     * @returns {boolean}
     */
    _checked() {
        return this.checked === true || this.checked === 'true' || this.checked === '';
    }

    template() {
        const disabled = this._disabled();
        // An entry with a type says its state, also while it is off and while it is disabled.
        const checkable = this.type === 'checkbox' || this.type === 'radio';
        const role = checkable ? `menuitem${this.type}` : 'menuitem';
        const checked = checkable ? String(this._checked()) : null;
        const classes = classMap({
            item: true,
            'item--disabled': disabled,
            'item--checkbox': this.type === 'checkbox',
            'item--radio': this.type === 'radio',
        });
        // The mark is drawn by the stylesheet, from the state the control says. Its place is
        // there for every entry with a type, so a text does not move when its entry is checked.
        const content = html`
            <span part="mark" class="mark" aria-hidden="true" ?hidden="${!checkable}"></span>
            <span part="icon" class="icon" ?hidden="${!hasSlotted(this, 'icon')}"><slot name="icon"></slot></span>
            <span part="label" class="label"><slot></slot></span>
        `;

        // The role and the place in the order of the Tab key are inside of the shadow root: they
        // are part of the server-rendered markup that way. A link that is disabled has no address
        // to follow, so it is the button.
        if (this.href && !disabled) {
            return html`
                <a
                    part="base"
                    class="${classes}"
                    role="${role}"
                    aria-checked="${checked}"
                    tabindex="-1"
                    href="${this.href}"
                    target="${this.target || null}"
                    rel="${this.target ? this.rel : null}"
                    >${content}</a
                >
            `;
        }

        return html`
            <button
                part="base"
                class="${classes}"
                type="button"
                role="${role}"
                aria-checked="${checked}"
                tabindex="-1"
                aria-disabled="${disabled ? 'true' : null}"
            >
                ${content}
            </button>
        `;
    }
}

export function define() {
    defineElement('el-menu-item', MenuItem);
}
