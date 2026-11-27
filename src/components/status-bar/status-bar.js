import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { hasSlotted } from '../../utils/slots.js';
import style from './status-bar.style.js';

/**
 * A narrow line of state at the lower edge of a tool for a desktop: whether the connection is
 * there, what is selected, how many entries there are, a task that runs in the background, the
 * version. Entries at its start and at its end, in one row that keeps its height.
 *
 * An entry is what the page writes: a text, an icon with a name, an `el-button`, or a small
 * component (`el-spinner`, `el-progress-bar`). The bar is no live region. An entry whose change
 * is to be announced is one the page marks itself (`role="status"`).
 *
 * In the footer of an `el-app-frame` the surface of the bar reaches as far as the surface of the
 * region. The look is the stylesheet alone, so a server-rendered bar does not change when the
 * element takes over.
 *
 * @element el-status-bar
 *
 * @slot - The entries at the start of the bar. They give way first where the bar is too narrow.
 * @slot end - The entries at the end of the bar.
 *
 * @csspart base - The bar: its surface and the line to the content.
 * @csspart row - The row of the entries, which keeps its height.
 * @csspart start - The entries at the start.
 * @csspart end - The entries at the end.
 */
export default class StatusBar extends TemplateElement {
    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    events() {
        return {
            // A template element does not render again when a child comes, goes or changes its
            // `slot` attribute. The slot tells of all three, and the event bubbles to the base.
            "[part~='base']": {
                slotchange: () => this.requestUpdate(),
            },
            this: {
                focusout: () => this._showStart(),
            },
        };
    }

    /**
     * Entries that do not fit are cut off, and the browser moves a group to show a button in the
     * part that is cut when the keyboard gets to it. With the focus gone, the group shows its
     * first entries again.
     * @private
     */
    _showStart() {
        for (const group of this.shadowRoot?.querySelectorAll('.start, .end') ?? []) {
            group.scrollLeft = 0;
        }
    }

    template() {
        return html`
            <div part="base" class="bar">
                <div part="row" class="row">
                    <div part="start" class="start"><slot></slot></div>
                    <div part="end" class="end" ?hidden="${!hasSlotted(this, 'end')}">
                        <slot name="end"></slot>
                    </div>
                </div>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-status-bar', StatusBar);
}
