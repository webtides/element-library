import { TemplateElement, defineElement } from '@webtides/element-js';
import style from './svg-use.style.js';

// TODO: think about setting spritePath globally ?!

export default class SvgUse extends TemplateElement {
    constructor() {
        super({ styles: [style] });
    }

    properties() {
        return {
            name: '',
            spritePath: '', // if empty, the sprite should be embedded in the parent document
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
