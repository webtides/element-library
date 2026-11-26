import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './description-list.style.js';

/**
 * Rows of a name and its value, for a settings page or the page of an entry: the address, the
 * plan, the day it was created. The element is the native `<dl>`; the page writes the names as
 * `<dt>` and the values as `<dd>` into it, as it would into a `<dl>`.
 *
 * In a narrow place a name stands above its value. From a width of 30rem, which the list measures
 * on itself, the two stand side by side, and the values of all rows begin on one line. A row can
 * end in an action: a `<dd data-action>` with a link or a button in it.
 *
 * Pure presentation: the list runs no script of its own, so a server-rendered list is complete
 * before the element takes over.
 *
 * @element el-description-list
 *
 * @slot - The rows: for each one a `<dt>` with the name, a `<dd>` with the value (or several),
 *   and, to end the row in an action, a `<dd data-action>` with a link or a button.
 *
 * @csspart base - The `<dl>`.
 *
 * @cssproperty --el-description-list-term-width - The width of the column of the names while
 *   names and values stand side by side. Unset, the column is as wide as the longest name, and
 *   40% of the list at most.
 */
export default class DescriptionList extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
    }

    template() {
        // The list is inside of the shadow root, and the names and values of the page are its
        // children by way of the slot: that is part of the server-rendered markup, and needs no script.
        return html`<dl part="base" class="list"><slot></slot></dl>`;
    }
}

export function define() {
    defineElement('el-description-list', DescriptionList);
}
