import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './nav.style.js';

/**
 * The destinations of an application: the three to five places the user goes to all the time, as
 * a bar at the lower edge of a phone. Each destination is an `el-nav-item`: a link with an icon
 * and a short text, and the one of the current view is marked.
 *
 * The element is a navigation landmark, named by `label`. In the footer of an `el-app-frame` the
 * surface of the bar reaches the lower edge of the screen, and the destinations stay above the
 * home indicator. Alone it keeps them above it itself.
 *
 * The look is the stylesheet alone, so a server-rendered bar does not change when the element
 * takes over.
 *
 * @element el-nav
 *
 * @slot - The destinations: `el-nav-item` elements.
 *
 * @csspart base - The navigation landmark (`<nav>`): the surface of the bar and its line to the
 *   content.
 * @csspart list - The list of the destinations.
 *
 * @property {string} label - The name of the navigation for assistive technology, "Main". A page
 *   with more than one navigation needs it to tell them apart.
 * @property {'bar'} layout - How the destinations lie: `bar`, a row in which they share the
 *   width in equal parts. Default `'bar'`.
 */
export default class Nav extends TemplateElement {
    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    properties() {
        return {
            label: '',
            layout: 'bar',
        };
    }

    template() {
        // The layout is a class of the landmark, not an attribute of the element: a server writes
        // it, and the default has to be on no element for the stylesheet.
        // A plain binding leaves the name out while there is none.
        return html`
            <nav part="base" class="nav nav--bar" aria-label="${this.label || null}">
                <div part="list" class="list" role="list"><slot></slot></div>
            </nav>
        `;
    }
}

export function define() {
    defineElement('el-nav', Nav);
}
