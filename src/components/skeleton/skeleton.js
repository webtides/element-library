import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './skeleton.style.js';

/**
 * A skeleton: a quiet shape in the place of content that is still loading, a line of text, an
 * image, an avatar. By default it is a line: as wide as its container and as high as the text. A
 * width, a height and a radius make it any other shape. It says nothing to assistive technology;
 * the region that loads does, with `aria-busy`.
 *
 * @element el-skeleton
 *
 * @csspart base - The shape.
 *
 * @cssproperty --el-skeleton-color - The colour of the shape. Unset, it is an eighth of the text
 *   colour (`--el-color-fg`, and the text colour of the page without a theme).
 * @cssproperty --el-skeleton-sheen-color - The colour of the band that passes over the shape with
 *   `effect="sheen"`. Unset, it is a third of the colour of the shape.
 * @cssproperty --el-skeleton-radius - The radius of the shape. Unset, it is `--el-radius-md`.
 *
 * @property {'none'|'sheen'|'pulse'} effect - How the shape moves while it waits: not at all, with
 *   a band that passes over it, or by fading. Default `'none'`. Reflected to the `effect`
 *   attribute.
 */
export default class Skeleton extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The stylesheet selects the host by this attribute.
            propertyOptions: {
                effect: { reflect: true },
            },
        });
    }

    properties() {
        return {
            effect: 'none',
        };
    }

    template() {
        return html`<span part="base" class="skeleton"></span>`;
    }
}

export function define() {
    defineElement('el-skeleton', Skeleton);
}
