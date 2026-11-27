import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './pagination.style.js';
import Events from './pagination.events.js';

/** What `perPage` is without a value that can be used. */
const PER_PAGE = 10;

/** What stands for the number of a page in `href`. */
const PAGE = '{page}';

/**
 * A whole number that is not negative, from a property that may hold anything.
 * @param {*} value
 * @param {number} fallback - For a value that is no number.
 * @returns {number}
 */
function count(value, fallback) {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

/**
 * A pagination: the way through a list that is split into pages. It shows the current page, the
 * pages around it, the first and the last, and a button for the page before and the page after.
 * The pages in between are left out, and the row keeps its length while the current page moves.
 *
 * The pagination does not load anything. A button sets `page` and fires `pagination-change`, and
 * the page shows the entries that belong to it.
 *
 * A list that a server renders a page at a time has the page in its address. With `href`, the
 * address of a page with `{page}` in the place of its number, the pages are links: they are in
 * the server-rendered markup, lead to their page without a script, open in a new tab and can be
 * copied. A link fires nothing and changes nothing: the address it leads to brings the next page.
 *
 * @element el-pagination
 *
 * @fires {CustomEvent<{ page: number }>} pagination-change - Fired when a button has changed the
 *   page. `detail.page` is the new page. Not fired when `page` is set from a script, and not by
 *   a link.
 *
 * @slot previous-icon - The icon of the button for the page before. Unset, an arrow head.
 * @slot next-icon - The icon of the button for the page after. Unset, an arrow head.
 *
 * @csspart base - The `nav` landmark.
 * @csspart list - The row of the buttons.
 * @csspart button - Every button: the pages, the page before and the page after. With `href`
 *   they are links, and keep their parts.
 * @csspart page - The button of a page.
 * @csspart current - The button of the current page.
 * @csspart previous - The button for the page before.
 * @csspart next - The button for the page after.
 * @csspart ellipsis - The mark in the place of pages that are left out.
 *
 * @property {number} page - The current page, counted from 1. A page that does not exist is shown
 *   as the nearest one that does. Default `1`. Reflected to the `page` attribute.
 * @property {string} href - The address of a page, with `{page}` in the place of its number:
 *   `/notes?page={page}`. With it the pages, the page before and the page after are links.
 *   Default `''`: buttons.
 * @property {number} total - The number of entries in the whole list. Default `0`.
 * @property {number} perPage - The number of entries on one page. Default `10`.
 * @property {number} siblings - How many pages are shown on each side of the current page.
 *   Default `1`.
 * @property {number} boundaries - How many pages are shown at the start and at the end of the
 *   row. Default `1`.
 * @property {'small'|'medium'|'large'} size - The size of the buttons. Default `'medium'`.
 *   Reflected to the `size` attribute.
 * @property {string} label - The name of the landmark. Two paginations on a page need two names.
 *   Default `'Pagination'`.
 * @property {string} pageLabel - The word the button of a page is named with, in front of its
 *   number: "Page 3". Default `'Page'`.
 * @property {string} previousLabel - The name of the button for the page before. Default
 *   `'Previous page'`.
 * @property {string} nextLabel - The name of the button for the page after. Default
 *   `'Next page'`.
 */
export default class Pagination extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            propertyOptions: {
                page: { reflect: true },
                // The shared size module selects the host by this attribute.
                size: { reflect: true },
            },
        });
    }

    properties() {
        return {
            page: 1,
            href: '',
            total: 0,
            perPage: PER_PAGE,
            siblings: 1,
            boundaries: 1,
            size: 'medium',
            label: 'Pagination',
            pageLabel: 'Page',
            previousLabel: 'Previous page',
            nextLabel: 'Next page',
        };
    }

    /**
     * The number of pages: `total` divided by `perPage`, rounded up. A list without entries has one
     * page, an empty one. Read-only.
     * @returns {number}
     */
    get pages() {
        const perPage = count(this.perPage, PER_PAGE) || PER_PAGE;
        return Math.max(1, Math.ceil(count(this.total, 0) / perPage));
    }

    events() {
        return {
            '[data-page]': {
                click: (event) => this._goTo(Number(event.currentTarget.dataset.page), event.currentTarget),
            },
            // One page back or on from where the pagination is now, not from where it was when the
            // row was rendered: two presses within one frame are two pages.
            '[data-step]': {
                click: (event) =>
                    this._goTo(this._currentPage() + Number(event.currentTarget.dataset.step), event.currentTarget),
            },
        };
    }

    afterUpdate() {
        this._restoreFocus();
    }

    /**
     * The page that is shown as the current one: `page`, or the nearest page that exists.
     * @private
     * @returns {number}
     */
    _currentPage() {
        return Math.min(Math.max(count(this.page, 1), 1), this.pages);
    }

    /**
     * Makes another page the current one, for a button.
     * @private
     * @param {number} page
     * @param {HTMLButtonElement} button - The button that asked for it.
     */
    _goTo(page, button) {
        // A page that is not there: a second press of an arrow button that reached the end with
        // the first, before the row was rendered again and the button disabled.
        if (page === this._currentPage() || page < 1 || page > this.pages) return;

        // Where the focus is, when it is on the button at all: a click with the mouse does not
        // put it there in every browser.
        this._focused = this.shadowRoot.activeElement === button ? button : undefined;
        this.page = page;
        this.dispatch(Events.CHANGE, { page });
    }

    /**
     * Keeps the focus where the user expects it after a button has changed the page. The buttons
     * of the pages are rendered anew by their place in the row: the one that was pressed can show
     * another page afterwards, or can be gone for an ellipsis. So the focus goes to the button of
     * the current page. It stays on the button for the page before or after, which can be pressed
     * again, unless that one has reached the end and is disabled now.
     * @private
     */
    _restoreFocus() {
        const button = this._focused;
        if (!button) return;
        this._focused = undefined;

        const stays = !button.matches("[part~='page']") && button.isConnected && !button.disabled;
        const target = stays ? button : this.shadowRoot.querySelector("[aria-current='page']");
        if (this.shadowRoot.activeElement !== target) target?.focus();
    }

    /**
     * The row of the pages: the numbers of the pages that are shown, and `null` in the place of
     * pages that are left out.
     *
     * The row has a fixed number of places: the boundaries at both ends, the current page with its
     * siblings in the middle, and one place between each end and the middle. That place holds an
     * ellipsis, or the page itself when only one page is missing there. Near an end the middle
     * does not shrink but stops, so the row is as long on the first page as on any other.
     * @private
     * @returns {Array<number | null>}
     */
    _items() {
        const pages = this.pages;
        const siblings = count(this.siblings, 1);
        const boundaries = count(this.boundaries, 1);
        const range = (from, to) => Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);

        if (pages <= 2 * boundaries + 2 * siblings + 3) return range(1, pages);

        const first = boundaries + 2;
        const last = pages - boundaries - 1;
        const from = Math.min(Math.max(this._currentPage() - siblings, first), last - 2 * siblings);
        const to = from + 2 * siblings;

        return [
            ...range(1, boundaries),
            from === first ? first - 1 : null,
            ...range(from, to),
            to === last ? last + 1 : null,
            ...range(last + 2, pages),
        ];
    }

    /**
     * The address of a page: `href` with the number in the place of its mark.
     * @private
     * @param {number} page
     * @returns {string}
     */
    _address(page) {
        return String(this.href).replaceAll(PAGE, String(page));
    }

    /** @private */
    _pageTemplate(page, current) {
        const isCurrent = page === current;
        const part = isCurrent ? 'button page current' : 'button page';

        // A link to the page. The current one is a link as well, to the address the user is at:
        // it can be copied and opened again.
        if (this.href) {
            return html`
                <li>
                    <a
                        part="${part}"
                        href="${this._address(page)}"
                        aria-label="${this.pageLabel} ${page}"
                        aria-current="${isCurrent ? 'page' : null}"
                    >
                        ${page}
                    </a>
                </li>
            `;
        }

        return html`
            <li>
                <button
                    part="${part}"
                    type="button"
                    aria-label="${this.pageLabel} ${page}"
                    aria-current="${isCurrent ? 'page' : undefined}"
                    data-page="${page}"
                >
                    ${page}
                </button>
            </li>
        `;
    }

    /**
     * The way to the page before or after, as a link. Where there is no such page, at the first
     * page and at the last one, it is a link without an address: no stop of the Tab key, and one
     * that says to assistive technology that it leads nowhere now.
     * @private
     * @param {'previous'|'next'} name
     * @param {number} page - The page it leads to.
     * @param {string} label
     * @param {*} icon - The slot of its icon.
     */
    _stepLinkTemplate(name, page, label, icon) {
        const there = page >= 1 && page <= this.pages;
        return html`
            <li>
                <a
                    part="button ${name}"
                    href="${there ? this._address(page) : null}"
                    rel="${there ? (name === 'previous' ? 'prev' : 'next') : null}"
                    role="${there ? null : 'link'}"
                    aria-disabled="${there ? null : 'true'}"
                    aria-label="${label}"
                >
                    ${icon}
                </a>
            </li>
        `;
    }

    template() {
        const current = this._currentPage();
        const arrow = (points) => html`
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <polyline points="${points}"></polyline>
            </svg>
        `;
        const previousIcon = html`<slot name="previous-icon">${arrow('15 18 9 12 15 6')}</slot>`;
        const nextIcon = html`<slot name="next-icon">${arrow('9 18 15 12 9 6')}</slot>`;

        return html`
            <nav part="base" aria-label="${this.label}">
                <ul part="list" role="list">
                    ${
                        this.href
                            ? this._stepLinkTemplate('previous', current - 1, this.previousLabel, previousIcon)
                            : html`
                                  <li>
                                      <button
                                          part="button previous"
                                          type="button"
                                          aria-label="${this.previousLabel}"
                                          ?disabled="${current <= 1}"
                                          data-step="-1"
                                      >
                                          ${previousIcon}
                                      </button>
                                  </li>
                              `
                    }
                    ${this._items().map((page) =>
                        page === null
                            ? html`<li part="ellipsis" aria-hidden="true">…</li>`
                            : this._pageTemplate(page, current),
                    )}
                    ${
                        this.href
                            ? this._stepLinkTemplate('next', current + 1, this.nextLabel, nextIcon)
                            : html`
                                  <li>
                                      <button
                                          part="button next"
                                          type="button"
                                          aria-label="${this.nextLabel}"
                                          ?disabled="${current >= this.pages}"
                                          data-step="1"
                                      >
                                          ${nextIcon}
                                      </button>
                                  </li>
                              `
                    }
                </ul>
            </nav>
        `;
    }
}

export function define() {
    defineElement('el-pagination', Pagination);
}

export { Events };
