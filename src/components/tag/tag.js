import { TemplateElement, defineElement, html, classMap } from '@webtides/element-js';
import style from './tag.style.js';
import Events from './tag.events.js';

/**
 * A tag: a label for one of several things that belong to something, a keyword of an article or a
 * filter that is set. With `removable` it has a button that asks to take it away. It speaks the
 * library's shared vocabulary: a semantic `variant`, an `appearance` and a `size`.
 *
 * The tag does not remove itself. Its button fires `tag-remove`, and the page decides what that
 * means: take the element out of a list, clear a filter.
 *
 * @element el-tag
 *
 * @fires {CustomEvent} tag-remove - Fired when the remove button is activated.
 *
 * @slot - The text of the tag.
 *
 * @csspart base - The surface of the tag: background, border, radius.
 * @csspart content - The wrapper around the default slot. A text that is too long is cut off here.
 * @csspart remove-button - The remove button, present only while `removable` is `true`.
 *
 * @property {'neutral'|'brand'|'success'|'warning'|'danger'} variant - Semantic variant, which
 *   picks the colours. Default `'neutral'`. Reflected to the `variant` attribute.
 * @property {'filled'|'outlined'|'plain'} appearance - How the colours of the variant are painted:
 *   as a fill, as a border around a transparent tag, or as text only. Default `'filled'`.
 *   Reflected to the `appearance` attribute.
 * @property {'small'|'medium'|'large'} size - Tag size. Default `'medium'`. Reflected to the
 *   `size` attribute.
 * @property {boolean} pill - Fully rounded ends.
 * @property {boolean} removable - Whether to render the remove button. Default `false`.
 * @property {string} removeLabel - The word the remove button is named with, in front of the text
 *   of the tag: "Remove TypeScript". Default `'Remove'`.
 */
export default class Tag extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The shared style modules select the host by these attributes.
            propertyOptions: {
                variant: { reflect: true },
                appearance: { reflect: true },
                size: { reflect: true },
            },
        });
    }

    properties() {
        return {
            variant: 'neutral',
            appearance: 'filled',
            size: 'medium',
            pill: false,
            removable: false,
            removeLabel: 'Remove',
        };
    }

    events() {
        return {
            '[data-remove]': {
                click: () => this.dispatch(Events.REMOVE),
            },
        };
    }

    /** @private */
    removeButtonTemplate() {
        // The button is named by its label and by the text of the tag: several tags in a row would
        // otherwise have buttons that all sound the same.
        return html`
            <button
                part="remove-button"
                type="button"
                class="remove-button"
                aria-labelledby="remove-label content"
                data-remove
            >
                <span id="remove-label" hidden>${this.removeLabel}</span>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
    }

    template() {
        const classes = {
            tag: true,
            'tag--pill': !!this.pill,
        };

        return html`
            <span part="base" class="${classMap(classes)}">
                <span part="content" id="content" class="content"><slot></slot></span>
                ${this.removable ? this.removeButtonTemplate() : ''}
            </span>
        `;
    }
}

export function define() {
    defineElement('el-tag', Tag);
}

export { Events };
