import hostStyle from '../../styles/host.style.js';
import variantsStyle from '../../styles/variants.style.js';
import appearanceStyle from '../../styles/appearance.style.js';

const css = String.raw;

const style = css`
    :host {
        display: inline-flex;
        vertical-align: middle;
    }

    .badge {
        /* The colours come from the variants and appearance modules. Everything else is in em: a
           badge is three quarters of the text it stands in, whatever size that text has. */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        /* As wide as it is high, so that a single character gives a square, and a circle as a pill. */
        min-width: calc(1.7em + 2 * var(--el-border-width, 1px));
        padding: 0.35em 0.6em;
        border: var(--el-border-width, 1px) solid transparent;
        border-radius: var(--el-radius-md, 4px);
        font-family: var(--el-font-family, inherit);
        font-size: 0.75em;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
    }

    .badge--pill {
        border-radius: 999px;
    }

    /* ── Pulse ────────────────────────────────────────────────────────────── */

    /* The ring has the border colour of the variant: its own colour for brand, success, warning
       and danger, the border of the theme for neutral, whose fill is too faint to be seen. */
    .badge--pulse {
        animation: el-badge-pulse 1.5s infinite;
    }

    @keyframes el-badge-pulse {
        0% {
            box-shadow: 0 0 0 0 var(--_el-variant-border);
        }
        70% {
            box-shadow: 0 0 0 0.5em transparent;
        }
        100% {
            box-shadow: 0 0 0 0 transparent;
        }
    }

    /* The pulse is there to catch the eye and says nothing the badge does not say. */
    @media (prefers-reduced-motion: reduce) {
        .badge--pulse {
            animation: none;
        }
    }
`;

export default [hostStyle(), variantsStyle(), appearanceStyle('.badge'), style].join('\n');
