import { TemplateElement, defineElement, html, spreadAttributes } from '@webtides/element-js';
import style from './breadcrumb-item.style.js';

/**
 * One entry of a breadcrumb: a link to a page on the way to the current one with `href`, plain
 * text without. `current` marks the entry of the page the user is on. Every entry but the first
 * brings the separator that stands in front of it.
 *
 * @element el-breadcrumb-item
 *
 * @slot - The name of the page.
 *
 * @csspart base - The entry: an item of the list of the breadcrumb.
 * @csspart separator - What stands in front of the entry. Hidden for the first one, and from
 *   assistive technology.
 * @csspart label - The name of the page: an `<a>` with `href`, a `<span>` without.
 *
 * @cssproperty --el-breadcrumb-separator - What stands in front of the entry, as a CSS string.
 *   Unset, it is `'/'`.
 *
 * @property {string} href - The address of the page. Unset, the entry is text and no link.
 * @property {string} target - Where to open the page (only with `href`).
 * @property {string} rel - `rel` attribute for the link, written when `target` is set. Default
 *   `'noreferrer noopener'`.
 * @property {boolean} current - The entry is the page the user is on: it gets
 *   `aria-current="page"`. Default `false`.
 */
export default class BreadcrumbItem extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
    }

    properties() {
        return {
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            current: false,
        };
    }

    /** @private */
    labelTemplate() {
        const current = { 'aria-current': this.current ? 'page' : undefined };

        if (!this.href) {
            return html`<span part="label" class="label" ${spreadAttributes(current)}><slot></slot></span>`;
        }

        return html`
            <a
                part="label"
                class="label"
                href="${this.href}"
                ${spreadAttributes({
                    target: this.target || undefined,
                    rel: this.target ? this.rel : undefined,
                    ...current,
                })}
                ><slot></slot
            ></a>
        `;
    }

    template() {
        // The role of an entry is inside of the shadow root, not on the element: it is part of the
        // server-rendered markup that way, and needs no script.
        return html`
            <div part="base" class="item" role="listitem">
                <span part="separator" class="separator" aria-hidden="true"></span>
                ${this.labelTemplate()}
            </div>
        `;
    }
}

export function define() {
    defineElement('el-breadcrumb-item', BreadcrumbItem);
}
