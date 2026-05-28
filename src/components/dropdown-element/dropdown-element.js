import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './dropdown-element.style.js';

/**
 * Toggleable dropdown menu with `trigger` and `content` slots. Auto-closes on outside
 * click or `Escape`.
 *
 * @element el-dropdown-element
 *
 * @slot trigger - Element that opens the dropdown when clicked. Automatically receives
 *   the `show-dropdown` attribute.
 * @slot content - Dropdown content shown only while `open` is `true`.
 *
 * @csspart trigger - Forwarded onto the `trigger` slot.
 * @csspart panel - Wrapper around the `content` slot. Surface for background, border, radius
 *   and elevation. Only present in the DOM while `open` is `true`.
 * @csspart content - Forwarded onto the `content` slot.
 *
 * @cssstate open - Set while the dropdown content is visible. Style with `:host(:state(open))`
 *   or `el-dropdown-element:state(open)` from outside.
 *
 * @property {boolean} open - Whether the dropdown content is visible. Setting to `true`
 *   attaches a one-shot outside-click / `Escape` listener that closes the dropdown.
 */
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
                    this._internals.states.add('open');
                } else {
                    this.removeEventListeners();
                    this._internals.states.delete('open');
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

    /** @private */
    addEventListeners() {
        window.addEventListener('click', this.onClick.bind(this), { once: true });
        document.addEventListener('keydown', this.onKeyDown.bind(this), { once: true });
    }

    /** @private */
    removeEventListeners() {
        window.removeEventListener('click', this.onClick);
        document.removeEventListener('keydown', this.onKeyDown);
    }

    /** @private */
    onClick() {
        this.open = false;
    }

    /** @private */
    onKeyDown(event) {
        if (event.keyCode === 27) this.open = false;
    }

    template() {
        return html`
            <slot part="trigger" name="trigger" show-dropdown></slot>
            ${this.open
                ? html`
                      <div part="panel">
                          <slot part="content" name="content"></slot>
                      </div>
                  `
                : null}
        `;
    }
}

export function define() {
    defineElement('el-dropdown-element', DropdownElement);
}
