import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    /*
     * What a destination looks like is the business of the el-nav around it: a bar, a rail or a
     * list. It says so in properties that are inherited, and every rule here reads one of them and
     * falls back to the value of a bar.
     */
    :host {
        display: block;
        /* In a bar a destination is as wide as its part of the bar, whatever its text needs. In a
           rail and in a list it is as high as it is. */
        flex: var(--_el-nav-item-flex, 1 1 0);
        min-inline-size: 0;
    }

    .item {
        block-size: 100%;
    }

    /*
     * The whole destination is the link: the icon, and the text under it. As high as an app bar,
     * so the two bars of a phone are the same. In a list the text is beside the icon, and the row
     * is as high as a control.
     *
     * The mark of the current row of a list is a surface behind the whole of it, with a border.
     * A row that is not the current one has no border, and the room of one as padding: forced
     * colours would paint a border.
     */
    .link {
        position: relative;
        display: flex;
        flex-direction: var(--_el-nav-item-direction, column);
        align-items: center;
        justify-content: var(--_el-nav-item-justify, center);
        gap: var(--_el-nav-item-gap, 0.125rem);
        box-sizing: border-box;
        block-size: 100%;
        min-block-size: var(
            --_el-nav-item-min-block-size,
            calc(var(--el-control-height, 2.5rem) + 2 * var(--el-space-2, 0.5rem))
        );
        padding: calc(
                var(--_el-nav-item-padding-block, var(--el-space-1, 0.25rem)) + var(--_el-nav-item-mark-width, 0px)
            )
            calc(var(--_el-nav-item-padding-inline, var(--el-space-1, 0.25rem)) + var(--_el-nav-item-mark-width, 0px));
        border-radius: var(--_el-nav-item-radius, 0);
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--_el-nav-item-font-size, var(--el-font-size-xs, 0.75rem));
        line-height: 1.2;
        text-decoration: none;
    }

    /* The ring is inside of the destination: a bar has the edge of the screen around it. */
    .link:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: calc(-1 * var(--el-focus-ring-width, 2px));
    }

    /* The icon, and a shape behind it. The shape of a destination that is not the current one has
       no border, and the room of one as padding: forced colours would paint a border. In a list
       the icon has no shape, the row has. */
    .icon {
        position: relative;
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.5em;
        min-block-size: 1.5em;
        padding: calc(var(--_el-nav-icon-padding-block, 0.125rem) + var(--_el-nav-icon-mark-width, 1px))
            calc(var(--_el-nav-icon-padding-inline, var(--el-space-3, 0.75rem)) + var(--_el-nav-icon-mark-width, 1px));
        border-radius: 999px;
        /* An icon is larger than the text under it. */
        font-size: var(--el-font-size-md, 1rem);
    }

    /* The badge sits on the corner of the icon at the end, and takes no room. It is after the
       text in the link, where a screen reader reads it, and placed from the middle of the link.
       In a list it is at the end of the row. */
    .badge {
        position: var(--_el-nav-badge-position, absolute);
        inset-block-start: 0.125rem;
        inset-inline-start: 50%;
        flex: none;
        margin-inline-start: var(--_el-nav-badge-margin, var(--el-space-1, 0.25rem));
        display: inline-flex;
    }

    /* One line. What does not fit is cut, and the bar keeps its height. In a list the text takes
       the room between the icon and the end of the row.
       Where the el-nav shows icons alone, the text is off the screen and stays the name of the
       link. */
    .label {
        position: var(--_el-nav-label-position, static);
        flex: var(--_el-nav-label-flex, 0 1 auto);
        inline-size: var(--_el-nav-label-size, auto);
        block-size: var(--_el-nav-label-size, auto);
        min-inline-size: 0;
        max-inline-size: 100%;
        overflow: hidden;
        clip-path: var(--_el-nav-label-clip, none);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /*
     * The current destination: the colour of the text, a heavier text, and the shape behind the
     * icon, or behind the row in a list. The shape has a border, transparent here: where the user
     * forces colours, a border is painted in a colour of the system, and the shape stays.
     */
    .item--current .link {
        padding: var(--_el-nav-item-padding-block, var(--el-space-1, 0.25rem))
            var(--_el-nav-item-padding-inline, var(--el-space-1, 0.25rem));
        border: var(--_el-nav-item-mark-width, 0px) solid transparent;
        background: var(--_el-nav-item-mark-background, transparent);
        color: var(--el-color-fg, inherit);
        font-weight: var(--el-font-weight-semibold, 600);
    }

    .item--current .icon {
        padding: var(--_el-nav-icon-padding-block, 0.125rem)
            var(--_el-nav-icon-padding-inline, var(--el-space-3, 0.75rem));
        border: var(--_el-nav-icon-mark-width, 1px) solid transparent;
        background: var(--_el-nav-icon-mark-background, var(--el-color-bg-muted, transparent));
    }

    /* Under the pointer the shape shows for every destination. Only where a pointer can hover: a
       touch screen leaves the state on what was tapped last. */
    @media (hover: hover) {
        .link:hover {
            background: var(--_el-nav-item-mark-background, transparent);
            color: var(--el-color-fg, inherit);
        }

        .link:hover .icon {
            background: var(--_el-nav-icon-mark-background, var(--el-color-bg-muted, transparent));
        }
    }

    /* On a touch screen a destination is at least as large as a finger needs, in both directions.
       Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        .link {
            min-inline-size: var(--el-touch-target, auto);
            min-block-size: max(
                var(
                    --_el-nav-item-min-block-size,
                    calc(var(--el-control-height, 2.5rem) + 2 * var(--el-space-2, 0.5rem))
                ),
                var(--el-touch-target, 0px)
            );
        }
    }
`;

export default [hostStyle(), style].join('\n');
