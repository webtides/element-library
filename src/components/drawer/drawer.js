import { defineElement } from '@webtides/element-js';
import Dialog from '../dialog/dialog.js';
import style from './drawer.style.js';
import Events from './drawer.events.js';

/**
 * A panel that slides in from an edge of the viewport and lies over the page: for a navigation, a
 * filter, the details of a row. It is the dialog of the library at another place, a modal built on
 * the native `<dialog>` element. The platform keeps the focus inside, makes the page behind it
 * `inert`, renders it in the top layer and gives the focus back when it closes. The component adds
 * the edge it comes from, the slide, a close that a listener can refuse, and the lock on the
 * scrolling of the page.
 *
 * @element el-drawer
 *
 * @fires {CustomEvent} drawer-show - Fired when the drawer starts to open.
 * @fires {CustomEvent} drawer-after-show - Fired once the drawer has slid in.
 * @fires {CustomEvent} drawer-hide - Fired when the drawer starts to close.
 * @fires {CustomEvent} drawer-after-hide - Fired once the drawer has slid out.
 * @fires {CustomEvent} drawer-initial-focus - Fired after the drawer has been opened and the
 *   platform has moved the focus into it. Move the focus in a listener to have it elsewhere.
 * @fires {CustomEvent<{ source: 'close-button' | 'keyboard' | 'overlay' }>} drawer-request-close -
 *   Fired before the drawer closes for the close button, `Escape` or a click on the backdrop.
 *   Cancelable: call `preventDefault()` to keep the drawer open.
 *
 * @slot - The content of the drawer (body).
 * @slot label - The title of the drawer. Takes precedence over the `label` attribute.
 * @slot header-actions - Controls in the header, before the close button.
 * @slot footer - The footer, for buttons as a rule. It is left out when it is empty.
 *
 * @csspart base - The native `<dialog>` element: the surface of the drawer (background, border,
 *   shadow). The backdrop is its `::backdrop` pseudo-element.
 * @csspart header - The header row with the title, the header actions and the close button.
 * @csspart title - The title heading.
 * @csspart header-actions - The container of the `header-actions` slot.
 * @csspart close-button - The built-in close button.
 * @csspart body - The body with the default slot. It scrolls when the content is longer.
 * @csspart footer - The footer with the `footer` slot.
 *
 * @cssstate open - Set while the drawer is open. Style with `:host(:state(open))` or
 *   `el-drawer:state(open)` from outside.
 *
 * @property {boolean} open - Whether the drawer is open. Reflected to the `open` attribute.
 * @property {string} label - The title of the drawer (used when the `label` slot is empty), and
 *   its accessible name when `no-header` is set.
 * @property {'start'|'end'|'top'|'bottom'} placement - The edge of the viewport the drawer comes
 *   from. `start` and `end` are the two ends of a line of text: left and right, and the other way
 *   round in a right-to-left page. Default `'end'`. Reflected to the `placement` attribute.
 * @property {boolean} noHeader - Removes the header (title and built-in close button). Provide a
 *   way to close the drawer when set. Reflected to the `no-header` attribute.
 * @property {string} closeLabel - Accessible label of the built-in close button. Default `'Close'`.
 */
export default class Drawer extends Dialog {
    constructor(options = {}) {
        super({
            styles: [style],
            ...options,
            // The stylesheet selects the host by this attribute.
            propertyOptions: { placement: { reflect: true }, ...options.propertyOptions },
        });
    }

    properties() {
        return {
            ...super.properties(),
            placement: 'end',
        };
    }

    /** @protected */
    get _eventNames() {
        return Events;
    }
}

export function define() {
    defineElement('el-drawer', Drawer);
}

export { Events };
