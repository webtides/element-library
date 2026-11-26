import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { hasSlotted } from '../../utils/slots.js';
import style from './app-bar.style.js';

/**
 * The bar at the top of a view: which view this is, a way back or to the navigation at its start,
 * and a few actions at its end. One row: a title that does not fit is cut with an ellipsis and
 * never pushes the actions out.
 *
 * In the header of an `el-app-frame` the surface of the bar reaches up under the status bar of a
 * phone, and its content stays below it. The bar is no landmark: the `header` of the page is.
 *
 * The look is the stylesheet alone, so a server-rendered bar does not change when the element
 * takes over.
 *
 * @element el-app-bar
 *
 * @slot - The title of the view.
 * @slot start - What is in front of the title: a button back, or the one for the navigation.
 * @slot end - The actions of the view, at the end of the bar.
 *
 * @csspart base - The bar: its surface and the line to the content.
 * @csspart row - The row of the start, the title and the end.
 * @csspart start - The region in front of the title.
 * @csspart title - The title. A heading while `heading-level` is set.
 * @csspart end - The region at the end.
 *
 * @property {number} headingLevel - Makes the title the heading of the view, at this level
 *   (1 to 6). Unset, the title is text. Default `0`.
 * @property {'filled'|'outlined'|'plain'} appearance - The appearance of the buttons in the bar
 *   that have none of their own. Default `'plain'`. Reflected to the `appearance` attribute.
 */
export default class AppBar extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet selects the host by this attribute.
            propertyOptions: { appearance: { reflect: true } },
        });
    }

    properties() {
        return {
            headingLevel: 0,
            appearance: 'plain',
        };
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

    template() {
        // A plain binding leaves an attribute out while its value is null, on a server as well, and
        // takes it off again when the level goes.
        const level = Number(this.headingLevel);
        const isHeading = level >= 1 && level <= 6;

        return html`
            <div part="base" class="bar">
                <div part="row" class="row">
                    <div part="start" class="start" ?hidden="${!hasSlotted(this, 'start')}">
                        <slot name="start"></slot>
                    </div>
                    <div
                        part="title"
                        class="title"
                        role="${isHeading ? 'heading' : null}"
                        aria-level="${isHeading ? level : null}"
                    >
                        <slot></slot>
                    </div>
                    <div part="end" class="end" ?hidden="${!hasSlotted(this, 'end')}">
                        <slot name="end"></slot>
                    </div>
                </div>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-app-bar', AppBar);
}
