import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
        vertical-align: middle;
    }

    .button-group {
        display: flex;
    }

    /* The group tells what is slotted into it which of its sides has a neighbour, with properties
       that el-button reads. They are internal (--_el-), and they inherit: a button inside of a
       slotted element, the anchor of a popover, is joined as that element is. */

    /* With a neighbour in front: square corners at the start, and the border at the start lies on
       the border at the end of that neighbour, so the two share one line. For a filled button
       that line is a quarter of its text colour on its fill, which shows between two fills of
       one colour. currentColor is taken where the button paints the line, not here. */
    ::slotted(:not(:first-child)) {
        --_el-group-radius-start: 0px;
        --_el-group-divider: color-mix(in srgb, currentColor 25%, transparent);
        margin-inline-start: calc(-1 * var(--el-border-width, 1px));
    }

    /* With a neighbour behind: square corners at the end. */
    ::slotted(:not(:last-child)) {
        --_el-group-radius-end: 0px;
    }

    /* The button with the focus lies over its neighbours, which would cover a part of its focus
       ring otherwise. */
    ::slotted(:focus-within) {
        z-index: 1;
    }
`;

export default [hostStyle(), style].join('\n');
