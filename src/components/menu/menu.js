import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { activeElement } from '../../utils/focus.js';
import { followAnchor, placeAtAnchor } from '../../utils/floating.js';
import style from './menu.style.js';
import Events from './menu.events.js';

/**
 * A menu button: a button that opens a list of actions. "Edit, Duplicate, Delete" for a row of a
 * table, the account in a header, "More" at the end of a toolbar. The button is what the page
 * puts into the `trigger` slot, the actions are `el-menu-item` elements.
 *
 * To assistive technology it is a menu (`role="menu"`) of menu items, and the button says that it
 * opens one and whether it is open. The keyboard moves through the entries with the arrow keys,
 * `Home`, `End` and the first letter of an entry. `Escape` closes the menu and gives the focus
 * back to the button, the Tab key closes it and moves on.
 *
 * The panel is a native popover: it is in the top layer, so nothing clips it and it moves nothing
 * on the page, and a click beside it closes it. It is placed at the button, at the side that
 * `placement` names, on the other side without room there, and never outside of the viewport.
 *
 * Choosing an entry closes the menu and fires `menu-select`.
 *
 * @element el-menu
 *
 * @fires {CustomEvent} menu-show - Fired when the menu has opened.
 * @fires {CustomEvent} menu-hide - Fired when the menu has closed.
 * @fires {CustomEvent<{ item: HTMLElement, value: string }>} menu-select - Fired when the user has
 *   chosen an entry: the `el-menu-item` is in `detail.item`, its `value` in `detail.value`. The
 *   menu closes after it.
 *
 * @slot - The entries: `el-menu-item` elements, in `el-menu-group` elements where they are
 *   divided into groups. An `el-divider` is a line between two of them.
 * @slot trigger - The button that opens the menu. It gets `aria-haspopup="menu"` and
 *   `aria-expanded`.
 *
 * @csspart trigger - Forwarded onto the `trigger` slot.
 * @csspart panel - The floating panel, which is the menu (`role="menu"`): background, border,
 *   radius, elevation, width.
 *
 * @cssstate open - Set while the menu is shown.
 *
 * @property {boolean} open - Whether the menu is shown. Reflected to the `open` attribute.
 * @property {string} label - The name of the menu for assistive technology. Without one the menu
 *   has the name of its button.
 * @property {'top'|'top-start'|'top-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'|'right'|'right-start'|'right-end'} placement -
 *   The side of the button the menu is placed at, and with `-start` or `-end` the edge of the
 *   button it is aligned with. Without room there, the menu goes to the opposite side. Default
 *   `'bottom-start'`.
 * @property {number} distance - The gap between the button and the menu, in pixels. Default `4`.
 */
export default class Menu extends TemplateElement {
    /**
     * Which entry gets the focus when the menu opens: the first one, or the last one for
     * `ArrowUp` on the button.
     * @private
     * @type {'first'|'last'}
     */
    _enterAt = 'first';

    /**
     * Whether the focus goes back to the button when the menu closes. It does after a choice and
     * after `Escape`, and not where the user has moved it on.
     * @private
     */
    _restoreFocus = false;

    constructor() {
        super({ styles: [style], shadowRender: true, propertyOptions: { open: { reflect: true } } });
    }

    properties() {
        return {
            open: false,
            label: '',
            placement: 'bottom-start',
            distance: 4,
        };
    }

    connected() {
        this._syncTrigger();
        // The watcher does not run for the first value, so a menu that is open from the start is
        // shown here.
        if (this.open) this._applyOpen();
    }

    disconnected() {
        this._stopPositioning();
    }

    afterUpdate() {
        this._syncTrigger();
        // A new placement or distance, other entries in the panel.
        if (this.open) this._position();
    }

    watch() {
        return {
            open: (open) => {
                if (open) this._applyOpen();
                else this._applyClose();
            },
        };
    }

