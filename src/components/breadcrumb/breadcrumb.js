import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './breadcrumb.style.js';

/**
 * A breadcrumb: the trail from the start page to the current page, for a page deep inside of a
 * site. The breadcrumb is the landmark and the list; every `el-breadcrumb-item` slotted into it is
 * one entry of the trail. A trail that does not fit breaks into a second line.
 *
 * @element el-breadcrumb
 *
 * @slot - The entries of the trail: `el-breadcrumb-item` elements, from the start page to the
 *   current page.
 *
 * @csspart base - The `nav` landmark.
 * @csspart list - The list of the entries.
 *
 * @cssproperty --el-breadcrumb-separator - What stands between two entries, as a CSS string.
 *   Unset, it is `'/'`. Read by the items, so it can be set on the breadcrumb or for the page.
 *
 * @property {string} label - The name of the landmark. Default `'Breadcrumb'`.
 */
export default class Breadcrumb extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
    }

    properties() {
        return {
            label: 'Breadcrumb',
        };
    }

    template() {
        return html`
            <nav part="base" class="breadcrumb" aria-label="${this.label}">
                <div part="list" class="list" role="list"><slot></slot></div>
            </nav>
        `;
    }
}

export function define() {
    defineElement('el-breadcrumb', Breadcrumb);
}
