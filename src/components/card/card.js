import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { hasSlotted } from '../../utils/slots.js';
import style from './card.style.js';

/**
 * A card: a surface that groups what belongs together, a form, a section of settings, an entry of
 * a list. It has four regions, each of them a slot: `media` at the top, then `header`, the body and
 * `footer`. A region that nothing is slotted into takes no space. Pure presentation, without a role
 * and without behaviour.
 *
 * @element el-card
 *
 * @slot - The body of the card.
 * @slot media - An image or a video at the top of the card, from edge to edge.
 * @slot header - The title of the card, and what stands beside it, an action for example.
 * @slot footer - What closes the card: actions, a note.
 *
 * @csspart base - The surface of the card: background, border, radius, shadow.
 * @csspart media - The region of the `media` slot.
 * @csspart header - The region of the `header` slot.
 * @csspart body - The region of the default slot.
 * @csspart footer - The region of the `footer` slot.
 *
 * @cssproperty --el-card-padding - The padding of the header, the body and the footer. Unset, it
 *   is `--el-space-4`, and `1rem` without a theme.
 *
 * @property {'outlined'|'filled'|'plain'} appearance - How the surface is painted: with the
 *   background of the page and a border, with a muted fill and a border, or not at all. Default
 *   `'outlined'`. Reflected to the `appearance` attribute.
 */
export default class Card extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet selects the host by this attribute.
            propertyOptions: {
                appearance: { reflect: true },
            },
        });
    }

    properties() {
        return {
            appearance: 'outlined',
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
        return html`
            <div part="base" class="card">
                <div part="media" ?hidden="${!hasSlotted(this, 'media')}"><slot name="media"></slot></div>
                <div part="header" ?hidden="${!hasSlotted(this, 'header')}"><slot name="header"></slot></div>
                <div part="body"><slot></slot></div>
                <div part="footer" ?hidden="${!hasSlotted(this, 'footer')}"><slot name="footer"></slot></div>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-card', Card);
}
