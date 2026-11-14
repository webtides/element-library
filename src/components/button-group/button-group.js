import { TemplateElement, defineElement, html, spreadAttributes } from '@webtides/element-js';
import style from './button-group.style.js';

/**
 * A button group: a row of `el-button` that reads as one control, the actions of a toolbar, a
 * button with a second one for more options, the steps back and forward. The buttons touch, only
 * the outer corners of the row are rounded, and a line divides two neighbours. To assistive
 * technology it is a group, with a name.
 *
 * The group joins its buttons with its stylesheet alone. It runs no script on them, so a
 * server-rendered group does not change when the elements take over.
 *
 * @element el-button-group
 *
 * @slot - The buttons of the group: `el-button` elements, or elements that hold one (an
 *   `el-popover` with its anchor).
 *
 * @csspart base - The row. It carries `role="group"` and the label.
 *
 * @property {string} label - The accessible name of the group, "Text alignment". Unset, the group
 *   has no name. Default `''`.
 */
export default class ButtonGroup extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
    }

    properties() {
        return {
            label: '',
        };
    }

    template() {
        return html`
            <div
                part="base"
                class="button-group"
                role="group"
                ${spreadAttributes({ 'aria-label': this.label || undefined })}
            >
                <slot></slot>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-button-group', ButtonGroup);
}
