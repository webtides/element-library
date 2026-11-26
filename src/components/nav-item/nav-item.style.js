import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
        /* In a bar a destination is as wide as its part of the bar, whatever its text needs. In a
           rail it is as high as it is. The el-nav says which, in a property that is inherited. */
        flex: var(--_el-nav-item-flex, 1 1 0);
        min-inline-size: 0;
    }

    .item {
        block-size: 100%;
    }

    /* The whole destination is the link: the icon, and the text under it. As high as an app bar,
       so the two bars of a phone are the same. */
    .link {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.125rem;
        box-sizing: border-box;
        block-size: 100%;
        min-block-size: calc(var(--el-control-height, 2.5rem) + 2 * var(--el-space-2, 0.5rem));
        padding: var(--el-space-1, 0.25rem);
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-xs, 0.75rem);
        line-height: 1.2;
        text-decoration: none;
    }

    /* The ring is inside of the destination: a bar has the edge of the screen around it. */
    .link:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    /* The icon, and a shape behind it. The shape of a destination that is not the current one has
       no border, and the room of one as padding: forced colours would paint a border. */
    .icon {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.5em;
        min-block-size: 1.5em;
        padding: calc(0.125rem + 1px) calc(var(--el-space-3, 0.75rem) + 1px);
        border-radius: 999px;
        /* An icon is larger than the text under it. */
        font-size: var(--el-font-size-md, 1rem);
    }

    /* The badge sits on the corner of the icon at the end, and takes no room. It is after the
       text in the link, where a screen reader reads it, and placed from the middle of the link. */
    .badge {
        position: absolute;
        inset-block-start: 0.125rem;
        inset-inline-start: 50%;
        margin-inline-start: var(--el-space-1, 0.25rem);
        display: inline-flex;
    }

    /* One line. What does not fit is cut, and the bar keeps its height.
       Where the el-nav shows icons alone, the text is off the screen and stays the name of the
       link: the el-nav says so in properties that are inherited. */
    .label {
        position: var(--_el-nav-label-position, static);
        inline-size: var(--_el-nav-label-size, auto);
        block-size: var(--_el-nav-label-size, auto);
        max-inline-size: 100%;
        overflow: hidden;
        clip-path: var(--_el-nav-label-clip, none);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /*
     * The current destination: the colour of the text, a heavier text, and the shape behind the
     * icon. The shape has a border, transparent here: where the user forces colours, a border is
     * painted in a colour of the system, and the shape stays.
     */
    .item--current .link {
        color: var(--el-color-fg, inherit);
        font-weight: var(--el-font-weight-semibold, 600);
    }

    .item--current .icon {
        padding: 0.125rem var(--el-space-3, 0.75rem);
        border: 1px solid transparent;
        background: var(--el-color-bg-muted, transparent);
    }

    /* Under the pointer the shape shows for every destination. Only where a pointer can hover: a
       touch screen leaves the state on what was tapped last. */
    @media (hover: hover) {
        .link:hover {
            color: var(--el-color-fg, inherit);
        }

        .link:hover .icon {
            background: var(--el-color-bg-muted, transparent);
        }
    }

    /* On a touch screen a destination is at least as large as a finger needs, in both directions.
       Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .link {
            min-inline-size: var(--el-touch-target, auto);
            min-block-size: max(
                calc(var(--el-control-height, 2.5rem) + 2 * var(--el-space-2, 0.5rem)),
                var(--el-touch-target, 0px)
            );
        }
    }
`;

export default [hostStyle(), style].join('\n');
