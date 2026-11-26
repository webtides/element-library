import { TemplateElement, defineElement, html, spreadAttributes } from '@webtides/element-js';
import { define as defineTooltip } from '../tooltip/tooltip.js';
import { activeElement, focusableElements } from '../../utils/focus.js';
import { hasSlotted } from '../../utils/slots.js';
import style from './toolbar.style.js';

/** A control that takes text: there the left and right arrow keys, Home and End move the caret. */
const TEXT_ENTRY =
    'textarea, select, [contenteditable=""], [contenteditable="true"], input:not([type="radio"], [type="checkbox"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"], [type="file"], [type="image"])';

/**
 * A toolbar: the row of controls over a list or a view. It gives them one size and one
 * appearance, lays them out with a gap, in lines where they do not fit into one, and with a group
 * at the end, and makes them one stop of the Tab key: the arrow keys move between them.
 *
 * The controls are what the page writes into it: `el-button` (also as a toggle, and with an icon
 * alone), `el-button-group`, `el-segmented-field`, and `el-divider` between two groups.
 *
 * The look is the stylesheet alone, so a server-rendered toolbar does not change when the element
 * takes over. The script adds the keyboard, and the tooltips of the buttons with an icon alone.
 *
 * @element el-toolbar
 *
 * @slot - The controls of the toolbar, and `el-divider` elements between two groups of them.
 * @slot end - The controls at the end of the toolbar.
 *
 * @csspart base - The toolbar (`role="toolbar"`): the row of the controls.
 * @csspart end - The group at the end.
 * @csspart tooltip - The tooltip of a button with an icon alone: an `el-tooltip`.
 *
 * @property {string} label - The name of the toolbar for assistive technology, "Formatting".
 *   Unset, the toolbar has none.
 * @property {'small'|'medium'|'large'} size - The size of the controls that have none of their
 *   own. Default `'medium'`. Reflected to the `size` attribute.
 * @property {'filled'|'outlined'|'plain'} appearance - The appearance of the buttons that have
 *   none of their own. Default `'plain'`. Reflected to the `appearance` attribute.
 */
export default class Toolbar extends TemplateElement {
    /**
     * The control that had the focus last: where the Tab key comes back to.
     * @private
     * @type {HTMLElement | undefined}
     */
    _current = undefined;

    /**
     * Whether the toolbar has started in a browser, see `connected()`.
     * @private
     */
    _started = false;

    constructor() {
        super({
            styles: [style],
            shadowRender: true,
            // The tooltips are made for the buttons with a name of their own: one that comes or
            // goes, also inside of a group, and a name that changes, ask for a new render.
            // The filter names the attributes of the toolbar itself as well: element-js hears of
            // them through the same observer.
            mutationObserverOptions: {
                childList: true,
                subtree: true,
                attributeFilter: ['aria-label', 'label', 'size', 'appearance'],
            },
            // The stylesheet selects the host by these attributes.
            propertyOptions: {
                size: { reflect: true },
                appearance: { reflect: true },
            },
        });
    }

    properties() {
        return {
            label: '',
            size: 'medium',
            appearance: 'plain',
        };
    }

    connected() {
        // The tooltips come with the script: a server renders none, and the first render in the
        // browser is the markup of the server.
        this._started = true;
        this.requestUpdate();
    }

    events() {
        return {
            this: {
                keydown: (event) => this._onKeydown(event),
                focusin: (event) => this._onFocusIn(event),
            },
            // A template element does not render again when a child comes, goes or changes its
            // `slot` attribute. The slot tells of all three, and the event bubbles to the base.
            "[part~='base']": {
                slotchange: () => this.requestUpdate(),
            },
        };
    }

