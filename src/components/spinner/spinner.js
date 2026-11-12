import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './spinner.style.js';

/**
 * A spinner for a wait of unknown length: a ring with a quarter that turns. It is as large as the
 * text it stands in (`1em`), so the font size is what sizes it; `size` steps it down or up from
 * there.
 *
 * @element el-spinner
 *
 * @csspart base - The ring. It carries `role="progressbar"` and the label.
 *
 * @cssproperty --el-spinner-indicator-color - The quarter of the ring that turns. Unset, it is
 *   `--el-color-accent`, and the text colour without a theme.
 * @cssproperty --el-spinner-track-color - The ring it turns on. Unset, it is a fifth of the text
 *   colour.
 *
 * @property {'small'|'medium'|'large'} size - `small` is 0.8 times, `large` 1.25 times the font
 *   size. Default `'medium'`. Reflected to the `size` attribute.
 * @property {string} label - The accessible name of the spinner. Default `'Loading'`.
 */
export default class Spinner extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The size module selects the host by this attribute.
            propertyOptions: {
                size: { reflect: true },
            },
        });
    }

    properties() {
        return {
            size: 'medium',
            label: 'Loading',
        };
    }

    template() {
        return html`<span part="base" class="spinner" role="progressbar" aria-label="${this.label}"></span>`;
    }
}

export function define() {
    defineElement('el-spinner', Spinner);
}
