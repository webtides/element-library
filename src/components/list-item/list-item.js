import { TemplateElement, defineElement, html, classMap, spreadAttributes } from '@webtides/element-js';
import style from './list-item.style.js';

/**
 * One row of an `el-list`. It has the parts a row has everywhere: something at the start (an icon,
 * an avatar), a title, a line under it, something at the end (a value, a count, a chevron), and a
 * control of its own after that.
 *
 * With `href` the row is a link as a whole: the title is the link, and its target is the whole
 * row. What is slotted into `action` stays a target of its own.
 *
 * Pure presentation: the row runs no script of its own.
 *
 * @element el-list-item
 *
 * @slot - The title of the row.
 * @slot description - The line under the title.
 * @slot start - What stands in front of the texts: an icon, an avatar. The texts of all rows of a
 *   list begin after the widest start.
 * @slot end - What stands at the end of the row and belongs to it: a value, a count, a chevron. In
 *   a row that is a link it is part of the target of the link.
 * @slot action - A control at the very end: a button, a switch, a menu. In a row that is a link it
 *   lies on top of the link and is a target of its own.
 *
 * @csspart base - The row: an item of the list.
 * @csspart mark - The dot of `mark`, in the padding at the start of the row.
 * @csspart start - The region of the `start` slot.
 * @csspart text - The title and the line under it.
 * @csspart title - The title: an `<a>` with `href`, a `<span>` without.
 * @csspart description - The region of the `description` slot.
 * @csspart end - The region of the `end` slot.
 * @csspart action - The region of the `action` slot.
 *
 * @cssproperty --el-list-padding-inline - The padding of the row at its start and its end. Unset,
 *   it is `--el-space-4`, and `1rem` without a theme.
 * @cssproperty --el-list-gap - The gap between the start, the texts, the end and the control of
 *   the row. Unset, it is `--el-space-3`, and `0.75rem` without a theme.
 *
 * @property {string} href - The address the row leads to. Unset, the row is no link.
 * @property {string} target - Where to open the address (only with `href`).
 * @property {string} rel - `rel` attribute for the link, written when `target` is set. Default
 *   `'noreferrer noopener'`.
 * @property {boolean} current - The row is the current or the chosen one: it gets `aria-current`
 *   (`"page"` on the link of a row with `href`, `"true"` on a row without), a bar at its start
 *   and a heavier title. Default `false`.
 * @property {string} mark - Marks the row with a dot in the padding at its start, which does not
 *   move the texts: an unread message, for example. The text is what assistive technology reads
 *   in front of the title ("Unread"). Unset, the row has no mark.
 * @property {boolean} truncate - Cuts the title and the line under it after one line, with an
 *   ellipsis. Unset, a long text breaks into more lines. Default `false`.
 */
export default class ListItem extends TemplateElement {
    constructor() {
        super({
            styles: [style],
            shadowRender: true,
        });
    }

    properties() {
        return {
            href: '',
            target: '',
            rel: 'noreferrer noopener',
            current: false,
            mark: '',
            truncate: false,
        };
    }

    /** @private */
    titleTemplate() {
        // Read in front of the title, and part of the name of the link: a list of links says
        // which of them are marked. The space keeps the two words apart in that name.
        const mark = this.mark ? html`<span class="mark-text">${this.mark} </span>` : '';

        if (!this.href) {
            return html`<span part="title" class="title">${mark}<slot></slot></span>`;
        }

        return html`
            <a
                part="title"
                class="title"
                href="${this.href}"
                ${spreadAttributes({
                    target: this.target || undefined,
                    rel: this.target ? this.rel : undefined,
                    'aria-current': this.current ? 'page' : undefined,
                })}
                >${mark}<slot></slot
            ></a>
        `;
    }

    template() {
        const classes = {
            item: true,
            'item--link': !!this.href,
            'item--current': !!this.current,
            'item--truncate': !!this.truncate,
        };

        // The role of a row is inside of the shadow root, not on the element: it is part of the
        // server-rendered markup that way, and needs no script.
        return html`
            <div
                part="base"
                class="${classMap(classes)}"
                role="listitem"
                ${spreadAttributes({ 'aria-current': this.current && !this.href ? 'true' : undefined })}
            >
                ${this.mark ? html`<span part="mark" class="mark" aria-hidden="true"></span>` : ''}
                <span part="start" class="start"><slot name="start"></slot></span>
                <span class="body">
                    <span part="text" class="text">
                        ${this.titleTemplate()}
                        <span part="description" class="description"><slot name="description"></slot></span>
                    </span>
                    <span part="end" class="end"><slot name="end"></slot></span>
                    <span part="action" class="action"><slot name="action"></slot></span>
                </span>
            </div>
        `;
    }
}

export function define() {
    defineElement('el-list-item', ListItem);
}
