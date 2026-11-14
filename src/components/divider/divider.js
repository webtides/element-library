import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './divider.style.js';

/**
 * A divider: a line between two groups of content, the regions of a card, the entries of a menu,
 * the controls of a toolbar. Horizontal by default, as wide as its container; vertical it is as
 * high as the row it stands in. The line is a native `<hr>`, which is a separator to assistive
 * technology.
 *
 * @element el-divider
 *
 * @csspart base - The line, an `<hr>`.
 *
 * @cssproperty --el-divider-color - The colour of the line. Unset, it is `--el-color-border`, and
 *   a fifth of the text colour without a theme.
 * @cssproperty --el-divider-width - The thickness of the line. Unset, it is `--el-border-width`,
 *   and `1px` without a theme.
 *
 * @property {'horizontal'|'vertical'} orientation - The direction of the line. Default
 *   `'horizontal'`. Reflected to the `orientation` attribute.
 */
export default class Divider extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet selects the host by this attribute.
            propertyOptions: {
                orientation: { reflect: true },
            },
        });
    }

    properties() {
        return {
            orientation: 'horizontal',
        };
    }

    template() {
        const orientation = this.orientation === 'vertical' ? 'vertical' : 'horizontal';
        return html`<hr part="base" class="divider" aria-orientation="${orientation}" />`;
    }
}

export function define() {
    defineElement('el-divider', Divider);
}
