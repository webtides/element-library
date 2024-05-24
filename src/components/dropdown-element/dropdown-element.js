import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './dropdown-element.css';

export default class DropdownElement extends TemplateElement {
    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    properties() {
        return {
            open: false,
        };
    }

    watch() {
        return {
            open: (open) => {
                if (open) {
                    this.addEventListeners();
                } else {
                    this.removeEventListeners();
                }
            },
        };
    }

    events() {
        return {
            '[show-dropdown]': {
                click: () => {
                    this.open = true;
                },
            },
        };
    }

    addEventListeners() {
        window.addEventListener('click', this.onClick.bind(this), { once: true });
        document.addEventListener('keydown', this.onKeyDown.bind(this), { once: true });
    }

    removeEventListeners() {
        window.removeEventListener('click', this.onClick);
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onClick() {
        this.open = false;
    }

    onKeyDown(event) {
        if (event.keyCode === 27) this.open = false;
    }

    template() {
        return html`
            <slot part="trigger" name="trigger" show-dropdown></slot>
            ${this.open ? html` <slot part="content" name="content"></slot> ` : null}
        `;
    }
}

export function define() {
    defineElement('dropdown-element', DropdownElement);
}
