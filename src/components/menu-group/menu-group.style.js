import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
        /* Where the user forces colours the line is there without a theme as well: nothing else
           tells two groups apart. */
        --_el-menu-group-line-width: var(--el-border-width, 1px);
    }

    @media (forced-colors: active) {
        :host {
            --_el-menu-group-line-width: max(var(--el-border-width, 0px), 1px);
        }
    }

    /* A line over the group, with a little room on both sides of it. Not over a group that is
       the first thing in its menu: the button of the menu is a child of it as well, in a slot of
       its own, and is not counted. */
    :host(:not(:nth-child(1 of :not([slot])))) .group {
        margin-block-start: var(--el-space-1, 0.25rem);
        padding-block-start: var(--el-space-1, 0.25rem);
        border-block-start: var(--_el-menu-group-line-width) solid var(--el-color-border, currentColor);
    }

    /* The heading starts where the entries start. */
    .label {
        padding: var(--el-space-2, 0.5rem) var(--el-space-3, 0.75rem) var(--el-space-1, 0.25rem);
        color: var(--el-color-fg-muted, inherit);
        font-size: var(--el-font-size-xs, 0.75rem);
        font-weight: var(--el-font-weight-semibold, 600);
        line-height: 1.2;
    }
`;

export default [hostStyle(), style].join('\n');
