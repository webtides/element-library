import { TemplateElement, defineElement, html, spreadAttributes } from '@webtides/element-js';
import style from './list.style.js';

/**
 * A list of rows: messages, articles, files, the entries of a settings page. The list is the
 * surface and the list for assistive technology; every `el-list-item` slotted into it is one row.
 * It gives its rows one density, one line between two of them and one place where their texts
 * begin, whatever stands at the start of a row.
 *
 * Pure presentation: the list runs no script of its own, so a server-rendered list is complete
 * before the element takes over.
 *
 * @element el-list
 *
 * @slot - The rows: `el-list-item` elements.
 *
 * @csspart base - The list (`role="list"`) and its surface.
 *
 * @cssproperty --el-list-padding-inline - The padding of a row at its start and its end. Unset, it
 *   is `--el-space-4`, and `1rem` without a theme. Read by the rows, so it can be set on the list
 *   or for the page.
 *
 * @property {string} label - The name of the list for assistive technology. Unset, the list has
 *   none.
 * @property {'default'|'compact'} density - How much room a row has above and below its texts.
 *   Default `'default'`. Reflected to the `density` attribute.
 * @property {'plain'|'outlined'|'filled'} appearance - How the surface is painted: not at all, so
 *   the list reaches from edge to edge of its place, or as a card with the background of the page
 *   or a muted fill, a border and round corners. Default `'plain'`. Reflected to the `appearance`
 *   attribute.
 */
export default class List extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet selects the host by these attributes.
            propertyOptions: {
                density: { reflect: true },
                appearance: { reflect: true },
            },
        });
    }

    properties() {
        return {
            label: '',
            density: 'default',
            appearance: 'plain',
        };
    }

    template() {
        // The role is inside of the shadow root, not on the element: it is part of the
        // server-rendered markup that way, and needs no script.
        return html`
            <div part="base" class="list" role="list" ${spreadAttributes({ 'aria-label': this.label || undefined })}>
                <slot></slot>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-list', List);
}
