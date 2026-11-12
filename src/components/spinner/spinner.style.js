import hostStyle from '../../styles/host.style.js';
import sizeStyle from '../../styles/size.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-block;
        /* As large as the text around it. The size module only brings the factor for small and
           large: the font size stays the one of the surrounding text. */
        width: calc(1em * var(--_el-size-scale));
        height: calc(1em * var(--_el-size-scale));
        vertical-align: middle;
    }

    .spinner {
        display: block;
        width: 100%;
        height: 100%;
        /* Without a theme both colours come from the text colour, so the spinner shows on any
           background. The track is a share of it, not the border token: in a theme with a border
           as dark as the text the indicator would not stand out. */
        border: calc(0.125em * var(--_el-size-scale)) solid
            var(--el-spinner-track-color, color-mix(in srgb, currentColor 20%, transparent));
        border-top-color: var(--el-spinner-indicator-color, var(--el-color-accent, currentColor));
        border-radius: 50%;
        animation: el-spinner-spin 0.8s linear infinite;
    }

    @keyframes el-spinner-spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Slower, not still: a ring that does not move looks like a wait that got stuck. */
    @media (prefers-reduced-motion: reduce) {
        .spinner {
            animation-duration: 1.6s;
        }
    }
`;

export default [hostStyle(), sizeStyle(), style].join('\n');
