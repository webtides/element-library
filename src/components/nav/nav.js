import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { define as defineTooltip } from '../tooltip/tooltip.js';
import { hasSlotted } from '../../utils/slots.js';
import style from './nav.style.js';

const LAYOUTS = ['auto', 'bar', 'rail', 'list'];

/**
 * The destinations of an application: the places the user goes to all the time. Each destination
 * is an `el-nav-item`: a link with an icon and a short text, and the one of the current view is
 * marked. The element is a navigation landmark, named by `label`.
 *
 * Three layouts. A **bar** for the lower edge of a phone, in which three to five destinations share
 * the width in equal parts. A **rail** for the side of a wider screen: a narrow column of icons
 * with a word under each. A **list** for a sidebar: an icon and its text in one row, as wide as
 * its place. A rail and a list have a group at their top and one at their lower end, and scroll
 * where they have more destinations than height.
 *
 * `layout="auto"`, the default, is a bar, and where an `el-app-frame` has the element in the
 * column at its side it is what `column` names, a rail or a list: the page writes the
 * destinations once.
 *
 * A second group takes the destinations that have no room among the five of a bar (the
 * `secondary` slot, with `secondary-label` as its heading). A bar leaves it out.
 *
 * In a region of an `el-app-frame` the surface reaches the edge of the screen, and the
 * destinations stay clear of the home indicator and the notch. Alone it keeps them clear itself.
 *
 * The look is the stylesheet alone, so server-rendered destinations do not change when the
 * element takes over. The script adds the tooltips of destinations that show an icon alone.
 *
 * @element el-nav
 *
 * @slot - The destinations: `el-nav-item` elements.
 * @slot secondary - A second group of destinations, below the first: the pages that have no room
 *   in a bar, which leaves them out.
 * @slot end - The destinations at the lower end of a rail or a list: the settings, the account. A
 *   bar has no room for them, and leaves them out.
 *
 * @csspart base - The navigation landmark (`<nav>`): the surface and its line to the content.
 * @csspart groups - The two groups at the top, which scroll where a rail or a list has more
 *   destinations than height.
 * @csspart list - The list of the destinations.
 * @csspart secondary - The second group: its heading and its list.
 * @csspart secondary-label - The heading of the second group, which a list shows.
 * @csspart secondary-list - The list of the destinations of the second group.
 * @csspart end - The list of the destinations at the lower end of a rail or a list.
 * @csspart tooltip - The tooltip of a destination that shows an icon alone: an `el-tooltip`.
 *
 * @cssproperty --el-nav-rail-size - The width of a rail. Default `5rem`.
 * @cssproperty --el-nav-list-size - The width of a list where its place is as wide as what is in
 *   it. Default `16rem`.
 *
 * @property {string} label - The name of the navigation for assistive technology, "Main". A page
 *   with more than one navigation needs it to tell them apart.
 * @property {'auto'|'bar'|'rail'|'list'} layout - How the destinations lie: `bar`, a row in which
 *   they share the width in equal parts; `rail`, a narrow column; `list`, rows of an icon and its
 *   text; `auto`, a bar, and in the column at the side of an `el-app-frame` what `column` names.
 *   Default `'auto'`.
 * @property {'rail'|'list'} column - What the destinations are in the column at the side of an
 *   `el-app-frame`, with `layout="auto"`. Default `'rail'`.
 * @property {string} secondaryLabel - The heading of the second group, and its name for assistive
 *   technology: "More". Default `''`.
 * @property {boolean} labels - Whether the destinations show their texts. With `false` they show
 *   an icon alone: the text stays the name of the link, and shows as a tooltip. Default `true`.
 */
