import { TemplateElement, defineElement, html, classMap } from '@webtides/element-js';
import style from './nav-item.style.js';

/**
 * One destination of an `el-nav`: a link with an icon and a short text under it. The destination
 * of the current view is marked: for assistive technology (`aria-current="page"`), and for the
 * eye by more than its colour.
 *
 * A count or a dot goes into the `badge` slot, an `el-badge` as a rule. It is part of the link and
 * comes after the text, so a screen reader reads it with the name of the destination: "Inbox 12".
 *
 * @element el-nav-item
 *
 * @slot - The short text of the destination. One line: a text that does not fit is cut.
 * @slot icon - The icon of the destination: a decoration, the text is the name.
 * @slot badge - A count or a dot at the corner of the icon, an `el-badge` as a rule.
 *
 * @csspart base - The entry of the list (`role="listitem"`).
 * @csspart link - The link: the whole destination is its target.
 * @csspart icon - The icon, with the shape behind it that marks the current destination.
 * @csspart badge - The place of the badge, at the corner of the icon.
 * @csspart label - The text of the destination.
 *
 * @property {string} href - The address the destination leads to.
 * @property {string} target - Where to open the address.
 * @property {string} rel - `rel` attribute for the link, written when `target` is set. Default
 *   `'noreferrer noopener'`.
 * @property {boolean} current - The destination of the current view: the link gets
 *   `aria-current="page"`, a heavier text and a shape behind its icon.
 */
export default class NavItem extends TemplateElement {
    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    properties() {
        return {
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            current: false,
        };
    }

    template() {
        const classes = {
            item: true,
            'item--current': !!this.current,
        };

        // The role of an entry is inside of the shadow root, not on the element: it is part of
        // the server-rendered markup that way, and needs no script. The attributes of the link
        // are plain bindings, which leave an attribute out while its value is null.
        return html`
            <div part="base" class="${classMap(classes)}" role="listitem">
                <a
                    part="link"
                    class="link"
                    href="${this.href || null}"
                    target="${this.target || null}"
                    rel="${this.target ? this.rel : null}"
                    aria-current="${this.current ? 'page' : null}"
                >
                    <span part="icon" class="icon"><slot name="icon"></slot></span>
                    <span part="label" class="label"><slot></slot></span>
                    <span part="badge" class="badge"><slot name="badge"></slot></span>
                </a>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-nav-item', NavItem);
}
