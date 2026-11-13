import hostStyle from '../../styles/host.style.js';

const css = String.raw;

const style = css`
    :host {
        /* A line of text by default: as wide as its container, as high as the text. A width and a
           height on the element make it a block or a circle. */
        display: block;
        height: 1em;
    }

    .skeleton {
        /* The shape fills the host by itself. It does not count on the display of the host, which
           a rule from outside can change: the media region of a card makes what is slotted into it
           a block. */
        display: block;
        width: 100%;
        height: 100%;

        /* A share of the text colour, not a grey of its own: that shows on the background of the
           page and on a muted fill, in a light scheme and in a dark one, and without a theme. */
        --_el-skeleton-color: var(
            --el-skeleton-color,
            color-mix(in srgb, var(--el-color-fg, currentColor) 12%, transparent)
        );
        --_el-skeleton-sheen-color: var(
            --el-skeleton-sheen-color,
            color-mix(in srgb, var(--el-color-fg, currentColor) 4%, transparent)
        );

        background: var(--_el-skeleton-color);
        border-radius: var(--el-skeleton-radius, var(--el-radius-md, 4px));
    }

    /* ── Effects ──────────────────────────────────────────────────────────── */

    /* A lighter band passes over the shape, from the start to the end. The gradient is three times
       as wide as the shape and has the band in its middle, so both ends of the way show the plain
       colour and the loop has no jump. */
    :host([effect='sheen']) .skeleton {
        background: linear-gradient(
            90deg,
            var(--_el-skeleton-color) 40%,
            var(--_el-skeleton-sheen-color) 50%,
            var(--_el-skeleton-color) 60%
        );
        background-size: 300% 100%;
        animation: el-skeleton-sheen 2s linear infinite;
    }

    :host([effect='pulse']) .skeleton {
        animation: el-skeleton-pulse 2s ease-in-out infinite;
    }

    @keyframes el-skeleton-sheen {
        from {
            background-position: 100% 0;
        }
        to {
            background-position: 0 0;
        }
    }

    @keyframes el-skeleton-pulse {
        50% {
            opacity: 0.4;
        }
    }

    /* The effect says no more than the shape does: that something is on its way. */
    @media (prefers-reduced-motion: reduce) {
        :host([effect]) .skeleton {
            animation: none;
        }
    }
`;

export default [hostStyle(), style].join('\n');
