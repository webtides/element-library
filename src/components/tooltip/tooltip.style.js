import hostStyle from '../../styles/host.style.js';
import arrowStyle from '../../styles/arrow.style.js';

const css = String.raw;

/* The gap between the anchor and the body, from its padding box outwards. */
const gap = 'calc(var(--_el-tooltip-gap, 0px) + var(--el-border-width, 1px))';

const style = css`
    /* The element is the popover, and only the box that is placed: the script sets left and top,
       in the coordinates of the viewport. What the platform gives a popover (a centred place, a
       border, a padding, a background) goes. The look is on the body inside, where a reset of the
       page that selects every element does not reach it. */
    :host {
        position: fixed;
        inset: auto;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        border: 0;
        background: none;
        /* The arrow sticks out. */
        overflow: visible;
        width: max-content;
        max-width: min(20rem, calc(100vw - 1rem));
    }

    /* Closed. The platform hides a closed popover as well, but the element is a popover only once
       its script has run. This rule is part of the server-rendered markup. */
    :host(:not(:popover-open)) {
        display: none;
    }

    /* Shown by the platform (showPopover() on the element) but not placed yet: the component hears
       of that a moment later. Until then the tooltip would sit in the corner of the viewport, for
       the eye and for the pointer. */
    :host(:not(:state(open))) {
        visibility: hidden;
        pointer-events: none;
    }

    .body {
        position: relative;
        padding: var(--el-space-1, 0.25rem) var(--el-space-2, 0.5rem);
        /* The colours of the page the other way round, with the system colours as the headless
           fallback: a tooltip has to be readable over whatever it floats above. */
        background: var(--el-color-fg, CanvasText);
        color: var(--el-color-bg, Canvas);
        /* Nothing to see until a user forces colours: then the background is not painted, and the
           border is the outline of the tooltip. */
        border: var(--el-border-width, 1px) solid transparent;
        border-radius: var(--el-radius-md, 0);
        /* The tooltip stands in the page next to its anchor and would take over what the text
           there looks like: a heading, a table header, a line that does not wrap. */
        font-family: var(--el-font-family, inherit);
        font-size: var(--el-font-size-sm, 0.875rem);
        font-style: normal;
        font-weight: normal;
        letter-spacing: normal;
        line-height: var(--el-line-height, 1.5);
        text-align: start;
        text-transform: none;
        white-space: normal;
        overflow-wrap: break-word;
    }

    /* ── The way from the anchor to the tooltip ───────────────────────────── */

    /* The gap between the two belongs to the tooltip: a pointer that goes from the anchor onto the
       text never leaves both, so the tooltip stays (WCAG 1.4.13). The script sets the width of the
       gap; the side is the one that faces the anchor. */
    .body::before {
        content: '';
        position: absolute;
    }

    :host([data-placement^='top']) .body::before {
        top: 100%;
        right: 0;
        left: 0;
        height: ${gap};
    }

    :host([data-placement^='bottom']) .body::before {
        right: 0;
        bottom: 100%;
        left: 0;
        height: ${gap};
    }

    :host([data-placement^='left']) .body::before {
        top: 0;
        bottom: 0;
        left: 100%;
        width: ${gap};
    }

    :host([data-placement^='right']) .body::before {
        top: 0;
        right: 100%;
        bottom: 0;
        width: ${gap};
    }
`;

export default [hostStyle(), style, arrowStyle(':host')].join('\n');
