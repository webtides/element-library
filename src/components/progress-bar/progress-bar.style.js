import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        /* As wide as its container. */
        display: block;
    }

    .progress-bar {
        height: var(--el-progress-bar-height, 0.5rem);
        /* The radius of the theme, which rounds the ends of a bar of this height fully in most
           themes and leaves them square in a theme without radii. */
        border-radius: var(--el-radius-md, 4px);
        /* Without a theme both colours come from the text colour, so the bar shows on any
           background. The track is a share of it, as the track of the spinner is. */
        background: var(--el-progress-bar-track-color, color-mix(in srgb, currentColor 20%, transparent));
        overflow: hidden;
    }

    /* A block with a width: it starts where the text starts, at the right in a text that runs
       from right to left. */
    .indicator {
        height: 100%;
        border-radius: inherit;
        background: var(--el-progress-bar-indicator-color, var(--el-color-accent, currentColor));
        transition: width var(--el-duration-md, 0s) var(--el-ease, linear);
    }

    /* ── Indeterminate ────────────────────────────────────────────────────── */

    /* Two fifths of the track pass over it, from before the start to behind the end. */
    .progress-bar--indeterminate .indicator {
        width: 40%;
        animation: el-progress-bar-pass 1.6s ease-in-out infinite;
    }

    :host(:dir(rtl)) .progress-bar--indeterminate .indicator {
        animation-name: el-progress-bar-pass-rtl;
    }

    /* The way is in widths of the indicator: the track is two and a half of them. */
    @keyframes el-progress-bar-pass {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(250%);
        }
    }

    @keyframes el-progress-bar-pass-rtl {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-250%);
        }
    }

    /* Nothing crosses the page for a user who prefers reduced motion. The whole track fades and
       comes back instead: a bar that stands still would read as a task that is done, or stuck. */
    @media (prefers-reduced-motion: reduce) {
        .progress-bar--indeterminate .indicator,
        :host(:dir(rtl)) .progress-bar--indeterminate .indicator {
            width: 100%;
            animation: el-progress-bar-fade 2s ease-in-out infinite;
        }
    }

    @keyframes el-progress-bar-fade {
        50% {
            opacity: 0.4;
        }
    }

    /* ── Forced colours ───────────────────────────────────────────────────── */

    /* Forced colours take both fills away. A border draws the track, and the colour of a
       selection, which is a system colour and stays, fills it. */
    @media (forced-colors: active) {
        .progress-bar {
            border: 1px solid CanvasText;
        }

        .indicator {
            background: Highlight;
        }
    }
`;

export default [hostStyle(), style].join('\n');
