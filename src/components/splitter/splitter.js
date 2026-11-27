import { TemplateElement, defineElement, html } from '@webtides/element-js';
import style from './splitter.style.js';
import Events from './splitter.events.js';

/**
 * The edge between two panes that are beside each other, which the user drags to set the width of
 * one of them: with a mouse, a finger or a pen, and with the arrow keys. To assistive technology
 * it is a separator with a value, the width in pixels, and with the name of what it sizes.
 *
 * The splitter is the control and sizes nothing itself, as a range does: it has a `value` between
 * `min` and `max`, and tells of every change. The layout around it takes the value. An
 * `el-app-frame` renders one at the edge of its navigation and of its aside (`resizable`); a page
 * with two panes of its own writes one between them and sets the width of the pane from the
 * event.
 *
 * @element el-splitter
 *
 * @fires {CustomEvent<{ value: number }>} splitter-resize - Fired with every change the user
 *   makes: while the edge is dragged, and with every key. The new width is in `detail.value`.
 * @fires {CustomEvent<{ value: number }>} splitter-resize-end - Fired once the user has set a
 *   width: when the pointer lets go of the edge, and with every key. The width to keep is in
 *   `detail.value`.
 *
 * @csspart base - The separator: what takes the pointer and the focus. It is wider than the line.
 * @csspart line - The line that shows, and the mark it becomes under the pointer and with the
 *   focus.
 *
 * @cssproperty --el-splitter-line-width - The width of the line. Default `--el-border-width`.
 *
 * @cssstate dragging - Set while a pointer drags the edge.
 *
 * @property {number} value - The width of the pane the splitter sizes, in pixels. Default `0`.
 * @property {number} min - The least width. Default `0`.
 * @property {number} max - The greatest width. Default `100`.
 * @property {number} step - How far an arrow key moves the edge, in pixels. Default `16`.
 * @property {string} label - The name of what the splitter sizes, for assistive technology.
 *   Default `''`.
 * @property {'start'|'end'} placement - The edge of its pane the splitter is. `end`: the pane is
 *   in front of it, and grows when the edge moves away from the start. `start`: the pane is after
 *   it. Default `'end'`.
 */
export default class Splitter extends TemplateElement {
    /**
     * The drag that is going on: the pointer, where it took the edge, the width then, and the
     * direction in which the width grows.
     * @private
     * @type {{ pointerId: number, x: number, value: number, sign: number } | undefined}
     */
    _drag = undefined;

    constructor() {
        super({ styles: [style], shadowRender: true });
    }

    properties() {
        return {
            value: 0,
            min: 0,
            max: 100,
            step: 16,
            label: '',
            placement: 'end',
        };
    }

    events() {
        return {
            "[part~='base']": {
                pointerdown: (event) => this._onPointerDown(event),
                pointermove: (event) => this._onPointerMove(event),
                pointerup: (event) => this._onPointerEnd(event),
                pointercancel: (event) => this._onPointerEnd(event),
                // The capture of a finger starts on what it touched, the line, and moves to the
                // separator: only the separator losing it is the end of a drag.
                lostpointercapture: (event) => {
                    if (event.target === event.currentTarget) this._onPointerEnd(event);
                },
                keydown: (event) => this._onKeyDown(event),
            },
        };
    }

    disconnected() {
        this._drag = undefined;
        this._internals.states.delete('dragging');
    }

    /**
     * A width between the least and the greatest one, in whole pixels.
     * @private
     * @param {number} value
     * @returns {number}
     */
    _clamp(value) {
        const min = Number(this.min) || 0;
        const max = Math.max(min, Number(this.max) || 0);
        return Math.round(Math.min(max, Math.max(min, Number(value) || 0)));
    }

    /**
     * The direction in which the width grows: 1 where it grows as the edge moves to the right.
     * The pane is in front of the edge or after it, and the page runs from the left or from the
     * right.
     * @private
     * @returns {number}
     */
    _sign() {
        const rtl = getComputedStyle(this).direction === 'rtl';
        return (rtl ? -1 : 1) * (this.placement === 'start' ? -1 : 1);
    }

    /**
     * Takes a width from the user and tells of it. A width that is the same as before is none.
     * @private
     * @param {number} value
     * @returns {boolean} Whether the width has changed.
     */
    _resize(value) {
        const next = this._clamp(value);
        if (next === this._clamp(this.value)) return false;
        this.value = next;
        this.dispatch(Events.RESIZE, { value: next });
        return true;
    }

    /**
     * The edge follows the pointer that took it, wherever that goes. The separator captures the
     * pointer, so a move outside of the window still arrives here. A page in the page takes a pen
     * that is over it all the same: while the edge is dragged, the separator covers the viewport
     * (see the stylesheet), and the pointer is over nothing else.
     * @private
     * @param {PointerEvent} event
     */
    _onPointerDown(event) {
        if (event.button !== 0) return;
        // A drag whose end never arrived is over when the next one starts.
        this._endDrag();

        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // A pointer that is gone again cannot be captured. The drag ends with the next one.
        }
        this._drag = {
            pointerId: event.pointerId,
            x: event.clientX,
            value: this._clamp(this.value),
            sign: this._sign(),
        };
        this._internals.states.add('dragging');
    }

    /**
     * @private
     * @param {PointerEvent} event
     */
    _onPointerMove(event) {
        const drag = this._drag;
        if (!drag || event.pointerId !== drag.pointerId) return;

        this._resize(drag.value + drag.sign * (event.clientX - drag.x));
    }

    /**
     * The pointer has let go, or the system has taken it away: the width stays as it is now.
     * @private
     * @param {PointerEvent} event
     */
    _onPointerEnd(event) {
        if (event.pointerId === this._drag?.pointerId) this._endDrag();
    }

    /**
     * Ends the drag that is going on, and tells of the width that stays if it is another one than
     * before the drag.
     * @private
     */
    _endDrag() {
        const drag = this._drag;
        if (!drag) return;

        this._drag = undefined;
        this._internals.states.delete('dragging');
        const value = this._clamp(this.value);
        if (value !== drag.value) this.dispatch(Events.RESIZE_END, { value });
    }

    /**
     * The arrow keys move the edge a step, in the direction of the arrow. `Home` and `End` take
     * it to the least and to the greatest width.
     * @private
     * @param {KeyboardEvent} event
     */
    _onKeyDown(event) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;

        const value = this._clamp(this.value);
        const step = Math.abs(Number(this.step)) || 1;
        const to = {
            ArrowRight: value + this._sign() * step,
            ArrowLeft: value - this._sign() * step,
            Home: Number(this.min) || 0,
            End: Number(this.max) || 0,
        }[event.key];
        if (to === undefined) return;

        // The key is the one of the splitter: the page does not scroll with it.
        event.preventDefault();
        if (this._resize(to)) this.dispatch(Events.RESIZE_END, { value: this._clamp(this.value) });
    }

    template() {
        const min = Number(this.min) || 0;

        return html`
            <div
                part="base"
                class="splitter"
                role="separator"
                tabindex="0"
                aria-orientation="vertical"
                aria-label="${this.label || null}"
                aria-valuenow="${this._clamp(this.value)}"
                aria-valuemin="${min}"
                aria-valuemax="${Math.max(min, Number(this.max) || 0)}"
            >
                <span part="line" class="line"></span>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-splitter', Splitter);
}

export { Events };