    events() {
        return {
            '[data-trigger]': {
                pointerdown: () => {
                    this._openAtPointerDown = this.open;
                },
                click: (event) => {
                    // The platform closes an open panel when the pointer is released beside it,
                    // and the button is beside it. A click that found it closed would open it
                    // again, so a click of a pointer goes by what was the case when the pointer
                    // went down. A click of the keyboard has no pointer (`detail` is 0).
                    const byPointer = event.detail > 0 && this._openAtPointerDown !== undefined;
                    const wasOpen = byPointer ? this._openAtPointerDown : this.open;
                    this._openAtPointerDown = undefined;
                    this._enterAt = 'first';
                    this.open = !wasOpen;
                },
                keydown: (event) => this._onTriggerKeyDown(event),
                slotchange: () => this._syncTrigger(),
            },
            "[part~='panel']": {
                beforetoggle: (event) => {
                    // Still open at this point, so the focus is where it was. Once the panel is
                    // closed, an entry that had the focus has lost it to the page.
                    if (event.newState === 'closed' && this._hasFocusInPanel()) this._restoreFocus = true;
                },
                toggle: (event) => {
                    // The platform has closed the panel: a click beside it, Escape, or another
                    // popover that opened.
                    if (event.newState === 'closed' && this.open) this.open = false;
                },
                keydown: (event) => this._onKeyDown(event),
                click: (event) => this._onClick(event),
                focusout: (event) => this._onFocusOut(event),
            },
        };
    }

    /**
     * Opens the menu, with the focus on its first entry.
     * @returns {void}
     */
    show() {
        this.open = true;
    }

    /**
     * Closes the menu.
     * @returns {void}
     */
    hide() {
        this.open = false;
    }

    /**
     * Opens the menu when it is closed, and closes it when it is open.
     * @returns {void}
     */
    toggle() {
        this.open = !this.open;
    }

    /**
     * The button of the menu: what is in the `trigger` slot.
     * @private
     * @returns {HTMLElement | undefined}
     */
    _trigger() {
        return this.$refs.trigger?.assignedElements({ flatten: true })[0];
    }

    /**
     * The entries the user can reach, in the order of the page. An entry that is disabled is one
     * of them: the keyboard gets to it, so a screen reader finds it, and it cannot be chosen.
     * @private
     * @returns {HTMLElement[]}
     */
    _items() {
        return [...this.querySelectorAll('el-menu-item')].filter(
            (item) => item.closest('el-menu') === this && !item.closest('[hidden]'),
        );
    }

    /**
     * The text of an entry, without its icon: what a letter of the keyboard is compared with.
     * @private
     * @param {Element} item
     * @returns {string}
     */
    _textOf(item) {
        return [...item.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE || !node.getAttribute?.('slot'))
            .map((node) => node.textContent)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * The button says that it opens a menu, and whether the menu is open. An `el-button` passes
     * both on to the control inside of it.
     * @private
     */
    _syncTrigger() {
        const trigger = this._trigger();
        if (!trigger) return;
        if (trigger.getAttribute('aria-haspopup') !== 'menu') trigger.setAttribute('aria-haspopup', 'menu');
        const expanded = this.open ? 'true' : 'false';
        if (trigger.getAttribute('aria-expanded') !== expanded) trigger.setAttribute('aria-expanded', expanded);

        // Without a name of its own the menu has the one of its button.
        const panel = this.$refs.panel;
        if (panel && 'ariaLabelledByElements' in panel) {
            panel.ariaLabelledByElements = this.label ? null : [trigger];
        }
    }

    /**
     * Whether the focus is on an entry of the menu.
     * @private
     * @returns {boolean}
     */
    _hasFocusInPanel() {
        const active = activeElement();
        return this._items().some((item) => item === active || item.shadowRoot?.contains(active));
    }

    /**
     * The arrow keys on the button open the menu: down at its first entry, up at its last one.
     * `Enter` and `Space` are a click of the button.
     * @private
     * @param {KeyboardEvent} event
     */
    _onTriggerKeyDown(event) {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();

        this._enterAt = event.key === 'ArrowUp' ? 'last' : 'first';
        if (this.open) this._focusEntry();
        else this.open = true;
    }

    /**
     * The keys of a menu, while the focus is on one of its entries.
     * @private
     * @param {KeyboardEvent} event
     */
    _onKeyDown(event) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;

        const items = this._items();
        const active = activeElement();
        const index = items.findIndex((item) => item === active || item.shadowRoot?.contains(active));
        const go = (to) => {
            event.preventDefault();
            items[(to + items.length) % items.length]?.focus();
        };

        if (event.key === 'ArrowDown') go(index + 1);
        else if (event.key === 'ArrowUp') go(index < 0 ? items.length - 1 : index - 1);
        else if (event.key === 'Home') go(0);
        else if (event.key === 'End') go(items.length - 1);
        else if (event.key === ' ' && index >= 0) {
            // A button is pressed with the space bar by the browser. A link is not, and in a menu
            // the key chooses every entry.
            event.preventDefault();
            active.click();
        } else if (event.key.length === 1 && event.key.trim()) {
            // A letter: the next entry that starts with it, from the one that has the focus on.
            const letter = event.key.toLocaleLowerCase();
            const starts = (item) => this._textOf(item).toLocaleLowerCase().startsWith(letter);
            const next = [...items.slice(index + 1), ...items.slice(0, index + 1)].find(starts);
            if (next) {
                event.preventDefault();
                next.focus();
            }
        }
    }

