import { BaseElement, defineElement } from '@webtides/element-js';

/**
 * Wraps any click-emitting child (`<a>`, `<button>`, …) and scrolls to the element
 * matched by `selector` when the child is clicked.
 *
 * @element el-scroll-to
 *
 * @slot - Default slot. Any child that emits a `click` event will trigger the scroll.
 *
 * @property {string} selector - CSS selector for the element to scroll into view on click.
 * @property {boolean} preventDefault - When `true`, the captured click's default action is
 *   suppressed (e.g. an `<a href>`'s navigation).
 */
export default class ScrollTo extends BaseElement {
    properties() {
        return {
            selector: '',
            preventDefault: true,
        };
    }

    events() {
        return {
            this: {
                click: (e) => {
                    if (this.preventDefault === true) e.preventDefault();
                    document.querySelector(this.selector)?.scrollIntoView({
                        behavior: 'auto',
                        block: 'start',
                    });
                },
            },
        };
    }
}

export function define() {
    defineElement('el-scroll-to', ScrollTo);
}
