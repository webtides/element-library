import { TemplateElement, defineElement } from '@webtides/element-js';
import style from './svg-use.style.js';

// TODO: think about setting spritePath globally ?!

/**
 * Thin wrapper around `<svg><use href>` that references a symbol from an SVG sprite
 * (either external via `spritePath` or embedded in the parent document).
 *
 * @element el-svg-use
 *
 * @property {string} name - `id` of the `<symbol>` to render from the sprite.
 * @property {string} spritePath - Path to an external SVG sprite. When empty, the symbol is
 *   assumed to be embedded in the parent document.
 */
export default class SvgUse extends TemplateElement {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            name: '',
            spritePath: '',
        };
    }

    template() {
        return `
            <svg>
                <use href="${this.spritePath}#${this.name}"></use>
            </svg>
        `;
    }
}

export function define() {
    defineElement('el-svg-use', SvgUse);
}