    /**
     * The controls of the toolbar that the user can move the focus to, in their order: the ones
     * at the end last, as they are shown.
     * @private
     * @returns {HTMLElement[]}
     */
    _controls() {
        const controls = focusableElements(this);
        const atEnd = (control) => {
            let element = control;
            // Out of the shadow root of a component, up to the child of the toolbar.
            while (element && element.parentNode !== this) element = element.parentNode?.host ?? element.parentNode;
            return element?.getAttribute?.('slot') === 'end';
        };
        return [...controls.filter((control) => !atEnd(control)), ...controls.filter(atEnd)];
    }

    /**
     * The arrow keys move the focus from control to control and around the ends, Home and End go
     * to the first and the last one. The Tab key leaves the toolbar.
     * @private
     * @param {KeyboardEvent} event
     */
    _onKeydown(event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;

        const controls = this._controls();
        const current = activeElement();
        const index = controls.indexOf(current);
        if (index === -1) return;

        if (event.key === 'Tab') {
            this._letTabLeave(controls, current);
            return;
        }

        // In a control that takes text the keys move the caret.
        if (current.matches(TEXT_ENTRY)) return;

        const backwards = getComputedStyle(this).direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        const forwards = backwards === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
        const targets = {
            [backwards]: () => controls[(index - 1 + controls.length) % controls.length],
            [forwards]: () => controls[(index + 1) % controls.length],
            Home: () => controls[0],
            End: () => controls[controls.length - 1],
        };
        if (!Object.hasOwn(targets, event.key)) return;

        // The keys would scroll the page, and move the choice of a group of radios: in a toolbar
        // they move the focus, and Space chooses.
        event.preventDefault();
        targets[event.key]().focus();
    }

    /**
     * Lets the Tab key leave the toolbar: the browser takes the key once every listener has had
     * it, and goes to the next stop. Until then the other controls of the toolbar are none.
     * @private
     * @param {HTMLElement[]} controls
     * @param {Element} current
     */
    _letTabLeave(controls, current) {
        const others = controls.filter((control) => control !== current && !control.inert);
        for (const control of others) control.inert = true;
        setTimeout(() => {
            for (const control of others) control.inert = false;
        });
    }

    /**
     * The Tab key comes into the toolbar at the control that had the focus last, and at the first
     * one before any had it. A pointer puts the focus where it is pressed.
     * @private
     * @param {FocusEvent} event
     */
    _onFocusIn(event) {
        const entered = activeElement();
        const controls = this._controls();
        if (!controls.includes(entered)) return;

        const cameFromOutside = !event.relatedTarget || !this.contains(event.relatedTarget);
        const remembered = controls.includes(this._current) ? this._current : controls[0];
        if (cameFromOutside && entered !== remembered && entered.matches(':focus-visible')) {
            remembered.focus();
            return;
        }
        this._current = entered;
    }

    /**
     * The buttons that show an icon alone: they have a name of their own for assistive technology
     * (`aria-label`), which their content does not show. None before the toolbar has started: on
     * a server there is no pointer to show a tooltip to.
     * @private
     * @returns {Element[]}
     */
    _namedButtons() {
        if (!this._started) return [];
        return [...this.querySelectorAll('el-button[aria-label]')].filter((button) =>
            button.getAttribute('aria-label'),
        );
    }

    template() {
        // The role is inside of the shadow root, not on the element: it is part of the
        // server-rendered markup that way, and needs no script.
        return html`
            <div
                part="base"
                class="toolbar"
                role="toolbar"
                ${spreadAttributes({ 'aria-label': this.label || undefined })}
            >
                <slot></slot>
                <div part="end" class="end" ?hidden="${!hasSlotted(this, 'end')}"><slot name="end"></slot></div>
            </div>
            ${this._namedButtons().map(
                (button) =>
                    html`<el-tooltip part="tooltip" type="label" placement="bottom" .anchor="${button}"
                        >${button.getAttribute('aria-label')}</el-tooltip
                    >`,
            )}
        `;
    }
}

export function define() {
    // The tooltips of the buttons with an icon alone.
    defineTooltip();
    defineElement('el-toolbar', Toolbar);
}
