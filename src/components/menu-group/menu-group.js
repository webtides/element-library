import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './menu-group.style.js';

/**
 * A group of entries in an `el-menu`, with a heading where it has a `label`. A group to assistive
 * technology (`role="group"`), which has the heading as its name. A line divides it from what is
 * before it in the menu.
 *
 * @element el-menu-group
 *
 * @slot - The entries of the group: `el-menu-item` elements.
 *
 * @csspart base - The group, with the line over it.
 * @csspart label - The heading of the group.
 *
 * @property {string} label - The heading of the group, and its name for assistive technology.
 *   Default `''`.
 */
export default class MenuGroup extends TemplateElement {
    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    properties() {
        return {
            label: '',
        };
    }

    template() {
        // The group has the text as its name, so the heading the eye sees is not read a second
        // time. A plain binding leaves the name out while there is none.
        return html`
            <div part="base" class="group" role="group" aria-label="${this.label || null}">
                <div part="label" class="label" aria-hidden="true" ?hidden="${!this.label}">${this.label}</div>
                <slot></slot>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-menu-group', MenuGroup);
}
