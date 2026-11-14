import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        /* As wide as its container, and without a space around it: the margin of the element, or
           the gap of the layout it stands in, sets the distance to the content. */
        display: block;

        --_el-divider-line: var(--el-divider-width, var(--el-border-width, 1px)) solid
            var(--el-divider-color, var(--el-color-border, color-mix(in srgb, currentColor 20%, transparent)));
    }

    .divider {
        /* The line is a border, not a background: forced colours take a background away and
           repaint a border. Everything else of the look the browser gives an hr is taken back,
           its grey text colour too: without a theme the line is a share of the text colour of
           the page. */
        display: block;
        flex: none;
        width: auto;
        height: 0;
        margin: 0;
        border: none;
        border-block-start: var(--_el-divider-line);
        color: inherit;
        overflow: visible;
    }

    /* ── Vertical ─────────────────────────────────────────────────────────── */

    /* In a row of a flex or grid container it is as high as the row, whatever the alignment of
       the row is. In a line of text it is as high as the text. */
    :host([orientation='vertical']) {
        display: inline-flex;
        align-self: stretch;
        min-height: 1em;
        vertical-align: middle;
    }

    /* The line stretches to the height of the host, as a flex item does. */
    :host([orientation='vertical']) .divider {
        height: auto;
        border-block-start: none;
        border-inline-start: var(--_el-divider-line);
    }
`;

export default [hostStyle(), style].join('\n');
