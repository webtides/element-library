import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
        width: var(--el-progress-ring-size, 4rem);
        height: var(--el-progress-ring-size, 4rem);
        vertical-align: middle;

        --_el-progress-ring-track-width: var(--el-progress-ring-track-width, 0.25rem);
    }

    .progress-ring {
        position: relative;
        width: 100%;
        height: 100%;
    }

    /* ── Ring ─────────────────────────────────────────────────────────────── */

    /* A circle starts at three o'clock. A quarter turn back, and it starts at the top. */
    .ring {
        display: block;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    /* Both circles are placed and sized here, from the size of the element: the ring is as large
       as its box, and the line lies inside of it. */
    circle {
        cx: 50%;
        cy: 50%;
        r: calc(50% - var(--_el-progress-ring-track-width) / 2);
        fill: none;
        stroke-width: var(--_el-progress-ring-track-width);
    }

    /* Without a theme both colours come from the text colour, so the ring shows on any
       background. The track is a share of it, as the track of the spinner is. */
    .track {
        stroke: var(--el-progress-ring-track-color, color-mix(in srgb, currentColor 20%, transparent));
    }

    .indicator {
        stroke: var(--el-progress-ring-indicator-color, var(--el-color-accent, currentColor));
        transition: stroke-dashoffset var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    /* ── Middle ───────────────────────────────────────────────────────────── */

    /* Over the ring, in its middle. Figures of one width: the text does not move while the value
       counts up. */
    .label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--el-font-family, inherit);
        font-variant-numeric: tabular-nums;
        line-height: 1;
        text-align: center;
    }

    /* ── Forced colours ───────────────────────────────────────────────────── */

    /* System colours, which stay. The whole ring becomes a thin line in the text colour, and the
       part that is drawn keeps its width, in the colour of a selection: the two are told apart by
       their width, whatever the colours of the user are. */
    @media (forced-colors: active) {
        .track {
            stroke: CanvasText;
            stroke-width: 1px;
        }

        .indicator {
            stroke: Highlight;
        }
    }
`;

export default [hostStyle(), style].join('\n');
