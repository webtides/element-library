import { TemplateElement, defineElement, html, classMap, spreadAttributes } from '@webtides/element-js';
import { hasSlotted } from '../../utils/slots.js';
import style from './tree-item.style.js';
import Events from './tree-item.events.js';

/**
 * One entry of an `el-tree`, and the entries below it. It has the parts of a row of a list: an
 * icon at the start, its name, a count at the end. With `href` the name is a link, and the whole
 * row is its target. An entry with entries below it has a button that opens and closes them; its
 * state is the `open` attribute, which the page can render.
 *
 * The entries below it are the `el-tree-item` elements the page writes into it.
 *
 * @element el-tree-item
 *
 * @fires {CustomEvent<{ open: boolean }>} tree-item-toggle - Fired when the user has opened or
 *   closed the entry, with its button or with the arrow keys. `detail.open` is the new state. Not
 *   fired when `open` is set from a script. It bubbles: an entry further up hears it as well, so
 *   look at `event.target`.
 *
 * @slot - The entries below this one: `el-tree-item` elements.
 * @slot label - The name of the entry. Takes precedence over the `label` attribute.
 * @slot start - What stands in front of the name: an icon.
 * @slot end - What stands at the end of the row: a count. In an entry that is a link it is part
 *   of the target of the link.
 *
 * @csspart base - The entry: an item of the list it is in.
 * @csspart row - The row of the entry: its button, its start, its name and its end.
 * @csspart toggle - The button that opens and closes the entries below, present only with such
 *   entries.
 * @csspart start - The region of the `start` slot.
 * @csspart label - The name: an `<a>` with `href`; without, a `<button>` that opens and closes
 *   the entry when it has entries below it, and a `<span>` when it has none.
 * @csspart end - The region of the `end` slot.
 * @csspart children - The list of the entries below (`role="list"`).
 *
 * @cssproperty --el-tree-indent - How far the entries below stand in from this one. Unset, it is
 *   `--el-space-4`, and `1rem` without a theme.
 *
 * @property {string} label - The name of the entry.
 * @property {string} href - The address the entry leads to. Unset, the entry is no link.
 * @property {string} target - Where to open the address (only with `href`).
 * @property {string} rel - `rel` attribute for the link, written when `target` is set. Default
 *   `'noreferrer noopener'`.
 * @property {boolean} current - The entry is the one of the page the user is on: it gets
 *   `aria-current="page"` (`"true"` without `href`), a bar at its start and a heavier name.
 *   Default `false`.
 * @property {boolean} open - Whether the entries below this one are shown. Reflected to the
 *   `open` attribute, which the stylesheet reads: an entry without `open="true"` is closed, before
 *   the element starts as well. Default `false`.
 */
export default class TreeItem extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet selects the host by this attribute.
            propertyOptions: { open: { reflect: true } },
        });
    }

    properties() {
        return {
            label: '',
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            current: false,
            open: false,
        };
    }

    events() {
        return {
            '[data-toggle]': {
                click: () => this.toggle(),
            },
            // A template element does not render again when a child comes, goes or changes its
            // `slot` attribute. The slot tells of all three, and the event bubbles to the base.
            "[part~='base']": {
                slotchange: () => this.requestUpdate(),
            },
        };
    }

    /**
     * Whether the entry has entries below it. The children of the host are asked, not the slot:
     * a template is rendered on a server too, where there are no slots to ask.
     * @returns {boolean}
     */
    get hasItems() {
        return [...(this.children ?? [])].some((child) => !child.getAttribute('slot'));
    }

    /**
     * The control of the entry that the focus goes to: its link, or the button its name is when it
     * has entries below it and no address. `null` for a name alone.
     * @returns {HTMLElement | null}
     */
    get focusTarget() {
        return this.shadowRoot?.querySelector('a[part~="label"], button[part~="label"]') ?? null;
    }

    /**
     * Opens or closes the entry, as its button does, and says so with `tree-item-toggle`. An entry
     * without entries below it stays as it is.
     * @param {boolean} [open] - The state to go to. Left out, the entry goes to the other one.
     * @returns {void}
     */
    toggle(open = !this.open) {
        if (!this.hasItems || !!open === !!this.open) return;
        this.open = !!open;
        this.dispatch(Events.TOGGLE, { open: this.open });
    }

    /** @private */
    labelContent() {
        return html`<slot name="label">${this.label}</slot>`;
    }

    /**
     * The name of the entry, and what it is: a link, the button of a branch that leads nowhere, or
     * a text.
     * @private
     */
    labelTemplate(hasItems) {
        if (this.href) {
            return html`
                <a
                    part="label"
                    id="label"
                    class="label"
                    href="${this.href}"
                    ${spreadAttributes({
                        target: this.target || undefined,
                        rel: this.target ? this.rel : undefined,
                        'aria-current': this.current ? 'page' : undefined,
                    })}
                    >${this.labelContent()}</a
                >
            `;
        }

        const current = { 'aria-current': this.current ? 'true' : undefined };
        if (hasItems) {
            return html`
                <button
                    part="label"
                    id="label"
                    class="label"
                    type="button"
                    aria-expanded="${this.open ? 'true' : 'false'}"
                    aria-controls="children"
                    data-toggle
                    ${spreadAttributes(current)}
                >
                    ${this.labelContent()}
                </button>
            `;
        }

        return html`<span part="label" id="label" class="label" ${spreadAttributes(current)}
            >${this.labelContent()}</span
        >`;
    }

    /**
     * The button that opens and closes the entries below: for an entry that is a link, which
     * cannot do both. It is named by the name of the entry, and says whether the entry is open.
     * @private
     */
    toggleTemplate() {
        return html`
            <button
                part="toggle"
                class="toggle"
                type="button"
                aria-labelledby="label"
                aria-expanded="${this.open ? 'true' : 'false'}"
                aria-controls="children"
                data-toggle
            >
                ${this.chevronTemplate()}
            </button>
        `;
    }

    /** @private */
    chevronTemplate() {
        return html`
            <svg
                class="chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="m9 6 6 6-6 6"></path>
            </svg>
        `;
    }

    template() {
        const hasItems = this.hasItems;
        const isLink = !!this.href;
        const classes = {
            row: true,
            'row--link': isLink,
            'row--branch': hasItems,
            'row--current': !!this.current,
        };

        // The roles are inside of the shadow root, not on the element: they are part of the
        // server-rendered markup that way, and need no script.
        return html`
            <div part="base" class="item" role="listitem">
                <div part="row" class="${classMap(classes)}">
                    ${
                        hasItems && isLink
                            ? this.toggleTemplate()
                            : html`<span class="toggle-place" aria-hidden="true"
                                  >${hasItems ? this.chevronTemplate() : ''}</span
                              >`
                    }
                    <span part="start" class="start" ?hidden="${!hasSlotted(this, 'start')}"
                        ><slot name="start"></slot
                    ></span>
                    ${this.labelTemplate(hasItems)}
                    <span part="end" class="end" ?hidden="${!hasSlotted(this, 'end')}"><slot name="end"></slot></span>
                </div>
                <div part="children" id="children" class="children" role="list" ?hidden="${!hasItems}">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-tree-item', TreeItem);
}

export { Events };
