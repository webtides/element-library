import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-flex;
        /* A long name breaks inside of its entry and does not push the row out of its container. */
        min-width: 0;
    }

    /* The separator and the name stay together when the row breaks: a new line starts with a
       separator, which says that the trail goes on. */
    .item {
        display: inline-flex;
        align-items: center;
        gap: var(--el-space-2, 0.5em);
        min-width: 0;
        font-family: var(--el-font-family, inherit);
    }

    /* ── Separator ────────────────────────────────────────────────────────── */

    /* A string from a custom property, so that a page or a theme sets it once for every entry.
       The element is hidden from assistive technology, and what it generates with it. */
    .separator {
        flex: none;
        color: var(--el-color-fg-muted, inherit);
        user-select: none;
    }

    .separator::before {
        content: var(--el-breadcrumb-separator, '/');
    }

    /* Nothing stands in front of the first entry. */
    :host(:first-of-type) .separator {
        display: none;
    }

    /* ── Name ─────────────────────────────────────────────────────────────── */

    .label {
        display: inline-flex;
        align-items: center;
        gap: var(--el-space-1, 0.25em);
        min-width: 0;
        color: inherit;
        text-decoration: none;
    }

    /* A page on the way has the accent colour of the theme. Without a theme it has the text
       colour, which shows on any background, and is underlined under the pointer like the plain
       button is. */
    a.label {
        border-radius: var(--el-radius-sm, 2px);
        color: var(--el-color-accent, inherit);
    }

    @media (hover: hover) {
        a.label:hover {
            text-decoration: underline;
        }
    }

    a.label:focus-visible {
        outline: var(--el-focus-ring-width, 2px) solid var(--el-color-focus-ring, currentColor);
        outline-offset: var(--el-focus-ring-offset, 2px);
    }

    /* The page the user is on: the text colour, and a weight that tells it from the others
       without a colour. Also where it is a link. */
    .label[aria-current='page'],
    a.label[aria-current='page'] {
        color: var(--el-color-fg, inherit);
        font-weight: 600;
    }

    /* ── Touch screens ────────────────────────────────────────────────────── */

    /* On a coarse pointer no link falls below --el-touch-target in either direction. A short name
       stands in the middle of its target. Without the token the sizes stay as they are. */
    @media (any-pointer: coarse) {
        a.label {
            justify-content: center;
            min-width: var(--el-touch-target, auto);
            min-height: var(--el-touch-target, auto);
        }
    }
`;

export default [hostStyle(), style].join('\n');
