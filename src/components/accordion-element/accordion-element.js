import { TemplateElement, html, defineElement } from '@webtides/element-js';
import style from './accordion-element.style.js';
import Events from './accordion-element.events.js';

/**
 * A collapsible content component that expands and collapses content sections with smooth
 * animations. Features customizable header and content slots, automatic toggle functionality,
 * and emits an event when its state changes.
 *
 * @element el-accordion-element
 *
 * @fires {CustomEvent<{ open: boolean }>} AccordionElementToggle - Fired when the accordion is
 *   toggled. The event bubbles up through the DOM. `detail.open` reflects the new open state.
 *
 * @slot header - Content to display in the accordion header/title area. Clicking this area
 *   toggles the accordion.
 * @slot content - Content to display in the collapsible section of the accordion.
 *
 * @csspart title - The header container that wraps the `header` slot and toggle icons.
 * @csspart content - The wrapper around the collapsible `content` slot.
 * @csspart open-icon - Icon shown while the accordion is collapsed.
 * @csspart close-icon - Icon shown while the accordion is expanded.
 *
 * @cssstate open - Set while the accordion is expanded. Style with `:host(:state(open))` or
 *   `el-accordion-element:state(open)` from outside.
 *
 * @property {boolean} open - Controls whether the accordion is expanded (`true`) or collapsed
 *   (`false`). Reflected to the `open` attribute.
 */
export default class AccordionElement extends TemplateElement {
    constructor() {
        super({ shadowRender: true, styles: [style], propertyOptions: { open: { reflect: true } } });
    }

    connected() {
        if (!this.open) this.collapse();
        if (this.open) this._internals.states.add('open');
    }

    properties() {
        return {
            open: false,
        };
    }

    watch() {
        return {
            open: (open) => {
                open === true ? this.expand() : this.collapse();
                if (open) this._internals.states.add('open');
                else this._internals.states.delete('open');
                this.dispatch(Events.TOGGLE, { open: this.open }, true);
            },
        };
    }

    events() {
        return {
            '[data-toggle]': {
                click: () => {
                    this.toggle();
                },
            },
        };
    }

    /**
     * Toggles the accordion between open and closed states.
     * @returns {void}
     */
    toggle() {
        this.open = !this.open;
    }

    /**
     * Closes the accordion with animation.
     * @returns {void}
     */
    collapse() {
        const contentHeight = this.$refs.content.scrollHeight;

        const elementTransition = this.$refs.content.style.transition;
        this.$refs.content.style.transition = '';

        requestAnimationFrame(() => {
            this.$refs.content.style.height = contentHeight + 'px';
            this.$refs.content.style.transition = elementTransition;

            requestAnimationFrame(() => {
                this.$refs.content.style.height = 0 + 'px';
            });
        });

        this.$refs.content.setAttribute('data-collapsed', 'true');
    }

    /**
     * Opens the accordion with animation.
     * @returns {void}
     */
    expand() {
        const contentHeight = this.$refs.content.scrollHeight;
        this.$refs.content.style.height = contentHeight + 'px';

        this.$refs.content.setAttribute('data-collapsed', 'false');
    }

    template() {
        return html`
            <div part="title" ref="header" data-toggle>
                <slot name="header"></slot>
                ${this.iconsTemplate()}
            </div>
            <div part="content" class="content" ref="content">
                <slot name="content"></slot>
            </div>
        `;
    }

    /** @private */
    iconsTemplate() {
        return html`
            <!--    		https://www.compart.com/de/unicode/U+2227-->
            <div part="open-icon" class="open-icon">&vee;</div>
            <div part="close-icon" class="close-icon">&wedge;</div>
        `;
    }
}

export function define() {
    defineElement('el-accordion-element', AccordionElement);
}

export { html, defineElement, Events };
