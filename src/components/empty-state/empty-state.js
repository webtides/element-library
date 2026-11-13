import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { hasSlotted } from '../../utils/slots.js';
import style from './empty-state.style.js';

/**
 * An empty state: what stands in the place of a list or a collection while there is nothing in
 * it. A message in the middle, with a heading above it, an icon above that and an action below, as
 * far as they are given. Pure presentation, without a role and without behaviour.
 *
 * @element el-empty-state
 *
 * @slot - The message: what is missing, and what to do about it.
 * @slot icon - An icon or an illustration above the heading.
 * @slot heading - A short heading above the message.
 * @slot action - What the user can do now: a button, a link, or two.
 *
 * @csspart base - The column in the middle that holds the regions.
 * @csspart icon - The region of the `icon` slot.
 * @csspart heading - The region of the `heading` slot.
 * @csspart message - The region of the default slot.
 * @csspart action - The region of the `action` slot.
 */
export default class EmptyState extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
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
        return html`
            <div part="base" class="empty-state">
                <div part="icon" ?hidden="${!hasSlotted(this, 'icon')}"><slot name="icon"></slot></div>
                <div part="heading" ?hidden="${!hasSlotted(this, 'heading')}"><slot name="heading"></slot></div>
                <div part="message"><slot></slot></div>
                <div part="action" ?hidden="${!hasSlotted(this, 'action')}"><slot name="action"></slot></div>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-empty-state', EmptyState);
}
