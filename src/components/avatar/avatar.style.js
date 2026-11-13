import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

const style = css`
    :host {
        /* The control height of its size, which is the least height of a button of that size.
           --el-avatar-size takes its place for an avatar of any other size. */
        --_el-avatar-size: var(--el-avatar-size, var(--_el-size-height));

        display: inline-block;
        width: var(--_el-avatar-size);
        height: var(--_el-avatar-size);
        vertical-align: middle;
    }

    .avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 50%;
        color: var(--el-color-fg, inherit);
        /* A share of that text colour, as the skeleton has it: the avatar shows on the background
           of the page and on a muted fill, in a light scheme and in a dark one, and without a
           theme. */
        background: color-mix(in srgb, currentColor 12%, transparent);
        font-family: var(--el-font-family, inherit);
        /* Two letters fill the avatar without touching its edge. */
        font-size: calc(var(--_el-avatar-size) * 0.4);
        font-weight: var(--el-font-weight-semibold, 600);
        line-height: 1;
        user-select: none;
    }

    :host([shape='square']) .avatar {
        border-radius: 0;
    }

    :host([shape='rounded']) .avatar {
        border-radius: var(--el-radius-md, 4px);
    }

    /* The image fills the avatar and is cut to its shape, not squeezed into it. */
    [part~='image'] {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* An icon is sized by the font size, which is larger here than for the initials. */
    [part~='icon'] {
        display: flex;
        font-size: calc(var(--_el-avatar-size) * 0.6);
    }

    [part~='icon'] svg {
        width: 1em;
        height: 1em;
    }
`;

export default [hostStyle(), sizeStyle(), style].join('\n');
