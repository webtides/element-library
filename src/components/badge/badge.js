import { TemplateElement, defineElement, html, classMap } from '@webtides/element-js';
import style from './badge.style.js';

/**
 * A badge: a short label that marks something with a status or a count ("New", "3"). Pure
 * presentation, without a role and without behaviour. It speaks the library's shared vocabulary
 * for its colours, a semantic `variant` and an `appearance`, and is sized by the font size of the
 * text it stands in.
 *
 * @element el-badge
 *
 * @slot - The text of the badge.
 *
 * @csspart base - The surface of the badge: background, border, radius.
 *
 * @property {'neutral'|'brand'|'success'|'warning'|'danger'} variant - Semantic variant, which
 *   picks the colours. Default `'neutral'`. Reflected to the `variant` attribute.
 * @property {'filled'|'outlined'|'plain'} appearance - How the colours of the variant are painted:
 *   as a fill, as a border around a transparent badge, or as text only. Default `'filled'`.
 *   Reflected to the `appearance` attribute.
 * @property {boolean} pill - Fully rounded ends. A badge with a single character is a circle.
 * @property {boolean} pulse - Draws attention: a ring spreads from the badge, again and again.
 */
export default class Badge extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The shared style modules select the host by these attributes.
            propertyOptions: {
                variant: { reflect: true },
                appearance: { reflect: true },
            },
        });
    }

    properties() {
        return {
            variant: 'neutral',
            appearance: 'filled',
            pill: false,
            pulse: false,
        };
    }

    template() {
        const classes = {
            badge: true,
            'badge--pill': !!this.pill,
            'badge--pulse': !!this.pulse,
        };

        return html`<span part="base" class="${classMap(classes)}"><slot></slot></span>`;
    }
}

export function define() {
    defineElement('el-badge', Badge);
}