export default class Nav extends TemplateElement {
    /**
     * Whether the element has started in a browser, see `connected()`.
     * @private
     */
    _started = false;

    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The tooltips have the texts of the destinations: a destination that comes or goes,
            // and a text that changes, ask for a new render. The filter names the attributes of
            // the element itself as well: element-js hears of them through the same observer.
            mutationObserverOptions: {
                childList: true,
                subtree: true,
                characterData: true,
                attributeFilter: ['label', 'layout', 'column', 'secondary-label', 'labels'],
            },
        });
    }

    properties() {
        return {
            label: '',
            layout: 'auto',
            column: 'rail',
            secondaryLabel: '',
            labels: true,
        };
    }

    connected() {
        // The tooltips come with the script: a server renders none, and the first render in the
        // browser is the markup of the server.
        this._started = true;
        if (!this._showsLabels()) this.requestUpdate();
    }

    events() {
        return {
            // A template element does not render again when a child comes, goes or changes its
            // `slot` attribute. The slot tells of all three, and the event bubbles to the base.
            "[part~='base']": {
                slotchange: () => this.requestUpdate(),
            },
        };
    }

    /**
     * @private
     * @returns {boolean}
     */
    _showsLabels() {
        return this.labels !== false && this.labels !== 'false';
    }

    /**
     * The destinations with their texts: what is in a destination and in none of its named slots.
     * None before the element has started, and none while the texts show: a tooltip is for an
     * icon alone, and on a server there is no pointer to show one to.
     * @private
     * @returns {Array<[Element, string]>}
     */
    _named() {
        if (!this._started || this._showsLabels()) return [];
        return [...this.querySelectorAll('el-nav-item')]
            .map((item) => [
                item,
                [...item.childNodes]
                    .filter((node) => node.nodeType === Node.TEXT_NODE || !node.getAttribute?.('slot'))
                    .map((node) => node.textContent)
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim(),
            ])
            .filter(([, text]) => text);
    }

    /**
     * Where the tooltip of a destination goes: beside a rail, on the side of the content, and
     * above a bar. The stylesheet decides what the destinations are; this reads what it decided.
     * @private
     * @returns {string}
     */
    _tooltipPlacement() {
        const base = this.shadowRoot.querySelector("[part~='base']");
        if (!base) return 'top';
        const style = getComputedStyle(base);
        if (style.getPropertyValue('--_el-nav-direction').trim() !== 'column') return 'top';
        return style.direction === 'rtl' ? 'left' : 'right';
    }

    template() {
        const layout = LAYOUTS.includes(this.layout) ? this.layout : 'auto';
        const named = this._named();
        const placement = named.length ? this._tooltipPlacement() : 'top';

        // The layout is a class of the landmark, not an attribute of the element: a server writes
        // it, and the default has to be on no element for the stylesheet. So is what the column
        // of a frame makes of the destinations.
        // A plain binding leaves a name out while there is none.
        return html`
            <nav
                part="base"
                class="nav nav--${layout} ${this.column === 'list' ? 'nav--column-list' : ''} ${
                    this._showsLabels() ? '' : 'nav--icons'
                }"
                aria-label="${this.label || null}"
            >
                <div part="groups" class="groups">
                    <div part="list" class="list" role="list"><slot></slot></div>
                    <div part="secondary" class="secondary" ?hidden="${!hasSlotted(this, 'secondary')}">
                        <div
                            part="secondary-label"
                            class="heading"
                            aria-hidden="true"
                            ?hidden="${!this.secondaryLabel}"
                        >
                            ${this.secondaryLabel}
                        </div>
                        <div part="secondary-list" class="list" role="list" aria-label="${this.secondaryLabel || null}">
                            <slot name="secondary"></slot>
                        </div>
                    </div>
                </div>
                <div part="end" class="end" role="list" ?hidden="${!hasSlotted(this, 'end')}">
                    <slot name="end"></slot>
                </div>
            </nav>
            ${named.map(
                ([item, text]) =>
                    html`<el-tooltip part="tooltip" type="label" placement="${placement}" .anchor="${item}"
                        >${text}</el-tooltip
                    >`,
            )}
        `;
    }
}

export function define() {
    // The tooltips of the destinations that show an icon alone.
    defineTooltip();
    defineElement('el-nav', Nav);
}