    /**
     * A click in the panel: the user has chosen the entry it is on, unless that one is disabled.
     * @private
     * @param {MouseEvent} event
     */
    _onClick(event) {
        const item = event.composedPath().find((node) => node instanceof Element && node.localName === 'el-menu-item');
        if (!item || item.closest('el-menu') !== this || item.disabled) return;

        this._restoreFocus = true;
        this.dispatch(Events.SELECT, { item, value: item.value });
        this.open = false;
    }

    /**
     * The focus has left the menu: with the Tab key, which closes it and moves on. The focus is
     * where the user has put it, and stays there.
     * @private
     * @param {FocusEvent} event
     */
    _onFocusOut(event) {
        if (!this.open || !event.relatedTarget) return;
        if (this.contains(event.relatedTarget) && event.relatedTarget.closest('el-menu-item')) return;

        this._restoreFocus = false;
        this.open = false;
    }

    /**
     * Puts the focus on the entry the menu is entered at.
     * @private
     */
    _focusEntry() {
        const items = this._items();
        (this._enterAt === 'last' ? items.at(-1) : items[0])?.focus();
        this._enterAt = 'first';
    }

    /** @private */
    _applyOpen() {
        const panel = this.$refs.panel;
        if (!panel || !this.isConnected) return;

        this._restoreFocus = false;
        if (!panel.matches(':popover-open')) panel.showPopover();
        this._internals.states.add('open');
        this._syncTrigger();
        this._startPositioning();
        this._focusEntry();
        this.dispatch(Events.SHOW);
    }

    /** @private */
    _applyClose() {
        const panel = this.$refs.panel;
        if (!panel) return;

        // Asked before the panel is hidden: an entry that has the focus loses it then.
        const restore = this._restoreFocus || this._hasFocusInPanel();
        this._restoreFocus = false;

        this._stopPositioning();
        if (panel.matches(':popover-open')) panel.hidePopover();
        this._internals.states.delete('open');
        this._syncTrigger();
        if (restore) this._trigger()?.focus();
        this.dispatch(Events.HIDE);
    }

    /**
     * Places the panel now, and again whenever the button moves: on scroll, on resize, when the
     * button or the panel changes its size.
     * @private
     */
    _startPositioning() {
        this._stopPositioning();
        this._stopAutoUpdate = followAnchor(this._trigger() ?? this, this.$refs.panel, () => this._position());
    }

    /** @private */
    _stopPositioning() {
        this._stopAutoUpdate?.();
        this._stopAutoUpdate = undefined;
    }

    /** @private */
    async _position() {
        const panel = this.$refs.panel;
        if (!panel || !this.open) return;

        await placeAtAnchor(this._trigger() ?? this, panel, {
            placement: this.placement,
            distance: this.distance,
        });
    }

    template() {
        // A plain binding leaves the name out while there is none.
        return html`
            <slot part="trigger" name="trigger" ref="trigger" data-trigger></slot>
            <div part="panel" ref="panel" class="panel" popover="auto" role="menu" aria-label="${this.label || null}">
                <slot></slot>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-menu', Menu);
}

export { Events };
