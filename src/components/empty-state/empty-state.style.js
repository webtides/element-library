import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: block;
    }

    /*
     * A column in the middle of the host, no wider than a text can be read. It paints nothing:
     * the colours are the text colours of the theme, and the ones of the page without a theme.
     */
    .empty-state {
        max-width: 30rem;
        margin-inline: auto;
        padding: var(--el-space-5, 1.5rem) var(--el-space-4, 1rem);
        color: var(--el-color-fg-muted, inherit);
        text-align: center;
    }

    /* A gap above every region that has one before it. Margins, and not the gap of a grid: the
       message is always there, and while it is empty it collapses into nothing, its margin
       included. */
    [part]:not([hidden]) ~ [part] {
        margin-top: var(--el-space-2, 0.5rem);
    }

    /* The action stands a little apart from the text. */
    [part]:not([hidden]) ~ [part~='action'] {
        margin-top: var(--el-space-4, 1rem);
    }

    /* A flex row, so that an icon is in the middle also where a reset of the page makes an image
       or an svg a block. */
    [part~='icon'] {
        display: flex;
        justify-content: center;
    }

    [part~='heading'] {
        color: var(--el-color-fg, inherit);
        font-weight: var(--el-font-weight-semibold, 600);
    }

    [part~='action'] {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--el-space-2, 0.5rem);
    }

    /* The regions space what is slotted into them. The margins the browser gives a heading or a
       paragraph would come on top of that. */
    ::slotted(*) {
        margin: 0;
    }
`;

export default [hostStyle(), style].join('\n');
