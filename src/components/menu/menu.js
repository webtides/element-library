import { TemplateElement, defineElement, html } from '@webtides/element-js';
import { activeElement } from '../../utils/focus.js';
import { followAnchor, placeAtAnchor } from '../../utils/floating.js';
import style from './menu.style.js';
import Events from './menu.events.js';

/**
 * The menu that is open. One at a time: a menu that opens closes the one before it.
 * @type {HTMLElement | undefined}
 */
let openMenu;

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
 * on the page. It is placed at the button, at the side that `placement` names, on the other side
 * without room there, and never outside of the viewport. A press beside it closes it.
 *
 * Choosing an entry closes the menu and fires `menu-select`.
 *
 * One menu can serve many things, the rows of a list: `showAt()` opens it at a point of the
 * viewport, for a right click or a long press, or at an element of the page, a button of a row.
 * What it was opened for is the `opener`, which gets the focus back and which `menu-select`
 * names.
 *
 * @element el-menu
 *
 * @fires {CustomEvent} menu-show - Fired when the menu has opened.
 * @fires {CustomEvent} menu-hide - Fired when the menu has closed.
 * @fires {CustomEvent<{ item: HTMLElement, value: string, opener: Element | undefined }>} menu-select -
 *   Fired when the user has chosen an entry: the `el-menu-item` is in `detail.item`, its `value`
 *   in `detail.value`, and what the menu was opened for in `detail.opener`. The menu closes after
 *   it.
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

    /**
     * Where the menu is placed while it is open somewhere else than at its own button: an element
     * of the page, or a point of the viewport.
     * @private
     * @type {Element | { x: number, y: number } | undefined}
     */
    _place = undefined;

    /**
     * What the menu was opened for with `showAt()`.
     * @private
     * @type {Element | undefined}
     */
    _opener = undefined;

    /**
     * The button of the page that was told that the menu is open.
     * @private
     * @type {Element | undefined}
     */
    _expanded = undefined;

    /**
     * Where the menu opens next, and what for: what `showAt()` was given. It is taken when the
     * menu opens, which is after the element has rendered.
     * @private
     * @type {{ place: Element | { x: number, y: number }, opener: Element | undefined } | undefined}
     */
    _next = undefined;

    /**
     * Whether the Tab key was pressed in the menu, and the focus is about to leave it.
     * @private
     */
    _leaving = false;

    /**
     * Whether the panel is being placed, and whether it was asked to be placed again meanwhile.
     * @private
     */
    _placing = false;

    /** @private */
    _placeAgain = false;

    /**
     * The entry that had the focus last while the menu is open. It gets the focus back when a
     * press beside the entries has given it to the panel.
     * @private
     * @type {HTMLElement | undefined}
     */
    _current = undefined;

    /**
     * Whether the menu is open and has not put the focus on an entry yet: its entries are not
     * there, or not defined. The focus goes to them once they are.
     * @private
     */
    _entering = false;

    /**
     * Whether the pointer that went down last is on the element the menu is open at, the button
     * of a row. The `showAt()` the page calls with the click of that press closes the menu.
     * @private
     */
    _pressedAtPlace = false;

    /**
     * A pointer that goes down beside the open menu closes it. The panel is a popover the menu
     * opens and closes itself (`popover="manual"`): the platform would close one of its own
     * (`auto`) when the pointer that opened it is let go, the finger after a long press.
     * @private
     * @param {PointerEvent} event
     */
    _onPressOutside = (event) => {
        const path = event.composedPath();
        this._pressedAtPlace = false;
        if (path.includes(this.$refs.panel)) return;
        // The button of the menu closes it with its click.
        if (!this._place && path.includes(this._trigger())) return;
        // So does the element the menu is open at, the button of a row. Its click is the one of
        // the page, which calls showAt() with it: closed here, the menu would be opened again
        // by that call, and the button could not close what it has opened.
        if (this._place instanceof Element && path.includes(this._place)) {
            this._pressedAtPlace = true;
            return;
        }

        this._restoreFocus = false;
        this.open = false;
    };

    /**
     * The keys of a menu, for as long as it is open and wherever the focus is: an open menu that
     * has lost the focus would be left with no key at all. The window hears a key before the
     * page does, so `Escape` closes the menu and nothing behind it.
     * @private
     * @param {KeyboardEvent} event
     */
    _onKeyDown = (event) => {
        // A key is no press of a pointer: `Enter` on the button of a row is a click as well.
        this._pressedAtPlace = false;
        if (event.altKey || event.ctrlKey || event.metaKey) return;

        const items = this._items();
        const active = activeElement();
        const index = items.findIndex((item) => item === active || item.shadowRoot?.contains(active));
        const inMenu = index >= 0 || active === this.$refs.panel;

        // The focus leaves the menu with this key, and may leave the page: the browser says
        // where it goes only while it stays in the page. Outside of the menu the focus moves on
        // from where it is, and the menu closes as well.
        if (event.key === 'Tab') {
            if (inMenu) {
                this._leaving = true;
                requestAnimationFrame(() => (this._leaving = false));
            } else {
                this._restoreFocus = false;
                this.open = false;
            }
            return;
        }
        // The key is the one of the menu: a dialog around it stays open.
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            this._restoreFocus = true;
            this.open = false;
            return;
        }
        // The focus is somewhere else in the page: the arrow keys bring it into the menu, and
        // every other key is the one of the page.
        if (!inMenu) {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            event.stopPropagation();
            this._enterAt = event.key === 'ArrowUp' ? 'last' : 'first';
            this._focusEntry();
            return;
        }

        const go = (to) => {
            event.preventDefault();
            items[(to + items.length) % items.length]?.focus();
        };

        if (event.key === 'ArrowDown') go(index + 1);
        else if (event.key === 'ArrowUp') go(index < 0 ? items.length - 1 : index - 1);
        else if (event.key === 'Home') go(0);
        else if (event.key === 'End') go(items.length - 1);
        else if (event.key === ' ') {
            // A button is pressed with the space bar by the browser. A link is not, and in a menu
            // the key chooses every entry. On the panel it chooses nothing, and scrolls nothing.
            event.preventDefault();
            if (index >= 0) active.click();
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
    };

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
        document.removeEventListener('pointerdown', this._onPressOutside, true);
        window.removeEventListener('keydown', this._onKeyDown, true);
        if (openMenu === this) openMenu = undefined;
    }

    afterUpdate() {
        this._syncTrigger();
        // A new placement or distance.
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
                    // A press beside the open menu closes it, and where the menu is open for a
                    // row, its own button is beside it. A click that found it closed would open
                    // it again, so a click of a pointer goes by what was the case when the
                    // pointer went down. A click of the keyboard has no pointer (`detail` is 0).
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
                click: (event) => this._onClick(event),
                focusin: (event) => this._onFocusIn(event),
                focusout: (event) => this._onFocusOut(event),
                // The element does not render again when an entry comes or goes: the slot tells
                // of it. An entry that has come renders with the next frame.
                slotchange: () => requestAnimationFrame(() => this._entriesChanged()),
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
     * Opens the menu somewhere else than at its own button: one menu for the rows of a list.
     *
     * At a point of the viewport, from a `contextmenu` event or a long press: the corner of the
     * menu is at the point, and the menu stays inside of the viewport. Or at an element of the
     * page, the button of a row: the menu is placed at it as at its own button.
     *
     * `opener` is what the menu is opened for. It gets the focus back when the menu closes, and
     * `menu-select` names it (`detail.opener`). Without one it is the element the menu is placed
     * at.
     *
     * Called with the click of a press on the element the menu is open at, it closes the menu:
     * the button of a row closes what it has opened, with the listener that opens it.
     * @param {Element | { x: number, y: number }} place - The element, or the point in the
     *   coordinates of the viewport (`clientX`, `clientY`).
     * @param {Element} [opener] - The row or the button the menu is opened for.
     * @returns {void}
     */
    showAt(place, opener) {
        const next = { place, opener: opener ?? (place instanceof Element ? place : undefined) };
        this._enterAt = 'first';

        // Open already, for something else: the panel stays where the platform has it, in the
        // top layer, and moves. The page is told of both, the row it has left and the row it is
        // open for now.
        if (this.open && this.$refs.panel?.matches(':popover-open')) {
            // The pointer is on what the menu is open at, and the page calls this with the click
            // of that press: a second press on a button closes what the first one has opened.
            if (this._pressedAtPlace && next.place === this._place) {
                this.open = false;
                return;
            }

            this.dispatch(Events.HIDE);
            this._place = next.place;
            this._opener = next.opener;
            this._current = undefined;
            this._pressedAtPlace = false;
            this._syncTrigger();
            this._startPositioning();
            this._focusEntry();
            this.dispatch(Events.SHOW);
            return;
        }

        // The property tells of its change after the element has rendered: the place waits.
        this._next = next;
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
     * What the menu is open for: the row or the button it was opened for with `showAt()`, or its
     * own button. Nothing while it is closed.
     * @returns {Element | undefined}
     */
    get opener() {
        return this.open ? (this._opener ?? this._trigger()) : undefined;
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
        // Open for something else, the menu is not the one of its own button for that time.
        const own = this.open && !this._place;
        if (trigger) {
            if (trigger.getAttribute('aria-haspopup') !== 'menu') trigger.setAttribute('aria-haspopup', 'menu');
            const expanded = own ? 'true' : 'false';
            if (trigger.getAttribute('aria-expanded') !== expanded) trigger.setAttribute('aria-expanded', expanded);
        }

        // A button of the page that opens the menu says that it does (`aria-haspopup`): the page
        // writes that, the menu does not know its buttons. Such a button is told whether the
        // menu is open. A row is no control, and has nothing to say.
        const button = this.open && this._opener?.matches('[aria-haspopup]') ? this._opener : undefined;
        if (this._expanded && this._expanded !== button) this._expanded.setAttribute('aria-expanded', 'false');
        if (button) button.setAttribute('aria-expanded', 'true');
        this._expanded = button;

        // Without a name of its own the menu has the one of the button it is open for.
        const panel = this.$refs.panel;
        if (panel && 'ariaLabelledByElements' in panel) {
            const named = this._place ? button : trigger;
            panel.ariaLabelledByElements = this.label || !named ? null : [named];
        }
    }

    /**
     * Whether the focus is on an entry of the menu.
     * @private
     * @returns {boolean}
     */
    _hasFocusOnEntry() {
        const active = activeElement();
        return this._items().some((item) => item === active || item.shadowRoot?.contains(active));
    }

    /**
     * Whether the focus is in the menu: on an entry, or on the panel around the entries.
     * @private
     * @returns {boolean}
     */
    _hasFocusInPanel() {
        return activeElement() === this.$refs.panel || this._hasFocusOnEntry();
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
     * A click in the panel: the user has chosen the entry it is on, unless that one is disabled.
     * @private
     * @param {MouseEvent} event
     */
    _onClick(event) {
        const item = event.composedPath().find((node) => node instanceof Element && node.localName === 'el-menu-item');
        if (!item || item.closest('el-menu') !== this || item.disabled) return;

        this._restoreFocus = true;
        this.dispatch(Events.SELECT, { item, value: item.value, opener: this.opener });
        this.open = false;
    }

    /**
     * The focus has left the menu with the Tab key, which closes it and moves on. The focus is
     * where the user has put it, and stays there.
     *
     * Only the key closes it this way. A pointer that goes down beside the menu closes it by
     * itself, and the finger of a long press gives the focus to the row it is on when it is
     * lifted: the menu it has just opened stays open.
     * @private
     * @param {FocusEvent} event
     */
    _onFocusOut(event) {
        if (!this.open || !this._leaving) return;
        if (event.relatedTarget?.closest('el-menu-item') && this.contains(event.relatedTarget)) return;

        this._restoreFocus = false;
        this.open = false;
    }

    /**
     * The focus has come into the menu. On an entry: the menu remembers it. On the panel itself:
     * the user has pressed beside the entries, on the heading of a group, a line or the padding,
     * and the entry that had the focus gets it back. The keyboard goes on from there.
     * @private
     * @param {FocusEvent} event
     */
    _onFocusIn(event) {
        if (event.target !== this.$refs.panel) {
            const path = event.composedPath();
            this._current = this._items().find((item) => path.includes(item)) ?? this._current;
            return;
        }
        if (this._current && this._items().includes(this._current)) this._current.focus();
    }

    /**
     * Puts the focus on the entry the menu is entered at. An entry that is not there yet, or
     * whose element is not defined yet, cannot take it: the menu waits for it.
     * @private
     */
    _focusEntry() {
        const items = this._items();
        (this._enterAt === 'last' ? items.at(-1) : items[0])?.focus();
        if (this._hasFocusOnEntry()) {
            this._entering = false;
            this._enterAt = 'first';
            return;
        }
        if (this._entering) return;

        // The page renders the entries when the menu is asked for, or an autoloader defines the
        // element of an entry when it first sees one. An element that is defined renders with
        // the next frame.
        this._entering = true;
        customElements.whenDefined('el-menu-item').then(() => requestAnimationFrame(() => this._entriesChanged()));
    }

    /**
     * Other entries in the open menu, or entries that have rendered by now. The panel has
     * another size, and a menu at a point is placed once. And the focus goes to the entry the
     * menu is entered at, where none could take it when the menu opened and nothing in the menu
     * has it by now.
     * @private
     */
    _entriesChanged() {
        if (!this.open) return;
        this._position();
        if (this._entering && !this._hasFocusInPanel()) this._focusEntry();
    }

    /** @private */
    _applyOpen() {
        const panel = this.$refs.panel;
        if (!panel || !this.isConnected) return;

        // What showAt() was given, or nothing: the menu of its own button.
        this._place = this._next?.place;
        this._opener = this._next?.opener;
        this._next = undefined;

        // One menu at a time.
        if (openMenu && openMenu !== this) openMenu.open = false;
        openMenu = this;

        this._restoreFocus = false;
        this._current = undefined;
        this._entering = false;
        if (!panel.matches(':popover-open')) panel.showPopover();
        document.addEventListener('pointerdown', this._onPressOutside, true);
        window.addEventListener('keydown', this._onKeyDown, true);
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

        // What the menu was open for gets the focus back: the row, the button, its own button.
        const opener = this._opener ?? this._trigger();
        this._place = undefined;
        this._opener = undefined;
        this._current = undefined;
        this._entering = false;
        this._pressedAtPlace = false;

        if (openMenu === this) openMenu = undefined;
        document.removeEventListener('pointerdown', this._onPressOutside, true);
        window.removeEventListener('keydown', this._onKeyDown, true);
        this._stopPositioning();
        if (panel.matches(':popover-open')) panel.hidePopover();
        this._internals.states.delete('open');
        this._syncTrigger();
        if (restore) opener?.focus?.();
        this.dispatch(Events.HIDE);
    }

    /**
     * What the panel is placed at: its own button, the element of `showAt()`, or its point. A
     * point is an element for the placing that has no size and does not move.
     * @private
     * @returns {Element | { getBoundingClientRect: () => DOMRect }}
     */
    _anchor() {
        const place = this._place;
        if (!place) return this._trigger() ?? this;
        if (place instanceof Element) return place;
        return { getBoundingClientRect: () => new DOMRect(Number(place.x) || 0, Number(place.y) || 0, 0, 0) };
    }

    /**
     * Places the panel now, and again whenever the button moves: on scroll, on resize, when the
     * button or the panel changes its size.
     * @private
     */
    _startPositioning() {
        this._stopPositioning();
        const anchor = this._anchor();
        // A point does not move: the menu is placed at it once.
        if (anchor instanceof Element) {
            this._stopAutoUpdate = followAnchor(anchor, this.$refs.panel, () => this._position());
        } else {
            this._position();
        }
    }

    /** @private */
    _stopPositioning() {
        this._stopAutoUpdate?.();
        this._stopAutoUpdate = undefined;
    }

    /**
     * Places the panel at what the menu is open at.
     *
     * Not before the panel is shown: the element renders when `open` is set, before the menu has
     * taken its place from `showAt()`, and would be placed at its own element. And one placement
     * at a time: a placement takes a few turns, more where the panel has to try the other side,
     * so one that was asked for first can be done last. A menu whose own element is out of view,
     * below a long list, was taken there that way. What is asked for while the panel is being
     * placed is placed after it, at what the menu is open at by then.
     * @private
     */
    async _position() {
        const panel = this.$refs.panel;
        if (!panel || !this.open || !panel.matches(':popover-open')) return;
        if (this._placing) {
            this._placeAgain = true;
            return;
        }

        this._placing = true;
        try {
            do {
                this._placeAgain = false;
                const atPoint = this._place && !(this._place instanceof Element);
                await placeAtAnchor(this._anchor(), panel, {
                    // At a point the corner of the menu is at the pointer, as the menu of the
                    // system is.
                    placement: atPoint ? 'bottom-start' : this.placement,
                    distance: atPoint ? 0 : this.distance,
                });
            } while (this._placeAgain && this.open);
        } finally {
            this._placing = false;
        }
    }

    template() {
        // A plain binding leaves the name out while there is none. The panel takes the focus of a
        // press beside its entries, and is no stop of the Tab key: without it the focus of such
        // a press would be nowhere in the page.
        return html`
            <slot part="trigger" name="trigger" ref="trigger" data-trigger></slot>
            <div
                part="panel"
                ref="panel"
                class="panel"
                popover="manual"
                role="menu"
                tabindex="-1"
                aria-label="${this.label || null}"
            >
                <slot></slot>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-menu', Menu);
}

export { Events };
